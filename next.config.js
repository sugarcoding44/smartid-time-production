/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled for debugging
  
  // Webpack config to handle native modules
  webpack: (config, { isServer }) => {
    // Always exclude Koffi and native modules from bundling
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }
    
    // Mark native modules as external to prevent bundling
    const externals = config.externals || []
    config.externals = [
      ...externals,
      'koffi',
      ({ context, request }, callback) => {
        // Exclude any Koffi-related imports
        if (request.includes('koffi') || 
            request.includes('rfid-native-koffi') ||
            request.includes('.node')) {
          return callback(null, 'commonjs ' + request)
        }
        callback()
      }
    ]
    
    // Ignore .node files in the build
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    config.module.rules.push({
      test: /\.node$/,
      use: 'null-loader'
    })
    
    return config
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Prefetch optimization
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    }
  },
  
  async headers() {
    return [
      {
        // Apply CORS headers to API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;