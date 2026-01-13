'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { acceptReferentInvitation } from '@/lib/actions/referent-invitations'
import Link from 'next/link'

function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [invitation, setInvitation] = useState<any>(null)

  useEffect(() => {
    checkAuthAndInvitation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkAuthAndInvitation() {
    if (!token) {
      setError("Token d'invitation manquant")
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Check if user is logged in
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    setUser(currentUser)

    // Load invitation details
    const { data: invitationData } = await supabase
      .from('referent_invitations')
      .select(
        `
        *,
        student:student_id (
          full_name
        )
      `
      )
      .eq('token', token)
      .single()

    if (invitationData) {
      setInvitation(invitationData)
    }

    setLoading(false)
  }

  async function handleAccept() {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/accept-invitation?token=${token}`)
      return
    }

    setAccepting(true)
    setError(null)

    const result = await acceptReferentInvitation(token!)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/referent/dashboard')
      }, 2000)
    }

    setAccepting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invitation acceptée !
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous pouvez maintenant suivre la progression de cet étudiant.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirection vers votre tableau de bord...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invitation de référent
          </h1>
        </div>

        {invitation && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{(invitation.student as any)?.full_name || 'Un étudiant'}</strong> vous invite
              à suivre sa progression en calcul littéral.
            </p>
            {invitation.student_message && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                &quot;{invitation.student_message}&quot;
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {!user ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              Vous devez vous connecter avec un compte référent pour accepter cette invitation.
            </p>
            <button
              onClick={handleAccept}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Se connecter / Créer un compte
            </button>
          </div>
        ) : (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {accepting ? 'Acceptation en cours...' : "Accepter l'invitation"}
          </button>
        )}

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  )
}
