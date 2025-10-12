# Sample Data for Green Hydrogen Platform

This folder contains sample CSV files that you can import into your Supabase database to populate your platform with realistic data.

## 📋 Files Included

### 1. **research_papers.csv**
Sample research papers related to hydrogen production, storage, and transportation.
- **Use**: Import into `research_papers` table
- **Records**: 10 papers covering various hydrogen topics
- **Note**: These appear on the Research page

### 2. **production_facilities.csv**
Sample production facilities from around the world.
- **Use**: Import into `production_facilities` table
- **Records**: 8 facilities with different electrolyzer types
- **Note**: Remember to update `user_id` after import to match your user ID

### 3. **production_records.csv**
Daily production records for hydrogen facilities.
- **Use**: Import into `production_records` table
- **Records**: 10 days of production data
- **Note**: Update `facility_id` to match facilities in your database

### 4. **storage_facilities.csv**
Storage facilities with various storage types.
- **Use**: Import into `storage_facilities` table
- **Records**: 7 storage facilities
- **Note**: Update `user_id` after import

### 5. **storage_records.csv**
Input/output transactions for storage facilities.
- **Use**: Import into `storage_records` table
- **Records**: 10 transaction records
- **Note**: Update `storage_id` to match your storage facilities

### 6. **renewable_sources.csv**
Renewable energy sources (solar, wind, hydro).
- **Use**: Import into `renewable_sources` table
- **Records**: 10 renewable energy sources
- **Note**: Update `user_id` after import

### 7. **system_metrics.csv**
System-wide metrics for dashboard display.
- **Use**: Import into `system_metrics` table
- **Records**: 10 days of system metrics
- **Note**: Update `user_id` after import

## 🚀 How to Import into Supabase

### Method 1: Using Supabase UI (Easiest)

1. Go to your Supabase project dashboard
2. Click on **Table Editor** in the left sidebar
3. Select the table you want to import data into
4. Click **Insert** → **Import data from CSV**
5. Upload the corresponding CSV file
6. Map the columns (should auto-detect)
7. Click **Import**

### Method 2: Using SQL (Recommended for user_id updates)

For tables that require `user_id`, you'll need to update the records after import. Here's an example:

```sql
-- First, get your user_id
SELECT id FROM auth.users LIMIT 1;

-- After importing, update the user_id
UPDATE production_facilities 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL;

UPDATE storage_facilities 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL;

UPDATE renewable_sources 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL;

UPDATE system_metrics 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL;
```

### Method 3: Copy-Paste in Supabase Table Editor

1. Open the CSV file
2. Copy all rows (excluding header)
3. Go to Supabase Table Editor
4. Select the table
5. Click **Insert Row** multiple times or use bulk insert
6. Paste data

## ⚠️ Important Notes

1. **User IDs**: Most tables have `user_id` field. After importing, you MUST update these to your actual user ID from `auth.users` table.

2. **Foreign Keys**: Tables like `production_records` reference `facility_id` from `production_facilities`. Import parent tables first, then update child table IDs.

3. **UUID Fields**: If importing via SQL, you may need to generate UUIDs:
   ```sql
   -- Example for production_facilities
   UPDATE production_facilities 
   SET id = gen_random_uuid() 
   WHERE id IS NULL;
   ```

4. **Arrays**: For columns with array types (like `authors` or `keywords` in research_papers), use PostgreSQL array syntax:
   ```sql
   -- Already formatted in CSV as: ["Author 1","Author 2"]
   ```

5. **Timestamps**: Date fields are in ISO 8601 format. They should import correctly.

## 📊 Data Overview

| Table | Records | Requires user_id | Foreign Keys |
|-------|---------|------------------|--------------|
| research_papers | 10 | ❌ No | None |
| production_facilities | 8 | ✅ Yes | None |
| production_records | 10 | ❌ No | facility_id |
| storage_facilities | 7 | ✅ Yes | None |
| storage_records | 10 | ❌ No | storage_id |
| renewable_sources | 10 | ✅ Yes | None |
| system_metrics | 10 | ✅ Yes | None |

## 🎯 Quick Start Guide

1. **Start with research_papers** (no dependencies):
   ```
   Import research_papers.csv → No changes needed
   ```

2. **Import facilities** (parent tables):
   ```
   Import production_facilities.csv → Update user_id
   Import storage_facilities.csv → Update user_id
   Import renewable_sources.csv → Update user_id
   ```

3. **Import records** (child tables):
   ```
   Import production_records.csv → Update facility_id
   Import storage_records.csv → Update storage_id
   ```

4. **Import metrics**:
   ```
   Import system_metrics.csv → Update user_id
   ```

## 🔧 Troubleshooting

**Problem**: CSV import fails with "column does not exist"
- **Solution**: Check that column names in CSV match your table schema exactly

**Problem**: Foreign key constraint violations
- **Solution**: Import parent tables first, then update IDs before importing child tables

**Problem**: Array fields not importing correctly
- **Solution**: Ensure array format is `["item1","item2"]` without spaces

**Problem**: Date/timestamp format errors
- **Solution**: Use ISO 8601 format: `YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:MM:SSZ` for timestamps

## 💡 Tips

- **Backup first**: Always backup your database before importing large datasets
- **Test with one row**: Import one row first to verify the format works
- **Use transactions**: When using SQL, wrap imports in transactions so you can rollback if needed
- **Check constraints**: Review table constraints (NOT NULL, CHECK, etc.) before importing

## 📝 Customization

Feel free to modify these CSV files to match your needs:
- Change locations to match your region
- Adjust production numbers to realistic scales
- Add more records by copying existing rows and modifying values
- Update dates to current timeframe

---

**Need Help?** Check the Supabase documentation on [importing data](https://supabase.com/docs/guides/database/import-data) or consult the database schema in `database-setup-safe.sql`.
