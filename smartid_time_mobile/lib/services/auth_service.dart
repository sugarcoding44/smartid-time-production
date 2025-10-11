import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

class AuthService extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _token;
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _userProfile;
  bool _isLoading = false;

  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  Map<String, dynamic>? get userProfile => _userProfile;
  bool get isLoading => _isLoading;

  AuthService() {
    _initializeAuth();
  }

  void _initializeAuth() {
    // Listen to auth state changes
    SupabaseService.authStateChanges.listen((data) {
      final AuthChangeEvent event = data.event;
      final Session? session = data.session;

      if (event == AuthChangeEvent.signedIn && session != null) {
        _handleSignedIn(session);
      } else if (event == AuthChangeEvent.signedOut) {
        _handleSignedOut();
      }
    });

    // Check if user is already signed in
    final session = SupabaseService.currentSession;
    if (session != null) {
      _handleSignedIn(session);
    }
  }

  Future<void> _handleSignedIn(Session session) async {
    _isAuthenticated = true;
    _token = session.accessToken;
    _user = {
      'id': session.user.id,
      'email': session.user.email,
      'emailConfirmed': session.user.emailConfirmedAt != null,
    };

    // Fetch user profile data
    await _fetchUserProfile(session.user.id);
    notifyListeners();
  }

  void _handleSignedOut() {
    _isAuthenticated = false;
    _token = null;
    _user = null;
    _userProfile = null;
    notifyListeners();
  }

  Future<void> _fetchUserProfile(String userId) async {
    try {
      final userData = await SupabaseService.getUserData(userId);
      if (userData != null) {
        _userProfile = userData;
        // Update user object with profile data
        _user = {
          ..._user!,
          'full_name': userData['full_name'],
          'employee_id': userData['employee_id'],
          'institution_id': userData['institution_id'],
          'primary_role': userData['primary_role'],
          'smartid_time_role': userData['smartid_time_role'],
          'phone': userData['phone'],
          'ic_number': userData['ic_number'],
          'institution_name': userData['institutions']?['name'],
        };
        print('🏫 TIME Mobile - User institution_id: ${userData['institution_id']}');
      }
    } catch (e) {
      print('Error fetching user profile: $e');
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final AuthResponse response = await SupabaseService.client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );

      if (response.session != null) {
        // Auth state change listener will handle the rest
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Login error: $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
    
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    try {
      await SupabaseService.client.auth.signOut();
      // Auth state change listener will handle clearing the state
    } catch (e) {
      print('Logout error: $e');
      // Force clear state even if signOut fails
      _handleSignedOut();
    }
  }

  // Get user dashboard data
  Future<Map<String, dynamic>?> getDashboardData() async {
    if (_userProfile == null) return null;

    try {
      final employeeId = _userProfile!['employee_id'];
      final userId = _user!['id'];

      // Fetch dashboard data in parallel
      final results = await Future.wait([
        SupabaseService.getUserAttendanceSummary(employeeId),
        SupabaseService.getUserWalletBalance(userId),
        SupabaseService.getUserLeaveBalance(userId),
      ]);

      return {
        'attendance': results[0],
        'wallet_balance': results[1],
        'leave_balance': results[2],
      };
    } catch (e) {
      print('Error fetching dashboard data: $e');
      return null;
    }
  }

  // Refresh user profile data
  Future<void> refreshUserProfile() async {
    if (_user?['id'] != null) {
      await _fetchUserProfile(_user!['id']);
    }
  }
}
