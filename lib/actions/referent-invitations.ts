'use server'

import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL, SITE_URL } from '@/lib/email/resend'
import { InvitationEmailHTML } from '@/lib/email/templates'
import crypto from 'crypto'

interface SendInvitationParams {
  referentEmail: string
  studentMessage?: string
}

interface SendInvitationResult {
  success?: boolean
  error?: string
  invitationId?: string
}

/**
 * Send invitation email to referent
 * Rate limit: Max 3 invitations per student per hour
 */
export async function sendReferentInvitation({
  referentEmail,
  studentMessage,
}: SendInvitationParams): Promise<SendInvitationResult> {
  const supabase = await createClient()

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // 2. Get student profile
  const { data: studentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, account_type, email')
    .eq('id', user.id)
    .single<{ full_name: string; account_type: string; email: string }>()

  if (profileError || !studentProfile) {
    return { error: 'Profil étudiant introuvable' }
  }

  if (studentProfile.account_type !== 'student') {
    return { error: 'Seuls les étudiants peuvent envoyer des invitations' }
  }

  // 3. Validate referent email
  if (!referentEmail || !referentEmail.includes('@')) {
    return { error: 'Email invalide' }
  }

  // Normalize email
  const normalizedEmail = referentEmail.toLowerCase().trim()

  // Prevent self-invitation
  if (normalizedEmail === studentProfile.email?.toLowerCase()) {
    return { error: 'Vous ne pouvez pas vous inviter vous-même' }
  }

  // 4. Rate limiting check - Max 3 invitations per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: recentInvitations, error: rateLimitError } = await supabase
    .from('referent_invitations')
    .select('id')
    .eq('student_id', user.id)
    .gte('sent_at', oneHourAgo)

  if (rateLimitError) {
    console.error('Rate limit check error:', rateLimitError)
  }

  if (recentInvitations && recentInvitations.length >= 3) {
    return { error: 'Limite atteinte : 3 invitations maximum par heure' }
  }

  // 5. Check for existing invitation
  const { data: existingInvitation } = await supabase
    .from('referent_invitations')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('referent_email', normalizedEmail)
    .single<{ id: string; status: string }>()

  if (existingInvitation) {
    if (existingInvitation.status === 'pending') {
      return { error: 'Une invitation est déjà en attente pour cet email' }
    }
    if (existingInvitation.status === 'accepted') {
      return { error: 'Ce référent est déjà lié à votre compte' }
    }
  }

  // 6. Generate secure token
  const token = crypto.randomBytes(32).toString('hex')

  // 7. Create invitation record
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const { data: invitation, error: insertError } = await supabase
    .from('referent_invitations')
    .insert({
      student_id: user.id,
      referent_email: normalizedEmail,
      token,
      expires_at: expiresAt.toISOString(),
      student_message: studentMessage?.trim() || null,
    })
    .select('id')
    .single<{ id: string }>()

  if (insertError || !invitation) {
    console.error('Invitation creation error:', insertError)
    return { error: "Erreur lors de la création de l'invitation" }
  }

  // 8. Send email via Resend
  const acceptUrl = `${SITE_URL}/accept-invitation?token=${token}`

  try {
    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: normalizedEmail,
      subject: `${studentProfile.full_name} vous invite à suivre ses progrès - Calcul Littéral`,
      html: InvitationEmailHTML({
        studentName: studentProfile.full_name || 'Un étudiant',
        referentEmail: normalizedEmail,
        acceptUrl,
        studentMessage: studentMessage?.trim(),
        expiresAt: expiresAt.toISOString(),
      }),
    })

    if (emailError) {
      console.error('Email sending error:', emailError)

      // Cleanup - delete invitation if email fails
      await supabase.from('referent_invitations').delete().eq('id', invitation.id)

      return { error: "Erreur lors de l'envoi de l'email" }
    }

    return {
      success: true,
      invitationId: invitation.id,
    }
  } catch (error) {
    console.error('Unexpected email error:', error)

    // Cleanup
    await supabase.from('referent_invitations').delete().eq('id', invitation.id)

    return { error: "Erreur inattendue lors de l'envoi" }
  }
}

/**
 * Accept referent invitation
 */
export async function acceptReferentInvitation(token: string) {
  const supabase = await createClient()

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié. Veuillez vous connecter ou créer un compte.' }
  }

  // 2. Get user profile
  const { data: referentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('email, account_type')
    .eq('id', user.id)
    .single<{ email: string; account_type: string }>()

  if (profileError || !referentProfile) {
    return { error: 'Profil introuvable' }
  }

  if (referentProfile.account_type !== 'referent') {
    return { error: 'Seuls les comptes référent peuvent accepter des invitations' }
  }

  // 3. Find invitation by token
  const { data: invitation, error: invitationError } = await supabase
    .from('referent_invitations')
    .select('id, student_id, referent_email, status, expires_at')
    .eq('token', token)
    .single<{
      id: string
      student_id: string
      referent_email: string
      status: string
      expires_at: string
    }>()

  if (invitationError || !invitation) {
    return { error: 'Invitation introuvable' }
  }

  // 4. Validate invitation
  if (invitation.status !== 'pending') {
    return { error: 'Cette invitation a déjà été traitée' }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from('referent_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id)

    return { error: 'Cette invitation a expiré' }
  }

  // 5. Verify email matches
  if (invitation.referent_email.toLowerCase() !== referentProfile.email?.toLowerCase()) {
    return { error: "Cette invitation n'a pas été envoyée à votre adresse email" }
  }

  // 6. Check for existing link
  const { data: existingLink } = await supabase
    .from('student_referent_links')
    .select('id')
    .eq('student_id', invitation.student_id)
    .eq('referent_id', user.id)
    .single<{ id: string }>()

  if (existingLink) {
    // Update invitation status even if link exists
    await supabase
      .from('referent_invitations')
      .update({
        status: 'accepted',
        referent_id: user.id,
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    return { error: 'Vous êtes déjà lié à cet étudiant' }
  }

  // 7. Create link
  const { error: linkError } = await supabase.from('student_referent_links').insert({
    student_id: invitation.student_id,
    referent_id: user.id,
    invitation_id: invitation.id,
  })

  if (linkError) {
    console.error('Link creation error:', linkError)
    return { error: 'Erreur lors de la création du lien' }
  }

  // 8. Update invitation status
  const { error: updateError } = await supabase
    .from('referent_invitations')
    .update({
      status: 'accepted',
      referent_id: user.id,
      responded_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  if (updateError) {
    console.error('Invitation update error:', updateError)
  }

  return { success: true }
}

/**
 * Revoke/cancel pending invitation
 */
export async function revokeInvitation(invitationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Update status to rejected
  const { error } = await supabase
    .from('referent_invitations')
    .update({ status: 'rejected', responded_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('student_id', user.id)
    .eq('status', 'pending')

  if (error) {
    console.error('Revoke error:', error)
    return { error: 'Erreur lors de la révocation' }
  }

  return { success: true }
}

/**
 * Get student's invitations
 */
export async function getStudentInvitations() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('referent_invitations')
    .select('*')
    .eq('student_id', user.id)
    .order('sent_at', { ascending: false })

  if (error) {
    console.error('Get invitations error:', error)
    return []
  }

  return JSON.parse(JSON.stringify(data || []))
}
