const net = require('net');

const server = net.createServer((socket) => {
    console.log('=== CLIENT CONNECTED ===');
    console.log('Remote address:', socket.remoteAddress);
    console.log('Remote port:', socket.remotePort);
    console.log('Local address:', socket.localAddress);
    console.log('Local port:', socket.localPort);
    console.log('Connection established at:', new Date().toISOString());
    console.log('========================');
    
    socket.on('data', (data) => {
        console.log('Received data length:', data.length);
        console.log('Data (hex):', data.toString('hex'));
        console.log('Data (ascii):', data.toString('ascii').replace(/[\x00-\x1F\x7F]/g, '.'));
        console.log('---');
        
        // Echo back some data to keep connection alive
        const response = Buffer.from([0x00, 0x01, 0x02, 0x03]);
        socket.write(response);
        console.log('Sent echo response:', response.toString('hex'));
    });
    
    socket.on('error', (err) => {
        console.log('Socket error:', err.message);
    });
    
    socket.on('close', () => {
        console.log('=== CLIENT DISCONNECTED ===');
        console.log('Connection closed at:', new Date().toISOString());
        console.log('==========================');
    });
    
    socket.on('end', () => {
        console.log('Client ended connection');
    });
});

// Bind specifically to IPv4 127.0.0.1
const PORT = 8888;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
    console.log(`TCP Listener bound to ${HOST}:${PORT}`);
    console.log(`Waiting for palm client connections...`);
    console.log(`Server is listening on IPv4 only`);
    console.log('');
});

server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try closing other servers.`);
    }
});

server.on('listening', () => {
    console.log('Server is ready and listening for connections');
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close();
    process.exit(0);
});
