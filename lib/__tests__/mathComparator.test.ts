import {
  areExpressionsEquivalent,
  parseExpression,
  expressionToString,
} from '../mathComparator'
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
