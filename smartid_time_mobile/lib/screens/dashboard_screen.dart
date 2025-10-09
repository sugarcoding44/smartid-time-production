import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/supabase_service.dart';
import '../services/auth_service.dart';
import '../services/dashboard_service.dart';
import '../services/attendance_service.dart';
import '../services/leave_service.dart';
import '../services/file_upload_service.dart';
import '../services/wallet_service.dart';
import '../main.dart';
import 'location_calibration_screen.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SmartIdTheme.slate900,
      appBar: AppBar(
        backgroundColor: SmartIdTheme.slate800,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [SmartIdTheme.indigo500, SmartIdTheme.indigo600],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.school,
                color: SmartIdTheme.slate50,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'SmartID TIME',
              style: TextStyle(
                color: SmartIdTheme.slate50,
                fontWeight: FontWeight.w600,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: SmartIdTheme.slate700,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: SmartIdTheme.slate600, width: 1),
            ),
            child: PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, color: SmartIdTheme.slate300),
              color: SmartIdTheme.slate800,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: SmartIdTheme.slate700),
              ),
              onSelected: (value) async {
                if (value == 'logout') {
                  await Provider.of<AuthService>(context, listen: false).logout();
                }
              },
              itemBuilder: (BuildContext context) => [
                PopupMenuItem<String>(
                  value: 'logout',
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: SmartIdTheme.red400.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.logout,
                          color: SmartIdTheme.red400,
                          size: 16,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Logout',
                        style: TextStyle(color: SmartIdTheme.slate50),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: _buildCurrentScreen(),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: SmartIdTheme.slate800,
          border: Border(
            top: BorderSide(color: SmartIdTheme.slate700, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          backgroundColor: SmartIdTheme.slate800,
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          type: BottomNavigationBarType.fixed,
          selectedItemColor: SmartIdTheme.indigo400,
          unselectedItemColor: SmartIdTheme.slate400,
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 12,
          ),
          unselectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w400,
            fontSize: 11,
          ),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.access_time_outlined),
              activeIcon: Icon(Icons.access_time),
              label: 'Attendance',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet),
              label: 'E-Wallet',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.assignment_outlined),
              activeIcon: Icon(Icons.assignment),
              label: 'Leave',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentScreen() {
    switch (_currentIndex) {
      case 0:
        return DashboardTab(onTabSwitch: (index) => setState(() => _currentIndex = index));
      case 1:
        return AttendanceTab(onTabSwitch: (index) => setState(() => _currentIndex = index));
      case 2:
        return EWalletTab(onTabSwitch: (index) => setState(() => _currentIndex = index));
      case 3:
        return LeaveTab(onTabSwitch: (index) => setState(() => _currentIndex = index));
      case 4:
        return ProfileTab(onTabSwitch: (index) => setState(() => _currentIndex = index));
      default:
        return DashboardTab(onTabSwitch: (index) => setState(() => _currentIndex = index));
    }
  }
}

class DashboardTab extends StatefulWidget {
  final Function(int) onTabSwitch;
  
  const DashboardTab({super.key, required this.onTabSwitch});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  Map<String, dynamic>? _todayAttendanceStatus;
  bool _isLoadingAttendance = false;
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchDashboardData();
      _fetchTodayAttendanceStatus();
    });
  }

  void _fetchDashboardData() {
    final authService = Provider.of<AuthService>(context, listen: false);
    final dashboardService = Provider.of<DashboardService>(context, listen: false);
    
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    if (user != null && userProfile != null) {
      final userId = user['id'];
      final employeeId = userProfile['employee_id'];
      
      if (dashboardService.needsRefresh) {
        dashboardService.fetchDashboardData(userId, employeeId);
      }
    }
  }
  
  // Fetch today's attendance status with shift information
  Future<void> _fetchTodayAttendanceStatus() async {
    setState(() {
      _isLoadingAttendance = true;
    });
    
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final attendanceService = Provider.of<AttendanceService>(context, listen: false);
      
      final user = authService.user;
      final userProfile = authService.userProfile;
      
      if (user != null && userProfile != null) {
        final userId = user['id'];
        final employeeId = userProfile['employee_id'];
        
        // Fetch today's attendance status
        await attendanceService.fetchAttendanceData(userId, employeeId);
        
        // Get current time and work shift info
        final now = DateTime.now();
        final workStartTime = _parseTimeString(userProfile['work_start_time'] ?? '08:00');
        final workEndTime = _parseTimeString(userProfile['work_end_time'] ?? '17:00');
        final lateThreshold = _parseTimeString(userProfile['late_threshold'] ?? '08:15');
        
        // Calculate attendance status
        final todayRecord = attendanceService.todayRecord;
        final hasCheckedIn = attendanceService.hasCheckedInToday;
        final hasCheckedOut = attendanceService.hasCheckedOutToday;
        
        String attendanceStatus = 'Not Checked In';
        Color statusColor = SmartIdTheme.red400;
        IconData statusIcon = Icons.schedule;
        String statusDetail = 'Please check in to start your day';
        bool isLate = false;
        
        if (hasCheckedIn && !hasCheckedOut) {
          attendanceStatus = 'Checked In';
          statusColor = SmartIdTheme.emerald400;
          statusIcon = Icons.check_circle;
          
          if (todayRecord != null && todayRecord['check_in_time'] != null) {
            final checkInTime = DateTime.parse(todayRecord['check_in_time']);
            final todayWorkStart = DateTime(
              now.year, now.month, now.day,
              workStartTime.hour, workStartTime.minute
            );
            final todayLateThreshold = DateTime(
              now.year, now.month, now.day,
              lateThreshold.hour, lateThreshold.minute
            );
            
            if (checkInTime.isAfter(todayLateThreshold)) {
              isLate = true;
              statusDetail = 'Late arrival at ${_formatTime(checkInTime)}';
            } else {
              statusDetail = 'On time at ${_formatTime(checkInTime)}';
            }
          }
        } else if (hasCheckedIn && hasCheckedOut) {
          attendanceStatus = 'Checked Out';
          statusColor = SmartIdTheme.blue400;
          statusIcon = Icons.logout;
          
          if (todayRecord != null && todayRecord['check_out_time'] != null) {
            final checkOutTime = DateTime.parse(todayRecord['check_out_time']);
            statusDetail = 'Completed at ${_formatTime(checkOutTime)}';
          }
        } else {
          // Not checked in yet - check if late
          final todayLateThreshold = DateTime(
            now.year, now.month, now.day,
            lateThreshold.hour, lateThreshold.minute
          );
          
          if (now.isAfter(todayLateThreshold)) {
            attendanceStatus = 'Late';
            statusColor = SmartIdTheme.orange500;
            statusIcon = Icons.warning;
            statusDetail = 'Please check in immediately';
            isLate = true;
          } else {
            final timeUntilWork = todayLateThreshold.difference(now);
            if (timeUntilWork.inMinutes <= 30) {
              statusDetail = 'Work starts in ${timeUntilWork.inMinutes} minutes';
            }
          }
        }
        
        setState(() {
          _todayAttendanceStatus = {
            'status': attendanceStatus,
            'statusColor': statusColor,
            'statusIcon': statusIcon,
            'statusDetail': statusDetail,
            'isLate': isLate,
            'hasCheckedIn': hasCheckedIn,
            'hasCheckedOut': hasCheckedOut,
            'workStartTime': _formatTime(DateTime(now.year, now.month, now.day, workStartTime.hour, workStartTime.minute)),
            'workEndTime': _formatTime(DateTime(now.year, now.month, now.day, workEndTime.hour, workEndTime.minute)),
            'checkInTime': hasCheckedIn && todayRecord?['check_in_time'] != null 
                ? _formatTime(DateTime.parse(todayRecord!['check_in_time'])) : null,
            'checkOutTime': hasCheckedOut && todayRecord?['check_out_time'] != null 
                ? _formatTime(DateTime.parse(todayRecord!['check_out_time'])) : null,
          };
        });
      }
    } catch (e) {
      print('❌ Error fetching attendance status: $e');
    } finally {
      setState(() {
        _isLoadingAttendance = false;
      });
    }
  }
  
  // Helper method to parse time string
  DateTime _parseTimeString(String timeStr) {
    final parts = timeStr.split(':');
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day, 
        int.parse(parts[0]), int.parse(parts[1]));
  }
  
  // Helper method to format time
  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
  
  // Build comprehensive attendance status card
  Widget _buildAttendanceStatusCard() {
    if (_isLoadingAttendance) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: SmartIdTheme.slate800,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: SmartIdTheme.slate700,
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: SmartIdTheme.indigo500.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(SmartIdTheme.indigo400),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Loading Attendance Status...',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: SmartIdTheme.slate50,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }
    
    final attendanceStatus = _todayAttendanceStatus;
    if (attendanceStatus == null) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: SmartIdTheme.slate800,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: SmartIdTheme.slate700,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: SmartIdTheme.red400.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.error_outline,
                    color: SmartIdTheme.red400,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Attendance Status',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: SmartIdTheme.slate50,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Unable to load attendance status',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SmartIdTheme.slate400,
              ),
            ),
          ],
        ),
      );
    }
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate800,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: attendanceStatus['isLate'] == true 
              ? SmartIdTheme.orange500.withOpacity(0.5)
              : SmartIdTheme.slate700,
          width: attendanceStatus['isLate'] == true ? 2 : 1,
        ),
        boxShadow: attendanceStatus['isLate'] == true 
            ? [
                BoxShadow(
                  color: SmartIdTheme.orange500.withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with status
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (attendanceStatus['statusColor'] as Color).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  attendanceStatus['statusIcon'] as IconData,
                  color: attendanceStatus['statusColor'] as Color,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Today\'s Attendance',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: SmartIdTheme.slate50,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: (attendanceStatus['statusColor'] as Color).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: (attendanceStatus['statusColor'] as Color).withOpacity(0.3),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            attendanceStatus['status'] as String,
                            style: TextStyle(
                              color: attendanceStatus['statusColor'] as Color,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        if (attendanceStatus['isLate'] == true) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: SmartIdTheme.red400.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: SmartIdTheme.red400.withOpacity(0.3),
                                width: 1,
                              ),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.warning,
                                  color: SmartIdTheme.red400,
                                  size: 10,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  'LATE',
                                  style: TextStyle(
                                    color: SmartIdTheme.red400,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              // Real-time clock
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: SmartIdTheme.slate700.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      DateTime.now().hour.toString().padLeft(2, '0') +
                          ':' +
                          DateTime.now().minute.toString().padLeft(2, '0'),
                      style: const TextStyle(
                        color: SmartIdTheme.slate50,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                    Text(
                      'NOW',
                      style: TextStyle(
                        color: SmartIdTheme.slate400,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Status detail
          Text(
            attendanceStatus['statusDetail'] as String,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: SmartIdTheme.slate300,
              fontWeight: FontWeight.w500,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Time details row
          Row(
            children: [
              // Work schedule
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Work Schedule',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SmartIdTheme.slate400,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.schedule,
                          color: SmartIdTheme.slate400,
                          size: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${attendanceStatus['workStartTime']} - ${attendanceStatus['workEndTime']}',
                          style: const TextStyle(
                            color: SmartIdTheme.slate50,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Check-in time (if available)
              if (attendanceStatus['checkInTime'] != null)
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Check-in Time',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SmartIdTheme.slate400,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Icon(
                            Icons.login,
                            color: SmartIdTheme.emerald400,
                            size: 14,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            attendanceStatus['checkInTime'] as String,
                            style: const TextStyle(
                              color: SmartIdTheme.slate50,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
            ],
          ),
          
          // Check-out time (if available)
          if (attendanceStatus['checkOutTime'] != null) ...[
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Check-out Time',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SmartIdTheme.slate400,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Icon(
                          Icons.logout,
                          color: SmartIdTheme.blue400,
                          size: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          attendanceStatus['checkOutTime'] as String,
                          style: const TextStyle(
                            color: SmartIdTheme.slate50,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ],
          
          const SizedBox(height: 16),
          
          // Action buttons
          Row(
            children: [
              if (!attendanceStatus['hasCheckedIn'])
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _performCheckIn(),
                    icon: const Icon(
                      Icons.login,
                      size: 16,
                    ),
                    label: const Text(
                      'Check In Now',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: SmartIdTheme.emerald500,
                      foregroundColor: SmartIdTheme.slate50,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                )
              else if (!attendanceStatus['hasCheckedOut'])
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _performCheckOut(),
                    icon: const Icon(
                      Icons.logout,
                      size: 16,
                    ),
                    label: const Text(
                      'Check Out',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: SmartIdTheme.blue500,
                      foregroundColor: SmartIdTheme.slate50,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                )
              else
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: SmartIdTheme.emerald500.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: SmartIdTheme.emerald500.withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.check_circle,
                          color: SmartIdTheme.emerald500,
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Day Completed',
                          style: TextStyle(
                            color: SmartIdTheme.emerald500,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: SmartIdTheme.slate700,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: SmartIdTheme.slate600,
                    width: 1,
                  ),
                ),
                child: InkWell(
                  onTap: () => widget.onTabSwitch(1),
                  child: Icon(
                    Icons.access_time,
                    color: SmartIdTheme.slate300,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final dashboardService = Provider.of<DashboardService>(context);
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    return RefreshIndicator(
      onRefresh: () async {
        if (user != null && userProfile != null) {
          await dashboardService.refreshData(user['id'], userProfile['employee_id']);
          await _fetchTodayAttendanceStatus();
        }
      },
      backgroundColor: SmartIdTheme.slate800,
      color: SmartIdTheme.indigo400,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header Card - matching Next.js design
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    SmartIdTheme.violet900,
                    SmartIdTheme.purple800,
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: SmartIdTheme.indigo500.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome back, ${user?['full_name'] ?? 'User'} 👋',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: SmartIdTheme.slate50,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${user?['smartid_time_role']?.toString().toUpperCase() ?? 'EMPLOYEE'} at ${user?['institution_name'] ?? 'Institution'} • ${DateTime.now().toString().split(' ')[0]}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: SmartIdTheme.violet400.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      _buildQuickStat(
                        '${dashboardService.attendanceData['attendance_rate']?.toStringAsFixed(0) ?? '92'}%', 
                        'Attendance'
                      ),
                      const SizedBox(width: 32),
                      _buildQuickStat(
                        'RM${dashboardService.walletBalance.toStringAsFixed(2)}', 
                        'E-Wallet'
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            
            const SizedBox(height: 24),
            
            // Attendance Status Card
            _buildAttendanceStatusCard(),
            
            const SizedBox(height: 24),
            
            // Quick Actions Grid
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: SmartIdTheme.slate800,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: SmartIdTheme.slate700,
                  width: 1,
                ),
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
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.flash_on,
                          color: SmartIdTheme.indigo400,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Quick Actions',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: SmartIdTheme.slate50,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Frequently used actions and shortcuts',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: SmartIdTheme.slate400,
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Primary Quick Actions Row
                  Row(
                    children: [
                      Expanded(
                        child: _buildPrimaryActionButton(
                          'Check In',
                          Icons.login,
                          SmartIdTheme.emerald400,
                          () => _performCheckIn(),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildPrimaryActionButton(
                          'Submit Leave',
                          Icons.assignment_turned_in,
                          SmartIdTheme.amber400,
                          () => _showLeaveRequestDialog(),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Secondary Quick Actions Grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.2,
                    children: [
                      _buildInfoCard(
                        'Attendance Rate',
                        '${dashboardService.attendanceData['attendance_rate']?.toStringAsFixed(0) ?? '92'}%',
                        Icons.access_time,
                        SmartIdTheme.emerald400,
                        'This month',
                        () => _switchToTab(1)
                      ),
                      _buildInfoCard(
                        'E-Wallet Balance',
                        'RM${dashboardService.walletBalance.toStringAsFixed(2)}',
                        Icons.account_balance_wallet,
                        SmartIdTheme.blue400,
                        'Available balance',
                        () => _switchToTab(2)
                      ),
                      _buildInfoCard(
                        'Leave Quota',
                        '${dashboardService.leaveBalance['remaining'] ?? (14 - (dashboardService.leaveBalance['used'] ?? 0))} days left',
                        Icons.calendar_today,
                        SmartIdTheme.amber400,
                        'Remaining this year',
                        () => _switchToTab(3),
                      ),
                      _buildInfoCard(
                        'Profile',
                        user?['smartid_time_role'] == 'teacher' ? 'Teacher' : 'Staff',
                        Icons.person,
                        SmartIdTheme.violet400,
                        'View details',
                        () => _switchToTab(4),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            
            const SizedBox(height: 24),
            
            // Recent Activity
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: SmartIdTheme.slate800,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: SmartIdTheme.slate700,
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Recent Activity',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: SmartIdTheme.slate50,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildActivityItem(
                    'Clock In',
                    'Today at 8:00 AM',
                    Icons.login,
                    SmartIdTheme.emerald400,
                  ),
                  const SizedBox(height: 8),
                  _buildActivityItem(
                    'E-Wallet Top Up',
                    'Yesterday at 2:30 PM',
                    Icons.add_circle,
                    SmartIdTheme.blue400,
                  ),
                  const SizedBox(height: 8),
                  _buildActivityItem(
                    'Leave Request Submitted',
                    '2 days ago',
                    Icons.assignment_turned_in,
SmartIdTheme.orange500
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickStat(String value, String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: SmartIdTheme.slate50,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: SmartIdTheme.violet400,
          ),
        ),
      ],
    );
  }

  // New primary action button for important actions
  Widget _buildPrimaryActionButton(String title, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: color.withOpacity(0.3),
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Updated info card with tap functionality
  Widget _buildInfoCard(String title, String value, IconData icon, Color color, String subtitle, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: SmartIdTheme.slate700,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: SmartIdTheme.slate600,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 18),
                ),
                const Spacer(),
                Icon(
                  Icons.arrow_forward_ios,
                  color: SmartIdTheme.slate400,
                  size: 14,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              subtitle,
              style: const TextStyle(
                color: SmartIdTheme.slate400,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: SmartIdTheme.slate50,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Tab switching method
  void _switchToTab(int index) {
    widget.onTabSwitch(index);
  }

  // Quick action methods
  void _performCheckIn() {
    print('🐈 DEBUG: Check-in button pressed!');
    _showCheckInConfirmationDialog();
  }
  void _showCheckInConfirmationDialog() {
    print('🐈 DEBUG: Showing confirmation dialog!');
    showDialog(
      context: context,
      builder: (context) => Consumer<AttendanceService>(
        builder: (context, attendanceService, child) => AlertDialog(
          backgroundColor: SmartIdTheme.slate800,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SmartIdTheme.emerald400.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.location_on,
                  color: SmartIdTheme.emerald400,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Check-in Confirmation',
                style: TextStyle(color: SmartIdTheme.slate50, fontSize: 18),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Location Status Indicator
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: attendanceService.locationPermissionGranted
                      ? SmartIdTheme.emerald500.withOpacity(0.1) 
                      : SmartIdTheme.amber500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: attendanceService.locationPermissionGranted
                        ? SmartIdTheme.emerald500.withOpacity(0.3)
                        : SmartIdTheme.amber500.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      attendanceService.locationPermissionGranted
                          ? Icons.location_on 
                          : Icons.location_off,
                      color: attendanceService.locationPermissionGranted
                          ? SmartIdTheme.emerald400
                          : SmartIdTheme.amber400,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            attendanceService.locationPermissionGranted
                                ? 'Location Access Granted'
                                : 'Location Permission Needed',
                            style: TextStyle(
                              color: SmartIdTheme.slate50,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            attendanceService.locationPermissionGranted
                                ? 'Your location will be captured to verify attendance at institution premises.'
                                : 'Please grant location permission to complete check-in verification.',
                            style: TextStyle(
                              color: SmartIdTheme.slate300,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              // Current Location Display (if available)
              if (attendanceService.currentLocation != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: SmartIdTheme.slate700.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: SmartIdTheme.blue500.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Icon(
                          Icons.my_location,
                          color: SmartIdTheme.blue400,
                          size: 16,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Current Location',
                              style: TextStyle(
                                color: SmartIdTheme.slate300,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${attendanceService.currentLocation!.latitude.toStringAsFixed(6)}, ${attendanceService.currentLocation!.longitude.toStringAsFixed(6)}',
                              style: const TextStyle(
                                color: SmartIdTheme.blue400,
                                fontSize: 11,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            const SizedBox(height: 16),
            const Text(
              'Attendance Status:',
              style: TextStyle(
                color: SmartIdTheme.slate400,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SmartIdTheme.slate700,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(
                    Icons.check_circle_outline,
                    color: SmartIdTheme.emerald400,
                    size: 16,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Inside institution area',
                    style: TextStyle(
                      color: SmartIdTheme.emerald400,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    ' = Automatic approval',
                    style: TextStyle(
                      color: SmartIdTheme.slate300,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SmartIdTheme.slate700,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(
                    Icons.pending_outlined,
                    color: SmartIdTheme.amber400,
                    size: 16,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Outside institution area',
                    style: TextStyle(
                      color: SmartIdTheme.amber400,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    ' = Requires approval',
                    style: TextStyle(
                      color: SmartIdTheme.slate300,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            ],
          ),
          actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Cancel',
              style: TextStyle(color: SmartIdTheme.slate400),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _executeCheckIn();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: SmartIdTheme.emerald400,
              foregroundColor: SmartIdTheme.slate900,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.login, size: 16),
                SizedBox(width: 8),
                Text('Proceed with Check-in', style: TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
        ),
      ),
    );
  }
  
  void _executeCheckIn() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final attendanceService = Provider.of<AttendanceService>(context, listen: false);
    
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    if (user == null || userProfile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please sign in to check in'),
          backgroundColor: SmartIdTheme.red500,
        ),
      );
      return;
    }
    
    final userId = user['id'];
    final employeeId = userProfile['employee_id'];
    final institutionId = userProfile['institution_id'];
    
    print('📋 TIME Mobile Check-in - User: $userId, Employee: $employeeId, Institution: $institutionId');
    
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(SmartIdTheme.emerald400),
            ),
            const SizedBox(height: 16),
            const Text(
              'Checking in...',
              style: TextStyle(color: SmartIdTheme.slate50),
            ),
            const SizedBox(height: 8),
            const Text(
              'Getting your location and verifying attendance',
              style: TextStyle(color: SmartIdTheme.slate400, fontSize: 12),
            ),
          ],
        ),
      ),
    );
    
    try {
      final success = await attendanceService.checkIn(
        userId: userId,
        employeeId: employeeId,
        institutionId: institutionId,
        manual: true,
      );
      
      // Close loading dialog
      Navigator.pop(context);
      
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Check-in Successful!',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'Your attendance has been recorded',
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.emerald500,
            duration: const Duration(seconds: 4),
          ),
        );
        
        // Refresh dashboard data and attendance status
        _fetchDashboardData();
        _fetchTodayAttendanceStatus();
      } else {
        final errorMessage = attendanceService.error ?? 'Check-in failed';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Check-in Failed',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        errorMessage,
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.red500,
            duration: const Duration(seconds: 6),
          ),
        );
      }
    } catch (e) {
      // Close loading dialog
      Navigator.pop(context);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Check-in error: $e'),
          backgroundColor: SmartIdTheme.red500,
        ),
      );
    }
  }
  
  // Check-out method
  void _performCheckOut() {
    print('🚪 DEBUG: Check-out button pressed!');
    _showCheckOutConfirmationDialog();
  }
  
  void _showCheckOutConfirmationDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: SmartIdTheme.blue400.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.logout,
                color: SmartIdTheme.blue400,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Check-out Confirmation',
              style: TextStyle(color: SmartIdTheme.slate50, fontSize: 18),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: SmartIdTheme.blue500.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: SmartIdTheme.blue500.withOpacity(0.3),
                  width: 1,
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
                        'End Your Work Day',
                        style: TextStyle(
                          color: SmartIdTheme.slate50,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'You are about to check out and end your work day. Your location will be recorded for attendance verification.',
                    style: TextStyle(
                      color: SmartIdTheme.slate300,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        color: SmartIdTheme.slate400,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Current Time: ${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}',
                        style: TextStyle(
                          color: SmartIdTheme.slate400,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Cancel',
              style: TextStyle(color: SmartIdTheme.slate400),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _executeCheckOut();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: SmartIdTheme.blue400,
              foregroundColor: SmartIdTheme.slate50,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.logout, size: 16),
                SizedBox(width: 8),
                Text('Check Out', style: TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  void _executeCheckOut() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final attendanceService = Provider.of<AttendanceService>(context, listen: false);
    
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    if (user == null || userProfile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please sign in to check out'),
          backgroundColor: SmartIdTheme.red500,
        ),
      );
      return;
    }
    
    final userId = user['id'];
    final employeeId = userProfile['employee_id'];
    final institutionId = userProfile['institution_id'];
    
    print('🚪 TIME Mobile Check-out - User: $userId, Employee: $employeeId, Institution: $institutionId');
    
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(SmartIdTheme.blue400),
            ),
            const SizedBox(height: 16),
            const Text(
              'Checking out...',
              style: TextStyle(color: SmartIdTheme.slate50),
            ),
            const SizedBox(height: 8),
            const Text(
              'Recording your departure time and location',
              style: TextStyle(color: SmartIdTheme.slate400, fontSize: 12),
            ),
          ],
        ),
      ),
    );
    
    try {
      final success = await attendanceService.checkOut(
        userId: userId,
        employeeId: employeeId,
        institutionId: institutionId,
        manual: true,
      );
      
      // Close loading dialog
      Navigator.pop(context);
      
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Check-out Successful!',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'Have a great day! Your work day is complete.',
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.blue500,
            duration: const Duration(seconds: 4),
          ),
        );
        
        // Refresh attendance status
        _fetchTodayAttendanceStatus();
        _fetchDashboardData();
      } else {
        final errorMessage = attendanceService.error ?? 'Check-out failed';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Check-out Failed',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        errorMessage,
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.red500,
            duration: const Duration(seconds: 6),
          ),
        );
      }
    } catch (e) {
      // Close loading dialog
      Navigator.pop(context);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Check-out error: $e'),
          backgroundColor: SmartIdTheme.red500,
        ),
      );
    }
  }

  void _showLeaveRequestDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Submit Leave Request',
          style: TextStyle(color: SmartIdTheme.slate50),
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Leave request functionality will be implemented here.',
              style: TextStyle(color: SmartIdTheme.slate400),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Cancel',
              style: TextStyle(color: SmartIdTheme.slate400),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Leave request submitted successfully'),
                  backgroundColor: SmartIdTheme.amber400,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: SmartIdTheme.amber400,
              foregroundColor: SmartIdTheme.slate900,
            ),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem(String title, String time, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate700,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: SmartIdTheme.slate600,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: SmartIdTheme.slate50,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  time,
                  style: const TextStyle(
                    color: SmartIdTheme.slate400,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right,
            color: SmartIdTheme.slate400,
            size: 16,
          ),
        ],
      ),
    );
  }
}

// Placeholder tabs for other screens
class AttendanceTab extends StatefulWidget {
  final Function(int) onTabSwitch;
  
  const AttendanceTab({super.key, required this.onTabSwitch});

  @override
  State<AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends State<AttendanceTab> {
  late AttendanceService _attendanceService;
  
  @override
  void initState() {
    super.initState();
    _attendanceService = Provider.of<AttendanceService>(context, listen: false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeAttendance();
    });
  }

  void _initializeAttendance() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    if (user != null && userProfile != null) {
      await _attendanceService.initializeLocation();
      await _attendanceService.fetchAttendanceData(user['id'], userProfile['employee_id']);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final attendanceService = Provider.of<AttendanceService>(context);
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    return RefreshIndicator(
      onRefresh: () async {
        if (user != null && userProfile != null) {
          await attendanceService.refreshData(user['id'], userProfile['employee_id']);
        }
      },
      backgroundColor: SmartIdTheme.slate800,
      color: SmartIdTheme.indigo400,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Today's Status Card
            _buildTodayStatusCard(attendanceService),
            const SizedBox(height: 24),
            
            // Check-in/Check-out Buttons
            _buildCheckInOutButtons(attendanceService, user, userProfile),
            const SizedBox(height: 24),
            
            // Monthly Statistics
            _buildMonthlyStats(attendanceService),
            const SizedBox(height: 24),
            
            // Recent Activity
            _buildRecentActivity(),
          ],
        ),
      ),
    );
  }

  Widget _buildTodayStatusCard(AttendanceService attendanceService) {
    final now = DateTime.now();
    final dateStr = '${now.day} ${_getMonthName(now.month)} ${now.year}';
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            SmartIdTheme.indigo900,
            SmartIdTheme.blue800,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SmartIdTheme.indigo500.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Today\'s Attendance',
                    style: TextStyle(
                      color: SmartIdTheme.slate300,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dateStr,
                    style: const TextStyle(
                      color: SmartIdTheme.slate50,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: attendanceService.hasCheckedInToday
                      ? SmartIdTheme.green500.withOpacity(0.2)
                      : SmartIdTheme.slate700,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: attendanceService.hasCheckedInToday
                        ? SmartIdTheme.green500
                        : SmartIdTheme.slate600,
                  ),
                ),
                child: Text(
                  attendanceService.hasCheckedOutToday
                      ? 'Completed'
                      : attendanceService.hasCheckedInToday
                          ? 'Present'
                          : 'Not Checked In',
                  style: TextStyle(
                    color: attendanceService.hasCheckedInToday
                        ? SmartIdTheme.green400
                        : SmartIdTheme.slate400,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Check-in/out times
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Check-in',
                      style: TextStyle(
                        color: SmartIdTheme.slate400,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      attendanceService.todayCheckInTime ?? '--:--',
                      style: const TextStyle(
                        color: SmartIdTheme.slate50,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: SmartIdTheme.slate600,
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Check-out',
                      style: TextStyle(
                        color: SmartIdTheme.slate400,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      attendanceService.todayCheckOutTime ?? '--:--',
                      style: const TextStyle(
                        color: SmartIdTheme.slate50,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          if (attendanceService.todayWorkDuration != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SmartIdTheme.slate800.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Work Duration',
                    style: TextStyle(
                      color: SmartIdTheme.slate300,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    attendanceService.todayWorkDuration!,
                    style: const TextStyle(
                      color: SmartIdTheme.indigo300,
                      fontSize: 14,
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

  Widget _buildCheckInOutButtons(AttendanceService attendanceService, Map<String, dynamic>? user, Map<String, dynamic>? userProfile) {
    if (user == null || userProfile == null) {
      return const SizedBox.shrink();
    }

    final canCheckIn = !attendanceService.hasCheckedInToday && !attendanceService.isLoading;
    final canCheckOut = attendanceService.hasCheckedInToday && !attendanceService.hasCheckedOutToday && !attendanceService.isLoading;

    return Row(
      children: [
        Expanded(
          child: _buildActionButton(
            title: 'Check In',
            subtitle: 'Start your workday',
            icon: Icons.login,
            color: SmartIdTheme.green500,
            enabled: canCheckIn,
            loading: attendanceService.isLoading,
            onTap: canCheckIn ? () => _showCheckInConfirmationDialog() : null,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildActionButton(
            title: 'Check Out',
            subtitle: 'End your workday',
            icon: Icons.logout,
            color: SmartIdTheme.orange500,
            enabled: canCheckOut,
            loading: attendanceService.isLoading,
            onTap: canCheckOut ? () => _showCheckOutConfirmationDialog(attendanceService, user, userProfile) : null,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required bool enabled,
    required bool loading,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: enabled ? SmartIdTheme.slate800 : SmartIdTheme.slate800.withOpacity(0.5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: enabled ? color.withOpacity(0.3) : SmartIdTheme.slate600,
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: enabled ? color.withOpacity(0.1) : SmartIdTheme.slate700,
                borderRadius: BorderRadius.circular(12),
              ),
              child: loading
                  ? SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          enabled ? color : SmartIdTheme.slate500,
                        ),
                      ),
                    )
                  : Icon(
                      icon,
                      color: enabled ? color : SmartIdTheme.slate500,
                      size: 24,
                    ),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                color: enabled ? SmartIdTheme.slate50 : SmartIdTheme.slate500,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                color: enabled ? SmartIdTheme.slate400 : SmartIdTheme.slate600,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMonthlyStats(AttendanceService attendanceService) {
    final attendanceData = attendanceService.attendanceData;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'This Month',
          style: TextStyle(
            color: SmartIdTheme.slate50,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Total Days',
                '${attendanceData?['total_days'] ?? 0}',
                Icons.calendar_month,
                SmartIdTheme.blue500,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Present',
                '${attendanceData?['present_days'] ?? 0}',
                Icons.check_circle,
                SmartIdTheme.green500,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Rate',
                '${(attendanceData?['attendance_rate'] ?? 0).toInt()}%',
                Icons.trending_up,
                SmartIdTheme.indigo500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate800,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: SmartIdTheme.slate700,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              color: SmartIdTheme.slate50,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              color: SmartIdTheme.slate400,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Activity',
          style: TextStyle(
            color: SmartIdTheme.slate50,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: SmartIdTheme.slate800,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: SmartIdTheme.slate700,
              width: 1,
            ),
          ),
          child: const Center(
            child: Column(
              children: [
                Icon(
                  Icons.history,
                  color: SmartIdTheme.slate500,
                  size: 48,
                ),
                SizedBox(height: 12),
                Text(
                  'No recent activity',
                  style: TextStyle(
                    color: SmartIdTheme.slate400,
                    fontSize: 16,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Your recent check-ins and check-outs will appear here',
                  style: TextStyle(
                    color: SmartIdTheme.slate500,
                    fontSize: 12,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }


  void _handleCheckOut(AttendanceService attendanceService, Map<String, dynamic> user, Map<String, dynamic> userProfile) async {
    print('📋 TIME Mobile Check-out - User: ${user['id']}, Employee: ${userProfile['employee_id']}, Institution: ${userProfile['institution_id']}');
    
    // Show confirmation dialog first
    _showCheckOutConfirmationDialog(attendanceService, user, userProfile);
  }
  
  void _showCheckInConfirmationDialog() {
    showDialog(
      context: context,
      builder: (context) => Consumer<AttendanceService>(
        builder: (context, attendanceService, child) => AlertDialog(
          backgroundColor: SmartIdTheme.slate800,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SmartIdTheme.emerald400.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.location_on,
                  color: SmartIdTheme.emerald400,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Check-in Confirmation',
                style: TextStyle(color: SmartIdTheme.slate50, fontSize: 18),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Location Status Indicator
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: attendanceService.locationPermissionGranted
                      ? SmartIdTheme.emerald500.withOpacity(0.1) 
                      : SmartIdTheme.amber500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: attendanceService.locationPermissionGranted
                        ? SmartIdTheme.emerald500.withOpacity(0.3)
                        : SmartIdTheme.amber500.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      attendanceService.locationPermissionGranted
                          ? Icons.location_on 
                          : Icons.location_off,
                      color: attendanceService.locationPermissionGranted
                          ? SmartIdTheme.emerald400
                          : SmartIdTheme.amber400,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            attendanceService.locationPermissionGranted
                                ? 'Location Access Granted'
                                : 'Location Permission Needed',
                            style: const TextStyle(
                              color: SmartIdTheme.slate50,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            attendanceService.locationPermissionGranted
                                ? 'Your location will be captured to verify attendance at institution premises.'
                                : 'Please grant location permission to complete check-in verification.',
                            style: const TextStyle(
                              color: SmartIdTheme.slate300,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              // Map/Location Preview (if location is available)
              if (attendanceService.currentLocation != null) ...[
                const SizedBox(height: 16),
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: SmartIdTheme.slate600,
                      width: 1,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: kIsWeb
                        ? _buildWebLocationPreview(attendanceService.currentLocation!)
                        : _buildGoogleMap(attendanceService.currentLocation!),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: SmartIdTheme.slate700.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: SmartIdTheme.blue500.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Icon(
                          Icons.my_location,
                          color: SmartIdTheme.blue400,
                          size: 16,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Coordinates',
                              style: TextStyle(
                                color: SmartIdTheme.slate300,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 2),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: Alignment.centerLeft,
                              child: Text(
                                '${attendanceService.currentLocation!.latitude.toStringAsFixed(4)}, ${attendanceService.currentLocation!.longitude.toStringAsFixed(4)}',
                                style: const TextStyle(
                                  color: SmartIdTheme.blue400,
                                  fontSize: 11,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),
              const Text(
                'Attendance Status:',
                style: TextStyle(
                  color: SmartIdTheme.slate400,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: SmartIdTheme.slate700,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.check_circle_outline,
                      color: SmartIdTheme.emerald400,
                      size: 16,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Inside institution area',
                      style: TextStyle(
                        color: SmartIdTheme.emerald400,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      ' = Automatic approval',
                      style: TextStyle(
                        color: SmartIdTheme.slate300,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: SmartIdTheme.slate700,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.pending_outlined,
                      color: SmartIdTheme.amber400,
                      size: 16,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Outside institution area',
                      style: TextStyle(
                        color: SmartIdTheme.amber400,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      ' = Requires approval',
                      style: TextStyle(
                        color: SmartIdTheme.slate300,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Cancel',
                style: TextStyle(color: SmartIdTheme.slate400),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _executeCheckIn();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: SmartIdTheme.emerald400,
                foregroundColor: SmartIdTheme.slate900,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.login, size: 16),
                  SizedBox(width: 8),
                  Text(
                    'Check In', 
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  void _executeCheckIn() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final attendanceService = Provider.of<AttendanceService>(context, listen: false);
    
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    if (user == null || userProfile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please sign in to check in'),
          backgroundColor: SmartIdTheme.red500,
        ),
      );
      return;
    }
    
    final userId = user['id'];
    final employeeId = userProfile['employee_id'];
    final institutionId = userProfile['institution_id'];
    
    print('📋 TIME Mobile Check-in - User: $userId, Employee: $employeeId, Institution: $institutionId');
    
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(SmartIdTheme.emerald400),
            ),
            const SizedBox(height: 16),
            const Text(
              'Checking in...',
              style: TextStyle(color: SmartIdTheme.slate50),
            ),
            const SizedBox(height: 8),
            const Text(
              'Getting your location and verifying attendance',
              style: TextStyle(color: SmartIdTheme.slate400, fontSize: 12),
            ),
          ],
        ),
      ),
    );
    
    try {
      final success = await attendanceService.checkIn(
        userId: userId,
        employeeId: employeeId,
        institutionId: institutionId,
        manual: true,
      );
      
      // Close loading dialog
      Navigator.pop(context);
      
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Check-in Successful!',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'Your attendance has been recorded',
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.emerald500,
            duration: const Duration(seconds: 4),
          ),
        );
      } else {
        final errorMessage = attendanceService.error ?? 'Check-in failed';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Check-in Failed',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        errorMessage,
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.red500,
            duration: const Duration(seconds: 6),
          ),
        );
      }
    } catch (e) {
      // Close loading dialog
      Navigator.pop(context);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Check-in error: $e'),
          backgroundColor: SmartIdTheme.red500,
        ),
      );
    }
  }
  
  void _showCheckOutConfirmationDialog(AttendanceService attendanceService, Map<String, dynamic> user, Map<String, dynamic> userProfile) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: SmartIdTheme.orange500.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.location_on,
                color: SmartIdTheme.orange500,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Check-out Confirmation',
              style: TextStyle(color: SmartIdTheme.slate50, fontSize: 18),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: SmartIdTheme.blue500.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: SmartIdTheme.blue500.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: SmartIdTheme.blue400,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'End Your Workday',
                          style: TextStyle(
                            color: SmartIdTheme.slate50,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Your location will be captured to verify your check-out. This helps ensure accurate work duration tracking.',
                          style: TextStyle(
                            color: SmartIdTheme.slate300,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Work Summary:',
              style: TextStyle(
                color: SmartIdTheme.slate400,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SmartIdTheme.slate700,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Checked in at:',
                    style: TextStyle(
                      color: SmartIdTheme.slate400,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    attendanceService.todayCheckInTime ?? '--:--',
                    style: const TextStyle(
                      color: SmartIdTheme.emerald400,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Cancel',
              style: TextStyle(color: SmartIdTheme.slate400),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _executeCheckOut(attendanceService, user, userProfile);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: SmartIdTheme.orange500,
              foregroundColor: SmartIdTheme.slate900,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.logout, size: 16),
                SizedBox(width: 8),
                Text('Proceed with Check-out', style: TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  void _executeCheckOut(AttendanceService attendanceService, Map<String, dynamic> user, Map<String, dynamic> userProfile) async {
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(SmartIdTheme.orange500),
            ),
            const SizedBox(height: 16),
            const Text(
              'Checking out...',
              style: TextStyle(color: SmartIdTheme.slate50),
            ),
            const SizedBox(height: 8),
            const Text(
              'Recording your work duration and location',
              style: TextStyle(color: SmartIdTheme.slate400, fontSize: 12),
            ),
          ],
        ),
      ),
    );
    
    try {
      final success = await attendanceService.checkOut(
        userId: user['id'],
        employeeId: userProfile['employee_id'],
        institutionId: userProfile['institution_id']?.toString(),
        manual: true, // Always manual from mobile app
      );
      
      // Close loading dialog
      Navigator.pop(context);
      
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Check-out Successful!',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'Have a great day! Your work duration has been recorded.',
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.orange500,
            duration: const Duration(seconds: 4),
          ),
        );
      } else {
        final errorMessage = attendanceService.error ?? 'Check-out failed';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Check-out Failed',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        errorMessage,
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.red500,
            duration: const Duration(seconds: 6),
          ),
        );
      }
    } catch (e) {
      // Close loading dialog
      Navigator.pop(context);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Check-out error: $e'),
          backgroundColor: SmartIdTheme.red500,
        ),
      );
    }
  }
  
  void _handleCheckOutOld(AttendanceService attendanceService, Map<String, dynamic> user, Map<String, dynamic> userProfile) async {
    print('📋 TIME Mobile Check-out - User: ${user['id']}, Employee: ${userProfile['employee_id']}, Institution: ${userProfile['institution_id']}');
    
    final success = await attendanceService.checkOut(
      userId: user['id'],
      employeeId: userProfile['employee_id'],
      institutionId: userProfile['institution_id']?.toString(),
      manual: true, // Always manual from mobile app
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle, color: SmartIdTheme.green400),
                SizedBox(width: 8),
                Expanded(
                  child: Text('Check-out successful! Have a great day.'),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.slate800,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: SmartIdTheme.red400),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    attendanceService.error ?? 'Check-out failed',
                  ),
                ),
              ],
            ),
            backgroundColor: SmartIdTheme.slate800,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  String _getMonthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  // Helper method to build Google Map for mobile platforms
  Widget _buildGoogleMap(Position position) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: LatLng(position.latitude, position.longitude),
        zoom: 16.0,
      ),
      markers: {
        Marker(
          markerId: const MarkerId('current_location'),
          position: LatLng(position.latitude, position.longitude),
          infoWindow: const InfoWindow(
            title: 'Your Location',
            snippet: 'Check-in location',
          ),
        ),
      },
      myLocationEnabled: false,
      myLocationButtonEnabled: false,
      zoomControlsEnabled: false,
      mapToolbarEnabled: false,
    );
  }

  // Helper method to build location preview for web
  Widget _buildWebLocationPreview(Position position) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            SmartIdTheme.blue800.withOpacity(0.8),
            SmartIdTheme.indigo900.withOpacity(0.8),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Background grid pattern
          Positioned.fill(
            child: CustomPaint(
              painter: LocationGridPainter(),
            ),
          ),
          // Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: SmartIdTheme.emerald400.withOpacity(0.2),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: SmartIdTheme.emerald400,
                      width: 2,
                    ),
                  ),
                  child: const Icon(
                    Icons.location_on,
                    color: SmartIdTheme.emerald400,
                    size: 32,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Check-in Location',
                  style: TextStyle(
                    color: SmartIdTheme.slate50,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Lat: ${position.latitude.toStringAsFixed(4)}',
                  style: const TextStyle(
                    color: SmartIdTheme.slate300,
                    fontSize: 12,
                    fontFamily: 'monospace',
                  ),
                ),
                Text(
                  'Lng: ${position.longitude.toStringAsFixed(4)}',
                  style: const TextStyle(
                    color: SmartIdTheme.slate300,
                    fontSize: 12,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class EWalletTab extends StatefulWidget {
  final Function(int) onTabSwitch;
  
  const EWalletTab({super.key, required this.onTabSwitch});

  @override
  State<EWalletTab> createState() => _EWalletTabState();
}

class _EWalletTabState extends State<EWalletTab> {
  late WalletService _walletService;
  
  @override
  void initState() {
    super.initState();
    _walletService = Provider.of<WalletService>(context, listen: false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeWallet();
    });
  }

  void _initializeWallet() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    if (user != null && userProfile != null) {
      await _walletService.fetchWalletData(user['id'], userProfile['employee_id']);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final walletService = Provider.of<WalletService>(context);
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    return RefreshIndicator(
      onRefresh: () async {
        if (user != null && userProfile != null) {
          await walletService.refreshData(user['id'], userProfile['employee_id']);
        }
      },
      backgroundColor: SmartIdTheme.slate800,
      color: SmartIdTheme.indigo400,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Balance Card
            _buildBalanceCard(walletService),
            const SizedBox(height: 24),
            
            // Quick Actions
            _buildQuickActions(walletService, user, userProfile),
            const SizedBox(height: 24),
            
            // Transaction History
            _buildTransactionHistory(walletService),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard(WalletService walletService) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            SmartIdTheme.blue800,
            SmartIdTheme.indigo900,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SmartIdTheme.indigo500.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'E-Wallet Balance',
                    style: TextStyle(
                      color: SmartIdTheme.slate300,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'RM${walletService.balance.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: SmartIdTheme.slate50,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: SmartIdTheme.slate50.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.account_balance_wallet,
                  color: SmartIdTheme.slate50,
                  size: 32,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            'Available for transactions',
            style: TextStyle(
              color: SmartIdTheme.slate300.withOpacity(0.8),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(WalletService walletService, Map<String, dynamic>? user, Map<String, dynamic>? userProfile) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate800,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SmartIdTheme.slate700,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SmartIdTheme.blue500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.flash_on,
                  color: SmartIdTheme.blue400,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: SmartIdTheme.slate50,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  'Top Up',
                  Icons.add,
                  SmartIdTheme.green500,
                  () => _showTopUpDialog(user, userProfile),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  'Pay',
                  Icons.payment,
                  SmartIdTheme.blue500,
                  () => _showPaymentDialog(user, userProfile),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(String title, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: color.withOpacity(0.3),
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionHistory(WalletService walletService) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Transactions',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: SmartIdTheme.slate50,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: SmartIdTheme.slate800,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: SmartIdTheme.slate700,
              width: 1,
            ),
          ),
          child: walletService.transactions.isEmpty
              ? const Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.receipt_long,
                        color: SmartIdTheme.slate500,
                        size: 48,
                      ),
                      SizedBox(height: 12),
                      Text(
                        'No transactions yet',
                        style: TextStyle(
                          color: SmartIdTheme.slate400,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Your transaction history will appear here',
                        style: TextStyle(
                          color: SmartIdTheme.slate500,
                          fontSize: 12,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : Column(
                  children: walletService.transactions.map((transaction) {
                    return _buildTransactionItem(transaction, walletService);
                  }).toList(),
                ),
        ),
      ],
    );
  }

  Widget _buildTransactionItem(Map<String, dynamic> transaction, WalletService walletService) {
    final amount = transaction['amount']?.toDouble() ?? 0.0;
    final isPositive = walletService.isPositiveTransaction(amount);
    final createdAt = DateTime.parse(transaction['created_at'] ?? DateTime.now().toIso8601String()).toLocal();
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate700.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: SmartIdTheme.slate600.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (isPositive ? SmartIdTheme.green500 : SmartIdTheme.orange500).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isPositive ? Icons.add_circle : Icons.remove_circle,
              color: isPositive ? SmartIdTheme.green500 : SmartIdTheme.orange500,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  transaction['description'] ?? 'Transaction',
                  style: const TextStyle(
                    color: SmartIdTheme.slate50,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${createdAt.day}/${createdAt.month}/${createdAt.year} at ${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}',
                  style: const TextStyle(
                    color: SmartIdTheme.slate400,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                walletService.formatAmount(amount),
                style: TextStyle(
                  color: isPositive ? SmartIdTheme.green400 : SmartIdTheme.orange500,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Color(walletService.getStatusColor(transaction['status'] ?? 'pending')).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  (transaction['status'] ?? 'pending').toString().toUpperCase(),
                  style: TextStyle(
                    color: Color(walletService.getStatusColor(transaction['status'] ?? 'pending')),
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showTopUpDialog(Map<String, dynamic>? user, Map<String, dynamic>? userProfile) {
    final _amountController = TextEditingController();
    String selectedMethod = 'Bank Transfer';
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          backgroundColor: SmartIdTheme.slate800,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: SmartIdTheme.slate700),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SmartIdTheme.green500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.add_circle,
                  color: SmartIdTheme.green400,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Top Up Wallet',
                style: TextStyle(
                  color: SmartIdTheme.slate50,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Amount (RM)',
                style: TextStyle(
                  color: SmartIdTheme.slate300,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: SmartIdTheme.slate50),
                decoration: InputDecoration(
                  hintText: '0.00',
                  prefixText: 'RM ',
                  filled: true,
                  fillColor: SmartIdTheme.slate700,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: SmartIdTheme.slate600),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Payment Method',
                style: TextStyle(
                  color: SmartIdTheme.slate300,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: selectedMethod,
                dropdownColor: SmartIdTheme.slate700,
                style: const TextStyle(color: SmartIdTheme.slate50),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: SmartIdTheme.slate700,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: SmartIdTheme.slate600),
                  ),
                ),
                items: ['Bank Transfer', 'Online Banking', 'Credit Card', 'E-Wallet Transfer']
                    .map((method) => DropdownMenuItem(
                          value: method,
                          child: Text(method),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() {
                    selectedMethod = value!;
                  });
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Cancel',
                style: TextStyle(color: SmartIdTheme.slate400),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(_amountController.text);
                if (amount != null && amount > 0 && user != null) {
                  Navigator.pop(context);
                  final success = await _walletService.topUpWallet(
                    userId: user['id'],
                    employeeId: userProfile?['employee_id'],
                    amount: amount,
                    method: selectedMethod,
                  );
                  
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(
                          children: [
                            Icon(
                              success ? Icons.check_circle : Icons.error,
                              color: success ? SmartIdTheme.green400 : SmartIdTheme.red400,
                            ),
                            const SizedBox(width: 8),
                            Text(success
                                ? 'Top up submitted successfully!'
                                : _walletService.error ?? 'Top up failed'),
                          ],
                        ),
                        backgroundColor: SmartIdTheme.slate800,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: SmartIdTheme.green500,
                foregroundColor: SmartIdTheme.slate900,
              ),
              child: const Text('Top Up'),
            ),
          ],
        ),
      ),
    );
  }

  void _showPaymentDialog(Map<String, dynamic>? user, Map<String, dynamic>? userProfile) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SmartIdTheme.slate700),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: SmartIdTheme.blue500.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.payment,
                color: SmartIdTheme.blue400,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Payment',
              style: TextStyle(
                color: SmartIdTheme.slate50,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        content: const Text(
          'Payment functionality will be available soon. This will allow you to make payments at participating merchants within the institution.',
          style: TextStyle(
            color: SmartIdTheme.slate300,
            fontSize: 14,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Got it',
              style: TextStyle(
                color: SmartIdTheme.blue400,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class LeaveTab extends StatefulWidget {
  final Function(int) onTabSwitch;
  
  const LeaveTab({super.key, required this.onTabSwitch});

  @override
  State<LeaveTab> createState() => _LeaveTabState();
}

class _LeaveTabState extends State<LeaveTab> {
  late LeaveService _leaveService;
  
  @override
  void initState() {
    super.initState();
    _leaveService = Provider.of<LeaveService>(context, listen: false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeLeave();
    });
  }

  void _initializeLeave() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    print('👤 Leave tab initializing...');
    print('👤 Auth service authenticated: ${authService.isAuthenticated}');
    print('👤 User data: $user');
    print('👤 User profile: $userProfile');
    
    if (user != null && userProfile != null) {
      print('👤 Calling fetchLeaveData with:');
      print('👤   User ID: "${user['id']}"');
      print('👤   Employee ID: "${userProfile['employee_id']}"');
      print('👤   Institution ID: "${userProfile['institution_id']}"');
      
      await _leaveService.fetchLeaveData(
        user['id'], 
        userProfile['employee_id'],
        userProfile['institution_id']
      );
    } else {
      print('👤 Cannot fetch leave data - user or userProfile is null');
      print('👤   User: ${user != null ? "exists" : "null"}');
      print('👤   UserProfile: ${userProfile != null ? "exists" : "null"}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final leaveService = Provider.of<LeaveService>(context);
    final user = authService.user;
    final userProfile = authService.userProfile;
    
    return RefreshIndicator(
      onRefresh: () async {
        if (user != null && userProfile != null) {
          await leaveService.refreshData(
            user['id'], 
            userProfile['employee_id'],
            userProfile['institution_id']
          );
        }
      },
      backgroundColor: SmartIdTheme.slate800,
      color: SmartIdTheme.indigo400,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Leave Balance Card
            _buildLeaveBalanceCard(leaveService),
            const SizedBox(height: 24),
            
            // Submit Leave Request
            _buildSubmitLeaveCard(leaveService, user, userProfile),
            const SizedBox(height: 24),
            
            // Leave History
            _buildLeaveHistory(leaveService),
          ],
        ),
      ),
    );
  }

  Widget _buildLeaveBalanceCard(LeaveService leaveService) {
    final balances = leaveService.leaveBalances;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Leave Balances',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: SmartIdTheme.slate50,
          ),
        ),
        const SizedBox(height: 16),
        if (balances.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: SmartIdTheme.slate800,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: SmartIdTheme.slate700,
                width: 1,
              ),
            ),
            child: const Center(
              child: Text(
                'Loading leave balances...',
                style: TextStyle(
                  color: SmartIdTheme.slate400,
                  fontSize: 16,
                ),
              ),
            ),
          )
        else
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: SmartIdTheme.slate800,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: SmartIdTheme.slate700,
                width: 1,
              ),
            ),
            child: Column(
              children: balances.map((balance) {
                final color = Color(int.parse(balance['color'].substring(1), radix: 16) + 0xFF000000);
                final isLast = balance == balances.last;
                
                return Column(
                  children: [
                    Row(
                      children: [
                        // Icon container
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            balance['icon'],
                            style: const TextStyle(fontSize: 16),
                          ),
                        ),
                        const SizedBox(width: 12),
                        
                        // Leave type name
                        Expanded(
                          flex: 2,
                          child: Text(
                            balance['name'],
                            style: const TextStyle(
                              color: SmartIdTheme.slate50,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        
                        // Remaining days (prominent)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${balance['remaining']}',
                            style: TextStyle(
                              color: color,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        
                        // Used/Total ratio
                        Text(
                          '${balance['used']}/${balance['allocated']}',
                          style: const TextStyle(
                            color: SmartIdTheme.slate400,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    
                    // Progress bar
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: balance['allocated'] > 0 
                          ? balance['used'] / balance['allocated']
                          : 0.0,
                      backgroundColor: SmartIdTheme.slate700,
                      valueColor: AlwaysStoppedAnimation<Color>(color.withOpacity(0.6)),
                      minHeight: 3,
                    ),
                    
                    // Divider (except for last item)
                    if (!isLast) ...[
                      const SizedBox(height: 12),
                      Divider(
                        color: SmartIdTheme.slate700,
                        height: 1,
                        thickness: 0.5,
                      ),
                      const SizedBox(height: 12),
                    ],
                  ],
                );
              }).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildSubmitLeaveCard(LeaveService leaveService, Map<String, dynamic>? user, Map<String, dynamic>? userProfile) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate800,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SmartIdTheme.slate700,
          width: 1,
        ),
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
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.assignment_turned_in,
                  color: SmartIdTheme.indigo400,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Submit Leave Request',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: SmartIdTheme.slate50,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Request time off for various purposes',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: SmartIdTheme.slate400,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _showLeaveRequestDialog(user, userProfile),
              icon: const Icon(Icons.add),
              label: const Text('New Leave Request'),
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
        ],
      ),
    );
  }

  Widget _buildLeaveHistory(LeaveService leaveService) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Leave History',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: SmartIdTheme.slate50,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: SmartIdTheme.slate800,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: SmartIdTheme.slate700,
              width: 1,
            ),
          ),
          child: leaveService.leaveHistory.isEmpty
              ? const Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.event_note,
                        color: SmartIdTheme.slate500,
                        size: 48,
                      ),
                      SizedBox(height: 12),
                      Text(
                        'No leave requests yet',
                        style: TextStyle(
                          color: SmartIdTheme.slate400,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Your leave request history will appear here',
                        style: TextStyle(
                          color: SmartIdTheme.slate500,
                          fontSize: 12,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : Column(
                  children: leaveService.leaveHistory.map((leave) {
                    return _buildLeaveHistoryItem(leave, leaveService);
                  }).toList(),
                ),
        ),
      ],
    );
  }

  Widget _buildLeaveHistoryItem(Map<String, dynamic> leave, LeaveService leaveService) {
    final startDate = DateTime.parse(leave['start_date'] ?? DateTime.now().toIso8601String()).toLocal();
    final endDate = DateTime.parse(leave['end_date'] ?? DateTime.now().toIso8601String()).toLocal();
    final status = leave['status'] ?? 'pending';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SmartIdTheme.slate700.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: SmartIdTheme.slate600.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                leaveService.getLeaveTypeDisplayName(leave['leave_type'] ?? 'Other'),
                style: const TextStyle(
                  color: SmartIdTheme.slate50,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Color(leaveService.getStatusColor(status)).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  status.toString().toUpperCase(),
                  style: TextStyle(
                    color: Color(leaveService.getStatusColor(status)),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${startDate.day}/${startDate.month}/${startDate.year} - ${endDate.day}/${endDate.month}/${endDate.year}',
            style: const TextStyle(
              color: SmartIdTheme.slate400,
              fontSize: 14,
            ),
          ),
          if (leave['reason'] != null && leave['reason'].toString().isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              leave['reason'],
              style: const TextStyle(
                color: SmartIdTheme.slate300,
                fontSize: 14,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          // Show rejection reason if application was rejected
          if (status.toLowerCase() == 'rejected' && 
              leave['rejection_reason'] != null && 
              leave['rejection_reason'].toString().isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SmartIdTheme.red400.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: SmartIdTheme.red400.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: SmartIdTheme.red400,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Rejection Reason:',
                          style: TextStyle(
                            color: SmartIdTheme.red400,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          leave['rejection_reason'],
                          style: const TextStyle(
                            color: SmartIdTheme.slate300,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${leaveService.calculateWorkingDays(startDate, endDate)} working days',
                style: const TextStyle(
                  color: SmartIdTheme.slate500,
                  fontSize: 12,
                ),
              ),
              if (status.toLowerCase() == 'pending')
                TextButton(
                  onPressed: () => _showCancelLeaveDialog(leave['id'].toString()),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(
                      color: SmartIdTheme.red400,
                      fontSize: 12,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  void _showLeaveRequestDialog(Map<String, dynamic>? user, Map<String, dynamic>? userProfile) {
    final _reasonController = TextEditingController();
    String selectedLeaveType = 'annual';
    DateTime? startDate;
    DateTime? endDate;
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          backgroundColor: SmartIdTheme.slate800,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: SmartIdTheme.slate700),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SmartIdTheme.indigo500.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.assignment_turned_in,
                  color: SmartIdTheme.indigo400,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'New Leave Request',
                style: TextStyle(
                  color: SmartIdTheme.slate50,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Leave Type
                const Text(
                  'Leave Type',
                  style: TextStyle(
                    color: SmartIdTheme.slate300,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: selectedLeaveType,
                  dropdownColor: SmartIdTheme.slate700,
                  style: const TextStyle(color: SmartIdTheme.slate50),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: SmartIdTheme.slate700,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: SmartIdTheme.slate600),
                    ),
                  ),
                  items: [
                    {'value': 'annual', 'label': 'Annual Leave'},
                    {'value': 'sick', 'label': 'Sick Leave'},
                    {'value': 'emergency', 'label': 'Emergency Leave'},
                    {'value': 'maternity', 'label': 'Maternity Leave'},
                    {'value': 'paternity', 'label': 'Paternity Leave'},
                    {'value': 'compassionate', 'label': 'Compassionate Leave'},
                  ].map((type) => DropdownMenuItem(
                        value: type['value']!,
                        child: Text(type['label']!),
                      ))
                      .toList(),
                  onChanged: (value) {
                    setState(() {
                      selectedLeaveType = value!;
                    });
                  },
                ),
                
                // Show quota balance for selected leave type
                if (selectedLeaveType.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: SmartIdTheme.blue500.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: SmartIdTheme.blue500.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.info_outline,
                            color: SmartIdTheme.blue400,
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _leaveService.getQuotaDisplayText(selectedLeaveType),
                              style: const TextStyle(
                                color: SmartIdTheme.blue300,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                
                const SizedBox(height: 16),
                
                // Start Date
                const Text(
                  'Start Date',
                  style: TextStyle(
                    color: SmartIdTheme.slate300,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now(),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                      builder: (context, child) {
                        return Theme(
                          data: Theme.of(context).copyWith(
                            colorScheme: const ColorScheme.dark(
                              primary: SmartIdTheme.indigo500,
                              onPrimary: SmartIdTheme.slate50,
                              surface: SmartIdTheme.slate800,
                              onSurface: SmartIdTheme.slate50,
                            ),
                          ),
                          child: child!,
                        );
                      },
                    );
                    if (date != null) {
                      setState(() {
                        startDate = date;
                      });
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      color: SmartIdTheme.slate700,
                      border: Border.all(color: SmartIdTheme.slate600),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      startDate != null
                          ? '${startDate!.day}/${startDate!.month}/${startDate!.year}'
                          : 'Select start date',
                      style: TextStyle(
                        color: startDate != null ? SmartIdTheme.slate50 : SmartIdTheme.slate400,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                // End Date
                const Text(
                  'End Date',
                  style: TextStyle(
                    color: SmartIdTheme.slate300,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: startDate ?? DateTime.now(),
                      firstDate: startDate ?? DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                      builder: (context, child) {
                        return Theme(
                          data: Theme.of(context).copyWith(
                            colorScheme: const ColorScheme.dark(
                              primary: SmartIdTheme.indigo500,
                              onPrimary: SmartIdTheme.slate50,
                              surface: SmartIdTheme.slate800,
                              onSurface: SmartIdTheme.slate50,
                            ),
                          ),
                          child: child!,
                        );
                      },
                    );
                    if (date != null) {
                      setState(() {
                        endDate = date;
                      });
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      color: SmartIdTheme.slate700,
                      border: Border.all(color: SmartIdTheme.slate600),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      endDate != null
                          ? '${endDate!.day}/${endDate!.month}/${endDate!.year}'
                          : 'Select end date',
                      style: TextStyle(
                        color: endDate != null ? SmartIdTheme.slate50 : SmartIdTheme.slate400,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                // Reason
                const Text(
                  'Reason',
                  style: TextStyle(
                    color: SmartIdTheme.slate300,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _reasonController,
                  maxLines: 3,
                  style: const TextStyle(color: SmartIdTheme.slate50),
                  decoration: InputDecoration(
                    hintText: 'Please provide a reason for your leave request...',
                    filled: true,
                    fillColor: SmartIdTheme.slate700,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: SmartIdTheme.slate600),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                // Supporting Documents (Optional)
                const Text(
                  'Supporting Documents (Optional)',
                  style: TextStyle(
                    color: SmartIdTheme.slate300,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Consumer<FileUploadService>(
                  builder: (context, fileUploadService, child) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: SmartIdTheme.slate700.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: SmartIdTheme.slate600,
                              width: 2,
                            ),
                          ),
                          child: Column(
                            children: [
                              if (fileUploadService.uploadedFileUrl == null) ...[
                                Icon(
                                  Icons.attach_file,
                                  color: SmartIdTheme.slate400,
                                  size: 32,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Attach medical certificate or supporting document',
                                  style: TextStyle(
                                    color: SmartIdTheme.slate400,
                                    fontSize: 14,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'PDF, DOC, DOCX, JPG, PNG (Max 10MB)',
                                  style: TextStyle(
                                    color: SmartIdTheme.slate500,
                                    fontSize: 12,
                                  ),
                                ),
                              ] else ...[
                                Row(
                                  children: [
                                    Text(
                                      fileUploadService.getFileIcon(fileUploadService.getFileNameFromUrl(fileUploadService.uploadedFileUrl!)),
                                      style: const TextStyle(fontSize: 24),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            fileUploadService.getFileNameFromUrl(fileUploadService.uploadedFileUrl!),
                                            style: const TextStyle(
                                              color: SmartIdTheme.slate50,
                                              fontSize: 14,
                                            ),
                                          ),
                                          Text(
                                            'Document uploaded successfully',
                                            style: TextStyle(
                                              color: SmartIdTheme.green400,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    IconButton(
                                      onPressed: () {
                                        fileUploadService.clearState();
                                      },
                                      icon: const Icon(
                                        Icons.close,
                                        color: SmartIdTheme.red400,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                              if (fileUploadService.error != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: SmartIdTheme.red400.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        Icons.error,
                                        color: SmartIdTheme.red400,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          fileUploadService.error!,
                                          style: const TextStyle(
                                            color: SmartIdTheme.red400,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: fileUploadService.isUploading
                                ? null
                                : () async {
                                    if (user != null) {
                                      await fileUploadService.uploadFile(
                                        userId: user['id'],
                                        documentType: 'leave_support',
                                      );
                                    }
                                  },
                            icon: fileUploadService.isUploading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: SmartIdTheme.slate400,
                                    ),
                                  )
                                : Icon(
                                    fileUploadService.uploadedFileUrl != null
                                        ? Icons.refresh
                                        : Icons.upload_file,
                                  ),
                            label: Text(
                              fileUploadService.isUploading
                                  ? 'Uploading...'
                                  : fileUploadService.uploadedFileUrl != null
                                      ? 'Upload Different File'
                                      : 'Upload Document',
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: SmartIdTheme.slate600,
                              foregroundColor: SmartIdTheme.slate50,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
                
                if (startDate != null && endDate != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: SmartIdTheme.indigo500.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Duration: ${_leaveService.calculateWorkingDays(startDate!, endDate!)} working days',
                        style: const TextStyle(
                          color: SmartIdTheme.indigo400,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Cancel',
                style: TextStyle(color: SmartIdTheme.slate400),
              ),
            ),
            ElevatedButton(
              onPressed: startDate != null && endDate != null && _reasonController.text.isNotEmpty
                    ? () async {
                      if (user != null) {
                        // Check quota before submission
                        final requestedDays = _leaveService.calculateWorkingDays(startDate!, endDate!);
                        if (!_leaveService.hasQuotaForLeave(selectedLeaveType, requestedDays)) {
                          // Show quota exceeded error
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Row(
                                children: [
                                  const Icon(
                                    Icons.warning,
                                    color: SmartIdTheme.red400,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Insufficient quota! You need $requestedDays days but only have ${_leaveService.getAvailableQuota(selectedLeaveType)} days remaining for $selectedLeaveType.',
                                      style: const TextStyle(color: SmartIdTheme.slate50),
                                    ),
                                  ),
                                ],
                              ),
                              backgroundColor: SmartIdTheme.red500,
                              behavior: SnackBarBehavior.floating,
                              duration: const Duration(seconds: 4),
                            ),
                          );
                          return; // Don't proceed with submission
                        }
                        
                        // Get file upload service for document URL
                        final fileUploadService = Provider.of<FileUploadService>(context, listen: false);
                        
                        Navigator.pop(context);
                        final success = await _leaveService.submitLeaveRequest(
                          userId: user['id'],
                          employeeId: userProfile?['employee_id'],
                          leaveType: selectedLeaveType,
                          startDate: startDate!,
                          endDate: endDate!,
                          reason: _reasonController.text,
                          attachmentUrl: fileUploadService.uploadedFileUrl,
                        );
                        
                        // Clear the upload service state after successful submission
                        if (success) {
                          fileUploadService.clearState();
                          // Force refresh the leave data to show the new request immediately
                          await _leaveService.fetchLeaveData(
                            user['id'], 
                            userProfile?['employee_id'],
                            userProfile?['institution_id']
                          );
                        }
                        
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Row(
                                children: [
                                  Icon(
                                    success ? Icons.check_circle : Icons.error,
                                    color: success ? SmartIdTheme.green400 : SmartIdTheme.red400,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(success
                                        ? 'Leave request submitted successfully!'
                                        : _leaveService.error ?? 'Leave request failed'),
                                  ),
                                ],
                              ),
                              backgroundColor: SmartIdTheme.slate800,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      }
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: SmartIdTheme.indigo500,
                foregroundColor: SmartIdTheme.slate50,
              ),
              child: const Text('Submit Request'),
            ),
          ],
        ),
      ),
    );
  }

  void _showCancelLeaveDialog(String leaveId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SmartIdTheme.slate700),
        ),
        title: const Row(
          children: [
            Icon(Icons.warning, color: SmartIdTheme.red400),
            SizedBox(width: 12),
            Text(
              'Cancel Leave Request',
              style: TextStyle(
                color: SmartIdTheme.slate50,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        content: const Text(
          'Are you sure you want to cancel this leave request? This action cannot be undone.',
          style: TextStyle(
            color: SmartIdTheme.slate300,
            fontSize: 14,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Keep Request',
              style: TextStyle(color: SmartIdTheme.slate400),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              final authService = Provider.of<AuthService>(context, listen: false);
              final user = authService.user;
              final userProfile = authService.userProfile;
              
              if (user != null) {
                Navigator.pop(context);
                final success = await _leaveService.cancelLeaveRequest(
                  userId: user['id'],
                  leaveRequestId: leaveId,
                  employeeId: userProfile?['employee_id'],
                );
                
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          Icon(
                            success ? Icons.check_circle : Icons.error,
                            color: success ? SmartIdTheme.green400 : SmartIdTheme.red400,
                          ),
                          const SizedBox(width: 8),
                          Text(success
                              ? 'Leave request cancelled successfully'
                              : _leaveService.error ?? 'Cancellation failed'),
                        ],
                      ),
                      backgroundColor: SmartIdTheme.slate800,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: SmartIdTheme.red400,
              foregroundColor: SmartIdTheme.slate900,
            ),
            child: const Text('Cancel Request'),
          ),
        ],
      ),
    );
  }
}

class ProfileTab extends StatefulWidget {
  final Function(int) onTabSwitch;
  
  const ProfileTab({super.key, required this.onTabSwitch});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final user = authService.user;
    final userProfile = authService.userProfile;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile Header Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  SmartIdTheme.indigo900,
                  SmartIdTheme.purple800,
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: SmartIdTheme.indigo500.withOpacity(0.3),
                width: 1,
              ),
            ),
            child: Column(
              children: [
                // Profile Avatar
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [SmartIdTheme.indigo400, SmartIdTheme.blue400],
                    ),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: SmartIdTheme.slate50.withOpacity(0.2),
                      width: 3,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      (user?['full_name'] ?? 'User').toString().substring(0, 1).toUpperCase(),
                      style: const TextStyle(
                        color: SmartIdTheme.slate50,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  user?['full_name'] ?? 'User',
                  style: const TextStyle(
                    color: SmartIdTheme.slate50,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user?['email'] ?? 'user@example.com',
                  style: TextStyle(
                    color: SmartIdTheme.slate300.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: SmartIdTheme.indigo400.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: SmartIdTheme.indigo400.withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    (user?['smartid_time_role'] ?? 'employee').toString().toUpperCase(),
                    style: const TextStyle(
                      color: SmartIdTheme.indigo300,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Profile Actions
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: SmartIdTheme.slate800,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: SmartIdTheme.slate700,
                width: 1,
              ),
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
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.settings,
                        color: SmartIdTheme.indigo400,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Settings & Tools',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: SmartIdTheme.slate50,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Manage your profile and app preferences',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: SmartIdTheme.slate400,
                  ),
                ),
                const SizedBox(height: 20),
                
                // GPS Calibration Option
                _buildSettingsOption(
                  context,
                  title: 'GPS Calibration',
                  subtitle: 'Recalibrate your institution\'s GPS location',
                  icon: Icons.gps_fixed,
                  iconColor: SmartIdTheme.blue500,
                  onTap: () => _navigateToLocationCalibration(context),
                ),
                
                const SizedBox(height: 12),
                
                // Account Settings
                _buildSettingsOption(
                  context,
                  title: 'Account Settings',
                  subtitle: 'Update your personal information',
                  icon: Icons.account_circle,
                  iconColor: SmartIdTheme.green500,
                  onTap: () => _showComingSoonDialog(context, 'Account Settings'),
                ),
                
                const SizedBox(height: 12),
                
                // Notification Settings
                _buildSettingsOption(
                  context,
                  title: 'Notifications',
                  subtitle: 'Manage notification preferences',
                  icon: Icons.notifications,
                  iconColor: SmartIdTheme.orange500,
                  onTap: () => _showComingSoonDialog(context, 'Notification Settings'),
                ),
                
                const SizedBox(height: 12),
                
                // Privacy & Security
                _buildSettingsOption(
                  context,
                  title: 'Privacy & Security',
                  subtitle: 'Control your privacy settings',
                  icon: Icons.security,
                  iconColor: SmartIdTheme.indigo500,
                  onTap: () => _showComingSoonDialog(context, 'Privacy & Security'),
                ),
                
                const SizedBox(height: 12),
                
                // Help & Support
                _buildSettingsOption(
                  context,
                  title: 'Help & Support',
                  subtitle: 'Get help and contact support',
                  icon: Icons.help,
                  iconColor: SmartIdTheme.violet400,
                  onTap: () => _showComingSoonDialog(context, 'Help & Support'),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // App Information
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: SmartIdTheme.slate800,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: SmartIdTheme.slate700,
                width: 1,
              ),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'App Version',
                      style: TextStyle(
                        color: SmartIdTheme.slate400,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      '1.0.0',
                      style: TextStyle(
                        color: SmartIdTheme.slate300,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Build',
                      style: TextStyle(
                        color: SmartIdTheme.slate400,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      '2025.01.1',
                      style: TextStyle(
                        color: SmartIdTheme.slate300,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsOption(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: SmartIdTheme.slate700.withOpacity(0.3),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: SmartIdTheme.slate600.withOpacity(0.5),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color: iconColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: SmartIdTheme.slate50,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: SmartIdTheme.slate400,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: SmartIdTheme.slate400,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToLocationCalibration(BuildContext context) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const LocationCalibrationScreen(),
      ),
    );
    
    if (result == true) {
      // Location was updated successfully
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: SmartIdTheme.green400),
                SizedBox(width: 8),
                Text('GPS location updated successfully!'),
              ],
            ),
            backgroundColor: SmartIdTheme.slate800,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _showComingSoonDialog(BuildContext context, String feature) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SmartIdTheme.slate800,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SmartIdTheme.slate700),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: SmartIdTheme.indigo500.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.construction,
                color: SmartIdTheme.indigo400,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              feature,
              style: const TextStyle(
                color: SmartIdTheme.slate50,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        content: const Text(
          'This feature is coming soon! We\'re working hard to bring you the best experience.',
          style: TextStyle(
            color: SmartIdTheme.slate300,
            fontSize: 14,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Got it',
              style: TextStyle(
                color: SmartIdTheme.indigo400,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Custom painter for location preview background
class LocationGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = SmartIdTheme.slate400.withOpacity(0.1)
      ..strokeWidth = 1;

    const gridSize = 20.0;
    
    // Draw vertical lines
    for (double x = 0; x <= size.width; x += gridSize) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x, size.height),
        paint,
      );
    }
    
    // Draw horizontal lines
    for (double y = 0; y <= size.height; y += gridSize) {
      canvas.drawLine(
        Offset(0, y),
        Offset(size.width, y),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
