'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  sendReferentInvitation,
  getStudentInvitations,
  revokeInvitation,
} from '@/lib/actions/referent-invitations'
import { getStudentReferents, deactivateReferentLink } from '@/lib/actions/referent-links'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accountType, setAccountType] = useState<string | null>(null)

  const [referentEmail, setReferentEmail] = useState('')
  const [studentMessage, setStudentMessage] = useState('')
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [invitationError, setInvitationError] = useState<string | null>(null)
  const [invitationSuccess, setInvitationSuccess] = useState(false)

  const [invitations, setInvitations] = useState<any[]>([])
  const [referents, setReferents] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    if (profile) {
      setAccountType(profile.account_type)

      if (profile.account_type === 'student') {
        const invitationsData = await getStudentInvitations()
        setInvitations(invitationsData)

        const referentsData = await getStudentReferents()
        setReferents(referentsData)
      }
    }

    setLoading(false)
  }

  async function handleSendInvitation(e: React.FormEvent) {
    e.preventDefault()
    setInvitationError(null)
    setInvitationSuccess(false)
    setSendingInvitation(true)

    const result = await sendReferentInvitation({
      referentEmail,
      studentMessage: studentMessage || undefined,
    })

    if (result.error) {
      setInvitationError(result.error)
    } else {
      setInvitationSuccess(true)
      setReferentEmail('')
      setStudentMessage('')
      await loadData() // Refresh invitations list
    }

    setSendingInvitation(false)
  }

  async function handleRevokeInvitation(invitationId: string) {
    if (!confirm('Voulez-vous vraiment annuler cette invitation ?')) return

    const result = await revokeInvitation(invitationId)

    if (result.error) {
      alert(result.error)
    } else {
      await loadData()
    }
  }

  async function handleDeactivateLink(linkId: string, referentName: string) {
    if (!confirm(`Voulez-vous vraiment retirer l'accès à ${referentName} ?`)) return

    const result = await deactivateReferentLink(linkId)

    if (result.error) {
      alert(result.error)
    } else {
      await loadData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (accountType !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux étudiants.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Paramètres</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Gérez vos référents et invitations
        </p>

        {/* Invite Referent Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Inviter un référent
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Invitez un enseignant, parent ou tuteur à suivre votre progression. Ils recevront un
            email pour accepter l&apos;invitation.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 italic">
            💡 Conseil : Demandez au référent de vérifier ses spams s&apos;il ne reçoit pas l&apos;email.
          </p>

          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div>
              <label
                htmlFor="referentEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email du référent
              </label>
              <input
                id="referentEmail"
                type="email"
                value={referentEmail}
                onChange={(e) => setReferentEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="referent@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="studentMessage"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Message personnel (optionnel)
              </label>
              <textarea
                id="studentMessage"
                value={studentMessage}
                onChange={(e) => setStudentMessage(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Ajoutez un message à votre invitation..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {studentMessage.length}/500 caractères
              </p>
            </div>

            {invitationError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {invitationError}
              </div>
            )}

            {invitationSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                <p className="font-semibold">Invitation envoyée avec succès !</p>
                <p className="mt-1 text-xs">
                  Si le référent ne reçoit pas l&apos;email, demandez-lui de vérifier ses spams.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={sendingInvitation}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {sendingInvitation ? 'Envoi en cours...' : "Envoyer l'invitation"}
            </button>
          </form>
        </div>

        {/* Active Referents */}
        {referents.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Référents actifs
            </h2>

            <div className="space-y-3">
              {referents.map((link) => {
                const referent = link.referent as any
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {referent?.full_name?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {referent?.full_name || 'Référent'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {referent?.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Lié depuis le {new Date(link.linked_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeactivateLink(link.id, referent?.full_name)}
                      className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Retirer l&apos;accès
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pending Invitations */}
        {invitations.filter((inv) => inv.status === 'pending').length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Invitations en attente
            </h2>

            <div className="space-y-3">
              {invitations
                .filter((inv) => inv.status === 'pending')
                .map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invitation.referent_email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Envoyée le {new Date(invitation.sent_at).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevokeInvitation(invitation.id)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
