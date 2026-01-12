'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Difficulty, Competence } from '@/types/database'
import { getChallengeTitle, getChallengeDescription } from '@/lib/challengeGenerator'
import { useRouter } from 'next/navigation'
import { getAllUserProgress } from '@/lib/database/challenges'

interface ChallengeCardData {
  competence: Competence
  difficulty: Difficulty
  title: string
  description: string
  isCompleted: boolean
  score: number | null
}

export default function ChallengesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [challenges, setChallenges] = useState<ChallengeCardData[]>([])

  useEffect(() => {
    loadChallenges()
  }, [])

  async function loadChallenges() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // ÉTAPE 2: Appel getAllUserProgress + création challenges
    const competences: Competence[] = ['developpement', 'reduction', 'factorisation']
    const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile']
    const allChallenges: ChallengeCardData[] = []

    // Récupérer les progrès
    const userProgress = await getAllUserProgress()

    // Créer une Map pour lookup rapide - ATTENTION: Ne jamais mettre la Map dans le state!
    const progressMap = new Map<string, any>()

    userProgress.forEach((progress: any) => {
      const key = `${progress.challenges.competence}-${progress.challenges.difficulty}`
      // IMPORTANT: Extraire UNIQUEMENT les primitives (number, string, boolean)
      progressMap.set(key, {
        score: progress.score, // primitive number
      })
    })

    // Créer les challenges avec UNIQUEMENT des primitives
    for (const competence of competences) {
      for (const difficulty of difficulties) {
        const key = `${competence}-${difficulty}`
        const progress = progressMap.get(key)

        allChallenges.push({
          competence, // string
          difficulty, // string
          title: getChallengeTitle(competence, difficulty), // string
          description: getChallengeDescription(competence, difficulty), // string
          isCompleted: !!progress, // boolean
          score: progress?.score || null, // number | null
        })
      }
    }

    setChallenges(allChallenges)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          TEST ÉTAPE 2 - State + getAllUserProgress
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Données chargées depuis DB ({challenges.length} challenges)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <h3 className="text-lg font-bold">{challenge.title}</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {challenge.isCompleted ? `Score: ${challenge.score}/5` : 'Non commencé'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
