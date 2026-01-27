-- Migration script to add platform_connections table
-- Run this if the table doesn't exist yet

-- Platform connections
CREATE TABLE IF NOT EXISTS platform_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL, -- leetcode, codeforces, codechef
  username VARCHAR(100) NOT NULL,
  rating INTEGER,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_platform_connections_user_id ON platform_connections(user_id);
