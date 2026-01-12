'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Utilisateur connecté → rediriger vers le dashboard
        router.push('/dashboard')
      } else {
        // Utilisateur non connecté → rediriger vers login
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Page de chargement pendant la vérification
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirection en cours...</p>
      </div>
    </div>
  )
}
