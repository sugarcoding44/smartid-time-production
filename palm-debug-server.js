/**
 * Palm Debug Server - Catch ALL requests to understand the protocol
 */

const http = require('http')
const url = require('url')

// Database
const palmDatabase = {
  templates: new Map(),
  nextId: 1000
}

// Universal success response
function sendSuccess(res, data = {}) {
  const response = {
    result: 0,
    ret: 0,
    status: 'success',
    error_code: 0,
    ...data
  }
  
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
  res.end(JSON.stringify(response))
  console.log('📤 Sent success response:', response)
}

// Universal handler for ALL requests
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  const method = req.method
  const query = parsedUrl.query
  
  console.log('\n' + '='.repeat(80))
  console.log(`📡 ${method} ${path}`)
  console.log(`🔗 Full URL: ${req.url}`)
  console.log(`📍 Remote address: ${req.connection.remoteAddress}`)
  console.log(`📋 Headers:`, req.headers)
  if (Object.keys(query).length > 0) {
    console.log(`❓ Query params:`, query)
  }
  
  // Enable CORS for everything
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  
  if (method === 'OPTIONS') {
    console.log('✅ OPTIONS request - sending CORS headers')
    res.writeHead(200)
    res.end()
    return
  }
  
  // Collect body data
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  
  req.on('end', () => {
    if (body) {
      console.log(`📥 Request body (${body.length} bytes):`)
      if (body.length < 1000) {
        console.log(body)
      } else {
        console.log(body.substring(0, 500) + '... (truncated)')
      }
      
      // Try to parse as JSON
      try {
        const jsonData = JSON.parse(body)
        console.log(`📊 Parsed JSON:`, jsonData)
      } catch (e) {
        console.log(`⚠️ Not JSON format`)
      }
    }
    
    // Handle different possible endpoints
    console.log(`🎯 Processing ${method} ${path}`)
    
    // Registration endpoints (try all variations)
    if (path.includes('register') || path.includes('Register')) {
      console.log('✅ REGISTRATION REQUEST DETECTED!')
      
      const featuresId = palmDatabase.nextId++
      palmDatabase.templates.set(featuresId, {
        id: featuresId,
        path: path,
        method: method,
        body: body,
        registered_at: new Date().toISOString()
      })
      
      sendSuccess(res, {
        features_id: featuresId,
        message: 'Registration successful',
        template_id: featuresId,
        id: featuresId
      })
      return
    }
    
    // Query endpoints
    if (path.includes('query') || path.includes('Query') || path.includes('search')) {
      console.log('✅ QUERY REQUEST DETECTED!')
      
      const templates = Array.from(palmDatabase.templates.values())
      if (templates.length > 0) {
        const template = templates[0]
        sendSuccess(res, {
          match_found: true,
          features_id: template.id,
          confidence_score: 95,
          message: 'Match found'
        })
      } else {
        sendSuccess(res, {
          match_found: false,
          message: 'No templates found'
        })
      }
      return
    }
    
    // Delete endpoints  
    if (path.includes('delete') || path.includes('Delete')) {
      console.log('✅ DELETE REQUEST DETECTED!')
      sendSuccess(res, {
        message: 'Delete successful'
      })
      return
    }
    
    // Status/health endpoints
    if (path.includes('status') || path.includes('health') || path === '/') {
      console.log('✅ STATUS REQUEST DETECTED!')
      sendSuccess(res, {
        server: 'Palm Debug Server',
        version: '1.0.0',
        status: 'running',
        templates_count: palmDatabase.templates.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      })
      return
    }
    
    // Catch ALL other requests
    console.log('🔍 UNKNOWN ENDPOINT - sending generic success')
    sendSuccess(res, {
      message: 'Generic success response',
      endpoint: path,
      method: method
    })
  })
}

// Start server on port 8888
const server = http.createServer(handleRequest)

server.listen(8888, '0.0.0.0', () => {
  console.log('\n🔍 Palm Debug Server Started!')
  console.log('=' * 50)
  console.log('📍 Server: http://0.0.0.0:8888')  
  console.log('🎯 Purpose: Capture ALL palm client requests')
  console.log('📊 Templates stored: 0')
  console.log('🔗 Will respond to ANY endpoint with success')
  console.log('=' * 50)
  console.log('')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down debug server...')
  console.log(`📊 Final stats: ${palmDatabase.templates.size} requests captured`)
  server.close(() => {
    console.log('✅ Server shut down')
    process.exit(0)
  })
})

console.log('🔍 Debug server ready - will log ALL requests!')
