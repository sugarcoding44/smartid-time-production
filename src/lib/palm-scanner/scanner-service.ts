/**
 * Palm Scanner SDK Integration Service
 * 
 * This service interfaces with the X-Telcom Palm Scanner SDK v1.3.41
 * located in the project's palm-sdk directory.
 * 
 * The SDK provides palm vein recognition capabilities through DLL files.
 * We use the CLI wrapper to interface with the palm_test.exe executable.
 */

import { getPalmCliWrapper, PalmCliWrapper } from './palm-cli-wrapper'
import type { PalmDeviceInfo, PalmCaptureResult, PalmVerifyResult } from './palm-cli-wrapper'
import path from 'path'
import fs from 'fs/promises'

// SDK Configuration
export const PALM_SDK_CONFIG = {
  SDK_PATH: path.join(process.cwd(), 'palm-sdk'),
  SDK_VERSION: '1.3.41',
  
  // Device configuration
  DEFAULT_CAPTURE_TIMEOUT: 10000, // 10 seconds
  MIN_QUALITY_THRESHOLD: 70,
  MAX_RETRY_ATTEMPTS: 3,
  
  // Image processing
  CAPTURE_WIDTH: 640,
  CAPTURE_HEIGHT: 480,
  IMAGE_FORMAT: 'BMP',
  
  // Template settings
  TEMPLATE_SIZE_BYTES: 2048,
  FEATURE_POINTS_COUNT: 100,
  
  // Matching thresholds
  VERIFICATION_THRESHOLD: 80,
  IDENTIFICATION_THRESHOLD: 75
}

export interface PalmScanResult {
  success: boolean
  quality_score: number
  template_data?: Buffer
  raw_image?: Buffer
  processed_image?: Buffer
  roi_coordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
  error_message?: string
  capture_duration_ms?: number
}

export interface PalmVerificationResult {
  success: boolean
  match_found: boolean
  confidence_score: number
  matched_template_id?: string
  processing_time_ms: number
  error_message?: string
}

export class PalmScannerService {
  private cliWrapper: PalmCliWrapper
  private isInitialized: boolean = false
  private currentDeviceId: string | null = null

  constructor() {
    this.cliWrapper = getPalmCliWrapper()
  }

  /**
   * Initialize the palm scanner SDK
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Palm Scanner SDK...')
      
      // Initialize the CLI wrapper
      const success = await this.cliWrapper.initialize()
      
      if (success) {
        this.isInitialized = true
        this.currentDeviceId = 'PALM_DEVICE_001'
        
        // Set up event listeners
        this.cliWrapper.on('error', (error) => {
          console.error('Palm SDK error:', error)
        })
        
        this.cliWrapper.on('disconnected', () => {
          console.warn('Palm SDK disconnected')
          this.isInitialized = false
          this.currentDeviceId = null
        })
        
        console.log('Palm Scanner SDK initialized successfully')
        return true
      } else {
        throw new Error('Failed to initialize CLI wrapper')
      }
    } catch (error) {
      console.error('Failed to initialize Palm Scanner SDK:', error)
      this.isInitialized = false
      return false
    }
  }

  /**
   * Check if the scanner device is connected and ready
   */
  async isDeviceReady(): Promise<boolean> {
    if (!this.isInitialized) {
      return false
    }

    try {
      console.log('Checking palm scanner device status...')
      return await this.cliWrapper.isDeviceReady()
    } catch (error) {
      console.error('Error checking device status:', error)
      return false
    }
  }

  /**
   * Capture palm scan and extract biometric template
   */
  async capturePalmScan(options: {
    hand_type: 'left' | 'right'
    quality_threshold?: number
    timeout_ms?: number
    capture_images?: boolean
  }): Promise<PalmScanResult> {
    if (!this.isInitialized) {
      throw new Error('Palm scanner not initialized')
    }

    const startTime = Date.now()
    console.log(`Starting palm capture for ${options.hand_type} hand...`)

    try {
      // Use the CLI wrapper to capture palm data
      const captureResult = await this.cliWrapper.capturePalm({
        timeout_ms: options.timeout_ms || PALM_SDK_CONFIG.DEFAULT_CAPTURE_TIMEOUT,
        save_images: options.capture_images,
        continuous: false
      })
      
      const capture_duration = Date.now() - startTime
      
      // Check if capture was successful
      if (!captureResult.success || !captureResult.palm_detected) {
        return {
          success: false,
          quality_score: captureResult.quality_score,
          error_message: captureResult.error_message || 'No palm detected',
          capture_duration_ms: capture_duration
        }
      }
      
      // Check quality threshold
      if (captureResult.quality_score < (options.quality_threshold || PALM_SDK_CONFIG.MIN_QUALITY_THRESHOLD)) {
        return {
          success: false,
          quality_score: captureResult.quality_score,
          error_message: `Quality score ${captureResult.quality_score}% below threshold`,
          capture_duration_ms: capture_duration
        }
      }
      
      // Generate template data from features if available
      let template_data: Buffer | undefined
      if (captureResult.ir_features || captureResult.rgb_features) {
        // Combine IR and RGB features into a template
        const templateSize = PALM_SDK_CONFIG.TEMPLATE_SIZE_BYTES
        template_data = Buffer.alloc(templateSize)
        
        // Fill with feature data (simplified)
        if (captureResult.ir_features) {
          const irBuffer = Buffer.from(captureResult.ir_features.buffer)
          irBuffer.copy(template_data, 0, 0, Math.min(irBuffer.length, templateSize / 2))
        }
        if (captureResult.rgb_features) {
          const rgbBuffer = Buffer.from(captureResult.rgb_features.buffer)
          rgbBuffer.copy(template_data, templateSize / 2, 0, Math.min(rgbBuffer.length, templateSize / 2))
        }
      }
      
      return {
        success: true,
        quality_score: captureResult.quality_score,
        template_data,
        roi_coordinates: captureResult.palm_bbox,
        capture_duration_ms: capture_duration
      }

    } catch (error) {
      console.error('Palm capture failed:', error)
      return {
        success: false,
        quality_score: 0,
        error_message: error instanceof Error ? error.message : 'Capture failed',
        capture_duration_ms: Date.now() - startTime
      }
    }
  }

  /**
   * Verify palm template against stored templates
   */
  async verifyPalm(
    capturedTemplate: Buffer,
    storedTemplates: Array<{ id: string; template: Buffer; hand_type: string }>
  ): Promise<PalmVerificationResult> {
    const startTime = Date.now()
    
    try {
      console.log(`Verifying palm against ${storedTemplates.length} stored templates...`)

      // Simulate template matching process
      // In real implementation, this would use SDK matching algorithms
      let bestMatch = { id: '', score: 0 }

      for (const stored of storedTemplates) {
        // Simulate matching algorithm
        const matchScore = this.simulateTemplateMatching(capturedTemplate, stored.template)
        
        if (matchScore > bestMatch.score) {
          bestMatch = { id: stored.id, score: matchScore }
        }
      }

      const processing_time = Date.now() - startTime
      const match_found = bestMatch.score >= PALM_SDK_CONFIG.VERIFICATION_THRESHOLD

      return {
        success: true,
        match_found,
        confidence_score: bestMatch.score,
        matched_template_id: match_found ? bestMatch.id : undefined,
        processing_time_ms: processing_time
      }

    } catch (error) {
      console.error('Palm verification failed:', error)
      return {
        success: false,
        match_found: false,
        confidence_score: 0,
        processing_time_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Verification failed'
      }
    }
  }

  /**
   * Get device information and status
   */
  async getDeviceInfo(): Promise<PalmDeviceInfo> {
    if (!this.isInitialized) {
      return {
        device_id: 'Unknown',
        model: 'X-Telcom Palm Scanner',
        firmware_version: 'Unknown',
        sdk_version: PALM_SDK_CONFIG.SDK_VERSION,
        serial_number: 'Unknown',
        status: 'disconnected',
        last_heartbeat: new Date()
      }
    }
    
    try {
      return await this.cliWrapper.getDeviceInfo()
    } catch (error) {
      console.error('Error getting device info:', error)
      return {
        device_id: this.currentDeviceId || 'Unknown',
        model: 'X-Telcom Palm Scanner',
        firmware_version: 'Unknown',
        sdk_version: PALM_SDK_CONFIG.SDK_VERSION,
        serial_number: 'Unknown',
        status: 'error',
        last_heartbeat: new Date()
      }
    }
  }

  /**
   * Cleanup and disconnect from scanner
   */
  async cleanup(): Promise<void> {
    try {
      console.log('Cleaning up Palm Scanner SDK...')
      
      if (this.cliWrapper) {
        await this.cliWrapper.cleanup()
      }
      
      this.isInitialized = false
      this.currentDeviceId = null
      console.log('Palm Scanner SDK cleanup completed')
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  // Private helper methods

  private simulateTemplateMatching(template1: Buffer, template2: Buffer): number {
    // Simulate template matching algorithm
    // In real implementation, this would use sophisticated palm vein matching
    
    if (template1.length !== template2.length) {
      return 0
    }

    let matchingBytes = 0
    const sampleSize = Math.min(100, template1.length) // Sample for simulation

    for (let i = 0; i < sampleSize; i++) {
      const index = Math.floor((i / sampleSize) * template1.length)
      const diff = Math.abs(template1[index] - template2[index])
      
      if (diff < 50) { // Threshold for similarity
        matchingBytes++
      }
    }

    // Calculate similarity percentage with some randomness for realistic simulation
    const baseScore = (matchingBytes / sampleSize) * 100
    const randomFactor = (Math.random() - 0.5) * 20 // ±10% randomness
    
    return Math.max(0, Math.min(100, Math.floor(baseScore + randomFactor)))
  }
}

// Singleton instance
let palmScannerService: PalmScannerService | null = null

export function getPalmScannerService(): PalmScannerService {
  if (!palmScannerService) {
    palmScannerService = new PalmScannerService()
  }
  return palmScannerService
}

export default PalmScannerService
