import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';
import '../main.dart';

class LocationCalibrationScreen extends StatefulWidget {
  const LocationCalibrationScreen({super.key});

  @override
  State<LocationCalibrationScreen> createState() => _LocationCalibrationScreenState();
}

class _LocationCalibrationScreenState extends State<LocationCalibrationScreen>
    with TickerProviderStateMixin {
  late LocationService _locationService;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _postalCodeController = TextEditingController();
  final _latitudeController = TextEditingController();
  final _longitudeController = TextEditingController();
  final _radiusController = TextEditingController(text: '300');

  bool _showManualEntry = false;
  bool _isUpdating = false;

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
    _latitudeController.dispose();
    _longitudeController.dispose();
    _radiusController.dispose();
    super.dispose();
  }

  Future<void> _loadInstitutionLocation() async {
    await _locationService.fetchInstitutionLocation();
    
    // Populate form fields with existing data
    final location = _locationService.institutionLocation;
    if (location != null) {
      _addressController.text = location['address'] ?? '';
      _cityController.text = location['city'] ?? '';
      _stateController.text = location['state'] ?? '';
      _postalCodeController.text = location['postal_code'] ?? '';
      _latitudeController.text = location['latitude']?.toString() ?? '';
      _longitudeController.text = location['longitude']?.toString() ?? '';
      _radiusController.text = location['attendance_radius']?.toString() ?? '300';
    }
  }

  Future<void> _getCurrentLocation() async {
    HapticFeedback.lightImpact();
    
    final position = await _locationService.getCurrentLocation(forceRefresh: true);
    
    if (position != null && _locationService.currentAddress != null) {
      // Auto-fill form with current location
      _addressController.text = _locationService.currentAddress!;
      _latitudeController.text = position.latitude.toString();
      _longitudeController.text = position.longitude.toString();
      
      setState(() {});
      
      _showSuccessSnackBar('Current location detected successfully!');
    }
  }

  Future<void> _searchAddress() async {
    if (_addressController.text.trim().isEmpty) {
      _showErrorSnackBar('Please enter an address to search');
      return;
    }

    HapticFeedback.lightImpact();
    final position = await _locationService.getCoordinatesFromAddress(_addressController.text.trim());
    
    if (position != null) {
      _latitudeController.text = position.latitude.toString();
      _longitudeController.text = position.longitude.toString();
      
      setState(() {});
      
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
        latitude: double.parse(_latitudeController.text),
        longitude: double.parse(_longitudeController.text),
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
        
        // Navigate back after a short delay
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
    if (_addressController.text.trim().isEmpty) {
      _showErrorSnackBar('Please enter an address');
      return false;
    }

    final lat = double.tryParse(_latitudeController.text);
    final lng = double.tryParse(_longitudeController.text);
    
    if (lat == null || lng == null) {
      _showErrorSnackBar('Please provide valid coordinates');
      return false;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      _showErrorSnackBar('Invalid coordinate range');
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
            TextButton(
              onPressed: _showManualEntry ? () {
                setState(() {
                  _showManualEntry = false;
                });
              } : () {
                setState(() {
                  _showManualEntry = true;
                });
              },
              child: Text(
                _showManualEntry ? 'Auto' : 'Manual',
                style: const TextStyle(
                  color: SmartIdTheme.indigo400,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        body: Consumer<LocationService>(
          builder: (context, locationService, child) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status Card
                  _buildStatusCard(locationService),
                  const SizedBox(height: 24),
                  
                  // GPS Detection Card
                  if (!_showManualEntry) _buildGPSDetectionCard(locationService),
                  
                  // Manual Entry Card
                  if (_showManualEntry) _buildManualEntryCard(),
                  
                  const SizedBox(height: 24),
                  
                  // Location Form
                  _buildLocationForm(),
                  
                  const SizedBox(height: 32),
                  
                  // Update Button
                  _buildUpdateButton(),
                  
                  const SizedBox(height: 16),
                  
                  // Info Card
                  _buildInfoCard(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildStatusCard(LocationService locationService) {
    final currentLocation = locationService.currentPosition;
    final institutionLocation = locationService.institutionLocation;
    
    String statusText = 'Location not set';
    Color statusColor = SmartIdTheme.slate500;
    IconData statusIcon = Icons.location_off;
    
    if (currentLocation != null && institutionLocation != null) {
      final isWithinRadius = locationService.isWithinInstitutionRadius();
      if (isWithinRadius) {
        statusText = 'Within institution radius';
        statusColor = SmartIdTheme.green500;
        statusIcon = Icons.gps_fixed;
      } else {
        statusText = 'Outside institution radius';
        statusColor = SmartIdTheme.orange500;
        statusIcon = Icons.gps_not_fixed;
      }
    } else if (institutionLocation != null) {
      statusText = 'Institution location set';
      statusColor = SmartIdTheme.blue500;
      statusIcon = Icons.location_on;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            statusColor.withOpacity(0.1),
            statusColor.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: statusColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(statusIcon, color: statusColor, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'GPS Status',
                      style: TextStyle(
                        color: SmartIdTheme.slate400,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      statusText,
                      style: TextStyle(
                        color: SmartIdTheme.slate50,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          if (currentLocation != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SmartIdTheme.slate800.withOpacity(0.5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Accuracy: ${locationService.getLocationAccuracyStatus()}',
                    style: const TextStyle(
                      color: SmartIdTheme.slate300,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    '±${currentLocation.accuracy.toInt()}m',
                    style: const TextStyle(
                      color: SmartIdTheme.indigo300,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
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

  Widget _buildGPSDetectionCard(LocationService locationService) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate800,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SmartIdTheme.slate700, width: 1),
      ),
      child: Column(
        children: [
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _pulseAnimation.value,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [SmartIdTheme.indigo500, SmartIdTheme.blue500],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.my_location,
                    color: SmartIdTheme.slate50,
                    size: 32,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          const Text(
            'Detect Current Location',
            style: TextStyle(
              color: SmartIdTheme.slate50,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Use your device\'s GPS to automatically detect your current location',
            style: TextStyle(
              color: SmartIdTheme.slate400,
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: locationService.isLoading ? null : _getCurrentLocation,
              icon: locationService.isLoading 
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(SmartIdTheme.slate50),
                      ),
                    )
                  : const Icon(Icons.gps_fixed),
              label: Text(
                locationService.isLoading ? 'Detecting...' : 'Get Current Location',
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: SmartIdTheme.indigo500,
                foregroundColor: SmartIdTheme.slate50,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          
          if (locationService.error != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SmartIdTheme.red400.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: SmartIdTheme.red400.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: SmartIdTheme.red400,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      locationService.error!,
                      style: const TextStyle(
                        color: SmartIdTheme.red400,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: locationService.openLocationSettings,
                    child: const Text(
                      'Settings',
                      style: TextStyle(
                        color: SmartIdTheme.red400,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
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

  Widget _buildManualEntryCard() {
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
                  color: SmartIdTheme.indigo500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.edit_location,
                  color: SmartIdTheme.indigo400,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Manual Location Entry',
                style: TextStyle(
                  color: SmartIdTheme.slate50,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _latitudeController,
                  decoration: InputDecoration(
                    labelText: 'Latitude',
                    hintText: '3.1390',
                    prefixIcon: const Icon(Icons.explore, size: 20),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _longitudeController,
                  decoration: InputDecoration(
                    labelText: 'Longitude',
                    hintText: '101.6869',
                    prefixIcon: const Icon(Icons.explore, size: 20),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                ),
              ),
            ],
          ),
        ],
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
                  ),
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
          
          // City, State, Postal Code
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _cityController,
                  decoration: const InputDecoration(
                    labelText: 'City',
                    prefixIcon: Icon(Icons.location_city, size: 20),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _stateController,
                  decoration: const InputDecoration(
                    labelText: 'State',
                    prefixIcon: Icon(Icons.map, size: 20),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _postalCodeController,
                  decoration: const InputDecoration(
                    labelText: 'Postal Code',
                    prefixIcon: Icon(Icons.local_post_office, size: 20),
                  ),
                  keyboardType: TextInputType.number,
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
                  ),
                  keyboardType: TextInputType.number,
                ),
              ),
            ],
          ),
          
          if (!_showManualEntry) ...[
            const SizedBox(height: 16),
            // Coordinates display (read-only when not in manual mode)
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _latitudeController,
                    decoration: const InputDecoration(
                      labelText: 'Latitude',
                      prefixIcon: Icon(Icons.my_location, size: 20),
                    ),
                    readOnly: true,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _longitudeController,
                    decoration: const InputDecoration(
                      labelText: 'Longitude',
                      prefixIcon: Icon(Icons.place, size: 20),
                    ),
                    readOnly: true,
                  ),
                ),
              ],
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

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SmartIdTheme.blue500.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: SmartIdTheme.blue500.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                color: SmartIdTheme.blue400,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Important Information',
                style: TextStyle(
                  color: Color(0xFF93C5FD), // blue300
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '• This location will be used for automatic attendance approval\n'
            '• Check-ins within the radius will be approved automatically\n'
            '• Remote check-ins will require manual approval\n'
            '• Make sure the location is accurate for best results',
            style: TextStyle(
              color: Color(0xFFBFDBFE), // blue200
              fontSize: 12,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}