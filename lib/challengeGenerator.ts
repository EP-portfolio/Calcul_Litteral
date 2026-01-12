import { ExerciseType, DifficultyLevel } from '@/types/math'
import { generateExercise } from './mathGenerator'
import { Difficulty, Competence } from '@/types/database'

// Mapping entre les types de la DB et les enums existants
export const DIFFICULTY_MAP: Record<Difficulty, DifficultyLevel> = {
  facile: DifficultyLevel.EASY,
  moyen: DifficultyLevel.MEDIUM,
  difficile: DifficultyLevel.HARD,
}

export const COMPETENCE_MAP: Record<Competence, ExerciseType> = {
  developpement: ExerciseType.DEVELOPMENT,
  reduction: ExerciseType.REDUCTION,
  factorisation: ExerciseType.FACTORIZATION,
}

export interface ChallengeExercise {
  id: string
  question: any // FactoredExpression | Expression
  expectedAnswer: string
  competence: Competence
  difficulty: Difficulty
}

export interface Challenge {
  competence: Competence
  difficulty: Difficulty
  exercises: ChallengeExercise[]
}

/**
 * Génère un challenge de 5 exercices pour une compétence et difficulté données
 */
export function generateChallenge(competence: Competence, difficulty: Difficulty): Challenge {
  const exerciseType = COMPETENCE_MAP[competence]
  const difficultyLevel = DIFFICULTY_MAP[difficulty]
  const exercises: ChallengeExercise[] = []

  for (let i = 0; i < 5; i++) {
    const question = generateExercise(exerciseType, difficultyLevel)
    const exerciseId = `${competence}-${difficulty}-${Date.now()}-${i}`

    exercises.push({
      id: exerciseId,
      question,
      expectedAnswer: '', // Sera calculé par le moteur de vérification
      competence,
      difficulty,
    })
  }

  return {
    competence,
    difficulty,
    exercises,
  }
}

/**
 * Génère tous les challenges possibles (3 compétences × 3 difficultés = 9 challenges)
 */
export function generateAllChallenges(): Challenge[] {
  const competences: Competence[] = ['developpement', 'reduction', 'factorisation']
  const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile']
  const challenges: Challenge[] = []

  for (const competence of competences) {
    for (const difficulty of difficulties) {
      challenges.push(generateChallenge(competence, difficulty))
    }
  }

  return challenges
}

/**
 * Obtient un titre descriptif pour un challenge
 */
export function getChallengeTitle(competence: Competence, difficulty: Difficulty): string {
  const competenceLabels: Record<Competence, string> = {
    developpement: 'Développement',
    reduction: 'Réduction',
    factorisation: 'Factorisation',
  }

  const difficultyLabels: Record<Difficulty, string> = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile',
  }

  return `${competenceLabels[competence]} - ${difficultyLabels[difficulty]}`
}

/**
 * Obtient une description pour un challenge
 */
export function getChallengeDescription(competence: Competence, difficulty: Difficulty): string {
  const descriptions: Record<Competence, string> = {
    developpement:
      'Développez et réduisez les expressions algébriques en appliquant la distributivité.',
    reduction: 'Regroupez les termes semblables pour réduire les expressions au maximum.',
    factorisation: 'Identifiez le facteur commun et factorisez les expressions algébriques.',
  }

  const difficultyDescriptions: Record<Difficulty, string> = {
    facile: 'Exercices avec des coefficients simples et peu de termes.',
    moyen: 'Exercices avec des coefficients plus grands et plusieurs termes.',
    difficile: 'Exercices avancés avec identités remarquables et expressions complexes.',
  }

  return `${descriptions[competence]} ${difficultyDescriptions[difficulty]}`
}
