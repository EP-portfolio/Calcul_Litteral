'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getReferentStudents, getStudentStatsForReferent } from '@/lib/actions/referent-links'
import { Competence, Difficulty } from '@/types/database'

export default function ReferentDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentStats, setStudentStats] = useState<any[]>([])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      .single<{ account_type: string }>()

    if (profile?.account_type !== 'referent') {
      router.push('/dashboard')
      return
    }

    const studentsData = await getReferentStudents()
    setStudents(studentsData)

    setLoading(false)
  }

  async function handleSelectStudent(student: any) {
    setSelectedStudent(student)
    const stats = await getStudentStatsForReferent(student.student_id)
    setStudentStats(stats || [])
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Tableau de bord référent
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Suivez la progression de vos étudiants
        </p>

        {students.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun étudiant lié
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Vous recevrez des notifications lorsque des étudiants vous inviteront à suivre leur
              progression.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Mes étudiants ({students.length})
                </h2>

                <div className="space-y-2">
                  {students.map((link) => {
                    const student = link.student as any
                    return (
                      <button
                        key={link.id}
                        onClick={() => handleSelectStudent(link)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedStudent?.id === link.id
                            ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {student?.full_name || 'Étudiant'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student?.email}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Progression de {(selectedStudent.student as any)?.full_name}
                    </h2>

                    {studentStats.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        Cet étudiant n&apos;a pas encore complété de challenges.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {studentStats.map((progress: any, index: number) => {
                          const successRate = (progress.score / progress.total_exercises) * 100
                          const minutes = Math.floor(progress.time_spent / 60)
                          const seconds = progress.time_spent % 60

                          return (
                            <div
                              key={index}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {getCompetenceLabel(progress.challenges.competence)}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Niveau {getDifficultyLabel(progress.challenges.difficulty)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {progress.score}/{progress.total_exercises}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {successRate.toFixed(0)}% de réussite
                                  </p>
                                </div>
                              </div>

                              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    successRate >= 80
                                      ? 'bg-green-600'
                                      : successRate >= 60
                                        ? 'bg-orange-600'
                                        : 'bg-red-600'
                                  }`}
                                  style={{ width: `${successRate}%` }}
                                ></div>
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  Temps : {minutes}min {seconds}s
                                </span>
                                <span>
                                  {new Date(progress.completed_at).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Sélectionnez un étudiant pour voir sa progression
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
