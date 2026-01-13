-- ========================================
-- Migration 004: Update handle_new_user trigger
-- ========================================
-- Modifies the handle_new_user function to extract account_type from user metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_account_type TEXT;
BEGIN
  -- Extract account_type from metadata, default to 'student'
  user_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'student');

  -- Validate account_type
  IF user_account_type NOT IN ('student', 'referent') THEN
    user_account_type := 'student';
  END IF;

  -- Insert profile with account_type
  INSERT INTO public.profiles (id, email, full_name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_account_type
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confirmation message
SELECT 'handle_new_user function updated successfully to include account_type' as message;
