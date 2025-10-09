# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

SmartID Time is a comprehensive attendance and leave management system built with Next.js 15, TypeScript, and Supabase. It's part of the SmartID ecosystem (HQ, POS, PAY, HUB) and serves educational institutions and organizations with advanced workforce management capabilities.

## Development Commands

### Primary Development Commands
```powershell
# Development server (runs on port 3003)
npm run dev

# Build for production
npm run build

# Start production server (runs on port 3001)
npm run start

# Lint code
npm run lint
```

### Database Operations
```powershell
# Run database migrations (SQL files in sql/ directory)
# Execute these in Supabase SQL Editor:
# - sql/migrations/005_premium_attendance_features.sql
# - sql/functions/006_premium_attendance_functions.sql

# Test database connection
# Visit: http://localhost:3003/api/debug/supabase
```

### Testing and Debugging
```powershell
# Debug authentication and user data
# Visit: http://localhost:3003/debug-auth

# Test specific features
# Visit: http://localhost:3003/test-db
# Visit: http://localhost:3003/palm-test

# Check email functionality
# Visit: http://localhost:3003/test-email
```

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 with React 19, TypeScript
- **Backend**: Next.js API routes with serverless functions
- **Database**: Supabase (PostgreSQL)
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth with custom user profiles
- **Biometrics**: Custom palm recognition SDK integration
- **Email**: Nodemailer with Resend integration

### Core System Architecture

#### Multi-System Integration
This system integrates with the broader SmartID ecosystem:
- **SmartID HUB (Registry)**: Main institutional management (this system)
- **SmartID HQ**: Central biometric and card management
- **SmartID POS**: Point of sale for cafeterias
- **SmartID PAY**: Digital wallet and payment system

#### Database Schema Structure

**Core Tables:**
- `users` - Main user profiles with multi-system role support
- `institutions` - Organizations using the system
- `institution_locations` - Geographical locations for institutions
- `attendance_records` - Daily check-in/check-out records

**Premium Attendance Features:**
- `work_groups` - Custom user groups with flexible schedules
- `user_work_group_assignments` - User assignments to work groups
- `institution_holidays` - Holiday management system
- `leave_types` - Customizable leave categories
- `user_leave_quotas` - Individual leave entitlements
- `leave_applications` - Leave request and approval workflow

**Biometric Integration:**
- `biometric_enrollments` - Palm/fingerprint enrollment data
- `smart_cards` - NFC card management
- `devices` - Hardware device management

#### Authentication and Authorization

**Multi-Level User Roles:**
- `superadmin` - System-wide access
- `admin` - Institution-wide management
- `hr_manager` - Leave approvals and reporting
- `teacher` - Educational staff with attendance tracking
- `staff` - Administrative staff
- `student` - Student attendance tracking

**Authentication Flow:**
1. Supabase Auth handles authentication
2. Custom middleware enforces location setup requirements
3. Context providers manage user state and permissions
4. Role-based access control throughout the application

### Key Business Logic

#### Attendance Management
- **Work Groups**: Custom schedules for different user types (teachers, admin staff, etc.)
- **Smart Attendance**: Automatic late/early detection based on work group rules
- **Holiday Awareness**: System recognizes holidays and adjusts attendance accordingly
- **Overtime Calculation**: Automatic calculation of overtime hours
- **Multi-Device Support**: Biometric readers, palm scanners, mobile devices

#### Leave Management System
- **Flexible Leave Types**: Customizable leave categories (Annual, Sick, Emergency, Maternity)
- **Quota Management**: Automatic quota allocation and tracking
- **Approval Workflows**: Multi-level approval processes
- **Working Day Calculation**: Intelligent calculation excluding weekends and holidays
- **Carry Forward**: Support for leave balance carry-over

#### Advanced Features
- **Premium Attendance**: Enhanced attendance tracking with work group integration
- **Holiday Management**: Institution-specific and group-specific holidays
- **Real-time Analytics**: Dashboard with attendance statistics and trends
- **Email Notifications**: Automated notifications for leave applications and approvals

### API Architecture

**RESTful API Endpoints:**
```
/api/auth/* - Authentication and user management
/api/attendance/* - Attendance recording and retrieval
/api/leave/* - Leave application management
/api/work-groups/* - Work group configuration
/api/holidays/* - Holiday management
/api/users/* - User profile management
/api/dashboard/* - Analytics and reporting
```

**Database Functions:**
- `record_premium_attendance()` - Enhanced attendance recording
- `get_user_work_schedule()` - Retrieve user's work schedule
- `apply_for_leave()` - Complete leave application workflow
- `calculate_leave_working_days()` - Smart working day calculation
- `is_holiday()` - Holiday checking logic

### Frontend Architecture

#### Component Structure
- `src/app/` - Next.js app router pages
- `src/components/` - Reusable UI components (shadcn/ui based)
- `src/contexts/` - React context providers (auth, theme, translation)
- `src/lib/` - Utility functions and configurations
- `src/hooks/` - Custom React hooks

#### Key Pages and Features
- **Dashboard**: Main overview with attendance stats and quick actions
- **Attendance Management**: Real-time attendance tracking and reporting
- **Leave Management**: Leave application and approval interface
- **Work Groups**: Configuration of work schedules and user assignments
- **Holiday Management**: Institution holiday calendar
- **User Management**: User profiles and role assignments

#### State Management
- **Authentication**: `AuthContext` with Supabase integration
- **Theme**: `ThemeContext` for dark/light mode
- **Translation**: `TranslationContext` for internationalization
- **Local State**: React hooks for component-specific state

### Development Guidelines

#### Code Conventions
- TypeScript strict mode enabled
- ESLint configured with Next.js rules
- Component naming: PascalCase for components, camelCase for functions
- File structure follows Next.js 15 app router conventions

#### Database Operations
- Use Supabase client for all database operations
- Implement proper error handling and logging
- Follow RLS (Row Level Security) policies
- Use database functions for complex business logic

#### API Development
- Follow REST conventions for API endpoints
- Implement proper error responses with status codes
- Use TypeScript for request/response typing
- Include proper authentication checks

#### Component Development
- Use shadcn/ui components as base
- Implement proper loading states
- Include error boundaries where appropriate
- Follow accessibility best practices

### Environment Setup

**Required Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
```

**Database Setup:**
1. Create Supabase project
2. Run SQL migrations from `sql/` directory
3. Configure RLS policies
4. Set up authentication providers

### Testing Strategy

#### API Testing
- Use built-in debug endpoints for API testing
- Test authentication flows through `/debug-auth`
- Validate database connections via `/api/debug/supabase`

#### Feature Testing
- Test attendance recording through dedicated pages
- Validate leave application workflows
- Check email functionality via test endpoints

### Deployment Considerations

- Production build runs on port 3001
- Development server runs on port 3003
- Requires Supabase project configuration
- Email service requires Resend API key
- Consider environment-specific configurations

### Palm Recognition Integration

The system includes custom palm recognition capabilities:
- `palm-sdk/` - Palm recognition SDK
- `palm-test-server.js` - Testing server for palm recognition
- Biometric enrollment and verification workflows
- Hardware device integration support