-- Initialize Logic Arena Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  avatar_url VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user', -- user, admin, mentor
  rating INTEGER DEFAULT 1200,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard
  category VARCHAR(50) NOT NULL, -- array, string, dp, graph, etc.
  constraints TEXT,
  input_format TEXT,
  output_format TEXT,
  time_limit INTEGER DEFAULT 5000, -- milliseconds
  memory_limit INTEGER DEFAULT 128, -- MB
  acceptance_rate DECIMAL(5,2) DEFAULT 0.0,
  total_submissions INTEGER DEFAULT 0,
  successful_submissions INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test cases table
CREATE TABLE IF NOT EXISTS test_cases (
  id SERIAL PRIMARY KEY,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE, -- visible to users
  is_hidden BOOLEAN DEFAULT FALSE, -- used for final evaluation
  points INTEGER DEFAULT 10,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  submission_uuid VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  problem_id INTEGER REFERENCES problems(id),
  language VARCHAR(20) NOT NULL,
  code TEXT NOT NULL,
  status VARCHAR(30) NOT NULL, -- success, compilation_error, runtime_error, timeout, etc.
  execution_time INTEGER, -- milliseconds
  memory_used INTEGER, -- MB
  test_cases_passed INTEGER DEFAULT 0,
  test_cases_total INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  output TEXT,
  error_message TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User problem stats
CREATE TABLE IF NOT EXISTS user_problem_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  problem_id INTEGER REFERENCES problems(id),
  attempts INTEGER DEFAULT 0,
  solved BOOLEAN DEFAULT FALSE,
  best_submission_id INTEGER REFERENCES submissions(id),
  first_solved_at TIMESTAMP,
  last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, problem_id)
);

-- Contests table
CREATE TABLE IF NOT EXISTS contests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  type VARCHAR(20) DEFAULT 'individual', -- individual, team
  max_participants INTEGER,
  is_public BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contest problems (many-to-many)
CREATE TABLE IF NOT EXISTS contest_problems (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES problems(id),
  points INTEGER DEFAULT 100,
  order_index INTEGER,
  UNIQUE(contest_id, problem_id)
);

-- Contest participants
CREATE TABLE IF NOT EXISTS contest_participants (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  score INTEGER DEFAULT 0,
  rank INTEGER,
  submission_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contest_id, user_id)
);

-- Collaboration sessions
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id SERIAL PRIMARY KEY,
  session_uuid VARCHAR(50) UNIQUE NOT NULL,
  problem_id INTEGER REFERENCES problems(id),
  mode VARCHAR(20) NOT NULL, -- pair, mob, mentor
  max_participants INTEGER DEFAULT 2,
  created_by INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- Session participants
CREATE TABLE IF NOT EXISTS session_participants (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'participant', -- driver, observer, mentor
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  UNIQUE(session_id, user_id)
);

-- Anti-cheat logs
CREATE TABLE IF NOT EXISTS anti_cheat_logs (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id),
  user_id INTEGER REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL, -- tab_switch, copy_paste, pattern_anomaly, etc.
  risk_score INTEGER DEFAULT 0,
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_category ON problems(category);
CREATE INDEX idx_test_cases_problem_id ON test_cases(problem_id);
CREATE INDEX idx_anti_cheat_submission_id ON anti_cheat_logs(submission_id);
CREATE INDEX idx_anti_cheat_user_id ON anti_cheat_logs(user_id);

-- Insert sample problem
INSERT INTO problems (title, slug, description, difficulty, category, constraints) VALUES
('Two Sum', 'two-sum', 
'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]',
'easy', 
'array',
'2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.'
);

-- Insert test cases for Two Sum
INSERT INTO test_cases (problem_id, input, expected_output, is_sample) VALUES
(1, '2,7,11,15
9', '0,1', TRUE),
(1, '3,2,4
6', '1,2', TRUE),
(1, '3,3
6', '0,1', TRUE);

COMMENT ON TABLE submissions IS 'All code submissions with execution results';
COMMENT ON TABLE anti_cheat_logs IS 'Behavioral monitoring and anomaly detection logs';
COMMENT ON TABLE collaboration_sessions IS 'Real-time pair programming and collaboration sessions';
