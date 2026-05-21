/*
  # Create Quiz System for 408 Exam Practice

  1. New Tables
    - `quiz_sessions`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `subject` (text) - one of: data_structures, os, computer_org, networks
      - `total_questions` (int)
      - `correct_count` (int)
      - `completed` (boolean)

    - `quiz_answers`
      - `id` (uuid, primary key)
      - `session_id` (uuid, fk to quiz_sessions)
      - `question_index` (int)
      - `question_text` (text)
      - `options` (jsonb) - array of option strings
      - `correct_answer` (int) - index of correct option
      - `user_answer` (int) - index user selected
      - `explanation` (text)
      - `is_correct` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Allow anonymous access for this public practice tool
*/

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  subject text NOT NULL DEFAULT 'data_structures',
  total_questions int DEFAULT 0,
  correct_count int DEFAULT 0,
  completed boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_index int NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer int NOT NULL,
  user_answer int,
  explanation text DEFAULT '',
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create quiz sessions"
  ON quiz_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read quiz sessions"
  ON quiz_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update quiz sessions"
  ON quiz_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert quiz answers"
  ON quiz_answers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read quiz answers"
  ON quiz_answers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update quiz answers"
  ON quiz_answers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS quiz_answers_session_id_idx ON quiz_answers(session_id);
