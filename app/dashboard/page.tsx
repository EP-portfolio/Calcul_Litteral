'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUserStats, getUserRecentActivity, getAllUserProgress } from '@/lib/database/challenges'
import Link from 'next/link'
import { Difficulty, Competence } from '@/types/database'
import { ActivityLineChart, CompetenceBarChart } from '@/components/ProgressChart'

interface UserStat {
  competence: Competence
  difficulty: Difficulty
  total_attempts: number
  correct_attempts: number
  success_rate: number
  avg_time_spent: number
}

interface RecentActivity {
  activity_date: string
  exercises_done: number
  correct_count: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState<UserStat[]>([])
  const [totalChallengesCompleted, setTotalChallengesCompleted] = useState(0)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [challengeHistory, setChallengeHistory] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadDashboardData() {
    const supabase = createClient()

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur')

    // Charger les statistiques
    const userStats = await getUserStats()
    if (userStats) {
      setStats(userStats.stats)
      setTotalChallengesCompleted(userStats.totalChallengesCompleted)
    }

    // Charger l'activité récente
    const activity = await getUserRecentActivity()
    setRecentActivity(activity.slice(0, 7)) // 7 derniers jours

    // Charger l'historique des challenges
    const history = await getAllUserProgress()
    setChallengeHistory(history.slice(0, 10)) // 10 derniers challenges

    setLoading(false)
  }

  const getCompetenceLabel = (competence: Competence) => {
    const labels: Record<Competence, string> = {
      developpement: 'Développement',
      reduction: 'Réduction',
      factorisation: 'Factorisation',
    }
    return labels[competence]
  }

  const getDifficultyLabel = (difficulty: Difficulty) => {
    const labels: Record<Difficulty, string> = {
      facile: 'Facile',
      moyen: 'Moyen',
      difficile: 'Difficile',
    }
    return labels[difficulty]
  }

  const getCompetenceColor = (competence: Competence) => {
    switch (competence) {
      case 'developpement':
        return 'text-blue-600 dark:text-blue-400'
      case 'reduction':
        return 'text-green-600 dark:text-green-400'
      case 'factorisation':
        return 'text-purple-600 dark:text-purple-400'
    }
  }

  // Calculer les statistiques globales
  const totalExercises = stats.reduce((acc, stat) => acc + stat.total_attempts, 0)
  const totalCorrect = stats.reduce((acc, stat) => acc + stat.correct_attempts, 0)
  const globalSuccessRate = totalExercises > 0 ? (totalCorrect / totalExercises) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bonjour, {userName} !
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Voici un résumé de votre progression en calcul littéral.
          </p>
        </div>

        {/* Invitation référent (pour nouveaux utilisateurs) */}
        {totalChallengesCompleted === 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold">Invitez un référent !</h3>
                </div>
                <p className="text-white/90 mb-4">
                  Invitez un parent, enseignant ou tuteur à suivre votre progression. Ils recevront
                  un email après chaque challenge complété.
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Inviter un référent
                </Link>
              </div>
              <button
                onClick={() => {
                  const banner = document.getElementById('referent-banner')
                  if (banner) banner.style.display = 'none'
                }}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Challenges complétés
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalChallengesCompleted}/9
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exercices réussis</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalCorrect}/{totalExercises}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
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
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Taux de réussite</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {globalSuccessRate.toFixed(0)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progression</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {((totalChallengesCompleted / 9) * 100).toFixed(0)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques de progression */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Graphique d'activité récente */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Activité des 7 derniers jours
              </h2>
              <ActivityLineChart data={recentActivity} />
            </div>

            {/* Graphique par compétence */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Taux de réussite par compétence
              </h2>
              <CompetenceBarChart
                data={stats.map((stat) => ({
                  competence: getCompetenceLabel(stat.competence),
                  success_rate: stat.success_rate,
                }))}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statistiques par compétence */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Performance par compétence
              </h2>

              {stats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Vous n&apos;avez pas encore complété de challenges.
                  </p>
                  <Link
                    href="/challenges"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Commencer un challenge
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className={`font-semibold ${getCompetenceColor(stat.competence)}`}>
                            {getCompetenceLabel(stat.competence)}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Niveau {getDifficultyLabel(stat.difficulty)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stat.success_rate.toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stat.correct_attempts}/{stat.total_attempts} réussis
                          </p>
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stat.competence === 'developpement'
                              ? 'bg-blue-600'
                              : stat.competence === 'reduction'
                                ? 'bg-green-600'
                                : 'bg-purple-600'
                          }`}
                          style={{ width: `${stat.success_rate}%` }}
                        ></div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Temps moyen : {Math.floor(stat.avg_time_spent)}s par exercice
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activité récente */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Activité récente
              </h2>

              {recentActivity.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucune activité récente
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => {
                    const date = new Date(activity.activity_date)
                    const formattedDate = date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {formattedDate}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.exercises_done} exercices
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.correct_count} réussis
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            {((activity.correct_count / activity.exercises_done) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bouton vers les challenges */}
            <div className="mt-6">
              <Link
                href="/challenges"
                className="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Continuer à s&apos;entraîner
              </Link>
            </div>
          </div>
        </div>

        {/* Historique des challenges complétés */}
        {challengeHistory.length > 0 && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Historique des challenges
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Challenge
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Temps
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Taux
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {challengeHistory.map((progress: any, index: number) => {
                      const completedDate = new Date(progress.completed_at)
                      const formattedDate = completedDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                      const formattedTime = completedDate.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      const successRate = (progress.score / progress.total_exercises) * 100
                      const minutes = Math.floor(progress.time_spent / 60)
                      const seconds = progress.time_spent % 60

                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white capitalize">
                                {getCompetenceLabel(progress.challenges.competence)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {getDifficultyLabel(progress.challenges.difficulty)}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {progress.score}/{progress.total_exercises}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {minutes}:{seconds.toString().padStart(2, '0')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {formattedDate}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formattedTime}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                successRate >= 80
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : successRate >= 60
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              }`}
                            >
                              {successRate.toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
