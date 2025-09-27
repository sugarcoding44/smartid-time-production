# 🏢 SmartID Registry Premium Attendance & Leave Management System

## 📋 System Overview

The SmartID Registry has been enhanced with premium attendance and leave management features that provide institutions with comprehensive workforce management capabilities. This system integrates with the existing SmartID ecosystem (HQ, POS, PAY) while adding advanced features for educational institutions and organizations.

---

## 🏗️ Architecture Overview

### Core Systems Integration
- **SmartID HUB (Registry)**: Main institutional management system
- **SmartID HQ**: Central biometric and card management
- **SmartID POS**: Point of sale for cafeterias
- **SmartID PAY**: Digital wallet and payment system

### Premium Features Added
1. **Advanced Attendance Management**
2. **Flexible Work Group System**
3. **Comprehensive Leave Management**
4. **Holiday Management**
5. **Reporting & Analytics**

---

## 📊 Database Schema Deep Dive

### 1. **Work Groups** (`work_groups`)
**Purpose**: Create custom user groups with different working schedules

```sql
-- Example: Morning Teachers vs Admin Staff
INSERT INTO work_groups (name, default_start_time, default_end_time) 
VALUES ('Morning Teachers', '07:00:00', '13:00:00');
```

**Key Features**:
- ✅ Custom working hours per group
- ✅ Flexible working days (Mon-Fri, Mon-Sat, etc.)
- ✅ Break time configuration
- ✅ Late/early leave thresholds
- ✅ Overtime calculation rules

**Use Cases**:
- Teachers with different shift timings
- Administrative staff with standard hours
- Security guards with night shifts
- Part-time vs full-time employees

### 2. **User Work Group Assignments** (`user_work_group_assignments`)
**Purpose**: Assign users to work groups with historical tracking

**Key Features**:
- ✅ Effective date ranges (from/to dates)
- ✅ Custom overrides for individual users
- ✅ Historical assignment tracking
- ✅ Bulk assignment capabilities

**Example Scenario**:
```
- John (Teacher) assigned to "Morning Teachers" from Jan 1, 2024
- Mary (Admin) assigned to "Admin Staff" from Feb 15, 2024
- David (Teacher) has custom hours: 8AM-2PM (override)
```

### 3. **Institution Holidays** (`institution_holidays`)
**Purpose**: Manage institution-specific holidays and non-working days

**Key Features**:
- ✅ Public holidays (affects everyone)
- ✅ School-specific holidays (Sports Day, etc.)
- ✅ Work group specific holidays
- ✅ Multi-day holidays
- ✅ Recurring annual holidays
- ✅ Paid vs unpaid holidays

**Example Scenarios**:
```
- Chinese New Year: Feb 10-11 (public holiday, affects all)
- Sports Day: Teachers work, Admin staff can take leave
- Exam Week: Different schedules for teachers vs admin
```

### 4. **Leave Types** (`leave_types`)
**Purpose**: Customizable leave categories with specific rules

**Default Leave Types Created**:
- 🏖️ **Annual Leave** (14 days/year)
- 🏥 **Sick Leave** (10 days/year)
- 🚨 **Emergency Leave** (3 days/year)
- 🤱 **Maternity Leave** (60 days)
- 📚 **Study Leave** (Custom)

**Advanced Features**:
- ✅ Custom quotas per leave type
- ✅ Approval workflow requirements
- ✅ Medical certificate requirements
- ✅ Maximum consecutive days limits
- ✅ Advance notice requirements
- ✅ Carry-forward rules
- ✅ Proration for new employees

### 5. **User Leave Quotas** (`user_leave_quotas`)
**Purpose**: Track individual leave entitlements and usage

**Real-time Calculations**:
```sql
available_days = allocated_days - used_days - pending_days
```

**Features**:
- ✅ Annual quota allocation
- ✅ Real-time usage tracking
- ✅ Pending applications tracking
- ✅ Carry-forward from previous years
- ✅ Quota expiry management
- ✅ Custom quotas for specific users

### 6. **Leave Applications** (`leave_applications`)
**Purpose**: Complete leave application and approval workflow

**Application Process**:
1. Employee submits application
2. System validates quotas and rules
3. Approval workflow initiated
4. Manager/HR approves/rejects
5. Quotas automatically updated
6. Calendar integration updated

**Features**:
- ✅ Auto-generated application numbers (LA-2024001)
- ✅ Multi-level approval workflows
- ✅ Half-day leave support
- ✅ Emergency contact information
- ✅ Medical certificate uploads
- ✅ Automatic quota deduction
- ✅ Email notifications

### 7. **Enhanced Attendance Records** (Updated)
**Purpose**: Advanced attendance tracking with work group integration

**Enhanced Features**:
- ✅ Work group schedule compliance
- ✅ Holiday-aware attendance
- ✅ Overtime calculation
- ✅ Break time tracking
- ✅ Late/early detection
- ✅ Location-based check-in
- ✅ Device tracking
- ✅ Biometric verification logs

---

## 🛠️ Helper Functions Explained

### 1. `get_user_work_schedule(user_id, date)`
**Purpose**: Get a user's work schedule for any given date

**Returns**:
- Work start/end times
- Break times
- Working day status
- Overtime thresholds
- Late arrival thresholds

**Usage Example**:
```sql
SELECT * FROM get_user_work_schedule('user-123', '2024-01-15');
-- Returns: 8:00 AM start, 5:00 PM end, 1-hour lunch, Mon-Fri working
```

### 2. `is_holiday(institution_id, date, work_group_id)`
**Purpose**: Check if a specific date is a holiday

**Checks**:
- Public holidays
- Institution-specific holidays
- Work group specific holidays
- Recurring holiday patterns

**Usage Example**:
```sql
SELECT * FROM is_holiday('inst-123', '2024-02-10', 'wg-456');
-- Returns: true, "Chinese New Year", "public"
```

### 3. `record_premium_attendance(user_id, check_in_time, device_id, location)`
**Purpose**: Advanced attendance recording with business logic

**Process**:
1. Gets user's work schedule
2. Checks if it's a working day
3. Detects late arrival
4. Calculates working hours
5. Applies overtime rules
6. Updates attendance record
7. Sends notifications if needed

### 4. `apply_for_leave(user_id, leave_type_id, start_date, end_date, reason)`
**Purpose**: Complete leave application with validation

**Validation Process**:
1. Check leave type rules
2. Validate quota availability
3. Check advance notice requirements
4. Calculate working days (excluding weekends/holidays)
5. Create application record
6. Update pending quotas
7. Initiate approval workflow

---

## 🎯 Business Logic Examples

### Scenario 1: Teacher Attendance
```
Teacher John (Morning Shift: 7AM-1PM)
- Arrives at 7:15 AM → Marked "Late" (15 min threshold)
- Leaves at 1:00 PM → Normal departure
- Working hours: 5.75 (deducted 15 min for lateness)
- Status: "Present - Late Arrival"
```

### Scenario 2: Leave Application
```
Teacher Mary applies for 3-day Annual Leave:
1. System checks: Has 8 days available ✅
2. Validates: 7-day advance notice met ✅  
3. Calculates: 3 working days (excludes weekend) ✅
4. Creates: Application LA-SKT2024015
5. Updates: Pending days = 3, Available = 5
6. Notifies: Head of Department for approval
```

### Scenario 3: Holiday Management
```
Sports Day Setup:
- Date: March 15, 2024
- Type: School Holiday
- Rule: Teachers must attend, Admin staff optional
- Result: 
  * Teachers: Normal working day
  * Admin: Can apply for leave or work (overtime pay)
```

---

## 📱 Frontend Implementation Guide

### 1. **Dashboard Components Needed**

#### Admin Dashboard:
- 📊 Attendance overview widgets
- 👥 Work group management
- 📅 Holiday calendar management
- 📋 Leave approval queue
- 📈 Attendance analytics

#### Employee Dashboard:
- ⏰ Today's schedule widget
- 📱 Quick check-in/out buttons
- 📅 Leave application form
- 📊 Leave balance display
- 🕒 Attendance history

#### Manager Dashboard:
- 👥 Team attendance overview
- ✅ Leave approvals pending
- 📈 Team analytics
- 🚨 Late arrival notifications

### 2. **API Endpoints to Create**

```javascript
// Work Group Management
GET    /api/workgroups
POST   /api/workgroups
PUT    /api/workgroups/:id
DELETE /api/workgroups/:id

// User Assignment
POST   /api/workgroups/:id/assign-users
GET    /api/users/:id/workgroup

// Attendance
POST   /api/attendance/checkin
POST   /api/attendance/checkout
GET    /api/attendance/report

// Leave Management  
GET    /api/leave-types
POST   /api/leave/apply
GET    /api/leave/applications
PUT    /api/leave/:id/approve
PUT    /api/leave/:id/reject

// Holiday Management
GET    /api/holidays
POST   /api/holidays
PUT    /api/holidays/:id

// Analytics
GET    /api/analytics/attendance
GET    /api/analytics/leave-trends
```

### 3. **Key React Components**

#### AttendanceWidget.jsx
```jsx
const AttendanceWidget = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  
  // Shows current schedule, check-in/out buttons, status
  return (
    <div className="attendance-widget">
      <h3>Today's Schedule: {currentSchedule?.start} - {currentSchedule?.end}</h3>
      <button onClick={handleCheckIn}>
        {isCheckedIn ? 'Check Out' : 'Check In'}
      </button>
    </div>
  );
};
```

#### LeaveApplicationForm.jsx
```jsx
const LeaveApplicationForm = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [quotas, setQuotas] = useState({});
  
  // Form for applying leave with quota validation
  return (
    <form onSubmit={handleSubmit}>
      <select name="leaveType">
        {leaveTypes.map(type => (
          <option key={type.id} value={type.id}>
            {type.name} ({quotas[type.id]?.available} days available)
          </option>
        ))}
      </select>
    </form>
  );
};
```

### 4. **Mobile App Integration**

#### Biometric Check-in Flow:
1. User scans palm/fingerprint
2. Device calls API: `POST /api/attendance/checkin`
3. System validates biometric
4. Records attendance with location
5. Shows confirmation with schedule info

---

## 🔄 Integration with Existing Systems

### SmartID HQ Integration:
- ✅ Biometric data sync
- ✅ User management sync
- ✅ Card status updates
- ✅ Attendance data push

### SmartID POS Integration:
- ✅ Staff schedule aware transactions
- ✅ Break time purchase tracking
- ✅ Overtime meal allowances

### SmartID PAY Integration:
- ✅ Salary calculation based on attendance
- ✅ Leave deductions
- ✅ Overtime payments
- ✅ Parent notifications for student attendance

---

## 📈 Reporting & Analytics

### Built-in Reports:
1. **Daily Attendance Report**
2. **Leave Balance Summary**
3. **Overtime Analysis**
4. **Late Arrival Trends**
5. **Leave Application Analytics**
6. **Work Group Performance**

### Export Formats:
- 📊 Excel spreadsheets
- 📄 PDF reports
- 📧 Email summaries
- 📱 Mobile notifications

---

## 🚀 Implementation Phases

### Phase 1: Core Setup (Week 1-2)
- ✅ Database migration completed
- ✅ Basic API endpoints
- ✅ Admin work group management
- ✅ User assignment interface

### Phase 2: Attendance Features (Week 3-4)
- 📱 Mobile check-in interface
- 🖥️ Desktop attendance dashboard
- 📊 Basic reporting
- 🔔 Notification system

### Phase 3: Leave Management (Week 5-6)
- 📝 Leave application forms
- ✅ Approval workflows
- 📱 Mobile leave requests
- 📧 Email notifications

### Phase 4: Advanced Features (Week 7-8)
- 📈 Advanced analytics
- 🔄 External system integration
- 📱 Mobile app enhancements
- 🎨 UI/UX improvements

---

## 🔒 Security Considerations

### Data Protection:
- ✅ Biometric data encryption
- ✅ User role-based access
- ✅ Audit trails for all changes
- ✅ GDPR compliance features

### Access Control:
- **Super Admin**: Full system access
- **Institution Admin**: Institution-wide management
- **HR Manager**: Leave approvals, reporting
- **Team Leader**: Team attendance, basic approvals
- **Employee**: Personal attendance, leave applications

---

## 🎯 Success Metrics

### For Institutions:
- 📊 95%+ attendance accuracy
- ⏱️ 80% reduction in manual attendance processing
- 📝 50% faster leave approval processes
- 💰 Better payroll accuracy

### For Employees:
- 📱 One-tap check-in/out
- 📊 Real-time leave balance visibility
- ⚡ Instant leave application status
- 📧 Automated notifications

---

This system transforms basic attendance tracking into a comprehensive workforce management solution, providing institutions with the tools they need to efficiently manage their human resources while giving employees a modern, user-friendly experience.
