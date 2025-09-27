const net = require('net');

// Create a more robust palm server that handles different protocols
const server = net.createServer((socket) => {
    console.log('=== PALM CLIENT CONNECTED ===');
    console.log('Time:', new Date().toISOString());
    console.log('Remote:', socket.remoteAddress + ':' + socket.remotePort);
    console.log('Local:', socket.localAddress + ':' + socket.localPort);
    console.log('==============================');
    
    let buffer = Buffer.alloc(0);
    let messageCount = 0;
    
    socket.on('data', (data) => {
        messageCount++;
        console.log(`\n--- MESSAGE ${messageCount} ---`);
        console.log('Length:', data.length);
        console.log('Hex:', data.toString('hex'));
        console.log('ASCII:', data.toString('ascii').replace(/[\x00-\x1F\x7F-\xFF]/g, '.'));
        
        // Try to parse as different possible protocols
        if (data.length >= 4) {
            const len1 = data.readUInt32LE(0);
            const len2 = data.readUInt32BE(0);
            console.log('Possible lengths - LE:', len1, 'BE:', len2);
        }
        
        if (data.length >= 8) {
            const type1 = data.readUInt32LE(4);
            const type2 = data.readUInt32BE(4);
            console.log('Possible types - LE:', type1.toString(16), 'BE:', type2.toString(16));
        }
        
        // Accumulate data
        buffer = Buffer.concat([buffer, data]);
        console.log('Total buffer length:', buffer.length);
        
        // Try different response strategies
        let response;
        
        if (messageCount === 1) {
            // First message - might be handshake
            console.log('Sending handshake response...');
            response = Buffer.from([0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00]); // 8 bytes total, success
        } else {
            // Subsequent messages - try to handle registration
            console.log('Sending registration response...');
            // Simulate successful registration with feature_id = 12345
            response = Buffer.alloc(16);
            response.writeUInt32LE(16, 0);      // Message length
            response.writeUInt32LE(0x81, 4);    // Response type (register response)
            response.writeUInt32LE(0, 8);       // Success code
            response.writeUInt32LE(12345, 12);  // Feature ID
        }
        
        if (response) {
            console.log('Sending response length:', response.length);
            console.log('Response hex:', response.toString('hex'));
            socket.write(response);
        }
        
        console.log('--- END MESSAGE ---\n');
    });
    
    socket.on('error', (err) => {
        console.log('Socket error:', err.message);
    });
    
    socket.on('close', () => {
        console.log('=== CLIENT DISCONNECTED ===');
        console.log('Time:', new Date().toISOString());
        console.log('Total messages received:', messageCount);
        console.log('===========================');
    });
    
    socket.on('end', () => {
        console.log('Client ended connection gracefully');
    });
});

const PORT = 8888;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
    console.log(`Enhanced Palm Server listening on ${HOST}:${PORT}`);
    console.log('Ready to handle palm client protocol');
    console.log('Waiting for connections...\n');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
