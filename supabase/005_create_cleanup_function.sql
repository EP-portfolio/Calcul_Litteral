-- ========================================
-- Migration 005: Cleanup expired invitations function
-- ========================================
-- Creates a function to mark expired pending invitations as 'expired'

CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Update all pending invitations that have expired
  UPDATE public.referent_invitations
  SET
    status = 'expired',
    responded_at = NOW()
  WHERE status = 'pending'
    AND expires_at < NOW();

  -- Get the number of rows updated
  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- Log the cleanup action
  RAISE NOTICE 'Cleaned up % expired invitation(s)', expired_count;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a scheduled job using pg_cron (if available on Supabase)
-- Note: This requires pg_cron extension which may not be available on all plans
-- If not available, you can call this function via a Next.js API route with Vercel Cron

-- Check if pg_cron extension exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule daily cleanup at 2 AM
    PERFORM cron.schedule(
      'cleanup-expired-invitations',
      '0 2 * * *',
      'SELECT cleanup_expired_invitations();'
    );
    RAISE NOTICE 'pg_cron job scheduled successfully';
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Use external cron (Vercel Cron, etc.) to call this function.';
  END IF;
END $$;

-- Test the function
SELECT cleanup_expired_invitations() as expired_invitations_cleaned;

-- Confirmation
SELECT 'cleanup_expired_invitations function created successfully' as message;
