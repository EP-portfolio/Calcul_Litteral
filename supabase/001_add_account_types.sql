-- ========================================
-- Migration 001: Add account types to profiles
-- ========================================
-- Adds account_type column to distinguish students from referents
-- Adds optional student_code for future enhancements

-- Add account_type column with constraint
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'student'
CHECK (account_type IN ('student', 'referent'));

-- Add student_code column (optional, for future use)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS student_code TEXT UNIQUE;

-- Add generated_at tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS code_generated_at TIMESTAMPTZ;

-- Function to generate unique student code
CREATE OR REPLACE FUNCTION generate_student_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate for students if code doesn't exist
  IF NEW.account_type = 'student' AND NEW.student_code IS NULL THEN
    -- Generate 8-character alphanumeric code (uppercase)
    NEW.student_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));
    NEW.code_generated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate student code
DROP TRIGGER IF EXISTS set_student_code ON public.profiles;
CREATE TRIGGER set_student_code
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_student_code();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_type
  ON public.profiles(account_type);

CREATE INDEX IF NOT EXISTS idx_profiles_student_code
  ON public.profiles(student_code)
  WHERE student_code IS NOT NULL;

-- Update existing profiles to have account_type='student' by default
UPDATE public.profiles
SET account_type = 'student'
WHERE account_type IS NULL;

-- Confirmation
SELECT
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE account_type = 'student') as students,
  COUNT(*) FILTER (WHERE account_type = 'referent') as referents
FROM public.profiles;
