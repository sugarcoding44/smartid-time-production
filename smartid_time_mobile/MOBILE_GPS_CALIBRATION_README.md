# SmartID Hub Mobile - GPS Recalibration Feature

## Overview
The GPS Recalibration feature allows users to update their institution's GPS location directly from the mobile app. This is crucial for accurate attendance tracking and location-based services.

## Features

### 🎯 **Core Functionality**
- **GPS Detection**: Automatically detect current location using device GPS
- **Interactive Maps**: Visual location selection with Google Maps integration (optional)
- **Address Search**: Search for locations by address with geocoding
- **Manual Entry**: Manual coordinate input for precise location setting
- **Attendance Radius**: Configurable radius for automatic attendance approval
- **Real-time Validation**: Instant feedback on location accuracy and status

### 📱 **User Interface**
- **Modern Dark Theme**: Matches web app design system
- **Animated GPS Pulse**: Visual feedback during location detection
- **Status Cards**: Clear indication of GPS accuracy and location status
- **Form Validation**: Real-time validation with helpful error messages
- **Progress Indicators**: Loading states for all async operations

### 🔧 **Technical Features**
- **Permission Management**: Automatic location permission handling
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Offline Support**: Works without Google Maps API when needed
- **Database Sync**: Direct integration with Supabase backend
- **State Management**: Uses Provider pattern for reactive UI updates

## Implementation

### Files Created/Modified

#### New Services
- `lib/services/location_service.dart` - Core location management service
  - GPS location detection
  - Address geocoding and reverse geocoding
  - Institution location CRUD operations
  - Permission management
  - Distance calculations

#### New Screens
- `lib/screens/location_calibration_screen.dart` - Basic GPS calibration screen
  - Works without Google Maps
  - GPS detection and manual entry
  - Address search and validation
  - Location form with all required fields

- `lib/screens/location_calibration_with_maps_screen.dart` - Enhanced version with maps
  - Interactive Google Maps integration
  - Visual location selection
  - Attendance radius visualization
  - Map-based location setting

#### Updated Files
- `lib/main.dart` - Added LocationService provider
- `lib/screens/dashboard_screen.dart` - Enhanced ProfileTab with GPS calibration option
- `pubspec.yaml` - Added Google Maps dependency

## Usage

### Accessing GPS Calibration
1. Open the mobile app
2. Navigate to the **Profile** tab (bottom navigation)
3. Tap on **"GPS Calibration"** in the Settings & Tools section
4. Choose between automatic GPS detection or manual entry

### GPS Detection Mode (Default)
1. Tap the pulsing **"Get Current Location"** button
2. Grant location permissions when prompted
3. Wait for GPS to detect your precise location
4. Verify the detected address and coordinates
5. Adjust attendance radius if needed
6. Tap **"Update Location"** to save

### Manual Entry Mode
1. Tap **"Manual"** in the top-right corner
2. Enter latitude and longitude coordinates directly
3. Fill in address and location details
4. Set attendance radius
5. Tap **"Update Location"** to save

### Address Search
1. Enter an address in the address field
2. Tap the search icon (🔍) next to the address field
3. The app will find coordinates for the address
4. Verify and adjust details as needed
5. Update location

## Configuration

### Dependencies Required
```yaml
dependencies:
  # Location and Permissions
  geolocator: ^10.1.0
  permission_handler: ^11.0.1
  geocoding: ^3.0.0
  google_maps_flutter: ^2.5.0  # Optional, for enhanced maps experience
```

### Google Maps Setup (Optional)
To enable the enhanced maps experience:

1. **Android Setup**:
   - Add Google Maps API key to `android/app/src/main/AndroidManifest.xml`
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_API_KEY_HERE"/>
   ```

2. **iOS Setup**:
   - Add Google Maps API key to `ios/Runner/AppDelegate.swift`
   ```swift
   GMSServices.provideAPIKey("YOUR_API_KEY_HERE")
   ```

### Permissions Setup

#### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### iOS (`ios/Runner/Info.plist`)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to calibrate institution GPS coordinates for accurate attendance tracking.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to calibrate institution GPS coordinates for accurate attendance tracking.</string>
```

## User Experience

### GPS Status Indicators
- **🟢 Green**: Within institution radius - automatic attendance approval
- **🟠 Orange**: Outside institution radius - manual approval required  
- **🔵 Blue**: Institution location set - ready for attendance
- **⚫ Gray**: Location not set - GPS calibration needed

### Accuracy Levels
- **Excellent**: ±10m accuracy
- **Good**: ±50m accuracy
- **Fair**: ±100m accuracy
- **Poor**: >100m accuracy

### Error Messages
- **Permission Denied**: Links to device settings to enable location
- **Location Unavailable**: Suggests manual entry or moving to open area
- **Address Not Found**: Prompts for different address or manual coordinates
- **Invalid Coordinates**: Validates latitude/longitude ranges
- **Network Error**: Graceful handling of connectivity issues

## Security & Privacy

### Data Protection
- Location data is only stored for institution calibration
- No personal location tracking or history
- All location operations require user consent
- Data transmitted securely via HTTPS to Supabase

### Permission Handling
- Requests minimal necessary permissions
- Graceful fallback when permissions denied
- Links to system settings for permission management
- Clear explanations of why location access is needed

## Troubleshooting

### Common Issues

#### GPS Not Working
1. Check location permissions in device settings
2. Ensure location services are enabled
3. Move to an area with clear sky view
4. Restart the app and try again
5. Use manual entry as fallback

#### Address Search Failing
1. Check internet connectivity
2. Try a more specific address
3. Use landmark or postal code
4. Fall back to manual coordinate entry

#### Location Update Failing
1. Verify internet connection
2. Check if address field is filled
3. Ensure coordinates are within valid ranges
4. Try again after a moment

#### Map Not Loading
1. Check Google Maps API key configuration
2. Verify internet connectivity
3. Use the basic GPS calibration screen instead
4. Contact support if issue persists

## API Integration

### Supabase Integration
The mobile app integrates with the same backend API as the web version:

#### Endpoints Used
- `GET /api/institution-locations` - Fetch current location
- `POST /api/profile/update-location` - Update institution location

#### Database Tables
- `institution_locations` - Stores GPS coordinates and settings
- `users` - Links users to their institutions

### Location Data Format
```json
{
  "latitude": 3.1390,
  "longitude": 101.6869,
  "address": "Kuala Lumpur, Malaysia",
  "city": "Kuala Lumpur",
  "state": "Federal Territory",
  "postal_code": "50470",
  "country": "Malaysia",
  "attendance_radius": 300
}
```

## Future Enhancements

### Planned Features
- **Location History**: Track calibration changes over time
- **Multi-Location Support**: Support for institutions with multiple campuses
- **Advanced Geofencing**: Smart radius adjustment based on building size
- **Offline Maps**: Cached maps for offline location selection
- **Location Accuracy Warnings**: Alerts for low-accuracy GPS readings
- **Bulk Location Import**: CSV import for multiple locations

### Performance Optimizations
- **Location Caching**: Cache recent GPS readings
- **Map Tile Caching**: Offline map tile storage
- **Battery Optimization**: Efficient GPS usage patterns
- **Network Optimization**: Compress location data transfers

## Support

For technical issues or feature requests related to the mobile GPS calibration feature, please:

1. Check this documentation first
2. Review the troubleshooting section
3. Contact the development team with:
   - Device model and OS version
   - App version
   - Steps to reproduce the issue
   - Screenshots if applicable

---

**Note**: This feature requires device location permissions and internet connectivity for optimal functionality. The basic GPS calibration works without Google Maps integration, making it accessible on all devices.