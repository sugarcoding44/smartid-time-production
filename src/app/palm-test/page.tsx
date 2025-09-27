'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface DeviceInfo {
  device_id: string
  model: string
  firmware_version: string
  sdk_version: string
  serial_number: string
  status: string
  is_ready: boolean
  connection_status: string
}

export default function PalmSDKTestPage() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Array<{
    test: string
    status: 'success' | 'error' | 'running'
    message: string
    timestamp: Date
  }>>([])

  const addTestResult = (test: string, status: 'success' | 'error' | 'running', message: string) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date() }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const testDeviceConnection = async () => {
    setLoading(true)
    addTestResult('Device Connection', 'running', 'Checking device status...')
    
    try {
      const response = await fetch('/api/palm/scanner/device')
      const data = await response.json()
      
      if (data.success && data.data) {
        setDeviceInfo(data.data)
        addTestResult('Device Connection', 'success', `Device connected: ${data.data.model} (${data.data.status})`)
        toast.success('Device connection test passed')
      } else {
        addTestResult('Device Connection', 'error', data.error || 'Device not available')
        toast.error('Device connection test failed')
      }
    } catch (error) {
      addTestResult('Device Connection', 'error', error instanceof Error ? error.message : 'Connection failed')
      toast.error('Device connection test failed')
    } finally {
      setLoading(false)
    }
  }

  const testDeviceInitialization = async () => {
    setLoading(true)
    addTestResult('Device Initialization', 'running', 'Initializing palm scanner...')
    
    try {
      const response = await fetch('/api/palm/scanner/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        addTestResult('Device Initialization', 'success', 'Device initialized successfully')
        toast.success('Device initialization test passed')
        // Refresh device info
        await testDeviceConnection()
      } else {
        addTestResult('Device Initialization', 'error', data.error || 'Initialization failed')
        toast.error('Device initialization test failed')
      }
    } catch (error) {
      addTestResult('Device Initialization', 'error', error instanceof Error ? error.message : 'Initialization failed')
      toast.error('Device initialization test failed')
    } finally {
      setLoading(false)
    }
  }

  const testPalmCapture = async () => {
    setLoading(true)
    addTestResult('Palm Capture', 'running', 'Starting palm capture test...')
    
    try {
      const response = await fetch('/api/palm/scanner/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_user_001',
          hand_type: 'right',
          quality_threshold: 70,
          timeout_ms: 15000,
          capture_images: true
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.data) {
        addTestResult('Palm Capture', 'success', 
          `Capture successful - Quality: ${data.data.quality_score}%, Duration: ${data.data.capture_duration_ms}ms`)
        toast.success('Palm capture test passed')
      } else {
        addTestResult('Palm Capture', 'error', data.error || data.details || 'Capture failed')
        toast.error('Palm capture test failed')
      }
    } catch (error) {
      addTestResult('Palm Capture', 'error', error instanceof Error ? error.message : 'Capture failed')
      toast.error('Palm capture test failed')
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    clearResults()
    await testDeviceConnection()
    if (deviceInfo?.is_ready) {
      await testPalmCapture()
    } else {
      await testDeviceInitialization()
      // Wait a bit then try capture
      setTimeout(async () => {
        await testPalmCapture()
      }, 2000)
    }
  }

  useEffect(() => {
    // Auto-run device connection test on page load
    testDeviceConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤚 Palm SDK Integration Test
          </h1>
          <p className="text-gray-600">
            Test the X-Telcom Palm Scanner SDK v1.3.41 integration
          </p>
        </div>

        {/* Device Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📱 Device Status
              {deviceInfo && (
                <Badge 
                  variant={deviceInfo.is_ready ? 'default' : 'secondary'}
                  className={deviceInfo.is_ready ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {deviceInfo.is_ready ? 'Ready' : deviceInfo.status}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Model</div>
                  <div className="font-medium">{deviceInfo.model}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">SDK Version</div>
                  <div className="font-medium">{deviceInfo.sdk_version}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Device ID</div>
                  <div className="font-medium">{deviceInfo.device_id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium">{deviceInfo.connection_status}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Device information not available</div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={testDeviceConnection}
                disabled={loading}
                variant="outline"
              >
                🔍 Test Connection
              </Button>
              <Button 
                onClick={testDeviceInitialization}
                disabled={loading}
                variant="outline"
              >
                🚀 Initialize Device
              </Button>
              <Button 
                onClick={testPalmCapture}
                disabled={loading || !deviceInfo?.is_ready}
                variant="outline"
              >
                🤚 Test Capture
              </Button>
              <Button 
                onClick={runAllTests}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ⚡ Run All Tests
              </Button>
              <Button 
                onClick={clearResults}
                disabled={loading}
                variant="outline"
              >
                🗑 Clear Results
              </Button>
            </div>
            {loading && (
              <div className="flex items-center gap-2 mt-4 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Running tests...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No test results yet. Run some tests to see results here.
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200'
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        result.status === 'success' 
                          ? 'bg-green-500'
                          : result.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500 animate-pulse'
                      }`}></div>
                      <div>
                        <div className="font-medium">{result.test}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Testing Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Ensure the X-Telcom palm scanner is connected to your computer</li>
                  <li>Install the palm scanner drivers if needed (check palm-sdk/driver/)</li>
                  <li>Click "Test Connection" to verify the device is detected</li>
                  <li>Click "Initialize Device" if the scanner is not ready</li>
                  <li>Click "Test Capture" to test palm scanning (place your palm on the scanner)</li>
                  <li>Use "Run All Tests" for a comprehensive test sequence</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">SDK Initialization Sequence:</h4>
                <div className="bg-blue-50 p-3 rounded text-xs">
                  <div className="font-medium mb-2">The palm SDK follows this initialization order:</div>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li><strong>c</strong> - Create device connection</li>
                    <li><strong>o</strong> - Open device for communication</li>
                    <li><strong>l</strong> - Set LED mode for optimal scanning</li>
                    <li><strong>E</strong> - Enable DimPalm algorithms (IR/RGB processing)</li>
                    <li><strong>a</strong> - Capture palm once / <strong>b</strong> - Continuous capture</li>
                  </ol>
                  <div className="mt-2 text-blue-700">
                    <strong>Optional server operations:</strong> 1 (Create client) → 2 (Register) → 4 (Query)
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">SDK Information:</h4>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div><strong>SDK Path:</strong> /palm-sdk/</div>
                  <div><strong>Version:</strong> 1.3.41</div>
                  <div><strong>Executable:</strong> palm-sdk/samples/PalmVein01_bin/palm_test.exe</div>
                  <div><strong>Config:</strong> palm-sdk/config/</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
