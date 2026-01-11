'use client'

import { useState, useEffect } from 'react'
import ExerciseCard from '@/components/ExerciseCard'
import { Expression, FactoredExpression, DifficultyLevel, ExerciseType } from '@/types/math'
import { generateExercise } from '@/lib/mathGenerator'
import { developAndReduce, reduce, factorize } from '@/lib/mathOperations'
import { parseExpression, areExpressionsEquivalent } from '@/lib/mathComparator'

export default function MixtePage() {
  const [exercise, setExercise] = useState<Expression | FactoredExpression | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<Expression | null>(null)
  const [exerciseCount, setExerciseCount] = useState(0)
  const [currentType, setCurrentType] = useState<ExerciseType>(ExerciseType.DEVELOPMENT)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY)

  const generateNewExercise = () => {
    // Choisir aléatoirement un type d'exercice
    const types = [ExerciseType.DEVELOPMENT, ExerciseType.REDUCTION, ExerciseType.FACTORIZATION]
    const randomType = types[Math.floor(Math.random() * types.length)]

    const newExercise = generateExercise(randomType, difficulty)

    let answer: Expression

    if (randomType === ExerciseType.DEVELOPMENT) {
      answer = developAndReduce(newExercise as FactoredExpression)
    } else if (randomType === ExerciseType.REDUCTION) {
      answer = reduce(newExercise as Expression)
    } else {
      // Factorization
      answer = newExercise as Expression
    }

    setExercise(newExercise)
    setCorrectAnswer(answer)
    setCurrentType(randomType)
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

    const isCorrect = areExpressionsEquivalent(parsedAnswer, correctAnswer)

    let explanation: string[] | undefined

    if (!isCorrect) {
      if (currentType === ExerciseType.DEVELOPMENT) {
        explanation = [
          "N'oubliez pas de développer tous les termes",
          'Puis regroupez les termes semblables',
        ]
      } else if (currentType === ExerciseType.REDUCTION) {
        explanation = [
          'Regroupez les termes qui ont les mêmes variables',
          'Additionnez leurs coefficients',
        ]
      } else {
        explanation = [
          'Cherchez le facteur commun à tous les termes',
          'Mettez-le en facteur : k(expression)',
        ]
      }
    } else if (currentType === ExerciseType.FACTORIZATION) {
      const factorized = factorize(correctAnswer)
      explanation = factorized
        ? ['Vous avez trouvé la bonne factorisation !']
        : ['Bonne réponse ! Cette expression est déjà sous forme réduite.']
    }

    return { isCorrect, explanation }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Mode Mixte</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Exercices variés : développement, réduction et factorisation
        </p>
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
          exerciseNumber={exerciseCount}
          type={
            currentType === ExerciseType.DEVELOPMENT
              ? 'development'
              : currentType === ExerciseType.REDUCTION
                ? 'reduction'
                : 'factorization'
          }
        />
      )}
    </div>
  )
}
