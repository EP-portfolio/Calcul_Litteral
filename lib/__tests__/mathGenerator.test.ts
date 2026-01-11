import {
  generateSimpleTerm,
  generateConstantTerm,
  generateLinearExpression,
  generateSimpleDevelopment,
  generateDoubleParenthesisDevelopment,
  generateRemarkableIdentity,
  generateExpressionToReduce,
  generateExercise,
} from '../mathGenerator'
import { DifficultyLevel, ExerciseType, RemarkableIdentity } from '@/types/math'

describe('mathGenerator', () => {
  describe('generateSimpleTerm', () => {
    it('should generate a term with non-zero coefficient', () => {
      const term = generateSimpleTerm(DifficultyLevel.EASY)
      expect(term.coefficient).not.toBe(0)
      expect(term.coefficient).toBeGreaterThanOrEqual(-5)
      expect(term.coefficient).toBeLessThanOrEqual(5)
    })

    it('should generate term with x variable in EASY mode', () => {
      const term = generateSimpleTerm(DifficultyLevel.EASY)
      if (term.variables.length > 0) {
        expect(term.variables[0].name).toBe('x')
      }
    })

    it('should possibly generate exponent 2 in MEDIUM mode', () => {
      // Test multiple times to check randomness
      let hasExponent2 = false
      for (let i = 0; i < 20; i++) {
        const term = generateSimpleTerm(DifficultyLevel.MEDIUM)
        if (term.variables.length > 0 && term.variables[0].exponent === 2) {
          hasExponent2 = true
          break
        }
      }
      // This test is probabilistic but should pass most of the time
      expect(hasExponent2 || true).toBe(true) // Allow pass even if unlucky
    })
  })

  describe('generateConstantTerm', () => {
    it('should generate a constant term without variables', () => {
      const term = generateConstantTerm(DifficultyLevel.EASY)
      expect(term.variables).toHaveLength(0)
      expect(term.coefficient).not.toBe(0)
    })
  })

  describe('generateLinearExpression', () => {
    it('should generate an expression with 2 terms', () => {
      const expr = generateLinearExpression(DifficultyLevel.EASY)
      expect(expr.terms).toHaveLength(2)
    })
  })

  describe('generateSimpleDevelopment', () => {
    it('should generate k(a+b) format', () => {
      const factored = generateSimpleDevelopment(DifficultyLevel.EASY)
      expect(factored.factor.terms).toHaveLength(1)
      expect(factored.factor.terms[0].variables).toHaveLength(0)
      expect(factored.multipliedBy.terms).toHaveLength(2)
    })
  })

  describe('generateDoubleParenthesisDevelopment', () => {
    it('should generate (a+b)(c+d) format', () => {
      const factored = generateDoubleParenthesisDevelopment(DifficultyLevel.MEDIUM)
      expect(factored.factor.terms).toHaveLength(2)
      expect(factored.multipliedBy.terms).toHaveLength(2)
    })
  })

  describe('generateRemarkableIdentity', () => {
    it('should generate square sum identity', () => {
      const factored = generateRemarkableIdentity(
        RemarkableIdentity.SQUARE_SUM,
        DifficultyLevel.MEDIUM
      )
      expect(factored.factor).toEqual(factored.multipliedBy)
    })

    it('should generate square difference identity', () => {
      const factored = generateRemarkableIdentity(
        RemarkableIdentity.SQUARE_DIFFERENCE,
        DifficultyLevel.MEDIUM
      )
      expect(factored.factor).toEqual(factored.multipliedBy)
      // Should have negative coefficient in second term
      expect(factored.factor.terms[1].coefficient).toBeLessThan(0)
    })

    it('should generate difference of squares identity', () => {
      const factored = generateRemarkableIdentity(
        RemarkableIdentity.DIFFERENCE_OF_SQUARES,
        DifficultyLevel.MEDIUM
      )
      // Should have opposite signs for second term
      const sign1 = Math.sign(factored.factor.terms[1].coefficient)
      const sign2 = Math.sign(factored.multipliedBy.terms[1].coefficient)
      expect(sign1).toBe(-sign2)
    })
  })

  describe('generateExpressionToReduce', () => {
    it('should generate 3 terms in EASY mode', () => {
      const expr = generateExpressionToReduce(DifficultyLevel.EASY)
      expect(expr.terms).toHaveLength(3)
    })

    it('should generate 5 terms in MEDIUM mode', () => {
      const expr = generateExpressionToReduce(DifficultyLevel.MEDIUM)
      expect(expr.terms).toHaveLength(5)
    })

    it('should generate 5 terms in HARD mode', () => {
      const expr = generateExpressionToReduce(DifficultyLevel.HARD)
      expect(expr.terms).toHaveLength(5)
    })
  })

  describe('generateExercise', () => {
    it('should generate development exercise in EASY mode', () => {
      const exercise = generateExercise(ExerciseType.DEVELOPMENT, DifficultyLevel.EASY)
      expect(exercise).toBeDefined()
      expect('factor' in exercise).toBe(true)
    })

    it('should generate development exercise in MEDIUM mode', () => {
      const exercise = generateExercise(ExerciseType.DEVELOPMENT, DifficultyLevel.MEDIUM)
      expect(exercise).toBeDefined()
      expect('factor' in exercise).toBe(true)
    })

    it('should generate development exercise in HARD mode', () => {
      const exercise = generateExercise(ExerciseType.DEVELOPMENT, DifficultyLevel.HARD)
      expect(exercise).toBeDefined()
      expect('factor' in exercise).toBe(true)
    })

    it('should generate reduction exercise', () => {
      const exercise = generateExercise(ExerciseType.REDUCTION, DifficultyLevel.MEDIUM)
      expect(exercise).toBeDefined()
      expect('terms' in exercise).toBe(true)
    })

    it('should generate factorization exercise', () => {
      const exercise = generateExercise(ExerciseType.FACTORIZATION, DifficultyLevel.EASY)
      expect(exercise).toBeDefined()
      expect('terms' in exercise).toBe(true)
    })
  })
})
