import { Term, Expression, FactoredExpression } from '@/types/math'
import { reduce } from './mathOperations'

/**
 * Compare deux expressions algébriques pour vérifier si elles sont équivalentes
 */
export function areExpressionsEquivalent(expr1: Expression, expr2: Expression): boolean {
  // Réduire les deux expressions
  const reduced1 = reduce(expr1)
  const reduced2 = reduce(expr2)

  // Vérifier qu'elles ont le même nombre de termes
  if (reduced1.terms.length !== reduced2.terms.length) {
    return false
  }

  // Trier les termes (ils sont déjà triés après reduce)
  // Comparer terme par terme
  for (let i = 0; i < reduced1.terms.length; i++) {
    if (!areTermsEqual(reduced1.terms[i], reduced2.terms[i])) {
      return false
    }
  }

  return true
}

/**
 * Compare deux termes pour vérifier s'ils sont égaux
 */
function areTermsEqual(term1: Term, term2: Term): boolean {
  // Comparer les coefficients
  if (term1.coefficient !== term2.coefficient) {
    return false
  }

  // Comparer les variables
  if (term1.variables.length !== term2.variables.length) {
    return false
  }

  // Les variables doivent être triées
  for (let i = 0; i < term1.variables.length; i++) {
    const v1 = term1.variables[i]
    const v2 = term2.variables[i]

    if (v1.name !== v2.name || v1.exponent !== v2.exponent) {
      return false
    }
  }

  return true
}

/**
 * Développe les parenthèses dans une expression (ex: "3(x+2)" devient "3x+6")
 */
function expandParentheses(input: string): string {
  let result = input

  // Regex pour trouver les expressions du type: nombre(expression)
  const pattern = /(-?\d*\.?\d*)\(([^()]+)\)/g

  while (pattern.test(result)) {
    result = result.replace(pattern, (match, coefficient, inside) => {
      // Si pas de coefficient explicite, c'est 1
      const coef =
        coefficient === '' || coefficient === '+'
          ? 1
          : coefficient === '-'
            ? -1
            : parseFloat(coefficient)

      // Parser l'expression à l'intérieur
      const insideExpr = parseSimpleExpression(inside, coef)
      return insideExpr
    })
    pattern.lastIndex = 0
  }

  return result
}

/**
 * Parse et multiplie une expression simple par un coefficient
 */
function parseSimpleExpression(expr: string, multiplier: number): string {
  const terms: string[] = []
  let currentTerm = ''
  let sign = 1

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i]

    if (char === '+' || char === '-') {
      if (currentTerm) {
        terms.push(multiplyTerm(currentTerm, sign * multiplier))
      }
      currentTerm = ''
      sign = char === '+' ? 1 : -1
    } else {
      currentTerm += char
    }
  }

  if (currentTerm) {
    terms.push(multiplyTerm(currentTerm, sign * multiplier))
  }

  return terms.join('')
}

/**
 * Multiplie un terme par un coefficient et retourne la string formatée
 */
function multiplyTerm(term: string, multiplier: number): string {
  // Extraire le coefficient du terme
  const coeffMatch = term.match(/^(-?\d*\.?\d*)(.*)/)
  if (!coeffMatch) return term

  const termCoef =
    coeffMatch[1] === '' || coeffMatch[1] === '+'
      ? 1
      : coeffMatch[1] === '-'
        ? -1
        : parseFloat(coeffMatch[1])
  const variables = coeffMatch[2]

  const result = termCoef * multiplier

  if (result === 0) return ''

  const sign = result > 0 ? '+' : ''
  const absResult = Math.abs(result)

  if (variables) {
    return `${sign}${absResult === 1 ? '' : result}${variables}`
  } else {
    return `${sign}${result}`
  }
}

/**
 * Parse une chaîne de caractères en Expression
 * Supporte: "3x^2 + 2x - 5", "x + 1", "5", "3(x+2)", etc.
 */
export function parseExpression(input: string): Expression | null {
  try {
    // Nettoyer l'input
    let cleaned = input.replace(/\s/g, '') // Enlever les espaces
    if (!cleaned) return null

    // Remplacer les ** par ^ pour uniformiser
    cleaned = cleaned.replace(/\*\*/g, '^')

    // Développer les parenthèses si présentes
    cleaned = expandParentheses(cleaned)

    const terms: Term[] = []
    let currentTerm = ''
    let sign = 1

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i]

      if (char === '+' || char === '-') {
        // Fin d'un terme
        if (currentTerm) {
          const term = parseTerm(currentTerm, sign)
          if (term) terms.push(term)
        }
        currentTerm = ''
        sign = char === '+' ? 1 : -1
      } else {
        currentTerm += char
      }
    }

    // Dernier terme
    if (currentTerm) {
      const term = parseTerm(currentTerm, sign)
      if (term) terms.push(term)
    }

    return terms.length > 0 ? { terms } : null
  } catch (e) {
    return null
  }
}

/**
 * Parse un terme individuel (ex: "3x^2", "2xy", "5", "x")
 */
function parseTerm(termStr: string, sign: number): Term | null {
  try {
    // Cas spécial : terme vide
    if (!termStr) return null

    let coefficient = sign
    let remainingStr = termStr

    // Extraire le coefficient numérique
    const coeffMatch = termStr.match(/^(-?\d+\.?\d*)/)
    if (coeffMatch) {
      coefficient = sign * parseFloat(coeffMatch[0])
      remainingStr = termStr.slice(coeffMatch[0].length)
    }

    // Si pas de variables, c'est un terme constant
    if (!remainingStr) {
      return { coefficient, variables: [] }
    }

    // Parser les variables
    const variables: { name: string; exponent: number }[] = []
    let i = 0

    while (i < remainingStr.length) {
      const varName = remainingStr[i]

      // Vérifier si c'est une lettre
      if (!/[a-z]/i.test(varName)) {
        i++
        continue
      }

      let exponent = 1

      // Vérifier s'il y a un exposant
      if (i + 1 < remainingStr.length && remainingStr[i + 1] === '^') {
        i += 2 // Sauter le ^
        let expStr = ''
        while (i < remainingStr.length && /\d/.test(remainingStr[i])) {
          expStr += remainingStr[i]
          i++
        }
        exponent = parseInt(expStr) || 1
      } else {
        i++
      }

      variables.push({ name: varName, exponent })
    }

    return { coefficient, variables }
  } catch (e) {
    return null
  }
}

/**
 * Convertit une FactoredExpression en chaîne de caractères lisible
 */
export function factoredExpressionToString(factored: FactoredExpression): string {
  const factorStr = expressionToString(factored.factor)
  const multipliedByStr = expressionToString(factored.multipliedBy)
  return `${factorStr}(${multipliedByStr})`
}

/**
 * Convertit une Expression en chaîne de caractères lisible
 */
export function expressionToString(expr: Expression): string {
  if (expr.terms.length === 0) return '0'

  return expr.terms
    .map((term, index) => {
      let str = ''

      // Ajouter le signe
      if (index > 0) {
        str += term.coefficient >= 0 ? ' + ' : ' - '
      } else if (term.coefficient < 0) {
        str += '-'
      }

      // Coefficient
      const absCoef = Math.abs(term.coefficient)
      if (term.variables.length === 0) {
        // Terme constant
        str += absCoef.toString()
      } else if (absCoef !== 1) {
        str += absCoef.toString()
      }

      // Variables
      term.variables.forEach((v) => {
        str += v.name
        if (v.exponent !== 1) {
          str += `^${v.exponent}`
        }
      })

      return str
    })
    .join('')
}
