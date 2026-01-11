'use client'

import { useState, useEffect } from 'react'
import ExerciseCard from '@/components/ExerciseCard'
import { Expression, DifficultyLevel, ExerciseType } from '@/types/math'
import { generateExercise } from '@/lib/mathGenerator'
import { factorize } from '@/lib/mathOperations'
import { parseExpression, areExpressionsEquivalent } from '@/lib/mathComparator'

export default function FactorisationPage() {
  const [exercise, setExercise] = useState<Expression | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<Expression | null>(null)
  const [exerciseCount, setExerciseCount] = useState(0)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY)

  const generateNewExercise = () => {
    const newExercise = generateExercise(ExerciseType.FACTORIZATION, difficulty) as Expression

    // La bonne réponse est l'expression elle-même, car c'est déjà sous forme développée
    // L'élève doit trouver la forme factorisée
    setExercise(newExercise)
    setCorrectAnswer(newExercise) // On garde l'original pour comparaison
    setExerciseCount((prev) => prev + 1)
  }

  useEffect(() => {
    generateNewExercise()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty])

  const handleSubmit = (userAnswer: string) => {
    if (!correctAnswer) {
      return { isCorrect: false }
    }

    const parsedAnswer = parseExpression(userAnswer)
    if (!parsedAnswer) {
      return {
        isCorrect: false,
        explanation: ["La réponse n'est pas une expression valide"],
      }
    }

    // Pour la factorisation, on vérifie que la réponse est équivalente à l'exercice
    const isCorrect = areExpressionsEquivalent(parsedAnswer, correctAnswer)

    if (isCorrect) {
      // Vérifier si vraiment factorisé (forme plus simple)
      // Pour simplifier, on accepte toute réponse équivalente
      const factorized = factorize(correctAnswer)
      return {
        isCorrect: true,
        explanation: factorized
          ? ['Vous avez trouvé la bonne factorisation !']
          : ['Bonne réponse ! Cette expression est déjà sous forme réduite.'],
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
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Factorisation</h1>
        <p className="text-gray-600">Factorisez les expressions suivantes</p>
      </header>

      <div className="mb-6">
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
          Niveau de difficulté :
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
          className="px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          exerciseNumber={exerciseCount}
          type="factorization"
        />
      )}
    </div>
  )
}
