# Diagnosing the 500 Error

The Network tab shows `POST localhost:3002/connect` returning **500 Internal Server Error**.

## Step 1: Check Backend Logs

The 500 error means the backend is crashing. Let's see the actual error:

```powershell
# Check Docker container logs
docker logs logic-arena-executor --tail 100

# Or if running locally
cd services/code-executor
npm run dev
# Then check the console output
```

**Look for errors like:**
- `Error saving platform connection`
- `relation "platform_connections" does not exist` (table missing)
- `permission denied` (RLS blocking)
- `Failed to fetch codeforces rating`

## Step 2: Verify the Table Exists

1. Go to Supabase Dashboard: https://app.supabase.com/project/yqbvjssfcjkijrbpduss/editor
2. Click on "Table Editor" in the left sidebar
3. Look for `platform_connections` table
4. If it doesn't exist, run the SQL from `CREATE_PLATFORM_CONNECTIONS_TABLE.sql`

## Step 3: Test the Endpoint Manually

Open your browser console and run:

```javascript
fetch('http://localhost:3002/api/users/platforms/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-user-id-here',
    platform: 'codeforces',
    username: 'xuozea'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show you the exact error message.

## Most Likely Causes:

1. **Table doesn't exist** → Run the SQL to create `platform_connections` table
2. **RLS blocking** → Make sure RLS is disabled on the table
3. **Codeforces API failing** → Check if `https://codeforces.com/api/user.info?handles=xuozea` works
4. **User ID format mismatch** → Check if user_id in your users table matches what's being sent

## Quick Fix:

Run this in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS platform_connections (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL,
  username VARCHAR(100) NOT NULL,
  rating INTEGER,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_platform_connections_user_id ON platform_connections(user_id);
ALTER TABLE platform_connections DISABLE ROW LEVEL SECURITY;
```

Then try connecting again!
