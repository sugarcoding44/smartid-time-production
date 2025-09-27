/**
 * Palm Scanner Simulator
 * 
 * Simulates the X-Telcom Palm SDK functionality for testing without hardware.
 * This allows development and testing when the physical palm scanner is not available.
 */

export interface SimulatedPalmResult {
  success: boolean
  palm_detected: boolean
  quality_score: number
  palm_type: 'left' | 'right' | 'unknown'
  ir_features: Float32Array
  rgb_features: Float32Array
  skeleton_data: Float32Array
  palm_bbox: { x: number; y: number; width: number; height: number }
  confidence_score: number
  error_message?: string
  capture_time_ms: number
}

export interface SimulatedDeviceInfo {
  device_id: string
  model: string
  firmware_version: string
  sdk_version: string
  serial_number: string
  status: 'connected' | 'disconnected' | 'error' | 'ready'
  last_heartbeat: Date
  temperature?: number
  is_simulation: boolean
}

export class PalmSimulator {
  private isInitialized = false
  private deviceId = 'SIM_PALM_DEVICE_001'
  private templates = new Map<string, {
    ir_features: Float32Array
    rgb_features: Float32Array
    skeleton_data: Float32Array
    quality_score: number
    created_at: Date
  }>()

  /**
   * Initialize the simulator
   */
  async initialize(): Promise<boolean> {
    console.log('🎭 Initializing Palm Scanner Simulator...')
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.isInitialized = true
    console.log('✅ Palm Scanner Simulator initialized successfully')
    
    return true
  }

  /**
   * Check if device is ready
   */
  async isDeviceReady(): Promise<boolean> {
    return this.isInitialized
  }

  /**
   * Get simulated device information
   */
  async getDeviceInfo(): Promise<SimulatedDeviceInfo> {
    return {
      device_id: this.deviceId,
      model: 'X-Telcom Palm Scanner (Simulator)',
      firmware_version: '1.3.41-sim',
      sdk_version: '1.3.41',
      serial_number: 'SIM-12345678',
      status: this.isInitialized ? 'ready' : 'disconnected',
      last_heartbeat: new Date(),
      temperature: 25 + Math.random() * 10, // 25-35°C
      is_simulation: true
    }
  }

  /**
   * Simulate palm capture
   */
  async capturePalm(options: {
    timeout_ms?: number
    continuous?: boolean
    save_images?: boolean
  } = {}): Promise<SimulatedPalmResult> {
    if (!this.isInitialized) {
      throw new Error('Simulator not initialized')
    }

    const startTime = Date.now()
    console.log('🎭 Simulating palm capture...')
    
    // Simulate capture time
    const captureDelay = 2000 + Math.floor(Math.random() * 3000) // 2-5 seconds
    const actualDelay = Math.min(captureDelay, options.timeout_ms || 10000)
    
    await new Promise(resolve => setTimeout(resolve, actualDelay))
    
    // Simulate success/failure (95% success rate)
    const success = Math.random() > 0.05
    
    if (!success) {
      return {
        success: false,
        palm_detected: false,
        quality_score: Math.floor(Math.random() * 60), // Low quality
        palm_type: 'unknown',
        ir_features: new Float32Array(0),
        rgb_features: new Float32Array(0),
        skeleton_data: new Float32Array(0),
        palm_bbox: { x: 0, y: 0, width: 0, height: 0 },
        confidence_score: 0,
        error_message: 'Simulated capture failure - please try again',
        capture_time_ms: Date.now() - startTime
      }
    }

    // Generate simulated biometric features
    const ir_features = this.generateSimulatedFeatures(256) // IR features
    const rgb_features = this.generateSimulatedFeatures(256) // RGB features  
    const skeleton_data = this.generateSimulatedFeatures(64) // Skeleton data
    
    const quality_score = 75 + Math.floor(Math.random() * 25) // 75-100%
    const confidence_score = 80 + Math.floor(Math.random() * 20) // 80-100%
    
    const result: SimulatedPalmResult = {
      success: true,
      palm_detected: true,
      quality_score,
      palm_type: Math.random() > 0.5 ? 'right' : 'left',
      ir_features,
      rgb_features,
      skeleton_data,
      palm_bbox: {
        x: 120 + Math.floor(Math.random() * 50),
        y: 80 + Math.floor(Math.random() * 40),
        width: 400 + Math.floor(Math.random() * 100),
        height: 320 + Math.floor(Math.random() * 80)
      },
      confidence_score,
      capture_time_ms: Date.now() - startTime
    }

    console.log('✅ Simulated palm capture successful:', {
      quality: quality_score,
      confidence: confidence_score,
      type: result.palm_type
    })

    return result
  }

  /**
   * Store template for verification testing
   */
  storeTemplate(templateId: string, features: {
    ir_features: Float32Array
    rgb_features: Float32Array
    skeleton_data: Float32Array
    quality_score: number
  }): void {
    this.templates.set(templateId, {
      ...features,
      created_at: new Date()
    })
    console.log(`📝 Stored template ${templateId} (total: ${this.templates.size})`)
  }

  /**
   * Simulate template verification
   */
  async verifyPalm(capturedFeatures: {
    ir_features: Float32Array
    rgb_features: Float32Array
    skeleton_data: Float32Array
  }): Promise<{
    success: boolean
    match_found: boolean
    confidence_score: number
    matched_template_id?: string
    processing_time_ms: number
  }> {
    const startTime = Date.now()
    
    console.log(`🔍 Simulating verification against ${this.templates.size} templates...`)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    if (this.templates.size === 0) {
      return {
        success: true,
        match_found: false,
        confidence_score: 0,
        processing_time_ms: Date.now() - startTime
      }
    }

    // Simulate matching process
    let bestMatch = { id: '', score: 0 }
    
    for (const [templateId, template] of this.templates) {
      // Simple simulated matching score
      const matchScore = 60 + Math.floor(Math.random() * 40) // 60-100%
      
      if (matchScore > bestMatch.score) {
        bestMatch = { id: templateId, score: matchScore }
      }
    }

    const MATCH_THRESHOLD = 80
    const matchFound = bestMatch.score >= MATCH_THRESHOLD

    console.log(`🎯 Best match: ${bestMatch.id} (${bestMatch.score}%) - ${matchFound ? 'MATCH' : 'NO MATCH'}`)

    return {
      success: true,
      match_found: matchFound,
      confidence_score: bestMatch.score,
      matched_template_id: matchFound ? bestMatch.id : undefined,
      processing_time_ms: Date.now() - startTime
    }
  }

  /**
   * Cleanup simulator
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Palm Scanner Simulator...')
    this.isInitialized = false
    this.templates.clear()
    console.log('✅ Simulator cleanup completed')
  }

  /**
   * Generate simulated biometric features
   */
  private generateSimulatedFeatures(size: number): Float32Array {
    const features = new Float32Array(size)
    
    // Generate realistic-looking biometric features
    for (let i = 0; i < size; i++) {
      // Use a mix of random and structured data to simulate real features
      const base = Math.sin(i * 0.1) * 0.3 // Structural component
      const noise = (Math.random() - 0.5) * 0.4 // Random component
      features[i] = base + noise
    }
    
    return features
  }

  /**
   * Get simulator statistics
   */
  getStats(): {
    templates_stored: number
    is_initialized: boolean
    device_id: string
    uptime_ms: number
  } {
    return {
      templates_stored: this.templates.size,
      is_initialized: this.isInitialized,
      device_id: this.deviceId,
      uptime_ms: this.isInitialized ? Date.now() - Date.now() : 0
    }
  }
}

// Singleton instance
let palmSimulator: PalmSimulator | null = null

export function getPalmSimulator(): PalmSimulator {
  if (!palmSimulator) {
    palmSimulator = new PalmSimulator()
  }
  return palmSimulator
}

export default PalmSimulator
