'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ChallengesTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Challenges - Version Minimale</h1>
      <p>User ID: {userId}</p>
      <p>Si vous voyez ceci sans erreur, getAllUserProgress n&apos;est pas le problème</p>
    </div>
  )
}
