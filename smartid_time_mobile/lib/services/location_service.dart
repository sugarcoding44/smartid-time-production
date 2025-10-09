import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:permission_handler/permission_handler.dart';
import 'supabase_service.dart';

class LocationService extends ChangeNotifier {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  bool _isLoading = false;
  String? _error;
  Position? _currentPosition;
  String? _currentAddress;
  Map<String, dynamic>? _institutionLocation;

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  Position? get currentPosition => _currentPosition;
  String? get currentAddress => _currentAddress;
  Map<String, dynamic>? get institutionLocation => _institutionLocation;

  // Check if location services are enabled and permissions granted
  Future<bool> checkLocationPermissions() async {
    try {
      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _error = 'Location services are disabled. Please enable them in settings.';
        notifyListeners();
        return false;
      }

      // Check location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _error = 'Location permission denied. Please grant location access.';
          notifyListeners();
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _error = 'Location permissions are permanently denied. Please enable them in settings.';
        notifyListeners();
        return false;
      }

      return true;
    } catch (e) {
      _error = 'Error checking location permissions: $e';
      notifyListeners();
      return false;
    }
  }

  // Get current GPS location
  Future<Position?> getCurrentLocation({bool forceRefresh = false}) async {
    if (!forceRefresh && _currentPosition != null) {
      return _currentPosition;
    }

    _setLoading(true);
    _error = null;

    try {
      // Check permissions first
      if (!await checkLocationPermissions()) {
        return null;
      }

      // Get current position
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      // Get address from coordinates
      await _getAddressFromCoordinates(
        _currentPosition!.latitude,
        _currentPosition!.longitude,
      );

      notifyListeners();
      return _currentPosition;
    } catch (e) {
      _error = 'Failed to get current location: $e';
      if (kDebugMode) {
        print('Location error: $e');
      }
    } finally {
      _setLoading(false);
    }
    return null;
  }

  // Get address from coordinates using reverse geocoding
  Future<String?> _getAddressFromCoordinates(double latitude, double longitude) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(latitude, longitude);
      
      if (placemarks.isNotEmpty) {
        final placemark = placemarks[0];
        _currentAddress = [
          placemark.street,
          placemark.subLocality,
          placemark.locality,
          placemark.postalCode,
          placemark.administrativeArea,
          placemark.country,
        ].where((element) => element != null && element.isNotEmpty).join(', ');
        
        return _currentAddress;
      }
    } catch (e) {
      if (kDebugMode) {
        print('Reverse geocoding error: $e');
      }
    }
    return null;
  }

  // Get coordinates from address
  Future<Position?> getCoordinatesFromAddress(String address) async {
    _setLoading(true);
    _error = null;

    try {
      List<Location> locations = await locationFromAddress(address);
      
      if (locations.isNotEmpty) {
        final location = locations[0];
        _currentPosition = Position(
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: DateTime.now(),
          accuracy: 0,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          headingAccuracy: 0,
          speed: 0,
          speedAccuracy: 0,
        );
        
        _currentAddress = address;
        notifyListeners();
        return _currentPosition;
      } else {
        _error = 'Address not found. Please try a different address.';
      }
    } catch (e) {
      _error = 'Failed to find location: $e';
      if (kDebugMode) {
        print('Geocoding error: $e');
      }
    } finally {
      _setLoading(false);
    }
    return null;
  }

  // Fetch current institution location
  Future<void> fetchInstitutionLocation() async {
    _setLoading(true);
    _error = null;

    try {
      final supabase = SupabaseService.client;
      
      // Get current user
      final user = supabase.auth.currentUser;
      if (user == null) {
        _error = 'User not authenticated';
        return;
      }

      // Get user's institution_id
      final userResponse = await supabase
          .from('users')
          .select('institution_id')
          .eq('auth_user_id', user.id)
          .single();

      if (userResponse['institution_id'] == null) {
        _error = 'No institution found for user';
        return;
      }

      // Get institution location
      final locationResponse = await supabase
          .from('institution_locations')
          .select('*')
          .eq('institution_id', userResponse['institution_id'])
          .eq('is_primary', true)
          .single();

      _institutionLocation = locationResponse;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to fetch institution location: $e';
      if (kDebugMode) {
        print('Institution location error: $e');
      }
    } finally {
      _setLoading(false);
    }
  }

  // Update institution location
  Future<bool> updateInstitutionLocation({
    required double latitude,
    required double longitude,
    required String address,
    String? city,
    String? state,
    String? postalCode,
    String? country,
    int attendanceRadius = 300,
  }) async {
    _setLoading(true);
    _error = null;

    try {
      final supabase = SupabaseService.client;
      
      // Get current user
      final user = supabase.auth.currentUser;
      if (user == null) {
        _error = 'User not authenticated';
        return false;
      }

      // Get user's institution_id
      final userResponse = await supabase
          .from('users')
          .select('institution_id')
          .eq('auth_user_id', user.id)
          .single();

      if (userResponse['institution_id'] == null) {
        _error = 'No institution found for user';
        return false;
      }

      // Update institution location
      final updateData = {
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'city': city,
        'state': state,
        'postal_code': postalCode,
        'country': country ?? 'Malaysia',
        'attendance_radius': attendanceRadius,
        'updated_at': DateTime.now().toIso8601String(),
      };

      await supabase
          .from('institution_locations')
          .update(updateData)
          .eq('institution_id', userResponse['institution_id'])
          .eq('is_primary', true);

      // Update local institution location data
      _institutionLocation = {
        ...(_institutionLocation ?? {}),
        ...updateData,
      };

      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to update location: $e';
      if (kDebugMode) {
        print('Update location error: $e');
      }
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Calculate distance between two points
  double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }

  // Check if current location is within institution radius
  bool isWithinInstitutionRadius() {
    if (_currentPosition == null || _institutionLocation == null) {
      return false;
    }

    final distance = calculateDistance(
      _currentPosition!.latitude,
      _currentPosition!.longitude,
      _institutionLocation!['latitude'],
      _institutionLocation!['longitude'],
    );

    final radius = _institutionLocation!['attendance_radius'] ?? 300;
    return distance <= radius;
  }

  // Get location accuracy status
  String getLocationAccuracyStatus() {
    if (_currentPosition == null) return 'Unknown';
    
    final accuracy = _currentPosition!.accuracy;
    if (accuracy <= 10) return 'Excellent';
    if (accuracy <= 50) return 'Good';
    if (accuracy <= 100) return 'Fair';
    return 'Poor';
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Clear current location
  void clearLocation() {
    _currentPosition = null;
    _currentAddress = null;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Open location settings
  Future<void> openLocationSettings() async {
    await openAppSettings();
  }

  // Public method to get address from coordinates
  Future<String?> getAddressFromCoordinates(double latitude, double longitude) async {
    return await _getAddressFromCoordinates(latitude, longitude);
  }
}
