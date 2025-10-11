// ================================================
// SmartID Card System Usage Examples
// Demonstrates how to use the SmartID card RFID/NFC system
// ================================================

import { smartIDCardService } from '../supabase/services/rfidService.js';

/**
 * Example 1: Initialize the card reader
 */
async function initializeReader() {
    try {
        await smartIDCardService.initializeReader({
            location: 'Main Campus Entrance',
            deviceId: 'XT-N424-WR-001'
        });
        
        console.log('✅ Reader initialized successfully');
        
        // Set up card detection callback
        smartIDCardService.setCardDetectionCallback((result) => {
            console.log('🆔 Card detected:', result);
            
            if (result.success) {
                console.log(`✅ ${result.action} - ${result.user.user_name}`);
            } else {
                console.log(`❌ ${result.message}`);
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize reader:', error);
    }
}

/**
 * Example 2: Register a new SmartID card (RFID type)
 */
async function registerRFIDCard() {
    const cardData = {
        uid: '04:A1:B2:C3:D4:E5:F6', // Example UID
        technology: 'rfid',
        chipType: 'ntag424',
        cardNumber: 'SID-2024-001',
        name: 'Staff Access Card',
        uidLength: 7,
        atq: '0044',
        sak: '00'
    };
    
    const readerInfo = {
        reader_type: 'XT-N424-WR',
        connection: 'USB',
        firmware: '1.2.3'
    };
    
    try {
        const card = await smartIDCardService.registerCard(cardData, readerInfo);
        console.log('✅ SmartID card registered:', card);
        return card;
    } catch (error) {
        console.error('❌ Failed to register card:', error);
    }
}

/**
 * Example 3: Register a new SmartID card (NFC type)
 */
async function registerNFCCard() {
    const cardData = {
        uid: '04:B1:C2:D3:E4:F5:A6', // Example UID
        technology: 'nfc',
        chipType: 'mifare-1k',
        cardNumber: 'SID-2024-002',
        name: 'Student Access Card',
        uidLength: 4,
        atq: '0004',
        sak: '08'
    };
    
    try {
        const card = await smartIDCardService.registerCard(cardData);
        console.log('✅ SmartID NFC card registered:', card);
        return card;
    } catch (error) {
        console.error('❌ Failed to register NFC card:', error);
    }
}

/**
 * Example 4: Enroll a card to a user
 */
async function enrollCardToUser(cardUid, userId, institutionId, enrolledBy) {
    const enrollmentOptions = {
        accessLevel: 'standard',
        reason: 'New employee card enrollment',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    };
    
    try {
        const enrollment = await smartIDCardService.enrollCardToUser(
            cardUid, userId, institutionId, enrolledBy, enrollmentOptions
        );
        
        console.log('✅ Card enrolled to user:', enrollment);
        console.log('💳 Wallet created automatically:', enrollment.card_wallets);
        return enrollment;
    } catch (error) {
        console.error('❌ Failed to enroll card:', error);
    }
}

/**
 * Example 5: Simulate card detection for testing
 */
async function simulateCardDetection(cardUid) {
    const cardDetails = {
        type: 'ntag424',
        technology: 'rfid',
        atq: '0044',
        sak: '00',
        uidLength: 7,
        signalStrength: 85,
        coordinates: {
            latitude: 3.1390, 
            longitude: 101.6869, // Kuala Lumpur coordinates
            accuracy: 5
        }
    };
    
    try {
        const result = await smartIDCardService.simulateCardDetection(cardUid, cardDetails);
        
        if (result.success) {
            console.log('✅ Card detection processed:', result);
            console.log(`📍 Action: ${result.action}`);
            console.log(`👤 User: ${result.user?.user_name}`);
            console.log(`🏢 Institution: ${result.user?.institution_name}`);
        } else {
            console.log('❌ Card detection failed:', result.message);
        }
        
        return result;
    } catch (error) {
        console.error('❌ Card simulation error:', error);
    }
}

/**
 * Example 6: Process a wallet transaction
 */
async function processPayment(cardUid, amount, description = 'Cafeteria purchase') {
    try {
        // First check wallet balance
        const wallet = await smartIDCardService.getCardWallet(cardUid);
        
        if (!wallet) {
            console.log('❌ No wallet found for this card');
            return;
        }
        
        console.log(`💰 Current balance: RM${wallet.wallet_balance}`);
        
        if (wallet.wallet_balance < amount) {
            console.log('❌ Insufficient balance');
            return;
        }
        
        // Process payment
        const transaction = await smartIDCardService.processWalletTransaction(
            cardUid, 
            'debit', 
            amount, 
            description,
            {
                category: 'food',
                merchantInfo: {
                    name: 'Campus Cafeteria',
                    location: 'Main Building'
                }
            }
        );
        
        if (transaction.success) {
            console.log('✅ Payment processed:', transaction);
            console.log(`💳 New balance: RM${transaction.newBalance}`);
        } else {
            console.log('❌ Payment failed:', transaction.message);
        }
        
        return transaction;
    } catch (error) {
        console.error('❌ Payment processing error:', error);
    }
}

/**
 * Example 7: Top up wallet
 */
async function topUpWallet(cardUid, amount) {
    try {
        const transaction = await smartIDCardService.processWalletTransaction(
            cardUid,
            'credit',
            amount,
            'Wallet top-up',
            {
                category: 'topup',
                reference: `TOPUP-${Date.now()}`
            }
        );
        
        if (transaction.success) {
            console.log('✅ Wallet topped up:', transaction);
            console.log(`💳 New balance: RM${transaction.newBalance}`);
        } else {
            console.log('❌ Top-up failed:', transaction.message);
        }
        
        return transaction;
    } catch (error) {
        console.error('❌ Top-up error:', error);
    }
}

/**
 * Example 8: Get today's attendance for SmartID cards
 */
async function getTodaysAttendance(institutionId = null) {
    try {
        const attendance = await smartIDCardService.getTodaysSmartIDAttendance(institutionId);
        
        console.log(`📊 Today's SmartID card attendance (${attendance.length} records):`);
        
        attendance.forEach(record => {
            const checkIn = record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-';
            const checkOut = record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-';
            
            console.log(`👤 ${record.user_name} (${record.employee_id}): In=${checkIn}, Out=${checkOut}`);
        });
        
        return attendance;
    } catch (error) {
        console.error('❌ Failed to get attendance:', error);
    }
}

/**
 * Example 9: Get recent card access events
 */
async function getRecentAccess(institutionId = null, limit = 10) {
    try {
        const events = await smartIDCardService.getRecentCardAccess(institutionId, limit);
        
        console.log(`📋 Recent SmartID card access (${events.length} events):`);
        
        events.forEach(event => {
            const time = new Date(event.detected_at).toLocaleString();
            const result = event.access_result === 'granted' ? '✅' : '❌';
            
            console.log(`${result} ${time} - ${event.user_name} (${event.card_technology?.toUpperCase()}) - ${event.event_type}`);
        });
        
        return events;
    } catch (error) {\n        console.error('❌ Failed to get recent access:', error);\n    }\n}\n\n/**\n * Example 10: Complete workflow demonstration\n */\nasync function demonstrateCompleteWorkflow() {\n    console.log('🚀 Starting SmartID Card System Demo...');\n    \n    try {\n        // 1. Initialize reader\n        await initializeReader();\n        \n        // 2. Register cards\n        const rfidCard = await registerRFIDCard();\n        const nfcCard = await registerNFCCard();\n        \n        // 3. Simulate card enrollments (you'll need actual user/institution IDs)\n        // const enrollment1 = await enrollCardToUser(rfidCard.card_uid, 'user-id-1', 'institution-id', 'admin-id');\n        // const enrollment2 = await enrollCardToUser(nfcCard.card_uid, 'user-id-2', 'institution-id', 'admin-id');\n        \n        // 4. Simulate card detections\n        if (rfidCard) {\n            console.log('\\n📱 Simulating RFID card detection...');\n            await simulateCardDetection(rfidCard.card_uid);\n        }\n        \n        if (nfcCard) {\n            console.log('\\n📱 Simulating NFC card detection...');\n            await simulateCardDetection(nfcCard.card_uid);\n        }\n        \n        // 5. Get today's attendance\n        console.log('\\n📊 Getting today\\'s attendance...');\n        await getTodaysAttendance();\n        \n        // 6. Get recent access events\n        console.log('\\n📋 Getting recent access events...');\n        await getRecentAccess();\n        \n        console.log('\\n✅ Demo completed successfully!');\n        \n    } catch (error) {\n        console.error('❌ Demo failed:', error);\n    }\n}\n\n// Export functions for use in other modules\nexport {\n    initializeReader,\n    registerRFIDCard,\n    registerNFCCard,\n    enrollCardToUser,\n    simulateCardDetection,\n    processPayment,\n    topUpWallet,\n    getTodaysAttendance,\n    getRecentAccess,\n    demonstrateCompleteWorkflow\n};\n\n// Run demo if this file is executed directly\nif (import.meta.url === `file://${process.argv[1]}`) {\n    demonstrateCompleteWorkflow();\n}