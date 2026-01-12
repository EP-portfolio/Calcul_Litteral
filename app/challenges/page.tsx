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

    // TEST: Créer challenges sans appeler getAllUserProgress
    const competences: Competence[] = ['developpement', 'reduction', 'factorisation']
    const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile']
    const allChallenges: ChallengeCardData[] = []

    for (const competence of competences) {
      for (const difficulty of difficulties) {
        allChallenges.push({
          competence,
          difficulty,
          title: getChallengeTitle(competence, difficulty),
          description: getChallengeDescription(competence, difficulty),
          isCompleted: false, // Hardcodé pour test
          score: null,
        })
      }
    }

    setChallenges(allChallenges)
    setLoading(false)
  }

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Challenges</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complétez les 9 challenges pour maîtriser le calcul littéral !
          </p>
        </div>

        {(['developpement', 'reduction', 'factorisation'] as Competence[]).map((competence) => (
          <div key={competence} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 capitalize">
              {competence}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges
                .filter((c) => c.competence === competence)
                .map((challenge) => (
                  <div
                    key={`${challenge.competence}-${challenge.difficulty}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                  >
                    <div
                      className={`bg-gradient-to-r ${getCompetenceColor(
                        challenge.competence
                      )} p-4 text-white`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">{challenge.title}</h3>
                        {getDifficultyBadge(challenge.difficulty)}
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {challenge.description}
                      </p>

                      <Link
                        href={`/challenges/${challenge.competence}/${challenge.difficulty}`}
                        className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors bg-gradient-to-r ${getCompetenceColor(
                          challenge.competence
                        )} text-white hover:opacity-90`}
                      >
                        Commencer
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
