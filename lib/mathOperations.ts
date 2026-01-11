import { Term, Expression, FactoredExpression, Variable } from '@/types/math'

/**
 * Compare deux variables pour le tri
 */
function compareVariables(a: Variable, b: Variable): number {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return b.exponent - a.exponent
}

/**
 * Compare deux termes pour le tri (par variables puis par coefficient)
 */
function compareTerms(a: Term, b: Term): number {
  // D'abord comparer par nombre de variables
  if (a.variables.length !== b.variables.length) {
    return b.variables.length - a.variables.length
  }

  // Ensuite comparer variable par variable
  for (let i = 0; i < a.variables.length; i++) {
    const comp = compareVariables(a.variables[i], b.variables[i])
    if (comp !== 0) return comp
  }

  // Enfin par coefficient
  return b.coefficient - a.coefficient
}

/**
 * Vérifie si deux termes ont les mêmes variables (donc sont similaires)
 */
function haveSameVariables(term1: Term, term2: Term): boolean {
  if (term1.variables.length !== term2.variables.length) return false

  const vars1 = [...term1.variables].sort(compareVariables)
  const vars2 = [...term2.variables].sort(compareVariables)

  for (let i = 0; i < vars1.length; i++) {
    if (vars1[i].name !== vars2[i].name || vars1[i].exponent !== vars2[i].exponent) {
      return false
    }
  }

  return true
}

/**
 * Multiplie deux termes
 */
function multiplyTerms(term1: Term, term2: Term): Term {
  const coefficient = term1.coefficient * term2.coefficient

  // Fusionner les variables
  const variableMap = new Map<string, number>()

  // Ajouter les variables du premier terme
  term1.variables.forEach((v) => {
    variableMap.set(v.name, (variableMap.get(v.name) || 0) + v.exponent)
  })

  // Ajouter les variables du second terme
  term2.variables.forEach((v) => {
    variableMap.set(v.name, (variableMap.get(v.name) || 0) + v.exponent)
  })

  // Convertir en tableau de variables
  const variables: Variable[] = []
  variableMap.forEach((exponent, name) => {
    if (exponent !== 0) {
      variables.push({ name, exponent })
    }
  })

  variables.sort(compareVariables)

  return { coefficient, variables }
}

/**
 * Développe une expression factorisée
 * Supporte k(a+b) et (a+b)(c+d)
 */
export function develop(factored: FactoredExpression): Expression {
  const { factor, multipliedBy } = factored

  // Si factor n'a qu'un terme constant, c'est k(a+b)
  if (factor.terms.length === 1 && factor.terms[0].variables.length === 0) {
    // k(a+b) = ka + kb
    const k = factor.terms[0].coefficient
    const developedTerms = multipliedBy.terms.map((term) => ({
      coefficient: term.coefficient * k,
      variables: term.variables,
    }))

    return { terms: developedTerms }
  }

  // Sinon c'est (a+b)(c+d)
  const developedTerms: Term[] = []

  // Multiplier chaque terme de factor avec chaque terme de multipliedBy
  factor.terms.forEach((term1) => {
    multipliedBy.terms.forEach((term2) => {
      developedTerms.push(multiplyTerms(term1, term2))
    })
  })

  return { terms: developedTerms }
}

/**
 * Réduit une expression (regroupe les termes similaires)
 */
export function reduce(expression: Expression): Expression {
  if (expression.terms.length === 0) {
    return { terms: [] }
  }

  // Grouper les termes similaires
  const termGroups: Term[][] = []

  expression.terms.forEach((term) => {
    // Trouver un groupe existant avec les mêmes variables
    const existingGroup = termGroups.find((group) => haveSameVariables(group[0], term))

    if (existingGroup) {
      existingGroup.push(term)
    } else {
      termGroups.push([term])
    }
  })

  // Réduire chaque groupe en un seul terme
  const reducedTerms: Term[] = termGroups.map((group) => {
    const totalCoefficient = group.reduce((sum, term) => sum + term.coefficient, 0)

    return {
      coefficient: totalCoefficient,
      variables: group[0].variables,
    }
  })

  // Filtrer les termes avec coefficient 0
  const nonZeroTerms = reducedTerms.filter((term) => term.coefficient !== 0)

  // Si tous les termes sont 0, retourner 0
  if (nonZeroTerms.length === 0) {
    return { terms: [{ coefficient: 0, variables: [] }] }
  }

  // Trier les termes
  nonZeroTerms.sort(compareTerms)

  return { terms: nonZeroTerms }
}

/**
 * Trouve le plus grand commun diviseur (PGCD) de plusieurs nombres
 */
function gcd(numbers: number[]): number {
  if (numbers.length === 0) return 1

  const gcd2 = (a: number, b: number): number => {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) {
      const t = b
      b = a % b
      a = t
    }
    return a
  }

  return numbers.reduce((acc, num) => gcd2(acc, Math.abs(num)))
}

/**
 * Factorise une expression (extrait le facteur commun)
 * Retourne null si pas de factorisation possible
 */
export function factorize(expression: Expression): FactoredExpression | null {
  if (expression.terms.length < 2) {
    return null
  }

  // Trouver le PGCD des coefficients
  const coefficients = expression.terms.map((t) => t.coefficient)
  const commonCoef = gcd(coefficients)

  if (commonCoef === 0 || commonCoef === 1) {
    return null // Pas de facteur commun significatif
  }

  // Diviser tous les termes par le facteur commun
  const factoredTerms = expression.terms.map((term) => ({
    coefficient: term.coefficient / commonCoef,
    variables: term.variables,
  }))

  return {
    factor: { terms: [{ coefficient: commonCoef, variables: [] }] },
    multipliedBy: { terms: factoredTerms },
  }
}

/**
 * Développe ET réduit une expression factorisée en une seule étape
 */
export function developAndReduce(factored: FactoredExpression): Expression {
  const developed = develop(factored)
  return reduce(developed)
}
