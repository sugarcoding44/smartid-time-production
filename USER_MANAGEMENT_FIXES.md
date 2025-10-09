# User Management Fixes

## Issues Fixed

### 1. Missing IC Number Field
**Problem:** The Add User form in the user management page was missing the IC Number field, which is a required field for user creation.

**Solution:** 
- Added IC Number field to the `AddStaffDialog` form in `/src/app/simple-users-v2/page.tsx`
- Updated form state to include `icNumber` property
- Added form validation to require IC Number
- Updated form submission to use the actual IC Number instead of auto-generated value

### 2. Employee ID Prefix Constraint Error
**Problem:** The API was generating employee IDs like `TC0001`, `ST0001`, etc., but the database constraint expects prefixes with hyphens like `TC-`, `STF-`, `STD-`, `ADM-`, `POS-`.

**Database Constraint:**
```sql
CHECK (employee_id ~ '^(ADM-|TC-|STF-|STD-|POS-)[A-Za-z0-9]+$')
```

**Solution:** 
- Updated the employee ID generation logic in `/src/app/api/users/route.ts`
- Changed prefix mapping from:
  ```javascript
  const typePrefix = {
    teacher: 'TC',
    staff: 'ST', 
    student: 'SD',
    admin: 'AD'
  }
  ```
- To:
  ```javascript
  const typePrefix = {
    teacher: 'TC-',
    staff: 'STF-',
    student: 'STD-', 
    admin: 'ADM-'
  }
  ```

## Files Modified

1. **`/src/app/api/users/route.ts`**
   - Fixed employee ID prefix format to match database constraints
   - Changed from `TC`, `ST`, `SD`, `AD` to `TC-`, `STF-`, `STD-`, `ADM-`

2. **`/src/app/simple-users-v2/page.tsx`**
   - Added IC Number field to the AddStaffDialog form
   - Updated form validation to require IC Number
   - Removed auto-generated IC Number, now uses form input
   - Updated form reset function to include IC Number

## Expected Behavior

### Before Fix:
- ❌ IC Number field missing from Add User form
- ❌ Employee IDs generated as `TC0001`, `ST0001` causing constraint errors
- ❌ IC Numbers auto-generated as `IC1696745123456`

### After Fix:
- ✅ IC Number field visible and required in Add User form
- ✅ Employee IDs generated as `TC-0001`, `STF-0001` matching database constraints
- ✅ IC Numbers entered by user and validated

## Testing

To test the fixes:

1. Navigate to the User Management page (`/simple-users-v2`)
2. Click "Add User" button
3. Verify that:
   - IC Number field is now visible and required
   - Form validation prevents submission without IC Number
   - User creation succeeds without prefix constraint errors
   - Generated employee IDs follow the correct format (e.g., `TC-0001`, `STF-0001`)

## Database Schema Reference

The employee ID constraint in the database expects:
- `ADM-` prefix for admin users
- `TC-` prefix for teacher users  
- `STF-` prefix for staff users
- `STD-` prefix for student users
- `POS-` prefix for other position users

Each prefix must be followed by alphanumeric characters (typically a 4-digit number like `0001`).