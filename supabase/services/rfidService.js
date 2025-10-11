// ================================================
// SmartID Card Service for RFID/NFC Card System
// Integrates with existing SmartID Time attendance system
// Uses XT-N424 WR NFC/RFID reader for SmartID card detection
// Supports both RFID and NFC SmartID cards
// ================================================

import { supabase } from '../supabaseClient.js';

class SmartIDCardService {
    constructor() {
        this.readerType = 'XT-N424-WR';
        this.isConnected = false;
        this.currentLocation = null;
        this.onCardDetectedCallback = null;
        this.onStatusChangeCallback = null;
    }

    // ================================================
    // 1. Card Management Functions
    // ================================================

    /**
     * Register a new SmartID card in the system
     * @param {Object} cardData - Card information from XT-N424 WR reader
     * @param {string} cardData.uid - Card UID (7 bytes for NTAG424)
     * @param {string} cardData.technology - Card technology: 'rfid' or 'nfc'
     * @param {string} cardData.chipType - Card chip type (ntag424, mifare-1k, etc.)
     * @param {string} cardData.atq - Answer To Request from reader
     * @param {string} cardData.sak - Select Acknowledge from reader
     * @param {number} cardData.uidLength - UID length in bytes
     * @param {Object} readerInfo - Reader connection info
     * @returns {Object} Created card record
     */
    async registerCard(cardData, readerInfo = {}) {
        try {
            const { data, error } = await supabase
                .from('smartid_cards')
                .insert({
                    card_uid: cardData.uid,
                    card_brand: 'SmartID Card', // Always "SmartID Card"
                    card_technology: cardData.technology || 'nfc', // rfid or nfc
                    card_chip_type: cardData.chipType || 'ntag424',
                    card_number: cardData.cardNumber || null,
                    card_name: cardData.name || null,
                    manufacturer: cardData.manufacturer || 'NXP',
                    uid_length: cardData.uidLength || 7,
                    atq: cardData.atq || null,
                    sak: cardData.sak || null,
                    is_active: true,
                    reader_info: readerInfo,
                    technical_data: {
                        atq: cardData.atq,
                        sak: cardData.sak,
                        memory_size: cardData.memorySize,
                        detected_protocols: cardData.protocols,
                        technology: cardData.technology
                    },
                    detection_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error registering SmartID card:', error);
                throw error;
            }

            console.log('SmartID card registered successfully:', data);
            return data;

        } catch (error) {
            console.error('Failed to register SmartID card:', error);
            throw error;
        }
    }

    /**
     * Enroll a card to a user (link card to user account)
     * @param {string} cardUid - Card UID to enroll
     * @param {string} userId - User ID to link the card to
     * @param {string} institutionId - Institution ID
     * @param {string} enrolledBy - ID of user performing the enrollment
     * @param {Object} enrollmentOptions - Additional enrollment settings
     * @returns {Object} Created enrollment record with auto-generated wallet
     */
    async enrollCardToUser(cardUid, userId, institutionId, enrolledBy, enrollmentOptions = {}) {
        try {
            // First, get the card record
            const { data: cardData, error: cardError } = await supabase
                .from('smartid_cards')
                .select('id')
                .eq('card_uid', cardUid)
                .eq('is_active', true)
                .single();

            if (cardError || !cardData) {
                throw new Error(`Card with UID ${cardUid} not found or inactive`);
            }

            // Create card enrollment (this will auto-create wallet via trigger)
            const { data, error } = await supabase
                .from('card_enrollments')
                .insert({
                    card_id: cardData.id,
                    user_id: userId,
                    institution_id: institutionId,
                    enrollment_status: 'active',
                    enrollment_date: new Date().toISOString(),
                    expiry_date: enrollmentOptions.expiryDate || null,
                    access_level: enrollmentOptions.accessLevel || 'standard',
                    allowed_locations: enrollmentOptions.allowedLocations || [],
                    access_schedule: enrollmentOptions.accessSchedule || {},
                    enrollment_reason: enrollmentOptions.reason || 'Regular enrollment',
                    enrolled_by: enrolledBy,
                    usage_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select(`
                    *,
                    smartid_cards!inner(*),
                    users!inner(*),
                    card_wallets(*)
                `)
                .single();

            if (error) {
                console.error('Error enrolling card to user:', error);
                throw error;
            }

            console.log('Card enrolled successfully:', data);
            return data;

        } catch (error) {
            console.error('Failed to enroll card to user:', error);
            throw error;
        }
    }

    /**
     * Get user information by card UID
     * @param {string} cardUid - Card UID scanned by reader
     * @returns {Object|null} User and enrollment information
     */
    async getUserByCard(cardUid) {
        try {
            const { data, error } = await supabase
                .from('active_card_enrollments')
                .select('*')
                .eq('card_uid', cardUid)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error getting user by card:', error);
                throw error;
            }

            return data || null;

        } catch (error) {
            console.error('Failed to get user by card:', error);
            return null;
        }
    }

    // ================================================
    // 2. Card Detection & Access Events
    // ================================================

    /**
     * Process card detection from XT-N424 WR reader
     * @param {Object} detectionData - Raw data from NFC reader
     * @param {string} detectionData.uid - Card UID detected
     * @param {string} detectionData.type - Card type
     * @param {Object} detectionData.technical - Technical details (ATQ, SAK, etc.)
     * @param {Object} locationInfo - Location where card was detected
     * @returns {Object} Processing result
     */
    async processCardDetection(detectionData, locationInfo = {}) {
        console.log('Processing card detection:', detectionData);

        try {
            // Get user enrollment info by card UID
            const userInfo = await this.getUserByCard(detectionData.uid);
            
            if (!userInfo) {
                // Log unknown card detection
                await this.logCardAccessEvent(
                    null, null, null, null, null,
                    'verification', 'denied', 'card_not_enrolled',
                    detectionData, locationInfo
                );
                
                return {
                    success: false,
                    message: 'Card not enrolled in system',
                    action: 'denied',
                    cardUid: detectionData.uid
                };
            }

            // Check if enrollment is active
            if (userInfo.enrollment_status !== 'active') {
                await this.logCardAccessEvent(
                    userInfo.card_id, userInfo.enrollment_id, userInfo.user_id, 
                    userInfo.institution_id, locationInfo.locationId,
                    'verification', 'denied', 'enrollment_inactive',
                    detectionData, locationInfo
                );

                return {
                    success: false,
                    message: 'Card enrollment is inactive',
                    action: 'denied',
                    cardUid: detectionData.uid,
                    user: userInfo
                };
            }

            // Log successful card access event
            const accessEvent = await this.logCardAccessEvent(
                userInfo.card_id, userInfo.enrollment_id, userInfo.user_id,
                userInfo.institution_id, locationInfo.locationId,
                'attendance_in', 'granted', null,
                detectionData, locationInfo
            );

            // Process attendance using existing attendance_records table
            const attendanceResult = await this.processAttendance(
                userInfo.user_id, userInfo.institution_id,
                accessEvent.id, detectionData.uid, locationInfo
            );

            return {
                success: true,
                message: 'Card processed successfully',
                action: attendanceResult.action,
                cardUid: detectionData.uid,
                user: userInfo,
                attendance: attendanceResult,
                accessEvent: accessEvent
            };

        } catch (error) {
            console.error('Error processing card detection:', error);
            return {
                success: false,
                message: 'Error processing card',
                error: error.message,
                cardUid: detectionData.uid
            };
        }
    }

    /**
     * Log card access event in the database
     * @param {string} cardId - RFID card ID
     * @param {string} enrollmentId - Card enrollment ID  
     * @param {string} userId - User ID
     * @param {string} institutionId - Institution ID
     * @param {string} locationId - Location ID
     * @param {string} eventType - Type of access event
     * @param {string} accessResult - Result of access attempt
     * @param {string} denialReason - Reason for denial (if applicable)
     * @param {Object} detectionData - Technical card data
     * @param {Object} locationInfo - Reader location info
     * @returns {Object} Created access event record
     */
    async logCardAccessEvent(cardId, enrollmentId, userId, institutionId, locationId,
                           eventType, accessResult, denialReason, detectionData, locationInfo) {
        try {
            const { data, error } = await supabase
                .from('card_access_events')
                .insert({
                    card_id: cardId,
                    enrollment_id: enrollmentId,
                    user_id: userId,
                    institution_id: institutionId,
                    location_id: locationId,
                    event_type: eventType,
                    access_result: accessResult,
                    denial_reason: denialReason,
                    reader_type: this.readerType,
                    reader_location: locationInfo.readerLocation || 'Unknown',
                    detected_at: new Date().toISOString(),
                    processed_at: new Date().toISOString(),
                    processing_time_ms: locationInfo.processingTime || 0,
                    technical_details: {
                        uid: detectionData.uid,
                        type: detectionData.type,
                        atq: detectionData.technical?.atq,
                        sak: detectionData.technical?.sak,
                        signal_strength: detectionData.technical?.signalStrength,
                        uid_length: detectionData.technical?.uidLength
                    },
                    device_info: {
                        reader_type: this.readerType,
                        connection_type: locationInfo.connectionType || 'USB',
                        firmware_version: locationInfo.firmwareVersion,
                        location: locationInfo.location
                    },
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error logging card access event:', error);
                throw error;
            }

            return data;

        } catch (error) {
            console.error('Failed to log card access event:', error);
            throw error;
        }
    }

    // ================================================
    // 3. Attendance Integration with Existing System
    // ================================================

    /**
     * Process attendance using existing attendance_records table structure
     * Integrates RFID detection with your current check-in/check-out system
     * @param {string} userId - User ID
     * @param {string} institutionId - Institution ID  
     * @param {string} cardAccessEventId - Access event ID for linking
     * @param {string} cardUid - Card UID for reference
     * @param {Object} locationInfo - Location and device information
     * @returns {Object} Attendance processing result
     */
    async processAttendance(userId, institutionId, cardAccessEventId, cardUid, locationInfo = {}) {
        try {
            // Use the PostgreSQL function to handle attendance logic
            const { data, error } = await supabase
                .rpc('handle_rfid_attendance', {
                    p_user_id: userId,
                    p_institution_id: institutionId,
                    p_card_access_event_id: cardAccessEventId,
                    p_card_uid: cardUid,
                    p_location: locationInfo.coordinates || null,
                    p_device_id: locationInfo.deviceId || this.readerType,
                    p_work_group_id: locationInfo.workGroupId || null
                });

            if (error) {
                console.error('Error processing RFID attendance:', error);
                throw error;
            }

            console.log('RFID attendance processed:', data);
            return data;

        } catch (error) {
            console.error('Failed to process RFID attendance:', error);
            throw error;
        }
    }

    /**
     * Get today's attendance records for SmartID cards
     * @param {string} institutionId - Institution ID to filter by
     * @returns {Array} Today's SmartID card attendance records
     */
    async getTodaysSmartIDAttendance(institutionId) {
        try {
            let query = supabase
                .from('todays_smartid_attendance')
                .select('*');

            if (institutionId) {
                // Note: Would need to join with institutions table if filtering by institution
                // For now, return all records as the view handles the institution relationship
                query = query.order('check_in_time', { ascending: false });
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error getting today\'s SmartID attendance:', error);
                throw error;
            }

            return data || [];

        } catch (error) {
            console.error('Failed to get today\'s SmartID attendance:', error);
            return [];
        }
    }

    // ================================================
    // 4. E-Wallet Functions
    // ================================================

    /**
     * Get wallet information for a card
     * @param {string} cardUid - Card UID
     * @returns {Object|null} Wallet information
     */
    async getCardWallet(cardUid) {
        try {
            const { data, error } = await supabase
                .from('active_card_enrollments')
                .select('wallet_number, wallet_balance, wallet_status')
                .eq('card_uid', cardUid)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error getting card wallet:', error);
                throw error;
            }

            return data || null;

        } catch (error) {
            console.error('Failed to get card wallet:', error);
            return null;
        }
    }

    /**
     * Process a wallet transaction (payment/topup)
     * @param {string} cardUid - Card UID
     * @param {string} transactionType - 'debit' or 'credit'
     * @param {number} amount - Transaction amount
     * @param {string} description - Transaction description
     * @param {Object} transactionDetails - Additional transaction info
     * @returns {Object} Transaction result
     */
    async processWalletTransaction(cardUid, transactionType, amount, description, transactionDetails = {}) {
        try {
            // Get enrollment and wallet info
            const userInfo = await this.getUserByCard(cardUid);
            if (!userInfo) {
                throw new Error('Card not found');
            }

            // Get wallet details
            const { data: wallet, error: walletError } = await supabase
                .from('card_wallets')
                .select('*')
                .eq('enrollment_id', userInfo.enrollment_id)
                .single();

            if (walletError) {
                throw walletError;
            }

            // Validate transaction
            const balanceBefore = parseFloat(wallet.balance);
            let balanceAfter = balanceBefore;

            if (transactionType === 'debit') {
                if (balanceBefore < amount) {
                    return {
                        success: false,
                        message: 'Insufficient balance',
                        balance: balanceBefore
                    };
                }
                balanceAfter = balanceBefore - amount;
            } else if (transactionType === 'credit') {
                balanceAfter = balanceBefore + amount;
            }

            // Create transaction record
            const { data: transaction, error: transactionError } = await supabase
                .from('wallet_transactions')
                .insert({
                    wallet_id: wallet.id,
                    transaction_number: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                    transaction_type: transactionType,
                    category: transactionDetails.category || 'other',
                    amount: amount,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter,
                    description: description,
                    reference_number: transactionDetails.reference || null,
                    location_id: transactionDetails.locationId || null,
                    merchant_info: transactionDetails.merchantInfo || {},
                    payment_method: 'card_tap',
                    status: 'completed',
                    processed_by: transactionDetails.processedBy || null,
                    card_access_event_id: transactionDetails.accessEventId || null,
                    transaction_date: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (transactionError) {
                console.error('Error creating transaction:', transactionError);
                throw transactionError;
            }

            // Update wallet balance
            const { error: updateError } = await supabase
                .from('card_wallets')
                .update({
                    balance: balanceAfter,
                    last_transaction_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', wallet.id);

            if (updateError) {
                console.error('Error updating wallet balance:', updateError);
                throw updateError;
            }

            return {
                success: true,
                message: 'Transaction completed successfully',
                transaction: transaction,
                previousBalance: balanceBefore,
                newBalance: balanceAfter
            };

        } catch (error) {
            console.error('Failed to process wallet transaction:', error);
            return {
                success: false,
                message: 'Transaction failed',
                error: error.message
            };
        }
    }

    // ================================================
    // 5. Reader Integration Functions
    // ================================================

    /**
     * Initialize connection to XT-N424 WR reader
     * This would integrate with your actual reader SDK/API
     * @param {Object} config - Reader configuration
     */
    async initializeReader(config = {}) {
        try {
            console.log('Initializing XT-N424 WR reader...');
            
            // TODO: Initialize actual reader connection here
            // This would integrate with the XT-N424 WR SDK
            
            this.isConnected = true;
            this.currentLocation = config.location || 'Unknown';
            
            console.log('XT-N424 WR reader initialized successfully');
            
            if (this.onStatusChangeCallback) {
                this.onStatusChangeCallback({
                    connected: true,
                    reader: this.readerType,
                    location: this.currentLocation
                });
            }

        } catch (error) {
            console.error('Failed to initialize reader:', error);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Set callback for card detection events
     * @param {Function} callback - Function to call when card is detected
     */
    setCardDetectionCallback(callback) {
        this.onCardDetectedCallback = callback;
    }

    /**
     * Set callback for reader status changes
     * @param {Function} callback - Function to call when reader status changes
     */
    setStatusCallback(callback) {
        this.onStatusChangeCallback = callback;
    }

    /**
     * Simulate card detection (for testing)
     * In production, this would be triggered by actual reader events
     * @param {string} cardUid - Card UID to simulate
     * @param {Object} cardDetails - Additional card details
     */
    async simulateCardDetection(cardUid, cardDetails = {}) {
        const detectionData = {
            uid: cardUid,
            type: cardDetails.type || 'ntag424',
            technical: {
                atq: cardDetails.atq || '0044',
                sak: cardDetails.sak || '00',
                uidLength: cardDetails.uidLength || 7,
                signalStrength: cardDetails.signalStrength || 85
            }
        };

        const locationInfo = {
            readerLocation: this.currentLocation,
            deviceId: this.readerType,
            connectionType: 'USB',
            processingTime: Date.now() % 100,
            coordinates: cardDetails.coordinates || null,
            locationId: cardDetails.locationId || null
        };

        const result = await this.processCardDetection(detectionData, locationInfo);
        
        if (this.onCardDetectedCallback) {
            this.onCardDetectedCallback(result);
        }

        return result;
    }

    // ================================================
    // 6. Utility Functions
    // ================================================

    /**
     * Get card statistics and usage information
     * @param {string} institutionId - Institution ID to filter by
     * @returns {Object} Card usage statistics
     */
    async getCardStatistics(institutionId) {
        try {
            const { data, error } = await supabase
                .rpc('get_card_statistics', {
                    p_institution_id: institutionId
                });

            if (error) {
                console.error('Error getting card statistics:', error);
                throw error;
            }

            return data || {};

        } catch (error) {
            console.error('Failed to get card statistics:', error);
            return {};
        }
    }

    /**
     * Get recent card access events
     * @param {string} institutionId - Institution ID to filter by
     * @param {number} limit - Maximum number of records to return
     * @returns {Array} Recent access events
     */
    async getRecentCardAccess(institutionId, limit = 50) {
        try {
            let query = supabase
                .from('recent_card_access')
                .select('*')
                .limit(limit);

            // Note: The view would need to be modified to filter by institution
            // For now, return all records
            
            const { data, error } = await query;

            if (error) {
                console.error('Error getting recent card access:', error);
                throw error;
            }

            return data || [];

        } catch (error) {
            console.error('Failed to get recent card access:', error);
            return [];
        }
    }

    /**
     * Check reader connection status
     * @returns {Object} Connection status
     */
    getReaderStatus() {
        return {
            connected: this.isConnected,
            reader: this.readerType,
            location: this.currentLocation,
            timestamp: new Date().toISOString()
        };
    }
}

// Export singleton instance
export const smartIDCardService = new SmartIDCardService();
export const rfidService = smartIDCardService; // Backward compatibility alias
export default SmartIDCardService;
