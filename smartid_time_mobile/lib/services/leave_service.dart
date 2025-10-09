import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'supabase_service.dart';

class LeaveService extends ChangeNotifier {
  static const String apiBaseUrl = 'http://localhost:3003/api';
  
  Map<String, dynamic>? _leaveData;
  List<Map<String, dynamic>> _leaveHistory = [];
  Map<String, dynamic> _leaveBalance = {
    'total': 14,
    'used': 0,
    'remaining': 14,
  };
  List<Map<String, dynamic>> _leaveTypes = [];
  List<Map<String, dynamic>> _leaveBalances = [];
  List<Map<String, dynamic>> _leaveQuotas = []; // Real quota data from API
  bool _isLoading = false;
  String? _error;
  DateTime? _lastUpdated;

  // Getters
  Map<String, dynamic>? get leaveData => _leaveData;
  List<Map<String, dynamic>> get leaveHistory => _leaveHistory;
  Map<String, dynamic> get leaveBalance => _leaveBalance;
  List<Map<String, dynamic>> get leaveTypes => _leaveTypes;
  List<Map<String, dynamic>> get leaveBalances => _leaveBalances;
  List<Map<String, dynamic>> get leaveQuotas => _leaveQuotas;
  bool get isLoading => _isLoading;
  String? get error => _error;
  DateTime? get lastUpdated => _lastUpdated;

  // Fetch leave data
  Future<void> fetchLeaveData(String userId, [String? employeeId, String? institutionId]) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('📋 Fetching leave data for user: $userId, institution: $institutionId');
      
      // Fetch leave types
      await _fetchLeaveTypes(userId, employeeId);
      
      // Fetch leave balances
      await _fetchLeaveBalances(userId, employeeId);
      
      // Fetch leave quotas (real data)
      await _fetchLeaveQuotas(userId, employeeId);
      
      // Fetch leave balance
      await _fetchLeaveBalance(userId, employeeId);
      
      // Fetch leave history
      await _fetchLeaveHistory(userId, employeeId, institutionId);
      
      _lastUpdated = DateTime.now();
      _error = null;
      
      print('✅ Leave data fetched successfully');
    } catch (e) {
      _error = 'Failed to load leave data: ${e.toString()}';
      print('❌ Leave data fetch error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch leave balance
  Future<void> _fetchLeaveBalance(String userId, [String? employeeId]) async {
    try {
      String apiUrl;
      if (employeeId != null && employeeId.isNotEmpty) {
        apiUrl = '$apiBaseUrl/leave/balance?employeeId=$employeeId';
      } else {
        apiUrl = '$apiBaseUrl/leave/balance?userId=$userId';
      }
      
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _leaveBalance = {
            'total': data['data']['total_leave'] ?? 14,
            'used': data['data']['used_leave'] ?? 0,
            'remaining': data['data']['remaining_leave'] ?? 14,
          };
          print('✅ Leave balance: ${_leaveBalance['remaining']} days remaining');
        }
      }
    } catch (e) {
      print('❌ Error fetching leave balance: $e');
      // Use default values if API fails
      _leaveBalance = {
        'total': 14,
        'used': 0,
        'remaining': 14,
      };
    }
  }

  // Fetch leave quotas from API
  Future<void> _fetchLeaveQuotas(String userId, [String? employeeId]) async {
    try {
      // Use the auth_user_id passed from the auth service
      final String authUserId = userId.isNotEmpty ? userId : '7f185f03-7aca-47c2-900f-04033476ea8b';
      
      String apiUrl = '$apiBaseUrl/leave/quota?userId=$authUserId';
      
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080',
        },
      );
      
      print('📊 Leave quota API response: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null && data['data']['quotas'] != null) {
          final quotaData = data['data'];
          final quotas = List<Map<String, dynamic>>.from(quotaData['quotas']);
          
          _leaveQuotas = quotas.map((quota) => {
            'leaveTypeId': quota['leaveTypeId'],
            'leaveTypeName': quota['leaveTypeName'],
            'leaveTypeCode': quota['leaveTypeCode'],
            'allocatedDays': quota['allocatedDays'],
            'usedDays': quota['usedDays'],
            'remainingDays': quota['remainingDays'],
            'hasAnnualQuota': quota['hasAnnualQuota'],
          }).toList();
          
          print('✅ Leave quotas loaded: ${_leaveQuotas.length} types');
          for (var quota in _leaveQuotas) {
            print('  - ${quota['leaveTypeName']}: ${quota['remainingDays']}/${quota['allocatedDays']} remaining');
          }
        } else {
          print('⚠️ No quota data returned from API');
          _leaveQuotas = [];
        }
      } else {
        print('❌ Leave quota API failed with status: ${response.statusCode}');
        print('❌ Response body: ${response.body}');
        _leaveQuotas = [];
      }
    } catch (e) {
      print('❌ Error fetching leave quotas: $e');
      _leaveQuotas = [];
    }
  }

  // Fetch leave types
  Future<void> _fetchLeaveTypes(String userId, [String? employeeId]) async {
    try {
      // For now, use default leave types - can be enhanced to fetch from API
      _leaveTypes = [
        {
          'id': 'annual',
          'name': 'Annual Leave',
          'icon': '🏖️',
          'color': '#4CAF50',
        },
        {
          'id': 'sick',
          'name': 'Sick Leave',
          'icon': '🏥',
          'color': '#F44336',
        },
        {
          'id': 'emergency',
          'name': 'Emergency Leave',
          'icon': '🚨',
          'color': '#FF9800',
        },
        {
          'id': 'maternity',
          'name': 'Maternity Leave',
          'icon': '👶',
          'color': '#E91E63',
        },
        {
          'id': 'paternity',
          'name': 'Paternity Leave',
          'icon': '👨‍👶',
          'color': '#2196F3',
        },
        {
          'id': 'compassionate',
          'name': 'Compassionate Leave',
          'icon': '💙',
          'color': '#9C27B0',
        },
      ];
      print('✅ Leave types loaded: ${_leaveTypes.length}');
    } catch (e) {
      print('❌ Error fetching leave types: $e');
      _leaveTypes = [];
    }
  }

  // Fetch leave balances for each type
  Future<void> _fetchLeaveBalances(String userId, [String? employeeId]) async {
    try {
      // Mock leave balances - in production, fetch from API
      _leaveBalances = [
        {
          'type': 'annual',
          'name': 'Annual Leave',
          'allocated': 21,
          'used': 8,
          'remaining': 13,
          'icon': '🏖️',
          'color': '#4CAF50',
        },
        {
          'type': 'sick',
          'name': 'Sick Leave',
          'allocated': 14,
          'used': 3,
          'remaining': 11,
          'icon': '🏥',
          'color': '#F44336',
        },
        {
          'type': 'emergency',
          'name': 'Emergency Leave',
          'allocated': 5,
          'used': 1,
          'remaining': 4,
          'icon': '🚨',
          'color': '#FF9800',
        },
        {
          'type': 'maternity',
          'name': 'Maternity Leave',
          'allocated': 90,
          'used': 0,
          'remaining': 90,
          'icon': '👶',
          'color': '#E91E63',
        },
      ];
      print('✅ Leave balances loaded: ${_leaveBalances.length}');
    } catch (e) {
      print('❌ Error fetching leave balances: $e');
      _leaveBalances = [];
    }
  }

  // Fetch leave history
  Future<void> _fetchLeaveHistory(String userId, [String? employeeId, String? institutionId]) async {
    try {
      print('📋 Fetching leave applications for user: $userId, institution: $institutionId');
      print('📋 User ID received: "$userId" (length: ${userId.length})');
      print('📋 Institution ID: "${institutionId ?? 'null'}"');
      
      // Use the auth_user_id passed from the auth service (should be session.user.id)
      final String authUserId = userId.isNotEmpty ? userId : '7f185f03-7aca-47c2-900f-04033476ea8b';
      print('📋 Auth User ID that will be used: "$authUserId"');
      
      // Build API URL with required parameters - using the working history endpoint
      String apiUrl = '$apiBaseUrl/leave/history?userId=$authUserId';
      print('📋 Using auth_user_id: $authUserId (from auth service or fallback)');
      
      print('📋 API URL: $apiUrl');
      
      // Use the leave/history API to get all applications for this user
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080',
        },
      );
      
      print('📋 Leave applications API response: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('📋 Raw API Response: ${json.encode(data)}');
        
        if (data['success'] == true && data['data'] != null) {
          // Debug: Print raw data structure
          final allApplications = List<Map<String, dynamic>>.from(data['data']);
          print('📋 Total applications received: ${allApplications.length}');
          
          // Debug: Print first application structure to understand format
          if (allApplications.isNotEmpty) {
            print('📋 Sample application structure: ${json.encode(allApplications[0])}');
            print('📋 Available keys: ${allApplications[0].keys.toList()}');
          }
          
          // Map applications from leave/history API response format to Flutter format
          _leaveHistory = allApplications.map((app) {
            print('📋 Processing app: ${app['id']} - Keys: ${app.keys.toList()}');
            return {
              'id': app['id'],
              'leave_type': app['leaveType'] ?? 'Unknown', // History API returns leaveType as string
              'start_date': app['startDate'],
              'end_date': app['endDate'], 
              'reason': app['reason'],
              'status': app['status'],
              'total_days': app['totalDays'],
              'application_number': app['applicationNumber'],
              'supporting_documents': [], // History API doesn't include this field
              'applied_date': app['appliedDate'],
              'user_name': app['user_name'] ?? app['userName'], // May not be available in history API
              'employee_id': app['employee_id'] ?? app['employeeId'], // May not be available in history API
              'rejection_reason': app['rejectionReason'], // Include rejection reason for rejected applications
              'approval_comments': app['approvalComments'], // Include approval comments for approved applications
            };
          }).toList();
          
          print('✅ Leave history loaded: ${_leaveHistory.length} records for user $userId');
          
          // Debug: Print each application
          for (var app in _leaveHistory) {
            print('  - ${app['application_number']}: ${app['leave_type']} (${app['status']})');
          }
        } else {
          print('⚠️ No leave applications data or API returned success=false');
          _leaveHistory = [];
        }
      } else {
        print('❌ Leave applications API failed with status: ${response.statusCode}');
        print('❌ Response body: ${response.body}');
        _leaveHistory = [];
      }
    } catch (e) {
      print('❌ Error fetching leave history: $e');
      _leaveHistory = [];
    }
  }

  // Submit leave request
  Future<bool> submitLeaveRequest({
    required String userId,
    String? employeeId,
    required String leaveType,
    required DateTime startDate,
    required DateTime endDate,
    required String reason,
    String? attachmentUrl,
  }) async {
    try {
      _error = null;
      notifyListeners();

      // Calculate total working days
      final totalDays = calculateWorkingDays(startDate, endDate);
      
      // Use the auth_user_id passed from the auth service
      final String authUserId = userId.isNotEmpty ? userId : '7f185f03-7aca-47c2-900f-04033476ea8b';
      
      final requestBody = {
        'userId': authUserId,
        'employeeId': employeeId,
        'leaveType': leaveType, // This will be mapped to leave_type_id on backend
        'startDate': startDate.toIso8601String().split('T')[0], // YYYY-MM-DD format
        'endDate': endDate.toIso8601String().split('T')[0],
        'totalDays': totalDays.toDouble(),
        'reason': reason,
        'supportingDocumentsUrls': attachmentUrl != null ? [attachmentUrl] : [],
        'status': 'pending', // Default status
        'approvalLevel': 1, // Start at level 1
        'appliedDate': DateTime.now().toIso8601String().split('T')[0],
      };

      final response = await http.post(
        Uri.parse('$apiBaseUrl/leave/request'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(requestBody),
      );

      final data = json.decode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Leave request submitted: ${data['message']}');
        
        // Refresh leave data
        await fetchLeaveData(userId, employeeId);
        return true;
      } else {
        _error = data['error'] ?? 'Leave request failed';
        print('❌ Leave request failed: ${_error}');
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Leave request failed: $e';
      print('❌ Leave request error: $e');
      notifyListeners();
      return false;
    }
  }

  // Cancel leave request
  Future<bool> cancelLeaveRequest({
    required String userId,
    required String leaveRequestId,
    String? employeeId,
  }) async {
    try {
      _error = null;
      notifyListeners();

      // Use the auth_user_id passed from the auth service
      final String authUserId = userId.isNotEmpty ? userId : '7f185f03-7aca-47c2-900f-04033476ea8b';

      final requestBody = {
        'userId': authUserId,
        'employeeId': employeeId,
        'leaveApplicationId': leaveRequestId, // Maps to leave_applications.id
        'status': 'cancelled', // Update status to cancelled
      };

      final response = await http.delete(
        Uri.parse('$apiBaseUrl/leave/request'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(requestBody),
      );

      final data = json.decode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Leave request cancelled: ${data['message']}');
        
        // Refresh leave data
        await fetchLeaveData(userId, employeeId);
        return true;
      } else {
        _error = data['error'] ?? 'Leave cancellation failed';
        print('❌ Leave cancellation failed: ${_error}');
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Leave cancellation failed: $e';
      print('❌ Leave cancellation error: $e');
      notifyListeners();
      return false;
    }
  }

  // Refresh all data
  Future<void> refreshData(String userId, [String? employeeId, String? institutionId]) async {
    await fetchLeaveData(userId, employeeId, institutionId);
  }

  // Clear all data
  void clearData() {
    _leaveData = null;
    _leaveHistory = [];
    _leaveBalance = {
      'total': 14,
      'used': 0,
      'remaining': 14,
    };
    _isLoading = false;
    _error = null;
    _lastUpdated = null;
    notifyListeners();
  }

  // Get leave type display name
  String getLeaveTypeDisplayName(String type) {
    // API already returns properly formatted names like "Annual Leave", "Sick Leave"
    // Just return the type as-is if it's already formatted, otherwise try to format it
    if (type.contains(' ') && type.contains('Leave')) {
      // Already formatted (e.g., "Annual Leave", "Sick Leave")
      return type;
    }
    
    // Handle short codes if needed
    switch (type.toLowerCase()) {
      case 'sick':
      case 'sl':
        return 'Sick Leave';
      case 'annual':
      case 'al':
        return 'Annual Leave';
      case 'emergency':
      case 'el':
        return 'Emergency Leave';
      case 'maternity':
      case 'ml':
        return 'Maternity Leave';
      case 'paternity':
      case 'pl':
        return 'Paternity Leave';
      case 'compassionate':
      case 'cl':
        return 'Compassionate Leave';
      case 'study':
        return 'Study Leave';
      default:
        return type; // Return as-is instead of "Other"
    }
  }

  // Get status color
  int getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return 0xFF10B981; // Green
      case 'rejected':
        return 0xFFEF4444; // Red
      case 'pending':
        return 0xFFF59E0B; // Orange
      default:
        return 0xFF6B7280; // Gray
    }
  }

  // Get quota balance for a specific leave type
  Map<String, dynamic>? getQuotaForLeaveType(String leaveType) {
    // Try to find quota by leave type name or code
    for (var quota in _leaveQuotas) {
      if (quota['leaveTypeName'].toString().toLowerCase().contains(leaveType.toLowerCase()) ||
          quota['leaveTypeCode'].toString().toLowerCase() == leaveType.toLowerCase()) {
        return quota;
      }
    }
    return null;
  }
  
  // Check if user has sufficient quota for requested days
  bool hasQuotaForLeave(String leaveType, int requestedDays) {
    final quota = getQuotaForLeaveType(leaveType);
    if (quota == null) return false;
    
    final remainingDays = quota['remainingDays'] as int? ?? 0;
    return remainingDays >= requestedDays;
  }
  
  // Get quota display text for UI
  String getQuotaDisplayText(String leaveType) {
    final quota = getQuotaForLeaveType(leaveType);
    if (quota == null) return 'Quota not available';
    
    final remaining = quota['remainingDays'] as int? ?? 0;
    final allocated = quota['allocatedDays'] as int? ?? 0;
    return '$remaining of $allocated days remaining';
  }
  
  // Get available quota days for a leave type
  int getAvailableQuota(String leaveType) {
    final quota = getQuotaForLeaveType(leaveType);
    if (quota == null) return 0;
    
    return quota['remainingDays'] as int? ?? 0;
  }

  // Generate mock leave data to demonstrate UI can show 6+ applications
  List<Map<String, dynamic>> _generateMockLeaveData() {
    return [
      {
        'id': 'mock-1',
        'application_number': 'LA2025-1001',
        'leave_type': 'Annual Leave',
        'start_date': '2025-01-15',
        'end_date': '2025-01-17',
        'total_days': 3,
        'reason': 'Family vacation - Mock Data',
        'status': 'approved',
        'applied_date': '2025-01-01',
        'supporting_documents': [],
        'user_name': 'Test User',
        'employee_id': 'EMP001'
      },
      {
        'id': 'mock-2',
        'application_number': 'LA2025-1002', 
        'leave_type': 'Sick Leave',
        'start_date': '2025-01-20',
        'end_date': '2025-01-21',
        'total_days': 2,
        'reason': 'Medical appointment - Mock Data',
        'status': 'pending',
        'applied_date': '2025-01-02',
        'supporting_documents': [],
        'user_name': 'Test User',
        'employee_id': 'EMP001'
      },
      {
        'id': 'mock-3',
        'application_number': 'LA2025-1003',
        'leave_type': 'Emergency Leave', 
        'start_date': '2025-02-01',
        'end_date': '2025-02-01',
        'total_days': 1,
        'reason': 'Family emergency - Mock Data',
        'status': 'approved',
        'applied_date': '2025-01-28',
        'supporting_documents': [],
        'user_name': 'Test User',
        'employee_id': 'EMP001'
      },
      {
        'id': 'mock-4',
        'application_number': 'LA2025-1004',
        'leave_type': 'Annual Leave',
        'start_date': '2025-02-10',
        'end_date': '2025-02-14',
        'total_days': 5,
        'reason': 'Long weekend getaway - Mock Data',
        'status': 'pending',
        'applied_date': '2025-01-05',
        'supporting_documents': [],
        'user_name': 'Test User',
        'employee_id': 'EMP001'
      },
      {
        'id': 'mock-5',
        'application_number': 'LA2025-1005',
        'leave_type': 'Maternity Leave',
        'start_date': '2025-03-01',
        'end_date': '2025-05-30',
        'total_days': 90,
        'reason': 'Maternity leave - Mock Data',
        'status': 'approved',
        'applied_date': '2025-01-10',
        'supporting_documents': [],
        'user_name': 'Test User',
        'employee_id': 'EMP001'
      },
      {
        'id': 'mock-6',
        'application_number': 'LA2025-1006',
        'leave_type': 'Study Leave',
        'start_date': '2025-03-15',
        'end_date': '2025-03-16',
        'total_days': 2,
        'reason': 'Professional development course - Mock Data',
        'status': 'pending',
        'applied_date': '2025-01-12',
        'supporting_documents': [],
        'user_name': 'Test User',
        'employee_id': 'EMP001'
      }
    ];
  }

  // Calculate working days between two dates
  int calculateWorkingDays(DateTime startDate, DateTime endDate) {
    int workingDays = 0;
    DateTime current = startDate;
    
    while (current.isBefore(endDate) || current.isAtSameMomentAs(endDate)) {
      // Skip weekends (Saturday = 6, Sunday = 7)
      if (current.weekday < 6) {
        workingDays++;
      }
      current = current.add(Duration(days: 1));
    }
    
    return workingDays;
  }
}