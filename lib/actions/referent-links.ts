'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Get student's active referent links
 */
export async function getStudentReferents() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('student_referent_links')
    .select(
      `
      *,
      referent:referent_id (
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq('student_id', user.id)
    .eq('is_active', true)
    .order('linked_at', { ascending: false })

  if (error) {
    console.error('Get referents error:', error)
    return []
  }

  return JSON.parse(JSON.stringify(data || []))
}

/**
 * Get referent's linked students
 */
export async function getReferentStudents() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('student_referent_links')
    .select(
      `
      *,
      student:student_id (
        full_name,
        email,
        avatar_url,
        student_code
      )
    `
    )
    .eq('referent_id', user.id)
    .eq('is_active', true)
    .order('linked_at', { ascending: false })

  if (error) {
    console.error('Get students error:', error)
    return []
  }

  return JSON.parse(JSON.stringify(data || []))
}

/**
 * Deactivate referent link (student action)
 */
export async function deactivateReferentLink(linkId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { error } = await supabase
    .from('student_referent_links')
    .update({ is_active: false })
    .eq('id', linkId)
    .eq('student_id', user.id)

  if (error) {
    console.error('Deactivate link error:', error)
    return { error: 'Erreur lors de la désactivation' }
  }

  return { success: true }
}

/**
 * Get student stats for referent dashboard
 */
export async function getStudentStatsForReferent(studentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Verify referent has access to this student
  const { data: link } = await supabase
    .from('student_referent_links')
    .select('id')
    .eq('referent_id', user.id)
    .eq('student_id', studentId)
    .eq('is_active', true)
    .single()

  if (!link) {
    return null
  }

  // Get student's challenge progress
  const { data: progress, error } = await supabase
    .from('user_challenge_progress')
    .select(
      `
      *,
      challenges (
        competence,
        difficulty,
        title
      )
    `
    )
    .eq('user_id', studentId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Get student stats error:', error)
    return null
  }

  return JSON.parse(JSON.stringify(progress || []))
}
