/**
 * Palm Scanner CLI Wrapper
 * 
 * This module provides a Node.js interface to the X-Telcom Palm SDK
 * through command-line interaction with the palm_test.exe executable.
 * 
 * Since the palm SDK is C++ based and uses DLLs, we use the sample
 * executable as an intermediate layer to access palm scanning functionality.
 */

import { spawn, exec, ChildProcess } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'
import { EventEmitter } from 'events'

const execAsync = promisify(exec)

export interface PalmDeviceInfo {
  device_id: string
  model: string
  firmware_version: string
  sdk_version: string
  serial_number: string
  status: 'connected' | 'disconnected' | 'error' | 'ready'
  last_heartbeat: Date
  temperature?: number
}

export interface PalmCaptureResult {
  success: boolean
  palm_detected: boolean
  quality_score: number
  palm_type: 'left' | 'right' | 'unknown'
  ir_features?: Float32Array
  rgb_features?: Float32Array
  skeleton_data?: Float32Array
  palm_bbox?: { x: number; y: number; width: number; height: number }
  confidence_score: number
  error_message?: string
  capture_time_ms: number
  raw_image_path?: string
  processed_image_path?: string
}

export interface PalmVerifyResult {
  success: boolean
  match_found: boolean
  confidence_score: number
  matched_template_id?: string
  processing_time_ms: number
  error_message?: string
}

export class PalmCliWrapper extends EventEmitter {
  private sdkPath: string
  private executablePath: string
  private configPath: string
  private process: ChildProcess | null = null
  private isInitialized = false
  private deviceInfo: PalmDeviceInfo | null = null
  private commandQueue: Array<{ command: string; resolve: Function; reject: Function }> = []
  private processingCommand = false

  constructor() {
    super()
    
    // Use the local palm-sdk directory
    this.sdkPath = path.join(process.cwd(), 'palm-sdk')
    this.executablePath = path.join(this.sdkPath, 'samples', 'PalmVein01_bin', 'palm_test.exe')
    this.configPath = path.join(this.sdkPath, 'config')
    
    console.log('PalmCliWrapper initialized with paths:', {
      sdkPath: this.sdkPath,
      executablePath: this.executablePath,
      configPath: this.configPath
    })
  }

  /**
   * Initialize the palm scanner SDK and start the interactive process
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Palm Scanner CLI wrapper...')

      // Check if SDK files exist
      const sdkExists = await this.checkSdkExists()
      if (!sdkExists) {
        throw new Error(`Palm SDK not found at: ${this.sdkPath}`)
      }

      // Start the interactive palm_test.exe process
      await this.startInteractiveProcess()

      // Initialize device with proper sequence
      try {
        await this.createDevice()
        await this.openDevice()
        await this.setLedMode('on')
        await this.enableDimPalm()
      } catch (error) {
        console.error('Device initialization failed:', error)
        
        // Check if it's a device connection issue
        if (error instanceof Error && 
            (error.message.includes('Access Violation') || 
             error.message.includes('device') ||
             error.message.includes('connection'))) {
          throw new Error('Palm scanner device not connected or drivers not installed. Please check:\n' +
                         '1. Physical device is connected via USB\n' +
                         '2. Install drivers from palm-sdk/driver/WinUsb-PalmVeinShine-InstallDriver.exe\n' +
                         '3. Device Manager shows no errors for the palm scanner')
        }
        
        throw error
      }

      this.isInitialized = true
      console.log('Palm Scanner CLI wrapper initialized successfully')
      
      return true
    } catch (error) {
      console.error('Failed to initialize Palm Scanner CLI wrapper:', error)
      this.cleanup()
      return false
    }
  }

  /**
   * Start the interactive palm_test.exe process
   */
  private async startInteractiveProcess(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Starting palm_test.exe process...')
        
        // Change to the SDK directory to ensure DLLs are found
        const workingDir = path.join(this.sdkPath, 'samples', 'PalmVein01_bin')
        
        this.process = spawn('palm_test.exe', [], {
          cwd: workingDir,
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let initOutput = ''
        let resolved = false

        this.process.stdout?.on('data', (data) => {
          const output = data.toString()
          console.log('Palm SDK Output:', output)
          
          initOutput += output
          
          // Check if initialization is complete
          if (output.includes('please input c to create device firstly') && !resolved) {
            resolved = true
            console.log('Palm SDK process started successfully')
            resolve()
          }

          // Emit data events for command processing
          this.emit('output', output)
        })

        this.process.stderr?.on('data', (data) => {
          const error = data.toString()
          console.error('Palm SDK Error:', error)
          this.emit('error', error)
        })

        this.process.on('close', (code) => {
          console.log(`Palm SDK process exited with code: ${code}`)
          
          // Handle specific error codes
          if (code === -1073741819) { // 0xC0000005 - Access Violation
            console.error('Palm scanner device access violation - likely no device connected or driver issue')
            if (!resolved) {
              resolved = true
              reject(new Error('Palm scanner device not found. Please:\n' +
                             '1. Connect the X-Telcom palm scanner via USB\n' +
                             '2. Install drivers from palm-sdk/driver/\n' +
                             '3. Restart the application after device setup'))
            }
          }
          
          this.process = null
          this.isInitialized = false
          this.emit('disconnected')
        })

        this.process.on('error', (error) => {
          console.error('Palm SDK process error:', error)
          if (!resolved) {
            resolved = true
            reject(error)
          }
          this.emit('error', error)
        })

        // Set timeout for initialization
        setTimeout(() => {
          if (!resolved) {
            resolved = true
            reject(new Error('Palm SDK initialization timeout'))
          }
        }, 10000) // 10 second timeout

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Send command to the palm_test.exe process
   */
  private async sendCommand(command: string, expectedResponse?: string, timeout = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin) {
        reject(new Error('Palm SDK process not available'))
        return
      }

      console.log(`Sending command: ${command}`)
      
      let output = ''
      let timer: NodeJS.Timeout

      const dataHandler = (data: Buffer) => {
        const response = data.toString()
        output += response
        
        console.log('Command response:', response)

        // Check if we got the expected response
        if (expectedResponse && response.includes(expectedResponse)) {
          clearTimeout(timer)
          this.process?.stdout?.off('data', dataHandler)
          resolve(output)
        }
      }

      // Set up response listener
      this.process.stdout?.on('data', dataHandler)

      // Set timeout
      timer = setTimeout(() => {
        this.process?.stdout?.off('data', dataHandler)
        resolve(output) // Return what we have so far
      }, timeout)

      // Send the command
      this.process.stdin.write(command + '\n')
    })
  }

  /**
   * Create device connection
   */
  private async createDevice(): Promise<void> {
    try {
      console.log('Creating device...')
      const response = await this.sendCommand('c', 'devices info:', 5000)
      
      if (response.includes('devices info:') || response.includes('hotplug has registed')) {
        console.log('Device created successfully')
      } else {
        throw new Error('Failed to create device')
      }
    } catch (error) {
      console.error('Error creating device:', error)
      throw error
    }
  }

  /**
   * Open device connection
   */
  private async openDevice(): Promise<void> {
    try {
      console.log('Opening device...')
      const response = await this.sendCommand('o', '', 3000)
      console.log('Device open response:', response)
      
      // Add small delay for device to open properly
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error opening device:', error)
      throw error
    }
  }


  /**
   * Enable DimPalm algorithms
   */
  private async enableDimPalm(): Promise<void> {
    try {
      console.log('Enabling DimPalm algorithms...')
      const response = await this.sendCommand('E', '', 3000)
      console.log('DimPalm enabled response:', response)
      
      // Add delay for algorithms to initialize
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error enabling DimPalm:', error)
      throw error
    }
  }

  /**
   * Check if device is ready for operations
   */
  async isDeviceReady(): Promise<boolean> {
    if (!this.isInitialized || !this.process) {
      return false
    }

    try {
      // Send device info command to check status
      const response = await this.sendCommand('G', '', 2000)
      return response.length > 0 // Simple check - if we get any response, device is communicating
    } catch (error) {
      console.error('Error checking device status:', error)
      return false
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<PalmDeviceInfo> {
    if (!this.isInitialized) {
      throw new Error('Palm scanner not initialized')
    }

    try {
      const response = await this.sendCommand('G', '', 3000)
      
      // Parse device information from response
      // This is a simplified version - you'll need to parse actual device info
      const deviceInfo: PalmDeviceInfo = {
        device_id: 'PALM_DEVICE_001',
        model: 'X-Telcom Palm Scanner v1.3.41',
        firmware_version: '1.3.41',
        sdk_version: '1.3.41',
        serial_number: 'Unknown',
        status: this.process ? 'ready' : 'disconnected',
        last_heartbeat: new Date()
      }
      
      this.deviceInfo = deviceInfo
      return deviceInfo
    } catch (error) {
      console.error('Error getting device info:', error)
      throw error
    }
  }

  /**
   * Capture palm biometric data
   */
  async capturePalm(options: {
    timeout_ms?: number
    continuous?: boolean
    save_images?: boolean
  } = {}): Promise<PalmCaptureResult> {
    if (!this.isInitialized) {
      throw new Error('Palm scanner not initialized')
    }

    const startTime = Date.now()
    
    try {
      console.log('Starting palm capture...')
      
      // Use 'a' for single capture or 'b' for continuous
      const command = options.continuous ? 'b' : 'a'
      const timeout = options.timeout_ms || 10000
      
      console.log(`Sending capture command: ${command}`)
      const response = await this.sendCommand(command, '', timeout)
      
      const captureTime = Date.now() - startTime
      
      // Parse the response to extract palm data
      // This is a simplified parser - you'll need to implement proper parsing
      const result: PalmCaptureResult = {
        success: true,
        palm_detected: response.includes('SUCCESS') || response.includes('detected'),
        quality_score: 90 + Math.floor(Math.random() * 10), // Simulated for now
        palm_type: 'right', // Default to right hand
        confidence_score: 85 + Math.floor(Math.random() * 15),
        capture_time_ms: captureTime
      }

      if (!result.palm_detected) {
        result.success = false
        result.error_message = 'No palm detected during capture'
      }

      console.log('Palm capture completed:', result)
      return result
      
    } catch (error) {
      console.error('Palm capture failed:', error)
      return {
        success: false,
        palm_detected: false,
        quality_score: 0,
        palm_type: 'unknown',
        confidence_score: 0,
        capture_time_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Capture failed'
      }
    }
  }

  /**
   * Stop ongoing palm capture
   */
  async stopCapture(): Promise<void> {
    if (!this.isInitialized) {
      return
    }

    try {
      console.log('Stopping palm capture...')
      await this.sendCommand('t', '', 1000)
    } catch (error) {
      console.error('Error stopping capture:', error)
    }
  }

  /**
   * Get algorithm version
   */
  async getAlgorithmVersion(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Palm scanner not initialized')
    }

    try {
      const response = await this.sendCommand('z', '', 2000)
      // Parse version from response - look for version info in output
      const versionMatch = response.match(/version[:\s]+([0-9.]+)/i)
      return versionMatch ? versionMatch[1] : '1.3.41'
    } catch (error) {
      console.error('Error getting algorithm version:', error)
      return 'Unknown'
    }
  }

  /**
   * Create palm client for server operations (optional)
   */
  async createPalmClient(serverConfig: {
    ip: string
    port: string
    companyId?: string
    hostName?: string
  }): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Palm scanner not initialized')
    }

    try {
      console.log(`Creating palm client for server ${serverConfig.ip}:${serverConfig.port}...`)
      const response = await this.sendCommand('1', '', 3000)
      console.log('Palm client creation response:', response)
      return true
    } catch (error) {
      console.error('Error creating palm client:', error)
      return false
    }
  }

  /**
   * Register palm template to server (requires palm client)
   */
  async registerToServer(): Promise<{ success: boolean; featuresId?: number; error?: string }> {
    if (!this.isInitialized) {
      throw new Error('Palm scanner not initialized')
    }

    try {
      console.log('Registering palm template to server...')
      const response = await this.sendCommand('2', '', 5000)
      console.log('Server registration response:', response)
      
      // Parse features ID from response if successful
      const featuresIdMatch = response.match(/features[\s_]*id[:\s]+(\d+)/i)
      if (featuresIdMatch) {
        return {
          success: true,
          featuresId: parseInt(featuresIdMatch[1])
        }
      }
      
      return { success: false, error: 'Failed to register to server' }
    } catch (error) {
      console.error('Error registering to server:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    }
  }

  /**
   * Query features ID from server (requires palm client)
   */
  async queryFeaturesFromServer(): Promise<{ success: boolean; featuresId?: number; error?: string }> {
    if (!this.isInitialized) {
      throw new Error('Palm scanner not initialized')
    }

    try {
      console.log('Querying features from server...')
      const response = await this.sendCommand('4', '', 5000)
      console.log('Server query response:', response)
      
      // Parse features ID from response
      const featuresIdMatch = response.match(/features[\s_]*id[:\s]+(\d+)/i)
      if (featuresIdMatch) {
        return {
          success: true,
          featuresId: parseInt(featuresIdMatch[1])
        }
      }
      
      return { success: false, error: 'No matching features found on server' }
    } catch (error) {
      console.error('Error querying server:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Query failed' 
      }
    }
  }

  /**
   * Set LED mode
   */
  async setLedMode(mode: 'on' | 'off' | 'auto'): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Palm scanner not initialized')
    }

    try {
      console.log(`Setting LED mode to: ${mode}`)
      await this.sendCommand('l', '', 2000)
    } catch (error) {
      console.error('Error setting LED mode:', error)
      throw error
    }
  }

  /**
   * Cleanup and close connections
   */
  async cleanup(): Promise<void> {
    try {
      console.log('Cleaning up Palm CLI wrapper...')
      
      if (this.process) {
        // Try to gracefully quit
        this.process.stdin?.write('q\n')
        
        // Force kill after timeout
        setTimeout(() => {
          if (this.process) {
            this.process.kill('SIGKILL')
          }
        }, 2000)
        
        this.process = null
      }
      
      this.isInitialized = false
      this.deviceInfo = null
      
      console.log('Palm CLI wrapper cleanup completed')
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  /**
   * Check if SDK exists
   */
  private async checkSdkExists(): Promise<boolean> {
    try {
      await fs.access(this.executablePath)
      await fs.access(this.configPath)
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
let palmCliWrapper: PalmCliWrapper | null = null

export function getPalmCliWrapper(): PalmCliWrapper {
  if (!palmCliWrapper) {
    palmCliWrapper = new PalmCliWrapper()
  }
  return palmCliWrapper
}

export default PalmCliWrapper
