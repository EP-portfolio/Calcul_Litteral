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
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Chaque challenge contient 5 exercices à résoudre.
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
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
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
                      {challenge.isCompleted && (
                        <div className="flex items-center gap-2 mt-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm">Complété ({challenge.score}/5)</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {challenge.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 mb-4">
                        <span>5 exercices</span>
                        <span>~10 minutes</span>
                      </div>

                      <Link
                        href={`/challenges/${challenge.competence}/${challenge.difficulty}`}
                        className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                          challenge.isCompleted
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-gradient-to-r ' +
                              getCompetenceColor(challenge.competence) +
                              ' text-white hover:opacity-90'
                        }`}
                      >
                        {challenge.isCompleted ? 'Refaire' : 'Commencer'}
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Progression globale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {challenges.filter((c) => c.isCompleted).length}/9
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Challenges complétés</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {challenges.length > 0
                  ? Math.round(
                      (challenges.filter((c) => c.isCompleted).length / challenges.length) * 100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taux de complétion</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {challenges.reduce((sum, c) => sum + (c.score || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Exercices réussis (total)
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
