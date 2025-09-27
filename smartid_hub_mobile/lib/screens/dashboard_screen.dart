import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/dashboard_service.dart';
import '../services/attendance_service.dart';
import '../main.dart';

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
              'SmartID Hub',
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
        return const DashboardTab();
      case 1:
        return const AttendanceTab();
      case 2:
        return const EWalletTab();
      case 3:
        return const LeaveTab();
      case 4:
        return const ProfileTab();
      default:
        return const DashboardTab();
    }
  }
}

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchDashboardData();
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
                            '${user?['smartid_hub_role']?.toString().toUpperCase() ?? 'EMPLOYEE'} at ${user?['institution_name'] ?? 'Institution'} • ${DateTime.now().toString().split(' ')[0]}',
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
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.1,
                    children: [
                      _buildActionCard(
                        'Attendance',
                        '${dashboardService.attendanceData['attendance_rate']?.toStringAsFixed(0) ?? '92'}%',
                        Icons.access_time,
                        SmartIdTheme.emerald400,
                        'This month',
                      ),
                      _buildActionCard(
                        'E-Wallet',
                        'RM${dashboardService.walletBalance.toStringAsFixed(2)}',
                        Icons.account_balance_wallet,
                        SmartIdTheme.blue400,
                        'Available balance',
                      ),
                      _buildActionCard(
                        'Leave Days',
                        '${dashboardService.leaveBalance['used']} / ${dashboardService.leaveBalance['total']}',
                        Icons.calendar_today,
                        SmartIdTheme.amber400,
                        'Used / Total',
                      ),
                      _buildActionCard(
                        'Classes',
                        user?['smartid_hub_role'] == 'teacher' ? '${DateTime.now().day}' : 'N/A',
                        Icons.school,
                        SmartIdTheme.violet400,
                        user?['smartid_hub_role'] == 'teacher' ? 'This month' : 'Not applicable',
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
                    SmartIdTheme.amber400,
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

  Widget _buildActionCard(String title, String value, IconData icon, Color color, String subtitle) {
    return Container(
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
              Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: SmartIdTheme.emerald400.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Icon(
                  Icons.trending_up,
                  color: SmartIdTheme.emerald400,
                  size: 12,
                ),
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
              fontSize: 18,
            ),
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
  const AttendanceTab({super.key});

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
            onTap: canCheckIn ? () => _handleCheckIn(attendanceService, user, userProfile) : null,
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
            onTap: canCheckOut ? () => _handleCheckOut(attendanceService, user, userProfile) : null,
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

  void _handleCheckIn(AttendanceService attendanceService, Map<String, dynamic> user, Map<String, dynamic> userProfile) async {
    final success = await attendanceService.checkIn(
      userId: user['id'],
      employeeId: userProfile['employee_id'],
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
                Text('Check-in successful! Pending admin approval.'),
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
                    attendanceService.error ?? 'Check-in failed',
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

  void _handleCheckOut(AttendanceService attendanceService, Map<String, dynamic> user, Map<String, dynamic> userProfile) async {
    final success = await attendanceService.checkOut(
      userId: user['id'],
      employeeId: userProfile['employee_id'],
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
                Text('Check-out successful! Have a great day.'),
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
}

class EWalletTab extends StatelessWidget {
  const EWalletTab({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.account_balance_wallet, size: 64, color: Colors.grey),
          SizedBox(height: 16),
          Text('E-Wallet Screen', style: TextStyle(fontSize: 18)),
          Text('Coming soon...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

class LeaveTab extends StatelessWidget {
  const LeaveTab({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.assignment, size: 64, color: Colors.grey),
          SizedBox(height: 16),
          Text('Leave Requests Screen', style: TextStyle(fontSize: 18)),
          Text('Coming soon...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.person, size: 64, color: Colors.grey),
          SizedBox(height: 16),
          Text('Profile Screen', style: TextStyle(fontSize: 18)),
          Text('Coming soon...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
