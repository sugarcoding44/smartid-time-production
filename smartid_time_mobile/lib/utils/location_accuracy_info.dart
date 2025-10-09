import 'dart:math' as math;

/// Location Accuracy Information and Helper Functions
/// 
/// This file provides utilities to explain location accuracy values
/// and determine if the user is within institution radius.

class LocationAccuracyInfo {
  /// Explains what the GPS accuracy value means in user-friendly terms
  static String explainAccuracy(double accuracy) {
    if (accuracy <= 5) {
      return "Excellent GPS signal (±${accuracy.toStringAsFixed(1)}m) - Very precise location";
    } else if (accuracy <= 15) {
      return "Good GPS signal (±${accuracy.toStringAsFixed(1)}m) - Accurate location";
    } else if (accuracy <= 30) {
      return "Fair GPS signal (±${accuracy.toStringAsFixed(1)}m) - Moderate accuracy";
    } else if (accuracy <= 100) {
      return "Weak GPS signal (±${accuracy.toStringAsFixed(1)}m) - Less precise location";
    } else {
      return "Poor GPS signal (±${accuracy.toStringAsFixed(1)}m) - Location may be imprecise";
    }
  }

  /// Gets the icon for accuracy level
  static String getAccuracyIcon(double accuracy) {
    if (accuracy <= 5) {
      return "🟢"; // Green - excellent
    } else if (accuracy <= 15) {
      return "🟡"; // Yellow - good
    } else if (accuracy <= 30) {
      return "🟠"; // Orange - fair
    } else {
      return "🔴"; // Red - poor
    }
  }

  /// Determines if location is reliable enough for attendance
  static bool isReliableForAttendance(double accuracy) {
    // Generally, accuracy within 50 meters is acceptable for attendance
    return accuracy <= 50;
  }

  /// Calculates if the user is within institution radius
  /// Returns distance in meters and whether they're within range
  static Map<String, dynamic> checkInstitutionRadius({
    required double userLat,
    required double userLng,
    required double institutionLat,
    required double institutionLng,
    double institutionRadius = 100, // Default 100m radius
  }) {
    double distance = calculateDistance(userLat, userLng, institutionLat, institutionLng);
    bool isWithinRadius = distance <= institutionRadius;
    
    return {
      'distance': distance,
      'isWithinRadius': isWithinRadius,
      'institutionRadius': institutionRadius,
      'message': isWithinRadius 
          ? "You are within the institution area (${distance.toStringAsFixed(0)}m away)"
          : "You are outside the institution area (${distance.toStringAsFixed(0)}m away, ${institutionRadius}m required)"
    };
  }

  /// Calculate distance between two GPS coordinates using Haversine formula
  static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double earthRadius = 6371000; // Earth's radius in meters
    
    double dLat = _degreesToRadians(lat2 - lat1);
    double dLon = _degreesToRadians(lon2 - lon1);
    
    double a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_degreesToRadians(lat1)) * 
        math.cos(_degreesToRadians(lat2)) *
        math.sin(dLon / 2) * math.sin(dLon / 2);
    
    double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    double distance = earthRadius * c;
    
    return distance; // Distance in meters
  }

  static double _degreesToRadians(double degrees) {
    return degrees * (math.pi / 180);
  }

  /// Get detailed location info for debugging
  static String getLocationDebugInfo({
    required double latitude,
    required double longitude,
    required double accuracy,
    String? address,
  }) {
    return """
📍 Location Debug Information:
- Coordinates: ${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}
- Accuracy: ${explainAccuracy(accuracy)}
- Address: ${address ?? 'Not available'}
- Reliable for attendance: ${isReliableForAttendance(accuracy) ? 'Yes' : 'No'}
""";
  }
}

