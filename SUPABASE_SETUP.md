# Supabase Setup Guide

Your leave types system is now configured to write to Supabase! Follow these steps to complete the setup:

## 1. Database Setup in Supabase

1. **Go to your Supabase project dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**
3. **Run the schema**: Copy and paste the content from `sql/schema.sql` and execute it
4. **Verify tables**: Go to Table Editor and confirm these tables exist:
   - `leave_types`
   - `users`
   - `leave_balances`

## 2. Environment Variables (Already Configured)

Your `.env.local` file is already set up with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://triiicqaljwajijeugul.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. What's Now Working

✅ **Create Leave Types** - Forms now save to Supabase
✅ **Edit Leave Types** - Updates are written to database
✅ **Delete Leave Types** - Removes from Supabase
✅ **Toggle Active Status** - Updates database
✅ **Real-time Data** - Automatically loads from Supabase
✅ **Error Handling** - Shows proper error messages
✅ **TypeScript Support** - Full type safety

## 4. Test Your Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to Leave Types page**: http://localhost:3000/leave-types

3. **Try these actions**:
   - ✅ Create a new leave type
   - ✅ Edit an existing leave type  
   - ✅ Delete a leave type
   - ✅ Toggle active/inactive status

4. **Check Supabase**: Go to Table Editor → `leave_types` to see your data!

## 5. Sample Data Included

The schema includes sample data:
- 5 leave types (Annual, Sick, Emergency, Maternity, Study)
- 6 sample users with IC numbers
- Proper relationships between tables

## 6. API Methods Available

Your app now has these Supabase methods:

```typescript
// Get all leave types
const types = await LeaveTypesAPI.getAll()

// Create new leave type
const newType = await LeaveTypesAPI.create({
  name: "New Leave",
  max_days: 10,
  // ... other fields
})

// Update leave type
const updated = await LeaveTypesAPI.update(id, { name: "Updated" })

// Delete leave type
await LeaveTypesAPI.delete(id)

// Toggle active status
const toggled = await LeaveTypesAPI.toggleActive(id)
```

## 7. Files Created/Updated

### New Files:
- `src/lib/supabase.ts` - Supabase client
- `src/lib/database.types.ts` - TypeScript types
- `src/lib/api/leave-types.ts` - API methods
- `src/hooks/useLeaveTypes.ts` - React hook
- `sql/schema.sql` - Database schema

### Updated Files:
- `src/app/leave-types/page.tsx` - Now uses Supabase

## 8. Next Steps

Your leave types now write to Supabase! You can:

1. **Add authentication** - Integrate with Supabase Auth
2. **Add user management** - Create users CRUD operations
3. **Add leave balances** - Implement the balance management
4. **Add leave applications** - Create leave request system
5. **Add reporting** - Generate leave reports

## 9. Troubleshooting

**If you get errors:**

1. **Check Supabase connection**: Verify your environment variables
2. **Check database**: Ensure tables exist in Supabase
3. **Check browser console**: Look for API errors
4. **Check Supabase logs**: Go to Logs section in dashboard

**Common issues:**
- Make sure to run the SQL schema in Supabase
- Verify your project URL and keys are correct
- Check that RLS policies are set up (they're included in schema)

🎉 **Your leave management system now writes to Supabase!**
