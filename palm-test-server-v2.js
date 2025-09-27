/**
 * Palm Test Server v2 - Compatible with X-Telcom Palm SDK Client
 * 
 * Updated to match the exact API format expected by palm_test.exe
 */

const http = require('http')
const url = require('url')

// In-memory storage for palm templates
const palmDatabase = {
  templates: new Map(),
  nextId: 1000
}

// Server configuration
const SERVER_CONFIG = {
  host: '0.0.0.0', // Listen on all interfaces 
  port: 8888,
  company_id: 'smartid_test',
  version: '2.0.0'
}

/**
 * Handle palm template registration - Updated for palm client compatibility
 */
function handleRegister(req, res, body) {
  try {
    console.log('📝 Palm registration request received')
    console.log('📄 Request body length:', body.length)
    
    let data = {}
    
    // Try to parse JSON body
    if (body.trim()) {
      try {
        data = JSON.parse(body)
        console.log('📊 Parsed JSON data keys:', Object.keys(data))
      } catch (e) {
        console.log('⚠️ Not JSON format, treating as raw data')
        data = { raw_data: body }
      }
    }
    
    // Generate new features ID
    const featuresId = palmDatabase.nextId++
    
    // Store template with flexible data structure
    const template = {
      id: featuresId,
      company_id: data.company_id || SERVER_CONFIG.company_id,
      user_id: data.user_id || `user_${featuresId}`,
      ir_features: data.ir_features || [],
      rgb_features: data.rgb_features || [],
      palm_images: data.palm_images || {},
      template_data: data.template_data || null,
      registered_at: new Date().toISOString(),
      quality_score: data.quality_score || Math.floor(85 + Math.random() * 15)
    }
    
    palmDatabase.templates.set(featuresId, template)
    
    console.log(`✅ Registered palm template ID: ${featuresId}`)
    console.log(`📊 Total templates: ${palmDatabase.templates.size}`)
    
    // Send success response in format expected by palm client
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    
    const response = {
      result: 0, // 0 = success in palm client protocol
      features_id: featuresId,
      message: 'Registration successful',
      quality_score: template.quality_score,
      timestamp: template.registered_at
    }
    
    res.end(JSON.stringify(response))
    console.log(`📤 Sent success response:`, response)
    
  } catch (error) {
    console.error('❌ Registration error:', error)
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    res.end(JSON.stringify({
      result: -1, // Error code
      error: 'Registration failed',
      details: error.message
    }))
  }
}

/**
 * Handle palm template query/verification
 */
function handleQuery(req, res, body) {
  try {
    console.log('🔍 Palm query request received')
    
    let data = {}
    if (body.trim()) {
      try {
        data = JSON.parse(body)
      } catch (e) {
        data = { raw_data: body }
      }
    }
    
    if (palmDatabase.templates.size === 0) {
      console.log('📭 No templates in database')
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(JSON.stringify({
        result: 0,
        match_found: false,
        message: 'No templates in database'
      }))
      return
    }
    
    // Simulate template matching
    const templateArray = Array.from(palmDatabase.templates.values())
    const randomTemplate = templateArray[Math.floor(Math.random() * templateArray.length)]
    const matchScore = Math.floor(70 + Math.random() * 30) // 70-100% match score
    const MATCH_THRESHOLD = 80
    const matchFound = matchScore >= MATCH_THRESHOLD
    
    console.log(`🎯 Match simulation: ${matchScore}% confidence`)
    console.log(`✅ Match ${matchFound ? 'FOUND' : 'NOT FOUND'} (threshold: ${MATCH_THRESHOLD}%)`)
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    
    const response = {
      result: 0,
      match_found: matchFound,
      features_id: matchFound ? randomTemplate.id : null,
      confidence_score: matchScore,
      threshold: MATCH_THRESHOLD,
      message: matchFound 
        ? `Match found with ${matchScore}% confidence`
        : `No match found (best: ${matchScore}%)`
    }
    
    res.end(JSON.stringify(response))
    console.log(`📤 Query response:`, response)
    
  } catch (error) {
    console.error('❌ Query error:', error)
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    res.end(JSON.stringify({
      result: -1,
      error: 'Query failed',
      details: error.message
    }))
  }
}

/**
 * Handle template deletion
 */
function handleDelete(req, res, body) {
  try {
    console.log('🗑️ Palm deletion request received')
    
    const data = JSON.parse(body || '{}')
    const featuresId = data.features_id || data.id
    
    if (palmDatabase.templates.has(featuresId)) {
      palmDatabase.templates.delete(featuresId)
      console.log(`✅ Deleted template ID: ${featuresId}`)
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(JSON.stringify({
        result: 0,
        message: `Template ${featuresId} deleted successfully`
      }))
    } else {
      console.log(`❌ Template ID ${featuresId} not found`)
      
      res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(JSON.stringify({
        result: -1,
        error: 'Template not found'
      }))
    }
    
  } catch (error) {
    console.error('❌ Deletion error:', error)
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    res.end(JSON.stringify({
      result: -1,
      error: 'Deletion failed',
      details: error.message
    }))
  }
}

/**
 * Handle server status requests
 */
function handleStatus(req, res) {
  const status = {
    server: 'Palm Test Server v2',
    version: SERVER_CONFIG.version,
    status: 'running',
    company_id: SERVER_CONFIG.company_id,
    templates_count: palmDatabase.templates.size,
    uptime: process.uptime(),
    endpoints: {
      register: 'POST /register',
      query: 'POST /query', 
      delete: 'POST /delete',
      status: 'GET /status'
    },
    timestamp: new Date().toISOString()
  }
  
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
  res.end(JSON.stringify(status, null, 2))
}

/**
 * Main request handler
 */
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  const method = req.method
  
  console.log(`📡 ${method} ${path} from ${req.connection.remoteAddress}`)
  
  // Enable CORS for all responses
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  if (method === 'GET') {
    if (path === '/status' || path === '/') {
      handleStatus(req, res)
      return
    }
  }
  
  if (method === 'POST') {
    let body = ''
    
    req.on('data', chunk => {
      body += chunk.toString()
    })
    
    req.on('end', () => {
      // Log the raw body for debugging
      console.log(`📥 Request body preview: ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}`)
      
      switch (path) {
        case '/register':
          handleRegister(req, res, body)
          break
        case '/query':
          handleQuery(req, res, body)
          break
        case '/delete':
          handleDelete(req, res, body)
          break
        default:
          console.log(`❌ Unknown endpoint: ${path}`)
          res.writeHead(404, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          })
          res.end(JSON.stringify({
            result: -1,
            error: 'Endpoint not found',
            available_endpoints: ['/register', '/query', '/delete', '/status']
          }))
      }
    })
    
    return
  }
  
  // Default 404
  res.writeHead(404, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
  res.end(JSON.stringify({ 
    result: -1, 
    error: 'Not found' 
  }))
}

/**
 * Start the server
 */
const server = http.createServer(handleRequest)

server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, () => {
  console.log('')
  console.log('🚀 Palm Test Server v2 Started!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📍 Server: http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`)
  console.log(`🏢 Company ID: ${SERVER_CONFIG.company_id}`)
  console.log(`📊 Templates: ${palmDatabase.templates.size}`)
  console.log('')
  console.log('🔗 Compatible with X-Telcom Palm SDK Client API')
  console.log('📋 Available endpoints:')
  console.log(`  GET  /status   - Server status and info`)
  console.log(`  POST /register - Register palm template`)
  console.log(`  POST /query    - Query/match palm template`)
  console.log(`  POST /delete   - Delete palm template`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
})

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Palm Test Server v2...')
  console.log(`📊 Final stats: ${palmDatabase.templates.size} templates processed`)
  server.close(() => {
    console.log('✅ Server shut down gracefully')
    process.exit(0)
  })
})

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
})
