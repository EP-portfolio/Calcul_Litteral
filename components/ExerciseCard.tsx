'use client'

import { useState } from 'react'
import { Expression, FactoredExpression } from '@/types/math'
import { expressionToString } from '@/lib/mathComparator'
import MathInput from './MathInput'
import Feedback from './Feedback'

interface ExerciseCardProps {
  question: Expression | FactoredExpression
  correctAnswer: string
  onSubmit: (userAnswer: string) => { isCorrect: boolean; explanation?: string[] }
  onNewExercise: () => void
  exerciseNumber: number
  type: 'development' | 'reduction' | 'factorization'
}

export default function ExerciseCard({
  question,
  correctAnswer,
  onSubmit,
  onNewExercise,
  exerciseNumber,
  type,
}: ExerciseCardProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    explanation?: string[]
  } | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const result = onSubmit(userAnswer)
    setFeedback(result)
    setHasSubmitted(true)
  }

  const handleReset = () => {
    setUserAnswer('')
    setFeedback(null)
    setHasSubmitted(false)
    onNewExercise()
  }

  const formatQuestion = () => {
    if ('factor' in question) {
      // FactoredExpression
      const factor = expressionToString(question.factor)
      const multipliedBy = expressionToString(question.multipliedBy)
      return `(${factor})(${multipliedBy})`
    } else {
      // Expression
      return expressionToString(question)
    }
  }

  const getInstructionText = () => {
    switch (type) {
      case 'development':
        return 'Développer et réduire :'
      case 'reduction':
        return 'Réduire :'
      case 'factorization':
        return 'Factoriser :'
    }
  }

  return (
    <article
      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700"
      aria-labelledby={`exercise-${exerciseNumber}`}
    >
      <header className="mb-4">
        <h2
          id={`exercise-${exerciseNumber}`}
          className="text-xl font-semibold text-gray-800 dark:text-gray-100"
        >
          Exercice {exerciseNumber}
        </h2>
      </header>

      <div className="space-y-4">
        <div>
          <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
            {getInstructionText()}
          </p>
          <div
            className="text-2xl font-mono font-semibold bg-blue-100 dark:bg-blue-950 text-gray-900 dark:text-blue-50 p-4 rounded border-2 border-blue-300 dark:border-blue-600"
            role="math"
            aria-label={`Expression mathématique : ${formatQuestion()}`}
          >
            {formatQuestion()}
          </div>
        </div>

        <MathInput
          value={userAnswer}
          onChange={setUserAnswer}
          disabled={hasSubmitted}
          onSubmit={handleSubmit}
          label="Votre réponse"
          placeholder="Ex: 2x^2 + 3x - 5"
        />

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || hasSubmitted}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            aria-label="Vérifier ma réponse"
          >
            Vérifier
          </button>

          {hasSubmitted && (
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              aria-label="Essayer un nouvel exercice"
            >
              Nouvel exercice
            </button>
          )}
        </div>

        {feedback && (
          <Feedback
            isCorrect={feedback.isCorrect}
            correctAnswer={correctAnswer}
            explanation={feedback.explanation}
          />
        )}
      </div>
    </article>
  )
}
