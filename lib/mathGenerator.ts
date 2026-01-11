import {
  Term,
  Expression,
  FactoredExpression,
  ExerciseType,
  DifficultyLevel,
  RemarkableIdentity,
} from '@/types/math'

/**
 * Génère un nombre aléatoire entre min et max (inclus)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Génère un coefficient non-nul
 */
function randomCoefficient(difficulty: DifficultyLevel): number {
  let max: number
  switch (difficulty) {
    case DifficultyLevel.EASY:
      max = 5
      break
    case DifficultyLevel.MEDIUM:
      max = 7
      break
    case DifficultyLevel.HARD:
      max = 10
      break
  }

  let coef = randomInt(-max, max)
  while (coef === 0) {
    coef = randomInt(-max, max)
  }
  return coef
}

/**
 * Génère une variable aléatoire
 */
function randomVariable(difficulty: DifficultyLevel): string {
  const vars = difficulty === DifficultyLevel.EASY ? ['x'] : ['x', 'y']
  return vars[randomInt(0, vars.length - 1)]
}

/**
 * Génère un terme simple (ex: 3x, -2y, 5x²)
 */
export function generateSimpleTerm(difficulty: DifficultyLevel, fixedVariable?: string): Term {
  const coef = randomCoefficient(difficulty)
  const varName = fixedVariable || randomVariable(difficulty)

  // Probabilité d'avoir un exposant 2 selon la difficulté
  const hasExponent = difficulty !== DifficultyLevel.EASY && Math.random() > 0.5

  if (hasExponent) {
    return {
      coefficient: coef,
      variables: [{ name: varName, exponent: 2 }],
    }
  }

  return {
    coefficient: coef,
    variables: [{ name: varName, exponent: 1 }],
  }
}

/**
 * Génère un terme constant
 */
export function generateConstantTerm(difficulty: DifficultyLevel): Term {
  return {
    coefficient: randomCoefficient(difficulty),
    variables: [],
  }
}

/**
 * Génère une expression linéaire simple (ex: 2x + 3)
 */
export function generateLinearExpression(
  difficulty: DifficultyLevel,
  fixedVariable?: string
): Expression {
  const term1 = generateSimpleTerm(difficulty, fixedVariable)
  const term2 = generateConstantTerm(difficulty)

  return {
    terms: [term1, term2],
  }
}

/**
 * Génère une expression pour développement k(a+b)
 */
export function generateSimpleDevelopment(difficulty: DifficultyLevel): FactoredExpression {
  const k = randomCoefficient(difficulty)
  const factor: Expression = {
    terms: [{ coefficient: k, variables: [] }],
  }

  const varName = randomVariable(difficulty)
  const expression = generateLinearExpression(difficulty, varName)

  return {
    factor,
    multipliedBy: expression,
  }
}

/**
 * Génère une expression pour développement (a+b)(c+d)
 */
export function generateDoubleParenthesisDevelopment(
  difficulty: DifficultyLevel
): FactoredExpression {
  const varName = randomVariable(difficulty)
  const factor = generateLinearExpression(difficulty, varName)
  const multipliedBy = generateLinearExpression(difficulty, varName)

  return {
    factor,
    multipliedBy,
  }
}

/**
 * Génère une identité remarquable
 */
export function generateRemarkableIdentity(
  type: RemarkableIdentity,
  difficulty: DifficultyLevel
): FactoredExpression {
  const a = randomCoefficient(difficulty)
  const b = randomCoefficient(difficulty)
  const varName = randomVariable(difficulty)

  switch (type) {
    case RemarkableIdentity.SQUARE_SUM: {
      // (ax + b)²
      const term1: Term = {
        coefficient: a,
        variables: [{ name: varName, exponent: 1 }],
      }
      const term2: Term = { coefficient: b, variables: [] }
      const expression: Expression = { terms: [term1, term2] }

      return {
        factor: expression,
        multipliedBy: expression, // Même expression car c'est un carré
      }
    }

    case RemarkableIdentity.SQUARE_DIFFERENCE: {
      // (ax - b)²
      const term1: Term = {
        coefficient: a,
        variables: [{ name: varName, exponent: 1 }],
      }
      const term2: Term = { coefficient: -Math.abs(b), variables: [] }
      const expression: Expression = { terms: [term1, term2] }

      return {
        factor: expression,
        multipliedBy: expression,
      }
    }

    case RemarkableIdentity.DIFFERENCE_OF_SQUARES: {
      // (ax + b)(ax - b)
      const term1: Term = {
        coefficient: a,
        variables: [{ name: varName, exponent: 1 }],
      }
      const term2Pos: Term = { coefficient: Math.abs(b), variables: [] }
      const term2Neg: Term = { coefficient: -Math.abs(b), variables: [] }

      return {
        factor: { terms: [term1, term2Pos] },
        multipliedBy: { terms: [term1, term2Neg] },
      }
    }
  }
}

/**
 * Génère une expression à réduire (plusieurs termes similaires)
 */
export function generateExpressionToReduce(difficulty: DifficultyLevel): Expression {
  const numTerms = difficulty === DifficultyLevel.EASY ? 3 : 5
  const terms: Term[] = []
  const varName = randomVariable(difficulty)

  for (let i = 0; i < numTerms; i++) {
    if (Math.random() > 0.5) {
      terms.push(generateSimpleTerm(difficulty, varName))
    } else {
      terms.push(generateConstantTerm(difficulty))
    }
  }

  return { terms }
}

/**
 * Génère une expression selon le type d'exercice
 */
export function generateExercise(
  type: ExerciseType,
  difficulty: DifficultyLevel
): FactoredExpression | Expression {
  switch (type) {
    case ExerciseType.DEVELOPMENT:
      if (difficulty === DifficultyLevel.EASY) {
        return generateSimpleDevelopment(difficulty)
      } else if (difficulty === DifficultyLevel.HARD && Math.random() > 0.5) {
        // 50% de chance d'avoir une identité remarquable en difficulté difficile
        const identities = Object.values(RemarkableIdentity)
        const randomIdentity = identities[randomInt(0, identities.length - 1)]
        return generateRemarkableIdentity(randomIdentity, difficulty)
      } else {
        return generateDoubleParenthesisDevelopment(difficulty)
      }

    case ExerciseType.REDUCTION:
      return generateExpressionToReduce(difficulty)

    case ExerciseType.FACTORIZATION:
      // Pour la factorisation, on va générer le développé et demander de factoriser
      // On commence simple avec k(a+b) développé = ka + kb
      const k = randomCoefficient(difficulty)
      const varName = randomVariable(difficulty)
      const expr = generateLinearExpression(difficulty, varName)

      // On développe k × expr pour créer l'expression à factoriser
      const developedTerms = expr.terms.map((term) => ({
        coefficient: term.coefficient * k,
        variables: term.variables,
      }))

      return { terms: developedTerms }
  }
}
