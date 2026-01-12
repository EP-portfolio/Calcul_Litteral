'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ExerciseCard from '@/components/ExerciseCard'
import { createClient } from '@/lib/supabase/client'
import {
  generateChallenge,
  getChallengeTitle,
  DIFFICULTY_MAP,
  COMPETENCE_MAP,
} from '@/lib/challengeGenerator'
import { Difficulty, Competence } from '@/types/database'
import { developAndReduce, reduce, factorize } from '@/lib/mathOperations'
import {
  parseExpression,
  areExpressionsEquivalent,
  expressionToString,
  factoredExpressionToString,
} from '@/lib/mathComparator'
import { FactoredExpression, Expression } from '@/types/math'
import { saveChallengeResults } from '@/lib/database/challenges'

interface PageProps {
  params: {
    competence: Competence
    difficulty: Difficulty
  }
}

export default function ChallengePage({ params }: PageProps) {
  const { competence, difficulty } = params
  const router = useRouter()

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exercises, setExercises] = useState<any[]>([])
  const [answers, setAnswers] = useState<
    Array<{ userAnswer: string; isCorrect: boolean; timeSpent: number }>
  >([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(Date.now())
  const [totalTime, setTotalTime] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    initializeChallenge()
  }, [])

  async function initializeChallenge() {
    const supabase = createClient()

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUserId(user.id)

    // Générer le challenge
    const challenge = generateChallenge(competence, difficulty)
    setExercises(challenge.exercises)
    setStartTime(Date.now())
    setExerciseStartTime(Date.now())
  }

  const getCurrentAnswer = (question: any) => {
    const exerciseType = COMPETENCE_MAP[competence]

    switch (exerciseType) {
      case 'development':
        return expressionToString(developAndReduce(question as FactoredExpression))
      case 'reduction':
        return expressionToString(reduce(question as Expression))
      case 'factorization': {
        const factorized = factorize(question as Expression)
        return factorized ? factoredExpressionToString(factorized) : ''
      }
      default:
        return ''
    }
  }

  const handleSubmit = (userAnswer: string) => {
    if (exercises.length === 0) {
      return { isCorrect: false }
    }

    const currentExercise = exercises[currentExerciseIndex]
    const correctAnswer = getCurrentAnswer(currentExercise.question)

    const parsedAnswer = parseExpression(userAnswer)
    if (!parsedAnswer) {
      return {
        isCorrect: false,
        explanation: ["La réponse n'est pas une expression valide"],
      }
    }

    const parsedCorrect = parseExpression(correctAnswer)
    if (!parsedCorrect) {
      return { isCorrect: false }
    }

    const isCorrect = areExpressionsEquivalent(parsedAnswer, parsedCorrect)
    const timeSpent = Math.floor((Date.now() - exerciseStartTime) / 1000)

    // Enregistrer la réponse
    const newAnswer = {
      userAnswer,
      isCorrect,
      timeSpent,
    }

    setAnswers([...answers, newAnswer])

    return {
      isCorrect,
      explanation: isCorrect ? undefined : getHints(competence),
    }
  }

  const getHints = (competence: Competence): string[] => {
    switch (competence) {
      case 'developpement':
        return [
          "N'oubliez pas de développer tous les termes",
          'Puis regroupez les termes semblables',
        ]
      case 'reduction':
        return ['Regroupez les termes en x ensemble', 'Regroupez les termes constants ensemble']
      case 'factorisation':
        return ['Cherchez le facteur commun à tous les termes', 'Mettez-le en facteur']
    }
  }

  const handleNext = async () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setExerciseStartTime(Date.now())
    } else {
      // Challenge terminé
      const total = Math.floor((Date.now() - startTime) / 1000)
      setTotalTime(total)
      setIsCompleted(true)

      // Sauvegarder les résultats en base de données
      const score = answers.filter((a) => a.isCorrect).length
      const exercisesWithQuestions = answers.map((answer, index) => {
        const exercise = exercises[index]
        // Convertir la question en string pour la sérialisation
        let questionStr = ''
        const exerciseType = COMPETENCE_MAP[competence]
        if (exerciseType === 'factorization') {
          questionStr = expressionToString(exercise.question as Expression)
        } else if (exerciseType === 'development') {
          questionStr = factoredExpressionToString(exercise.question as FactoredExpression)
        } else {
          questionStr = expressionToString(exercise.question as Expression)
        }

        return {
          question: questionStr,
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect,
          timeSpent: answer.timeSpent,
        }
      })

      await saveChallengeResults({
        competence,
        difficulty,
        score,
        totalExercises: exercises.length,
        timeSpent: total,
        exercises: exercisesWithQuestions,
      })
    }
  }

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Génération du challenge...</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    const score = answers.filter((a) => a.isCorrect).length
    const successRate = (score / exercises.length) * 100

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            {/* Icône de succès */}
            <div className="mb-6">
              {successRate >= 80 ? (
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-12 h-12 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-12 h-12 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Challenge terminé !
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {getChallengeTitle(competence, difficulty)}
            </p>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {score}/{exercises.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bonnes réponses</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {successRate.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taux de réussite</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Temps total</div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/challenges')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Retour aux challenges
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Voir mes statistiques
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentExerciseIndex]
  const correctAnswer = getCurrentAnswer(currentExercise.question)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* En-tête avec progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getChallengeTitle(competence, difficulty)}
            </h1>
            <div className="text-gray-600 dark:text-gray-400">
              Exercice {currentExerciseIndex + 1} / {exercises.length}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {answers.filter((a) => a.isCorrect).length} bonne(s) réponse(s)
          </div>
        </div>

        {/* Exercice */}
        <ExerciseCard
          key={currentExerciseIndex}
          question={currentExercise.question}
          correctAnswer={correctAnswer}
          onSubmit={handleSubmit}
          onNewExercise={handleNext}
          exerciseNumber={currentExerciseIndex + 1}
          type={
            competence === 'developpement'
              ? 'development'
              : competence === 'reduction'
                ? 'reduction'
                : 'factorization'
          }
        />
      </div>
    </div>
  )
}
