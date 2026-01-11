'use client'

import { useState, useEffect } from 'react'
import ExerciseCard from '@/components/ExerciseCard'
import { Expression, DifficultyLevel, ExerciseType } from '@/types/math'
import { generateExercise } from '@/lib/mathGenerator'
import { factorize } from '@/lib/mathOperations'
import {
  parseExpression,
  areExpressionsEquivalent,
  factoredExpressionToString,
} from '@/lib/mathComparator'

export default function FactorisationPage() {
  const [exercise, setExercise] = useState<Expression | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<string>('')
  const [exerciseCount, setExerciseCount] = useState(0)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY)

  const generateNewExercise = () => {
    const newExercise = generateExercise(ExerciseType.FACTORIZATION, difficulty) as Expression

    // Calculer la forme factorisée
    const factorized = factorize(newExercise)

    setExercise(newExercise)

    // Si on peut factoriser, utiliser la forme factorisée comme réponse
    if (factorized) {
      setCorrectAnswer(factoredExpressionToString(factorized))
    } else {
      // Sinon, l'expression est déjà sous forme réduite
      setCorrectAnswer('Expression déjà réduite')
    }

    setExerciseCount((prev) => prev + 1)
  }

  useEffect(() => {
    generateNewExercise()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty])

  const handleSubmit = (userAnswer: string) => {
    if (!correctAnswer || !exercise) {
      return { isCorrect: false }
    }

    const parsedAnswer = parseExpression(userAnswer)
    if (!parsedAnswer) {
      return {
        isCorrect: false,
        explanation: ["La réponse n'est pas une expression valide"],
      }
    }

    // Vérifier que la réponse de l'élève développée == l'exercice
    const isCorrect = areExpressionsEquivalent(parsedAnswer, exercise)

    if (isCorrect) {
      // Vérifier si l'expression pouvait être factorisée
      const factorized = factorize(exercise)
      return {
        isCorrect: true,
        explanation: factorized
          ? ['Bravo ! Vous avez trouvé la bonne factorisation !']
          : ['Correct ! Cette expression est déjà sous forme réduite.'],
      }
    }

    return {
      isCorrect: false,
      explanation: [
        'Cherchez le facteur commun à tous les termes',
        'Mettez-le en facteur : k(expression)',
      ],
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Factorisation</h1>
        <p className="text-gray-700 dark:text-gray-300">Factorisez les expressions suivantes</p>
      </header>

      <div className="mb-6">
        <label
          htmlFor="difficulty"
          className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2"
        >
          Niveau de difficulté :
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
          className="px-4 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={DifficultyLevel.EASY}>Facile</option>
          <option value={DifficultyLevel.MEDIUM}>Moyen</option>
          <option value={DifficultyLevel.HARD}>Difficile</option>
        </select>
      </div>

      {exercise && correctAnswer && (
        <ExerciseCard
          key={exerciseCount}
          question={exercise}
          correctAnswer={correctAnswer}
          onSubmit={handleSubmit}
          onNewExercise={generateNewExercise}
          exerciseNumber={exerciseCount}
          type="factorization"
        />
      )}
    </div>
  )
}
