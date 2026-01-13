-- ========================================
-- Migration 003: Create student_referent_links table
-- ========================================
-- Table to track active relationships between students and referents

CREATE TABLE IF NOT EXISTS public.student_referent_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Student being followed
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Referent following the student
  referent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- When the link was created
  linked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Reference to original invitation (for audit trail)
  invitation_id UUID REFERENCES public.referent_invitations(id) ON DELETE SET NULL,

  -- Soft delete: student can deactivate without deleting history
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Notification preferences
  notify_on_challenge_completion BOOLEAN DEFAULT true NOT NULL,

  -- Constraints
  CONSTRAINT unique_student_referent UNIQUE(student_id, referent_id),
  CONSTRAINT no_self_referent CHECK (student_id != referent_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_links_student_id
  ON public.student_referent_links(student_id);

CREATE INDEX IF NOT EXISTS idx_links_referent_id
  ON public.student_referent_links(referent_id);

CREATE INDEX IF NOT EXISTS idx_links_active
  ON public.student_referent_links(is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_links_notify_enabled
  ON public.student_referent_links(notify_on_challenge_completion)
  WHERE notify_on_challenge_completion = true AND is_active = true;

-- Enable Row Level Security
ALTER TABLE public.student_referent_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Students can view own links" ON public.student_referent_links;
DROP POLICY IF EXISTS "Students can update own links" ON public.student_referent_links;
DROP POLICY IF EXISTS "Referents can view their links" ON public.student_referent_links;
DROP POLICY IF EXISTS "System can create links" ON public.student_referent_links;

-- RLS Policy 1: Students can view their own links
CREATE POLICY "Students can view own links"
  ON public.student_referent_links
  FOR SELECT
  USING (auth.uid() = student_id);

-- RLS Policy 2: Students can update their own links (deactivate, change notification settings)
CREATE POLICY "Students can update own links"
  ON public.student_referent_links
  FOR UPDATE
  USING (auth.uid() = student_id);

-- RLS Policy 3: Referents can view links where they are the referent
CREATE POLICY "Referents can view their links"
  ON public.student_referent_links
  FOR SELECT
  USING (auth.uid() = referent_id);

-- RLS Policy 4: System can insert links (via server actions)
-- This allows server-side code to create links after invitation acceptance
CREATE POLICY "System can create links"
  ON public.student_referent_links
  FOR INSERT
  WITH CHECK (true);

-- Confirmation
SELECT
  'student_referent_links table created successfully' as message,
  COUNT(*) as total_links,
  COUNT(*) FILTER (WHERE is_active = true) as active_links
FROM public.student_referent_links;
