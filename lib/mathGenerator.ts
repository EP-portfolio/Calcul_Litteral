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
 * Génère un terme linéaire (degré 1 uniquement, ex: 3x, -2y)
 * Utilisé pour les exercices de développement afin de garantir un résultat max degré 2
 */
export function generateLinearTerm(difficulty: DifficultyLevel, fixedVariable?: string): Term {
  const coef = randomCoefficient(difficulty)
  const varName = fixedVariable || randomVariable(difficulty)

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
 * Utilise uniquement des termes de degré 1 pour garantir que le développement donne max degré 2
 */
export function generateLinearExpression(
  difficulty: DifficultyLevel,
  fixedVariable?: string
): Expression {
  const term1 = generateLinearTerm(difficulty, fixedVariable)
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
 * Génère une expression pour développement avec signe négatif -(a+b)(c+d)
 * Représenté comme (-a-b)(c+d) pour simplifier
 */
export function generateNegativeDoubleParenthesisDevelopment(
  difficulty: DifficultyLevel
): FactoredExpression {
  const varName = randomVariable(difficulty)
  const firstParenthesis = generateLinearExpression(difficulty, varName)
  const secondParenthesis = generateLinearExpression(difficulty, varName)

  // Inverser les signes de la première parenthèse pour représenter le signe négatif
  const negativeFactor: Expression = {
    terms: firstParenthesis.terms.map((term) => ({
      ...term,
      coefficient: -term.coefficient,
    })),
  }

  return {
    factor: negativeFactor,
    multipliedBy: secondParenthesis,
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
 * Garantit qu'après réduction, il reste au moins un terme en x ET un terme constant
 */
export function generateExpressionToReduce(difficulty: DifficultyLevel): Expression {
  const varName = randomVariable(difficulty)

  // 1. Générer l'expression cible réduite (résultat final garanti)
  const targetXCoef = randomCoefficient(difficulty)
  const targetConstant = randomCoefficient(difficulty)

  // 2. Calculer combien de termes supplémentaires ajouter
  const numExtraTerms = difficulty === DifficultyLevel.EASY ? 2 : 4

  // 3. Créer des paires de termes qui contribuent au résultat
  const terms: Term[] = []

  // Répartir targetXCoef en plusieurs termes
  const numXTerms = Math.floor(numExtraTerms / 2) + 1
  const xContributions: number[] = []
  let remainingX = targetXCoef

  for (let i = 0; i < numXTerms - 1; i++) {
    const contrib = randomInt(-10, 10)
    xContributions.push(contrib)
    remainingX -= contrib
  }
  xContributions.push(remainingX)

  // Répartir targetConstant en plusieurs termes
  const numConstTerms = numExtraTerms - Math.floor(numExtraTerms / 2) + 1
  const constContributions: number[] = []
  let remainingConst = targetConstant

  for (let i = 0; i < numConstTerms - 1; i++) {
    const contrib = randomInt(-10, 10)
    constContributions.push(contrib)
    remainingConst -= contrib
  }
  constContributions.push(remainingConst)

  // 4. Créer les termes en x
  for (const coef of xContributions) {
    if (coef !== 0) {
      // Parfois ajouter un exposant 2 pour les difficultés moyennes/difficiles
      const useSquare = difficulty !== DifficultyLevel.EASY && Math.random() > 0.7
      terms.push({
        coefficient: coef,
        variables: [{ name: varName, exponent: useSquare ? 2 : 1 }],
      })
    }
  }

  // 5. Créer les termes constants
  for (const coef of constContributions) {
    if (coef !== 0) {
      terms.push({
        coefficient: coef,
        variables: [],
      })
    }
  }

  // 6. Mélanger aléatoirement les termes
  for (let i = terms.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[terms[i], terms[j]] = [terms[j], terms[i]]
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
      } else if (difficulty === DifficultyLevel.HARD) {
        const rand = Math.random()
        if (rand > 0.66) {
          // 33% de chance d'avoir une identité remarquable
          const identities = Object.values(RemarkableIdentity)
          const randomIdentity = identities[randomInt(0, identities.length - 1)]
          return generateRemarkableIdentity(randomIdentity, difficulty)
        } else if (rand > 0.33) {
          // 33% de chance d'avoir un développement avec signe négatif
          return generateNegativeDoubleParenthesisDevelopment(difficulty)
        } else {
          // 33% de chance d'avoir un développement classique
          return generateDoubleParenthesisDevelopment(difficulty)
        }
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
