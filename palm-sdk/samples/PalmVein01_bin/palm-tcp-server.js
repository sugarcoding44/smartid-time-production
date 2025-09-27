const net = require('net');

// Expected message types based on palm client functionality
const MSG_TYPE_REGISTER = 0x01;
const MSG_TYPE_QUERY = 0x02;
const MSG_TYPE_DELETE = 0x03;
const MSG_TYPE_LICENSE = 0x04;
const MSG_TYPE_RESPONSE = 0x80;

// Response codes
const RESPONSE_SUCCESS = 0x00;
const RESPONSE_ERROR = 0x01;

function parseMessage(buffer) {
    if (buffer.length < 8) {
        return null; // Not enough data for header
    }
    
    // Assuming a simple protocol:
    // 4 bytes: message length
    // 4 bytes: message type
    // N bytes: payload
    
    const messageLength = buffer.readUInt32LE(0);
    const messageType = buffer.readUInt32LE(4);
    
    if (buffer.length < messageLength) {
        return null; // Not complete message yet
    }
    
    const payload = buffer.slice(8, messageLength);
    
    return {
        length: messageLength,
        type: messageType,
        payload: payload,
        remaining: buffer.slice(messageLength)
    };
}

function createResponse(messageType, responseCode, data = Buffer.alloc(0)) {
    const responseType = messageType | MSG_TYPE_RESPONSE;
    const headerSize = 12; // 4 + 4 + 4 bytes
    const totalLength = headerSize + data.length;
    
    const response = Buffer.alloc(totalLength);
    response.writeUInt32LE(totalLength, 0);      // Total message length
    response.writeUInt32LE(responseType, 4);     // Response message type
    response.writeUInt32LE(responseCode, 8);     // Response code
    
    if (data.length > 0) {
        data.copy(response, 12);
    }
    
    return response;
}

function handleRegisterMessage(payload) {
    console.log('Handling REGISTER message, payload length:', payload.length);
    
    // For registration, typically we expect:
    // - Palm images (IR and RGB)
    // - Feature vectors
    // - Maybe user ID or other metadata
    
    // Simulate successful registration with feature ID = 12345
    const featureId = Buffer.alloc(4);
    featureId.writeUInt32LE(12345, 0);
    
    return createResponse(MSG_TYPE_REGISTER, RESPONSE_SUCCESS, featureId);
}

function handleQueryMessage(payload) {
    console.log('Handling QUERY message, payload length:', payload.length);
    
    // For query, we simulate finding a match with feature ID = 12345
    const featureId = Buffer.alloc(4);
    featureId.writeUInt32LE(12345, 0);
    
    return createResponse(MSG_TYPE_QUERY, RESPONSE_SUCCESS, featureId);
}

function handleDeleteMessage(payload) {
    console.log('Handling DELETE message, payload length:', payload.length);
    
    // Extract feature ID from payload and simulate deletion
    if (payload.length >= 4) {
        const featureId = payload.readUInt32LE(0);
        console.log('Deleting feature ID:', featureId);
    }
    
    return createResponse(MSG_TYPE_DELETE, RESPONSE_SUCCESS);
}

function handleLicenseMessage(payload) {
    console.log('Handling LICENSE message, payload length:', payload.length);
    
    // Return a mock license string
    const license = "MOCK_LICENSE_12345";
    const licenseBuffer = Buffer.from(license, 'utf8');
    
    return createResponse(MSG_TYPE_LICENSE, RESPONSE_SUCCESS, licenseBuffer);
}

const server = net.createServer((socket) => {
    console.log('Palm client connected:', socket.remoteAddress + ':' + socket.remotePort);
    
    let buffer = Buffer.alloc(0);
    
    socket.on('data', (data) => {
        console.log('Received data, length:', data.length);
        console.log('Data hex:', data.toString('hex'));
        
        // Accumulate data in buffer
        buffer = Buffer.concat([buffer, data]);
        
        // Try to parse complete messages
        while (buffer.length > 0) {
            const message = parseMessage(buffer);
            if (!message) {
                break; // Wait for more data
            }
            
            console.log('Parsed message type:', message.type.toString(16), 'length:', message.length);
            
            let response;
            switch (message.type) {
                case MSG_TYPE_REGISTER:
                    response = handleRegisterMessage(message.payload);
                    break;
                case MSG_TYPE_QUERY:
                    response = handleQueryMessage(message.payload);
                    break;
                case MSG_TYPE_DELETE:
                    response = handleDeleteMessage(message.payload);
                    break;
                case MSG_TYPE_LICENSE:
                    response = handleLicenseMessage(message.payload);
                    break;
                default:
                    console.log('Unknown message type:', message.type.toString(16));
                    // Try to respond with error
                    response = createResponse(message.type, RESPONSE_ERROR);
                    break;
            }
            
            if (response) {
                console.log('Sending response, length:', response.length);
                console.log('Response hex:', response.toString('hex'));
                socket.write(response);
            }
            
            // Move to next message
            buffer = message.remaining;
        }
    });
    
    socket.on('error', (err) => {
        console.log('Socket error:', err.message);
    });
    
    socket.on('close', () => {
        console.log('Palm client disconnected');
    });
});

const PORT = 8888;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Palm TCP Server listening on ${HOST}:${PORT}`);
    console.log('Waiting for palm client connections...');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
