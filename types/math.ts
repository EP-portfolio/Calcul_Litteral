/**
 * Types pour le moteur de calcul littéral
 */

/**
 * Représente une variable avec son exposant (ex: x, y, x², xy)
 */
export interface Variable {
  name: string // 'x', 'y'
  exponent: number // 1 pour x, 2 pour x², etc.
}

/**
 * Représente un terme algébrique (ex: 3x², -2xy, 5)
 * Un terme = coefficient × produit de variables
 */
export interface Term {
  coefficient: number // ex: 3, -2, 5
  variables: Variable[] // ex: [{name: 'x', exponent: 2}], [{name: 'x', exponent: 1}, {name: 'y', exponent: 1}]
}

/**
 * Représente une expression algébrique (somme de termes)
 * ex: 3x² + 2x - 5 = [Term, Term, Term]
 */
export interface Expression {
  terms: Term[]
}

/**
 * Représente une expression factorisée (ex: k(a + b) ou (a+b)(c+d))
 */
export interface FactoredExpression {
  factor: Expression // le facteur commun ou premier facteur
  multipliedBy: Expression // l'expression entre parenthèses ou second facteur
}

/**
 * Types d'exercices disponibles
 */
export enum ExerciseType {
  DEVELOPMENT = 'development', // Développer (a+b)(c+d) ou k(a+b)
  REDUCTION = 'reduction', // Réduire une expression
  FACTORIZATION = 'factorization', // Factoriser une expression
}

/**
 * Niveaux de difficulté
 */
export enum DifficultyLevel {
  EASY = 'easy', // Coefficients simples, 1-2 variables
  MEDIUM = 'medium', // Coefficients moyens, 2-3 variables
  HARD = 'hard', // Coefficients complexes, identités remarquables
}

/**
 * Représente un exercice
 */
export interface Exercise {
  id: string
  type: ExerciseType
  difficulty: DifficultyLevel
  question: Expression | FactoredExpression
  correctAnswer: Expression
  userAnswer?: Expression
  isCorrect?: boolean
  explanation?: string[]
}

/**
 * Identités remarquables
 */
export enum RemarkableIdentity {
  SQUARE_SUM = 'square_sum', // (a+b)² = a² + 2ab + b²
  SQUARE_DIFFERENCE = 'square_difference', // (a-b)² = a² - 2ab + b²
  DIFFERENCE_OF_SQUARES = 'difference_of_squares', // (a+b)(a-b) = a² - b²
}
