import { areExpressionsEquivalent, parseExpression, expressionToString } from '../mathComparator'
import { Expression } from '@/types/math'

describe('mathComparator', () => {
  describe('areExpressionsEquivalent', () => {
    it('should recognize equivalent expressions', () => {
      // 3x + 2 == 2 + 3x
      const expr1: Expression = {
        terms: [
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 2, variables: [] },
        ],
      }

      const expr2: Expression = {
        terms: [
          { coefficient: 2, variables: [] },
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
        ],
      }

      expect(areExpressionsEquivalent(expr1, expr2)).toBe(true)
    })

    it('should recognize non-equivalent expressions', () => {
      // 3x + 2 != 3x + 5
      const expr1: Expression = {
        terms: [
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 2, variables: [] },
        ],
      }

      const expr2: Expression = {
        terms: [
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 5, variables: [] },
        ],
      }

      expect(areExpressionsEquivalent(expr1, expr2)).toBe(false)
    })

    it('should handle expressions that need reduction', () => {
      // 2x + x == 3x
      const expr1: Expression = {
        terms: [
          { coefficient: 2, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 1, variables: [{ name: 'x', exponent: 1 }] },
        ],
      }

      const expr2: Expression = {
        terms: [{ coefficient: 3, variables: [{ name: 'x', exponent: 1 }] }],
      }

      expect(areExpressionsEquivalent(expr1, expr2)).toBe(true)
    })
  })

  describe('parseExpression', () => {
    it('should parse simple linear expression', () => {
      const result = parseExpression('3x + 2')
      expect(result).not.toBeNull()
      expect(result?.terms).toHaveLength(2)
      expect(result?.terms[0].coefficient).toBe(3)
      expect(result?.terms[1].coefficient).toBe(2)
    })

    it('should parse expression with exponents', () => {
      const result = parseExpression('2x^2 + 3x + 1')
      expect(result).not.toBeNull()
      expect(result?.terms).toHaveLength(3)
      expect(result?.terms[0].variables[0].exponent).toBe(2)
    })

    it('should handle negative coefficients', () => {
      const result = parseExpression('3x - 2')
      expect(result).not.toBeNull()
      expect(result?.terms).toHaveLength(2)
      expect(result?.terms[0].coefficient).toBe(3)
      expect(result?.terms[1].coefficient).toBe(-2)
    })

    it('should handle expressions without spaces', () => {
      const result = parseExpression('3x+2')
      expect(result).not.toBeNull()
      expect(result?.terms).toHaveLength(2)
    })

    it('should parse constant', () => {
      const result = parseExpression('5')
      expect(result).not.toBeNull()
      expect(result?.terms).toHaveLength(1)
      expect(result?.terms[0].coefficient).toBe(5)
      expect(result?.terms[0].variables).toHaveLength(0)
    })

    it('should parse variable without coefficient', () => {
      const result = parseExpression('x')
      expect(result).not.toBeNull()
      expect(result?.terms[0].coefficient).toBe(1)
    })

    it('should return null for invalid input', () => {
      const result = parseExpression('')
      expect(result).toBeNull()
    })

    it('should parse factored expressions with parentheses', () => {
      // 3(x+2) devrait donner 3x + 6
      const result = parseExpression('3(x+2)')
      expect(result).not.toBeNull()
      expect(result?.terms).toHaveLength(2)
      expect(result?.terms[0].coefficient).toBe(3)
      expect(result?.terms[0].variables[0].name).toBe('x')
      expect(result?.terms[1].coefficient).toBe(6)
    })

    it('should parse factored expressions with and without spaces', () => {
      // 3(x+3) == 3(x + 3)
      const result1 = parseExpression('3(x+3)')
      const result2 = parseExpression('3(x + 3)')
      expect(result1).not.toBeNull()
      expect(result2).not.toBeNull()
      expect(areExpressionsEquivalent(result1!, result2!)).toBe(true)
    })

    it('should parse negative factored expressions', () => {
      // -2(x+1) devrait donner -2x - 2
      const result = parseExpression('-2(x+1)')
      expect(result).not.toBeNull()
      expect(result?.terms).toHaveLength(2)
      expect(result?.terms[0].coefficient).toBe(-2)
      expect(result?.terms[1].coefficient).toBe(-2)
    })
  })

  describe('expressionToString', () => {
    it('should convert simple expression to string', () => {
      const expr: Expression = {
        terms: [
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 2, variables: [] },
        ],
      }

      const result = expressionToString(expr)
      expect(result).toBe('3x + 2')
    })

    it('should handle negative coefficients', () => {
      const expr: Expression = {
        terms: [
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: -2, variables: [] },
        ],
      }

      const result = expressionToString(expr)
      expect(result).toBe('3x - 2')
    })

    it('should handle exponents', () => {
      const expr: Expression = {
        terms: [
          { coefficient: 2, variables: [{ name: 'x', exponent: 2 }] },
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 1, variables: [] },
        ],
      }

      const result = expressionToString(expr)
      expect(result).toBe('2x^2 + 3x + 1')
    })

    it('should handle zero expression', () => {
      const expr: Expression = { terms: [] }
      const result = expressionToString(expr)
      expect(result).toBe('0')
    })
  })
})
