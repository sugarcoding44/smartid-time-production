/**
 * Local Palm Test Server
 * 
 * Simple HTTP server to test X-Telcom Palm SDK client functionality
 * Simulates the server endpoints that the palm SDK expects for:
 * - Template registration
 * - Template querying/matching
 * - Feature ID management
 */

const http = require('http')
const url = require('url')

// In-memory storage for palm templates (for testing)
const palmDatabase = {
  templates: new Map(),
  nextId: 1000
}

// Server configuration
const SERVER_CONFIG = {
  host: 'localhost',
  port: 8888,
  company_id: 'smartid_test',
  version: '1.0.0'
}

/**
 * Handle palm template registration
 */
function handleRegister(req, res, body) {
  try {
    console.log('📝 Palm registration request received')
    
    // Parse request data
    const data = JSON.parse(body)
    const { ir_features, rgb_features, palm_images, user_info } = data
    
    // Generate new features ID
    const featuresId = palmDatabase.nextId++
    
    // Store template
    palmDatabase.templates.set(featuresId, {
      id: featuresId,
      ir_features: ir_features || [],
      rgb_features: rgb_features || [],
      palm_images: palm_images || {},
      user_info: user_info || {},
      registered_at: new Date().toISOString(),
      quality_score: Math.floor(85 + Math.random() * 15) // Simulate quality
    })
    
    console.log(`✅ Registered new palm template with ID: ${featuresId}`)
    console.log(`📊 Total templates in database: ${palmDatabase.templates.size}`)
    
    // Send success response
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: true,
      features_id: featuresId,
      message: 'Palm template registered successfully',
      quality_score: palmDatabase.templates.get(featuresId).quality_score
    }))
    
  } catch (error) {
    console.error('❌ Registration error:', error)
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: false,
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
    
    // Parse request data
    const data = JSON.parse(body)
    const { ir_features, rgb_features } = data
    
    if (palmDatabase.templates.size === 0) {
      console.log('📭 No templates in database')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        success: true,
        match_found: false,
        message: 'No templates in database'
      }))
      return
    }
    
    // Simulate template matching
    let bestMatch = null
    let highestScore = 0
    
    for (const [id, template] of palmDatabase.templates) {
      // Simulate matching algorithm
      const matchScore = Math.floor(70 + Math.random() * 30) // 70-100% match score
      
      if (matchScore > highestScore) {
        highestScore = matchScore
        bestMatch = { id, template, score: matchScore }
      }
    }
    
    // Determine if match is above threshold (80%)
    const MATCH_THRESHOLD = 80
    const matchFound = highestScore >= MATCH_THRESHOLD
    
    console.log(`🎯 Best match: ID ${bestMatch?.id} with ${highestScore}% confidence`)
    console.log(`✅ Match ${matchFound ? 'FOUND' : 'NOT FOUND'} (threshold: ${MATCH_THRESHOLD}%)`)
    
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: true,
      match_found: matchFound,
      features_id: matchFound ? bestMatch.id : null,
      confidence_score: highestScore,
      threshold: MATCH_THRESHOLD,
      message: matchFound 
        ? `Match found with ${highestScore}% confidence`
        : `No match found (best: ${highestScore}%)`
    }))
    
  } catch (error) {
    console.error('❌ Query error:', error)
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: false,
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
    
    const data = JSON.parse(body)
    const { features_id } = data
    
    if (palmDatabase.templates.has(features_id)) {
      palmDatabase.templates.delete(features_id)
      console.log(`✅ Deleted template ID: ${features_id}`)
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        success: true,
        message: `Template ${features_id} deleted successfully`
      }))
    } else {
      console.log(`❌ Template ID ${features_id} not found`)
      
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        success: false,
        error: 'Template not found'
      }))
    }
    
  } catch (error) {
    console.error('❌ Deletion error:', error)
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: false,
      error: 'Deletion failed',
      details: error.message
    }))
  }
}

/**
 * Handle server status/info requests
 */
function handleStatus(req, res) {
  const status = {
    server: 'Palm Test Server',
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
  
  res.writeHead(200, { 'Content-Type': 'application/json' })
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
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
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
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            error: 'Endpoint not found',
            available_endpoints: ['/register', '/query', '/delete', '/status']
          }))
      }
    })
    
    return
  }
  
  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
}

/**
 * Start the server
 */
const server = http.createServer(handleRequest)

server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, () => {
  console.log('')
  console.log('🚀 Palm Test Server Started!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📍 Server: http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`)
  console.log(`🏢 Company ID: ${SERVER_CONFIG.company_id}`)
  console.log(`📊 Templates: ${palmDatabase.templates.size}`)
  console.log('')
  console.log('Available endpoints:')
  console.log(`  GET  /status   - Server status and info`)
  console.log(`  POST /register - Register palm template`)
  console.log(`  POST /query    - Query/match palm template`)
  console.log(`  POST /delete   - Delete palm template`)
  console.log('')
  console.log('🔗 Use these settings in palm SDK client:')
  console.log(`  IP: ${SERVER_CONFIG.host}`)
  console.log(`  Port: ${SERVER_CONFIG.port}`)
  console.log(`  Company ID: ${SERVER_CONFIG.company_id}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
})

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Palm Test Server...')
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
