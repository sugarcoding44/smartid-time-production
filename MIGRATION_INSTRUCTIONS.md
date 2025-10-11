# Database Migration Instructions

## Add institution_id to smartid_cards table

You need to run the SQL migration in your Supabase dashboard to add the `institution_id` column.

### Steps:

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project: `triiicqaljwajijeugul`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Migration**
   - Copy the contents of `migrations/add_institution_id_to_smartid_cards.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the migration

### What this migration does:

1. ✅ **Adds `institution_id` column** to `smartid_cards` table
2. ✅ **Creates index** for better query performance  
3. ✅ **Adds RLS policy** to ensure users only see cards from their institution
4. ✅ **Enables Row Level Security** on the table

### After running the migration:

- Cards will be properly filtered by institution
- Users will only see cards from their own institution
- The RLS error will be resolved
- Multi-tenancy will work correctly

### If you have existing cards:

If you already have cards in the database, you may need to update them with an institution_id:

```sql
-- Update existing cards to belong to a specific institution
-- Replace 'your-institution-id' with the actual UUID
UPDATE smartid_cards 
SET institution_id = 'your-institution-id' 
WHERE institution_id IS NULL;
```

## Step 1: Add institution_id to smartid_cards
Run the first migration: `migrations/add_institution_id_to_smartid_cards.sql`

## Step 2: Fix wallet RLS policies  
Run the second migration: `migrations/fix_card_wallets_rls.sql`

This fixes the wallet creation issues by updating RLS policies.

Run both migrations, then try issuing cards again!
