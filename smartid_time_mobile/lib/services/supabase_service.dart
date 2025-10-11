import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class SupabaseService {
  static const String supabaseUrl = 'https://triiicqaljwajijeugul.supabase.co';
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyaWlpY3FhbGp3YWppamV1Z3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NjczMDMsImV4cCI6MjA3NDA0MzMwM30.gA_jqT0fRasv2otS92m1Y60Qmy20iSVgmp3n8Lfgzp8';
  static const String apiBaseUrl = 'http://localhost:3003/api';

  static late SupabaseClient _client;
  
  static SupabaseClient get client => _client;

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
    _client = Supabase.instance.client;
  }

  // Auth helpers
  static User? get currentUser => _client.auth.currentUser;
  static Session? get currentSession => _client.auth.currentSession;
  static Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  // User data helpers
  static Future<Map<String, dynamic>?> getUserData(String userId) async {
    try {
      print('🔍 Looking for user with auth_user_id: $userId');
      
      final currentUser = _client.auth.currentUser;
      if (currentUser?.email == null || currentUser!.email!.isEmpty) {
        print('❌ No current user email available');
        return null;
      }
      
      final userEmail = currentUser.email!;
      print('📧 Current user email: $userEmail');
      
      // Strategy 1: Try to find user by auth_user_id first
      var response = await _client
          .from('users')
          .select('''
            id,
            full_name,
            employee_id,
            email,
            ic_number,
            primary_role,
            smartid_time_role,
            phone,
            institution_id,
            status,
            auth_user_id,
            institutions(
              id,
              name
            )
          ''')
          .eq('auth_user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

      if (response != null) {
        print('✅ Found user by auth_user_id: ${response['full_name']}');
        return response;
      }
      
      // Strategy 2: Find by email (common case when web admin creates users)
      print('🔄 No user found by auth_user_id, trying email: $userEmail');
      
      response = await _client
          .from('users')
          .select('''
            id,
            full_name,
            employee_id,
            email,
            ic_number,
            primary_role,
            smartid_time_role,
            phone,
            institution_id,
            status,
            auth_user_id,
            institutions(
              id,
              name
            )
          ''')
          .eq('email', userEmail)
          .eq('status', 'active')
          .maybeSingle();
          
      if (response != null) {
        print('✅ Found user by email: ${response['full_name']}');
        print('🔗 Current auth_user_id in DB: ${response['auth_user_id']}');
        
        // Link this user record to the current auth user
        if (response['auth_user_id'] != userId) {
          print('🔄 Linking user record to auth account...');
          
          try {
            await _client
                .from('users')
                .update({
                  'auth_user_id': userId,
                  'updated_at': DateTime.now().toIso8601String()
                })
                .eq('id', response['id']);
            
            response['auth_user_id'] = userId;
            print('✅ Successfully linked user ${response['full_name']} to auth account');
          } catch (linkError) {
            print('❌ Error linking user to auth account: $linkError');
          }
        }
        
        return response;
      }
      
      // Strategy 3: List available users for debugging
      print('⚠️ No user found by email, checking available users...');
      
      final availableUsers = await _client
          .from('users')
          .select('id, full_name, email, ic_number, auth_user_id, status')
          .eq('status', 'active')
          .limit(5);
      
      print('Available active users:');
      for (var user in availableUsers) {
        print('  - ${user['full_name']} (${user['email']}) - auth_user_id: ${user['auth_user_id']}');
      }
      
      print('❌ No matching user found for email: $userEmail');
      return null;
    } catch (e) {
      print('❌ Error fetching user data: $e');
      return null;
    }
  }

  // Get user attendance summary using API
  static Future<Map<String, dynamic>?> getUserAttendanceSummary(String userId, [String? employeeId]) async {
    try {
      print('📊 Fetching attendance summary for user: $userId');
      
      String apiUrl;
      if (employeeId != null && employeeId.isNotEmpty) {
        apiUrl = '$apiBaseUrl/users/attendance?employeeId=$employeeId';
      } else {
        apiUrl = '$apiBaseUrl/users/attendance?userId=$userId';
      }
      
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          print('✅ Got attendance data from: ${data['source']}');
          return data['data'];
        }
      }
      
      print('⚠️ API call failed, using fallback');
      // Fallback data
      return {
        'total_days': 20,
        'present_days': 18,
        'attendance_rate': 90.0,
        'source': 'fallback'
      };
    } catch (e) {
      print('❌ Error fetching attendance summary: $e');
      return {
        'total_days': 20,
        'present_days': 18,
        'attendance_rate': 90.0,
        'source': 'error_fallback'
      };
    }
  }

  // Get user wallet balance using API
  static Future<Map<String, dynamic>?> getUserWalletBalance(String userId) async {
    try {
      print('💰 Fetching wallet balance for user: $userId');
      
      final apiUrl = '$apiBaseUrl/users/wallet?userId=$userId';
      
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          print('✅ Got wallet data from: ${data['source']}');
          return {
            'balance': data['data']['balance']?.toDouble() ?? 0.0,
            'currency': data['data']['currency'] ?? 'MYR',
            'status': data['data']['status'] ?? 'unknown',
            'source': data['source']
          };
        }
      }
      
      print('⚠️ Wallet API call failed, using fallback');
      // Fallback to RM0
      return {
        'balance': 0.0,
        'currency': 'MYR',
        'status': 'inactive',
        'source': 'fallback'
      };
    } catch (e) {
      print('❌ Error fetching wallet balance: $e');
      return {
        'balance': 0.0,
        'currency': 'MYR',
        'status': 'error',
        'source': 'error_fallback'
      };
    }
  }

  // Get user leave balance (placeholder)
  static Future<Map<String, int>> getUserLeaveBalance(String userId) async {
    try {
      // This is a placeholder - implement based on your leave schema
      final response = await _client
          .from('leave_balances')  // Adjust table name as needed
          .select('used_days, total_days')
          .eq('user_id', userId)
          .single();

      return {
        'used': response['used_days'] ?? 0,
        'total': response['total_days'] ?? 21,
      };
    } catch (e) {
      print('Error fetching leave balance: $e');
      return {'used': 8, 'total': 21}; // Default fallback
    }
  }
}
