import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../services/location_service.dart';
import '../main.dart';

class LocationCalibrationWithMapsScreen extends StatefulWidget {
  const LocationCalibrationWithMapsScreen({super.key});

  @override
  State<LocationCalibrationWithMapsScreen> createState() => _LocationCalibrationWithMapsScreenState();
}

class _LocationCalibrationWithMapsScreenState extends State<LocationCalibrationWithMapsScreen>
    with TickerProviderStateMixin {
  late LocationService _locationService;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  GoogleMapController? _mapController;
  
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _postalCodeController = TextEditingController();
  final _radiusController = TextEditingController(text: '300');

  bool _isUpdating = false;
  LatLng? _selectedLocation;
  Set<Marker> _markers = {};
  Set<Circle> _circles = {};

  // Default location (Kuala Lumpur, Malaysia)
  static const LatLng _defaultLocation = LatLng(3.1390, 101.6869);

  @override
  void initState() {
    super.initState();
    _locationService = LocationService();
    
    // Initialize animation
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    
    _pulseController.repeat(reverse: true);
    
    // Load existing data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInstitutionLocation();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _postalCodeController.dispose();
    _radiusController.dispose();
    _mapController?.dispose();
    super.dispose();
  }

  Future<void> _loadInstitutionLocation() async {
    await _locationService.fetchInstitutionLocation();
    
    final location = _locationService.institutionLocation;
    if (location != null) {
      _addressController.text = location['address'] ?? '';
      _cityController.text = location['city'] ?? '';
      _stateController.text = location['state'] ?? '';
      _postalCodeController.text = location['postal_code'] ?? '';
      _radiusController.text = location['attendance_radius']?.toString() ?? '300';
      
      final lat = location['latitude'];
      final lng = location['longitude'];
      
      if (lat != null && lng != null) {
        _selectedLocation = LatLng(lat.toDouble(), lng.toDouble());
        _updateMapMarker();
        
        // Move camera to existing location
        if (_mapController != null) {
          _mapController!.animateCamera(
            CameraUpdate.newLatLng(_selectedLocation!),
          );
        }
      }
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    
    // If we have an existing location, move to it
    if (_selectedLocation != null) {
      controller.animateCamera(
        CameraUpdate.newLatLng(_selectedLocation!),
      );
    }
  }

  void _onMapTap(LatLng position) {
    HapticFeedback.lightImpact();
    
    setState(() {
      _selectedLocation = position;
    });
    
    _updateMapMarker();
    _reverseGeocode(position);
  }

  void _updateMapMarker() {
    if (_selectedLocation == null) return;
    
    final radius = int.tryParse(_radiusController.text) ?? 300;
    
    setState(() {
      _markers = {
        Marker(
          markerId: const MarkerId('institution'),
          position: _selectedLocation!,
          infoWindow: const InfoWindow(
            title: 'Institution Location',
            snippet: 'Tap to recalibrate',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        ),
      };
      
      _circles = {
        Circle(
          circleId: const CircleId('attendance_radius'),
          center: _selectedLocation!,
          radius: radius.toDouble(),
          fillColor: SmartIdTheme.blue500.withOpacity(0.2),
          strokeColor: SmartIdTheme.blue500,
          strokeWidth: 2,
        ),
      };
    });
  }

  Future<void> _reverseGeocode(LatLng position) async {
    try {
      final addresses = await _locationService.getAddressFromCoordinates(
        position.latitude, 
        position.longitude
      );
      
      if (addresses != null && addresses.isNotEmpty) {
        final address = addresses;
        _addressController.text = address;
        
        // Try to extract city/state from address
        final parts = address.split(', ');
        if (parts.length >= 3) {
          _cityController.text = parts[parts.length - 3];
          _stateController.text = parts[parts.length - 2];
        }
      }
    } catch (e) {
      print('Reverse geocoding error: $e');
    }
  }

  Future<void> _getCurrentLocation() async {
    HapticFeedback.lightImpact();
    
    final position = await _locationService.getCurrentLocation(forceRefresh: true);
    
    if (position != null) {
      final newLocation = LatLng(position.latitude, position.longitude);
      
      setState(() {
        _selectedLocation = newLocation;
      });
      
      _updateMapMarker();
      
      // Move camera to current location
      if (_mapController != null) {
        _mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(newLocation, 17),
        );
      }
      
      // Get address
      if (_locationService.currentAddress != null) {
        _addressController.text = _locationService.currentAddress!;
      }
      
      _showSuccessSnackBar('Current location detected successfully!');
    }
  }

  Future<void> _searchAddress() async {
    if (_addressController.text.trim().isEmpty) {
      _showErrorSnackBar('Please enter an address to search');
      return;
    }

    HapticFeedback.lightImpact();
    final position = await _locationService.getCoordinatesFromAddress(
      _addressController.text.trim()
    );
    
    if (position != null) {
      final newLocation = LatLng(position.latitude, position.longitude);
      
      setState(() {
        _selectedLocation = newLocation;
      });
      
      _updateMapMarker();
      
      // Move camera to searched location
      if (_mapController != null) {
        _mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(newLocation, 17),
        );
      }
      
      _showSuccessSnackBar('Address location found!');
    }
  }

  Future<void> _updateLocation() async {
    if (!_validateForm()) return;

    setState(() {
      _isUpdating = true;
    });

    HapticFeedback.mediumImpact();

    try {
      final success = await _locationService.updateInstitutionLocation(
        latitude: _selectedLocation!.latitude,
        longitude: _selectedLocation!.longitude,
        address: _addressController.text.trim(),
        city: _cityController.text.trim().isEmpty ? null : _cityController.text.trim(),
        state: _stateController.text.trim().isEmpty ? null : _stateController.text.trim(),
        postalCode: _postalCodeController.text.trim().isEmpty ? null : _postalCodeController.text.trim(),
        country: 'Malaysia',
        attendanceRadius: int.tryParse(_radiusController.text) ?? 300,
      );

      if (success) {
        HapticFeedback.heavyImpact();
        _showSuccessSnackBar('Location updated successfully!');
        
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) {
            Navigator.pop(context, true);
          }
        });
      }
    } catch (e) {
      _showErrorSnackBar('Failed to update location: $e');
    } finally {
      setState(() {
        _isUpdating = false;
      });
    }
  }

  bool _validateForm() {
    if (_selectedLocation == null) {
      _showErrorSnackBar('Please select a location on the map');
      return false;
    }

    if (_addressController.text.trim().isEmpty) {
      _showErrorSnackBar('Please enter an address');
      return false;
    }

    final radius = int.tryParse(_radiusController.text);
    if (radius == null || radius < 50 || radius > 5000) {
      _showErrorSnackBar('Attendance radius must be between 50 and 5000 meters');
      return false;
    }

    return true;
  }

  void _showSuccessSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: SmartIdTheme.green400),
              const SizedBox(width: 8),
              Expanded(child: Text(message)),
            ],
          ),
          backgroundColor: SmartIdTheme.slate800,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  void _showErrorSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error, color: SmartIdTheme.red400),
              const SizedBox(width: 8),
              Expanded(child: Text(message)),
            ],
          ),
          backgroundColor: SmartIdTheme.slate800,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: _locationService,
      child: Scaffold(
        backgroundColor: SmartIdTheme.slate900,
        appBar: AppBar(
          backgroundColor: SmartIdTheme.slate800,
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [SmartIdTheme.indigo500, SmartIdTheme.blue500],
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.gps_fixed,
                  color: SmartIdTheme.slate50,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'GPS Calibration',
                style: TextStyle(
                  color: SmartIdTheme.slate50,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: SmartIdTheme.slate50),
            onPressed: () => Navigator.pop(context),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.my_location, color: SmartIdTheme.indigo400),
              onPressed: _getCurrentLocation,
            ),
          ],
        ),
        body: Consumer<LocationService>(
          builder: (context, locationService, child) {
            return Column(
              children: [
                // Map Section
                Expanded(
                  flex: 3,
                  child: Container(
                    margin: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: SmartIdTheme.slate700),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: GoogleMap(
                        onMapCreated: _onMapCreated,
                        initialCameraPosition: CameraPosition(
                          target: _selectedLocation ?? _defaultLocation,
                          zoom: 15,
                        ),
                        onTap: _onMapTap,
                        markers: _markers,
                        circles: _circles,
                        mapType: MapType.normal,
                        zoomControlsEnabled: true,
                        myLocationEnabled: true,
                        myLocationButtonEnabled: false,
                        compassEnabled: true,
                        mapToolbarEnabled: false,
                      ),
                    ),
                  ),
                ),
                
                // Form Section
                Expanded(
                  flex: 2,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        // Location Form
                        _buildLocationForm(),
                        const SizedBox(height: 20),
                        
                        // Update Button
                        _buildUpdateButton(),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildLocationForm() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate800,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SmartIdTheme.slate700, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SmartIdTheme.green500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.location_on,
                  color: SmartIdTheme.green400,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Location Details',
                style: TextStyle(
                  color: SmartIdTheme.slate50,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Address field with search
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _addressController,
                  decoration: const InputDecoration(
                    labelText: 'Institution Address *',
                    hintText: 'Enter full address',
                    prefixIcon: Icon(Icons.home, size: 20),
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  style: const TextStyle(fontSize: 14),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(
                  color: SmartIdTheme.blue500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: SmartIdTheme.blue500.withOpacity(0.3),
                  ),
                ),
                child: IconButton(
                  onPressed: _searchAddress,
                  icon: const Icon(
                    Icons.search,
                    color: SmartIdTheme.blue400,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // City, State, Postal Code, Radius
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _cityController,
                  decoration: const InputDecoration(
                    labelText: 'City',
                    prefixIcon: Icon(Icons.location_city, size: 20),
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  style: const TextStyle(fontSize: 14),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _radiusController,
                  decoration: const InputDecoration(
                    labelText: 'Radius (m)',
                    hintText: '300',
                    prefixIcon: Icon(Icons.radio_button_unchecked, size: 20),
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  style: const TextStyle(fontSize: 14),
                  keyboardType: TextInputType.number,
                  onChanged: (_) => _updateMapMarker(),
                ),
              ),
            ],
          ),
          
          if (_selectedLocation != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SmartIdTheme.green500.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: SmartIdTheme.green500.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: SmartIdTheme.green400, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Location: ${_selectedLocation!.latitude.toStringAsFixed(6)}, ${_selectedLocation!.longitude.toStringAsFixed(6)}',
                      style: const TextStyle(
                        color: SmartIdTheme.green300,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildUpdateButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: (_isUpdating || _locationService.isLoading) ? null : _updateLocation,
        icon: _isUpdating 
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(SmartIdTheme.slate50),
                ),
              )
            : const Icon(Icons.save),
        label: Text(_isUpdating ? 'Updating...' : 'Update Location'),
        style: ElevatedButton.styleFrom(
          backgroundColor: SmartIdTheme.green500,
          foregroundColor: SmartIdTheme.slate50,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}