import 'package:flutter/foundation.dart';
import 'supabase_service.dart';

class DashboardService extends ChangeNotifier {
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = false;
  String? _error;
  DateTime? _lastUpdated;

  Map<String, dynamic>? get dashboardData => _dashboardData;
  bool get isLoading => _isLoading;
  String? get error => _error;
  DateTime? get lastUpdated => _lastUpdated;

  // Get cached data or default values
  Map<String, dynamic> get attendanceData => _dashboardData?['attendance'] ?? {
    'attendance_rate': 92.0,
    'total_days': 20,
    'present_days': 18,
  };

  Map<String, dynamic> get walletData => _dashboardData?['wallet_data'] ?? {
    'balance': 0.0,
    'currency': 'MYR',
    'status': 'inactive',
    'source': 'fallback'
  };
  
  double get walletBalance => walletData['balance']?.toDouble() ?? 0.0;

  Map<String, int> get leaveBalance => Map<String, int>.from(
    _dashboardData?['leave_balance'] ?? {'used': 8, 'total': 21}
  );

  Future<void> fetchDashboardData(String userId, String? employeeId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('🔄 Fetching dashboard data for user: $userId, employeeId: $employeeId');
      
      // Fetch all dashboard data in parallel
      final results = await Future.wait([
        SupabaseService.getUserAttendanceSummary(userId, employeeId),
        SupabaseService.getUserWalletBalance(userId),
        SupabaseService.getUserLeaveBalance(userId),
      ]);

      _dashboardData = {
        'attendance': results[0],
        'wallet_data': results[1],
        'leave_balance': results[2],
      };

      _lastUpdated = DateTime.now();
      _error = null;
      
      print('✅ Dashboard data fetched successfully');
      print('  - Attendance: ${results[0]}');
      print('  - Wallet: ${results[1]}');
      print('  - Leave: ${results[2]}');
    } catch (e) {
      _error = 'Failed to load dashboard data: ${e.toString()}';
      print('❌ Dashboard data fetch error: $e');
      
      // Set fallback data on error
      _dashboardData = {
        'attendance': {
          'attendance_rate': 90.0,
          'total_days': 20,
          'present_days': 18,
          'source': 'error_fallback'
        },
        'wallet_data': {
          'balance': 0.0,
          'currency': 'MYR',
          'status': 'error',
          'source': 'error_fallback'
        },
        'leave_balance': {'used': 8, 'total': 21},
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshData(String userId, String? employeeId) async {
    await fetchDashboardData(userId, employeeId);
  }

  void clearData() {
    _dashboardData = null;
    _isLoading = false;
    _error = null;
    _lastUpdated = null;
    notifyListeners();
  }

  // Check if data needs refreshing (older than 5 minutes)
  bool get needsRefresh {
    if (_lastUpdated == null) return true;
    return DateTime.now().difference(_lastUpdated!).inMinutes > 5;
  }
}
