# SmartID Ecosystem Database Schema

This folder contains all database schema files for the SmartID ecosystem, which includes SmartID HUB, HQ, POS, and PAY applications.

## Database Structure Overview

### Core Entities

1. **institutions** - Schools, universities, corporate entities using SmartID
2. **users** - Unified user table supporting all systems with role-based access
3. **smart_cards** - NFC cards issued by SmartID HQ with e-wallet functionality
4. **biometric_enrollments** - Palm vein, fingerprint, and facial recognition data
5. **cafeterias** - Dining facilities within institutions
6. **devices** - IoT devices, scanners, and POS terminals

### User Roles Across Systems

#### SmartID HUB (Free & Premium Plans)
- `admin` - Institution administrator
- `teacher` - Teaching staff  
- `staff` - Non-teaching staff
- `student` - Students

**Free Plan Features:**
- Basic user management
- Simple attendance tracking
- Basic biometric enrollment
- Student/staff registration

**Premium Plan Features:**
- Advanced time attendance tracking
- Leave management system
- Advanced analytics and reporting
- Comprehensive dashboard
- Detailed attendance reports
- Leave approval workflows

#### SmartID HQ
- `hq_superadmin` - Full system access
- `hq_admin` - Institution management
- `hq_support` - Technical support
- `hq_analyst` - Data analysis

#### SmartID POS (Java Application)
- `superadmin` - Full POS access, can cash out
- `manager` - Menu management, reports
- `cashier` - Transaction processing
- `kitchen_staff` - Order management

#### SmartID PAY
- `parent` - Parent/guardian with wallet access
- `student` - Student with spending capabilities
- `guardian` - Limited guardian access

### Key Features

- **Multi-tenant Architecture**: Each institution is isolated
- **Role-based Access Control**: Granular permissions per system
- **Subscription Management**: Free vs Premium HUB plans
- **Audit Logging**: Complete activity tracking
- **Data Synchronization**: Between SmartID applications
- **Financial Controls**: Spending limits, cash management
- **Biometric Integration**: Secure authentication
- **Menu Management**: Full POS functionality with SST support

## File Structure

```
sql/
├── migrations/
│   └── 001_initial_schema.sql     # Main database schema
├── indexes/
│   └── 002_create_indexes.sql     # Performance indexes
├── policies/
│   └── 003_security_policies.sql  # Row Level Security
├── functions/
│   └── 004_helper_functions.sql   # Utility functions
└── README.md                      # This file
```

## Setup Instructions

### 1. Prerequisites

- PostgreSQL 14+ (recommended)
- Supabase account (or local PostgreSQL)
- Database admin access

### 2. Running Migrations

Execute the files in order:

```sql
-- 1. Create base schema
\i sql/migrations/001_initial_schema.sql

-- 2. Add indexes for performance
\i sql/indexes/002_create_indexes.sql

-- 3. Setup Row Level Security
\i sql/policies/003_security_policies.sql

-- 4. Add helper functions
\i sql/functions/004_helper_functions.sql
```

### 3. Environment Setup

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Java Integration for SmartPOS

Since SmartPOS will be developed in Java, here are the recommended database integration approaches:

#### Database Connection
```java
// Using PostgreSQL JDBC driver
implementation 'org.postgresql:postgresql:42.6.0'

// Connection example
String url = "jdbc:postgresql://your-supabase-host:5432/postgres";
String username = "postgres";
String password = "your-password";

Connection conn = DriverManager.getConnection(url, username, password);
```

#### ORM Options
1. **Hibernate/JPA** - For complex entity relationships
2. **MyBatis** - For custom SQL queries and stored procedures  
3. **JOOQ** - Type-safe SQL builder
4. **Spring Data JPA** - If using Spring Boot

#### Recommended Java Structure for POS
```java
// Entity classes
@Entity
@Table(name = "pos_transactions")
public class POSTransaction {
    @Id
    private UUID id;
    
    @Column(name = "cafeteria_id")
    private UUID cafeteriaId;
    
    @Column(name = "transaction_number")
    private String transactionNumber;
    
    // ... other fields
}

// Service layer
@Service
public class POSService {
    
    public String generateTransactionNumber(UUID cafeteriaId) {
        // Call database function
        return jdbcTemplate.queryForObject(
            "SELECT generate_transaction_number(?)", 
            String.class, 
            cafeteriaId
        );
    }
    
    public TransactionTotals calculateTotals(BigDecimal subtotal, BigDecimal taxRate) {
        // Use database function for consistent calculations
        return jdbcTemplate.queryForObject(
            "SELECT * FROM calculate_transaction_totals(?, ?)",
            new BeanPropertyRowMapper<>(TransactionTotals.class),
            subtotal, taxRate
        );
    }
}
```

## Key Functions

### User Management
- `get_user_role_info(user_id)` - Get user role and permissions
- `generate_employee_id(institution_id, role)` - Auto-generate employee IDs
- `validate_user_data()` - Trigger for data validation

### POS Operations (Java Integration)
- `generate_transaction_number(cafeteria_id)` - Unique transaction numbers
- `calculate_transaction_totals(subtotal, tax_rate, discount)` - Tax calculations
- `validate_card_transaction(card_id, amount)` - Pre-transaction validation
- `is_cash_drawer_open(cafeteria_id, staff_id)` - Check drawer status
- `get_current_cash_session(cafeteria_id, staff_id)` - Get active session

### HUB Premium Features
- `record_attendance(user_id, method, device_id)` - Check in/out processing
- Advanced reporting functions for analytics
- Leave management functions (to be implemented)

### Wallet
- `get_wallet_balance(user_id)` - Current balance lookup
- `validate_card_transaction(card_id, amount)` - Spending limit checks

### Reporting
- `get_daily_sales_report(cafeteria_id, date)` - Daily POS summary

## Security Features

### Row Level Security (RLS)
- Institution-based data isolation
- Role-based access control
- Self-service data access only

### Data Validation
- Email format validation
- Malaysian IC number format (XXXXXX-XX-XXXX)
- Malaysian phone number format
- Automatic employee ID generation

### Java Security Considerations
- Use prepared statements to prevent SQL injection
- Implement connection pooling (HikariCP recommended)
- Use environment variables for database credentials
- Implement proper session management for POS users

### Audit Trail
- All changes tracked in `system_logs`
- Sync operations logged in `sync_logs`
- User sessions tracked

## Integration Points

### SmartID HQ
- Institution management
- User provisioning
- Smart card issuance
- Biometric template storage

### SmartID POS (Java Application)
- Menu management
- Transaction processing
- Cash drawer operations
- Sales reporting
- Real-time inventory tracking
- Kitchen display integration

### SmartID PAY
- Wallet top-ups via Billplz
- Parent-child relationships
- Spending limit controls
- Transaction history

### SmartID HUB
- **Free Plan:**
  - User enrollment
  - Basic attendance tracking
  - Device management
  - Biometric enrollment
  
- **Premium Plan:**
  - Advanced time attendance tracking
  - Leave management workflows
  - Advanced analytics dashboard
  - Comprehensive reporting
  - Real-time monitoring

## Subscription Management

The `institutions` table includes a `subscription_plan` field:

```sql
-- Check institution's plan
SELECT subscription_plan FROM institutions WHERE id = ?;

-- Premium features are gated by plan
IF subscription_plan = 'premium' THEN
    -- Enable advanced features
    - Time attendance tracking
    - Leave management
    - Advanced analytics
ELSE
    -- Free plan limitations
    - Basic features only
END IF;
```

## Java POS Development Tips

### 1. Database Connection Pool
```java
// HikariCP configuration
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://host:port/database");
config.setUsername("username");
config.setPassword("password");
config.setMaximumPoolSize(10);
config.setConnectionTimeout(30000);

HikariDataSource dataSource = new HikariDataSource(config);
```

### 2. Transaction Management
```java
@Transactional
public void processTransaction(POSTransactionRequest request) {
    // 1. Validate card
    // 2. Create transaction
    // 3. Add transaction items
    // 4. Update inventory
    // 5. Update cash drawer session
}
```

### 3. Real-time Updates
Consider using PostgreSQL LISTEN/NOTIFY for real-time updates:
```java
// Listen for transaction updates
connection.createStatement().execute("LISTEN transaction_updates");
```

## Maintenance

### Regular Tasks
- Monitor sync logs for failures
- Archive old transaction data
- Update user permissions as needed
- Review security policies

### Performance
- Monitor index usage with `pg_stat_user_indexes`
- Update table statistics with `ANALYZE`
- Consider partitioning for large transaction tables

### Backup Strategy
- Daily database backups
- Point-in-time recovery setup
- Test restore procedures regularly

## Support

For technical support or questions about the database schema:
1. Check the function documentation in the SQL files
2. Review the Row Level Security policies
3. Examine the helper functions for business logic
4. Contact the SmartID development team

## Version History

- v1.0 - Initial schema with all core tables
- v1.1 - Added helper functions and validation
- v1.2 - Enhanced security policies
- v1.3 - POS system integration complete
- v1.4 - Updated for SmartID HUB branding and premium features
- v1.5 - Added Java integration documentation for POS system
