import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:http/http.dart' as http;
import 'package:permission_handler/permission_handler.dart';
import 'supabase_service.dart';

class AttendanceService extends ChangeNotifier {
  static const String apiBaseUrl = 'http://localhost:3000/api';
  
  Map<String, dynamic>? _attendanceData;
  Map<String, dynamic>? _todayStatus;
  bool _isLoading = false;
  String? _error;
  DateTime? _lastUpdated;
  Position? _currentLocation;
  bool _locationPermissionGranted = false;

  // Getters
  Map<String, dynamic>? get attendanceData => _attendanceData;
  Map<String, dynamic>? get todayStatus => _todayStatus;
  bool get isLoading => _isLoading;
  String? get error => _error;
  DateTime? get lastUpdated => _lastUpdated;
  Position? get currentLocation => _currentLocation;
  bool get locationPermissionGranted => _locationPermissionGranted;
  
  bool get hasCheckedInToday => _todayStatus?['hasCheckedIn'] ?? false;
  bool get hasCheckedOutToday => _todayStatus?['hasCheckedOut'] ?? false;
  Map<String, dynamic>? get todayRecord => _todayStatus?['record'];

  // Initialize location services
  Future<bool> initializeLocation() async {
    try {
      // Check and request location permission
      LocationPermission permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        
        if (permission == LocationPermission.denied) {
          _error = 'Location permission denied';
          _locationPermissionGranted = false;
          notifyListeners();
          return false;
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        _error = 'Location permissions are permanently denied';
        _locationPermissionGranted = false;
        notifyListeners();
        return false;
      }

      _locationPermissionGranted = true;
      await _getCurrentLocation();
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to initialize location: $e';
      _locationPermissionGranted = false;
      notifyListeners();
      return false;
    }
  }

  // Get current location
  Future<Position?> _getCurrentLocation() async {
    try {
      if (!_locationPermissionGranted) {
        await initializeLocation();
      }

      _currentLocation = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      
      print('📍 Current location: ${_currentLocation?.latitude}, ${_currentLocation?.longitude}');
      return _currentLocation;
    } catch (e) {
      print('❌ Error getting location: $e');
      _error = 'Failed to get current location: $e';
      return null;
    }
  }

  // Get address from coordinates
  Future<String?> _getAddressFromCoordinates(double latitude, double longitude) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(latitude, longitude);
      
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        String address = '';
        
        if (place.name != null && place.name!.isNotEmpty) {
          address += place.name!;
        }
        
        if (place.street != null && place.street!.isNotEmpty) {
          if (address.isNotEmpty) address += ', ';
          address += place.street!;
        }
        
        if (place.locality != null && place.locality!.isNotEmpty) {
          if (address.isNotEmpty) address += ', ';
          address += place.locality!;
        }
        
        if (place.administrativeArea != null && place.administrativeArea!.isNotEmpty) {
          if (address.isNotEmpty) address += ', ';
          address += place.administrativeArea!;
        }
        
        if (place.country != null && place.country!.isNotEmpty) {
          if (address.isNotEmpty) address += ', ';
          address += place.country!;
        }
        
        if (address.isEmpty) {
          address = '${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}';
        }
        
        print('📍 Address: $address');
        return address;
      }
    } catch (e) {
      print('⚠️ Error getting address: $e');
    }
    
    // Fallback to coordinates
    return '${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}';
  }

  // Fetch attendance data
  Future<void> fetchAttendanceData(String userId, [String? employeeId]) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('📊 Fetching attendance data for user: $userId');
      
      // Fetch attendance summary
      final attendanceData = await SupabaseService.getUserAttendanceSummary(userId, employeeId);
      
      // Fetch today's status
      await _fetchTodayStatus(userId, employeeId);
      
      _attendanceData = attendanceData;
      _lastUpdated = DateTime.now();
      _error = null;
      
      print('✅ Attendance data fetched successfully');
    } catch (e) {
      _error = 'Failed to load attendance data: ${e.toString()}';
      print('❌ Attendance data fetch error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch today's check-in/out status
  Future<void> _fetchTodayStatus(String userId, [String? employeeId]) async {
    try {
      String apiUrl;
      if (employeeId != null && employeeId.isNotEmpty) {
        apiUrl = '$apiBaseUrl/attendance/checkin?employeeId=$employeeId';
      } else {
        apiUrl = '$apiBaseUrl/attendance/checkin?userId=$userId';
      }
      
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _todayStatus = data['data'];
          print('✅ Today status: Checked in: ${hasCheckedInToday}, Checked out: ${hasCheckedOutToday}');
        }
      }
    } catch (e) {
      print('❌ Error fetching today status: $e');
    }
  }

  // Check in
  Future<bool> checkIn({
    required String userId,
    String? employeeId,
    bool manual = false,
  }) async {
    try {
      _error = null;
      notifyListeners();

      // Get current location
      final position = await _getCurrentLocation();
      if (position == null) {
        _error = 'Unable to get location. Please enable location services.';
        notifyListeners();
        return false;
      }

      print('📍 Checking in at: ${position.latitude}, ${position.longitude}');
      
      // Get address from coordinates
      final address = await _getAddressFromCoordinates(position.latitude, position.longitude);

      final requestBody = {
        'userId': userId,
        'employeeId': employeeId,
        'type': 'check_in',
        'method': 'manual_mobile', // Specify this is mobile app check-in
        'manual': manual,
        'location': {
          'latitude': position.latitude,
          'longitude': position.longitude,
          'accuracy': position.accuracy,
          'address': address,
        }
      };

      final response = await http.post(
        Uri.parse('$apiBaseUrl/attendance/checkin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(requestBody),
      );

      final data = json.decode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Check-in successful: ${data['message']}');
        
        // Refresh today's status
        await _fetchTodayStatus(userId, employeeId);
        notifyListeners();
        return true;
      } else {
        _error = data['error'] ?? 'Check-in failed';
        print('❌ Check-in failed: ${_error}');
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Check-in failed: $e';
      print('❌ Check-in error: $e');
      notifyListeners();
      return false;
    }
  }

  // Check out
  Future<bool> checkOut({
    required String userId,
    String? employeeId,
    bool manual = false,
  }) async {
    try {
      _error = null;
      notifyListeners();

      // Get current location
      final position = await _getCurrentLocation();
      if (position == null) {
        _error = 'Unable to get location. Please enable location services.';
        notifyListeners();
        return false;
      }

      print('📍 Checking out at: ${position.latitude}, ${position.longitude}');
      
      // Get address from coordinates
      final address = await _getAddressFromCoordinates(position.latitude, position.longitude);

      final requestBody = {
        'userId': userId,
        'employeeId': employeeId,
        'type': 'check_out',
        'method': 'manual_mobile', // Specify this is mobile app check-out
        'manual': manual,
        'location': {
          'latitude': position.latitude,
          'longitude': position.longitude,
          'accuracy': position.accuracy,
          'address': address,
        }
      };

      final response = await http.post(
        Uri.parse('$apiBaseUrl/attendance/checkin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(requestBody),
      );

      final data = json.decode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Check-out successful: ${data['message']}');
        
        // Refresh today's status
        await _fetchTodayStatus(userId, employeeId);
        notifyListeners();
        return true;
      } else {
        _error = data['error'] ?? 'Check-out failed';
        print('❌ Check-out failed: ${_error}');
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Check-out failed: $e';
      print('❌ Check-out error: $e');
      notifyListeners();
      return false;
    }
  }

  // Refresh all data
  Future<void> refreshData(String userId, [String? employeeId]) async {
    await fetchAttendanceData(userId, employeeId);
  }

  // Clear all data
  void clearData() {
    _attendanceData = null;
    _todayStatus = null;
    _isLoading = false;
    _error = null;
    _lastUpdated = null;
    _currentLocation = null;
    _locationPermissionGranted = false;
    notifyListeners();
  }

  // Get formatted location string
  String? get locationString {
    if (_currentLocation != null) {
      return '${_currentLocation!.latitude.toStringAsFixed(6)}, ${_currentLocation!.longitude.toStringAsFixed(6)}';
    }
    return null;
  }

  // Get work duration for today
  String? get todayWorkDuration {
    final record = todayRecord;
    if (record?['work_duration_minutes'] != null) {
      final minutes = record!['work_duration_minutes'] as int;
      final hours = minutes ~/ 60;
      final remainingMinutes = minutes % 60;
      return '${hours}h ${remainingMinutes}m';
    }
    return null;
  }

  // Get check-in time for today
  String? get todayCheckInTime {
    final record = todayRecord;
    if (record?['check_in_time'] != null) {
      final checkIn = DateTime.parse(record!['check_in_time']);
      return '${checkIn.hour.toString().padLeft(2, '0')}:${checkIn.minute.toString().padLeft(2, '0')}';
    }
    return null;
  }

  // Get check-out time for today
  String? get todayCheckOutTime {
    final record = todayRecord;
    if (record?['check_out_time'] != null) {
      final checkOut = DateTime.parse(record!['check_out_time']);
      return '${checkOut.hour.toString().padLeft(2, '0')}:${checkOut.minute.toString().padLeft(2, '0')}';
    }
    return null;
  }
}
