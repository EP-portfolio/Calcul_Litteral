import { develop, reduce, factorize, developAndReduce } from '../mathOperations'
import { Expression, FactoredExpression } from '@/types/math'

describe('mathOperations', () => {
  describe('develop', () => {
    it('should develop k(a+b) correctly', () => {
      // 2(x + 3) = 2x + 6
      const factored: FactoredExpression = {
        factor: { terms: [{ coefficient: 2, variables: [] }] },
        multipliedBy: {
          terms: [
            { coefficient: 1, variables: [{ name: 'x', exponent: 1 }] },
            { coefficient: 3, variables: [] },
          ],
        },
      }

      const result = develop(factored)
      expect(result.terms).toHaveLength(2)
      expect(result.terms[0]).toEqual({
        coefficient: 2,
        variables: [{ name: 'x', exponent: 1 }],
      })
      expect(result.terms[1]).toEqual({ coefficient: 6, variables: [] })
    })

    it('should develop (a+b)(c+d) correctly', () => {
      // (x + 2)(x + 3) = x² + 3x + 2x + 6
      const factored: FactoredExpression = {
        factor: {
          terms: [
            { coefficient: 1, variables: [{ name: 'x', exponent: 1 }] },
            { coefficient: 2, variables: [] },
          ],
        },
        multipliedBy: {
          terms: [
            { coefficient: 1, variables: [{ name: 'x', exponent: 1 }] },
            { coefficient: 3, variables: [] },
          ],
        },
      }

      const result = develop(factored)
      expect(result.terms).toHaveLength(4)
    })

    it('should handle negative coefficients', () => {
      // -3(x - 2) = -3x + 6
      const factored: FactoredExpression = {
        factor: { terms: [{ coefficient: -3, variables: [] }] },
        multipliedBy: {
          terms: [
            { coefficient: 1, variables: [{ name: 'x', exponent: 1 }] },
            { coefficient: -2, variables: [] },
          ],
        },
      }

      const result = develop(factored)
      expect(result.terms[0]).toEqual({
        coefficient: -3,
        variables: [{ name: 'x', exponent: 1 }],
      })
      expect(result.terms[1]).toEqual({ coefficient: 6, variables: [] })
    })
  })

  describe('reduce', () => {
    it('should combine like terms', () => {
      // 3x + 2x = 5x
      const expr: Expression = {
        terms: [
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 2, variables: [{ name: 'x', exponent: 1 }] },
        ],
      }

      const result = reduce(expr)
      expect(result.terms).toHaveLength(1)
      expect(result.terms[0]).toEqual({
        coefficient: 5,
        variables: [{ name: 'x', exponent: 1 }],
      })
    })

    it('should handle constants separately', () => {
      // 3x + 2 + 4x + 5 = 7x + 7
      const expr: Expression = {
        terms: [
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 2, variables: [] },
          { coefficient: 4, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 5, variables: [] },
        ],
      }

      const result = reduce(expr)
      expect(result.terms).toHaveLength(2)
      expect(result.terms[0].coefficient).toBe(7)
      expect(result.terms[1].coefficient).toBe(7)
    })

    it('should remove terms with zero coefficient', () => {
      // 3x - 3x = 0
      const expr: Expression = {
        terms: [
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: -3, variables: [{ name: 'x', exponent: 1 }] },
        ],
      }

      const result = reduce(expr)
      expect(result.terms).toHaveLength(1)
      expect(result.terms[0]).toEqual({ coefficient: 0, variables: [] })
    })

    it('should handle different exponents separately', () => {
      // 2x² + 3x + x² = 3x² + 3x
      const expr: Expression = {
        terms: [
          { coefficient: 2, variables: [{ name: 'x', exponent: 2 }] },
          { coefficient: 3, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 1, variables: [{ name: 'x', exponent: 2 }] },
        ],
      }

      const result = reduce(expr)
      expect(result.terms).toHaveLength(2)
    })
  })

  describe('factorize', () => {
    it('should extract common factor', () => {
      // 6x + 9 = 3(2x + 3)
      const expr: Expression = {
        terms: [
          { coefficient: 6, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 9, variables: [] },
        ],
      }

      const result = factorize(expr)
      expect(result).not.toBeNull()
      expect(result?.factor.terms[0].coefficient).toBe(3)
    })

    it('should return null when no common factor', () => {
      // 5x + 7 (no common factor)
      const expr: Expression = {
        terms: [
          { coefficient: 5, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: 7, variables: [] },
        ],
      }

      const result = factorize(expr)
      expect(result).toBeNull()
    })

    it('should handle negative coefficients', () => {
      // -4x - 8 = -4(x + 2)
      const expr: Expression = {
        terms: [
          { coefficient: -4, variables: [{ name: 'x', exponent: 1 }] },
          { coefficient: -8, variables: [] },
        ],
      }

      const result = factorize(expr)
      expect(result).not.toBeNull()
      expect(Math.abs(result?.factor.terms[0].coefficient || 0)).toBe(4)
    })
  })

  describe('developAndReduce', () => {
    it('should develop and reduce in one step', () => {
      // (x + 1)(x + 2) = x² + 2x + x + 2 = x² + 3x + 2
      const factored: FactoredExpression = {
        factor: {
          terms: [
            { coefficient: 1, variables: [{ name: 'x', exponent: 1 }] },
            { coefficient: 1, variables: [] },
          ],
        },
        multipliedBy: {
          terms: [
            { coefficient: 1, variables: [{ name: 'x', exponent: 1 }] },
            { coefficient: 2, variables: [] },
          ],
        },
      }

      const result = developAndReduce(factored)
      expect(result.terms).toHaveLength(3)
      // x²
      expect(result.terms[0]).toEqual({
        coefficient: 1,
        variables: [{ name: 'x', exponent: 2 }],
      })
      // 3x (2x + x réduits)
      expect(result.terms[1]).toEqual({
        coefficient: 3,
        variables: [{ name: 'x', exponent: 1 }],
      })
      // 2
      expect(result.terms[2]).toEqual({ coefficient: 2, variables: [] })
    })
  })
})
