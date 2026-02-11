-- Add support for activity-based workouts
-- This migration adds a type column to workouts and creates a table for activity sessions

-- Add type column to workouts table (default to 'ejercicios' for existing workouts)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'ejercicios';

-- Create workout_activities table for storing activity session data
CREATE TABLE IF NOT EXISTS workout_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  activity_id TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- Duration in minutes
  intensity TEXT CHECK (intensity IN ('baja', 'media', 'alta')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on workout_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_activities_workout_id ON workout_activities(workout_id);

-- Add RLS policies for workout_activities
ALTER TABLE workout_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity sessions
CREATE POLICY "Users can view own activity sessions"
  ON workout_activities
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert their own activity sessions
CREATE POLICY "Users can insert own activity sessions"
  ON workout_activities
  FOR INSERT
  WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own activity sessions
CREATE POLICY "Users can update own activity sessions"
  ON workout_activities
  FOR UPDATE
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own activity sessions
CREATE POLICY "Users can delete own activity sessions"
  ON workout_activities
  FOR DELETE
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );
