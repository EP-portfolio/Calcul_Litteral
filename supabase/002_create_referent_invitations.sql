-- ========================================
-- Migration 002: Create referent_invitations table
-- ========================================
-- Table to track invitation emails sent from students to referents

CREATE TABLE IF NOT EXISTS public.referent_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Student sending invitation
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Referent receiving invitation (email before account creation)
  referent_email TEXT NOT NULL,

  -- Referent profile ID (set after account creation and acceptance)
  referent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Secure token for invitation link
  token TEXT NOT NULL UNIQUE,

  -- Invitation status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,

  -- Optional message from student
  student_message TEXT,

  -- Ensure no duplicate invitations
  CONSTRAINT unique_student_referent_email UNIQUE(student_id, referent_email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitations_token
  ON public.referent_invitations(token);

CREATE INDEX IF NOT EXISTS idx_invitations_student_id
  ON public.referent_invitations(student_id);

CREATE INDEX IF NOT EXISTS idx_invitations_referent_email
  ON public.referent_invitations(referent_email);

CREATE INDEX IF NOT EXISTS idx_invitations_status
  ON public.referent_invitations(status);

CREATE INDEX IF NOT EXISTS idx_invitations_expires_at
  ON public.referent_invitations(expires_at);

-- Enable Row Level Security
ALTER TABLE public.referent_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Students can view own invitations" ON public.referent_invitations;
DROP POLICY IF EXISTS "Students can create invitations" ON public.referent_invitations;
DROP POLICY IF EXISTS "Students can update own pending invitations" ON public.referent_invitations;
DROP POLICY IF EXISTS "Referents can view invitations to their email" ON public.referent_invitations;
DROP POLICY IF EXISTS "Referents can respond to invitations" ON public.referent_invitations;

-- RLS Policy 1: Students can view their own invitations
CREATE POLICY "Students can view own invitations"
  ON public.referent_invitations
  FOR SELECT
  USING (auth.uid() = student_id);

-- RLS Policy 2: Students can create invitations
CREATE POLICY "Students can create invitations"
  ON public.referent_invitations
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- RLS Policy 3: Students can update their own pending invitations (for revocation)
CREATE POLICY "Students can update own pending invitations"
  ON public.referent_invitations
  FOR UPDATE
  USING (auth.uid() = student_id AND status = 'pending');

-- RLS Policy 4: Referents can view invitations sent to their email
CREATE POLICY "Referents can view invitations to their email"
  ON public.referent_invitations
  FOR SELECT
  USING (
    referent_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- RLS Policy 5: Referents can update (accept/reject) invitations sent to their email
CREATE POLICY "Referents can respond to invitations"
  ON public.referent_invitations
  FOR UPDATE
  USING (
    referent_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    AND status = 'pending'
  );

-- Confirmation
SELECT
  'referent_invitations table created successfully' as message,
  COUNT(*) as total_invitations
FROM public.referent_invitations;
