/*
  # Add User Stats for Learning Analysis

  1. New Table: `user_stats`
     - Tracks overall learning statistics per subject
     - Enables learning analysis and weak subject identification

  2. Indexes for efficient querying of wrong questions
*/

CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  subject text NOT NULL,
  total_sessions int DEFAULT 0,
  total_questions int DEFAULT 0,
  correct_answers int DEFAULT 0,
  wrong_answers int DEFAULT 0,
  UNIQUE(subject)
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create user stats"
  ON user_stats FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read user stats"
  ON user_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update user stats"
  ON user_stats FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Index for getting wrong answers by subject
CREATE INDEX IF NOT EXISTS quiz_answers_session_correct_idx ON quiz_answers(session_id, is_correct);
CREATE INDEX IF NOT EXISTS quiz_sessions_subject_completed_idx ON quiz_sessions(subject, completed);
