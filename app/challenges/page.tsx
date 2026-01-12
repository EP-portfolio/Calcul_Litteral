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

    const competences: Competence[] = ['developpement', 'reduction', 'factorisation']
    const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile']
    const allChallenges: ChallengeCardData[] = []

    const userProgress = await getAllUserProgress()
    const progressMap = new Map<string, any>()

    userProgress.forEach((progress: any) => {
      const key = `${progress.challenges.competence}-${progress.challenges.difficulty}`
      progressMap.set(key, {
        score: progress.score,
      })
    })

    for (const competence of competences) {
      for (const difficulty of difficulties) {
        const key = `${competence}-${difficulty}`
        const progress = progressMap.get(key)

        allChallenges.push({
          competence,
          difficulty,
          title: getChallengeTitle(competence, difficulty),
          description: getChallengeDescription(competence, difficulty),
          isCompleted: !!progress,
          score: progress?.score || null,
        })
      }
    }

    setChallenges(allChallenges)
    setLoading(false)
  }

  // ÉTAPE 3A: Ajouter helpers
  const getCompetenceColor = (competence: Competence) => {
    switch (competence) {
      case 'developpement':
        return 'from-blue-500 to-blue-600'
      case 'reduction':
        return 'from-green-500 to-green-600'
      case 'factorisation':
        return 'from-purple-500 to-purple-600'
    }
  }

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'facile':
        return (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded">
            Facile
          </span>
        )
      case 'moyen':
        return (
          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-medium rounded">
            Moyen
          </span>
        )
      case 'difficile':
        return (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded">
            Difficile
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mes Challenges</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Choisissez un challenge pour tester vos compétences en calcul littéral
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <button
              key={index}
              onClick={() =>
                router.push(`/challenges/${challenge.competence}/${challenge.difficulty}`)
              }
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 text-left w-full"
            >
              <div
                className={`bg-gradient-to-r ${getCompetenceColor(challenge.competence)} p-4 text-white`}
              >
                <h3 className="text-lg font-bold">{challenge.title}</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">{getDifficultyBadge(challenge.difficulty)}</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {challenge.description}
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {challenge.isCompleted ? `Score: ${challenge.score}/5` : 'Non commencé'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
