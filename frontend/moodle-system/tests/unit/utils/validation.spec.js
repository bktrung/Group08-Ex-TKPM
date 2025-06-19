import {
  vietnamesePhone,
  notFutureDate,
  notFutureYear,
  vietnameseIdNumber,
  passportNumber,
  studentIdFormat,
  isValidStatusTransition
} from '@/utils/validation.js'

describe('Validation Utils', () => {
  describe('vietnamesePhone', () => {
    it('should validate Vietnamese phone numbers with +84 prefix', () => {
      const validator = vietnamesePhone.$validator || vietnamesePhone
      
      expect(validator('+84901234567')).toBe(true)
      expect(validator('+84912345678')).toBe(true)
      expect(validator('+84987654321')).toBe(true)
    })

    it('should validate Vietnamese phone numbers with 0 prefix', () => {
      const validator = vietnamesePhone.$validator || vietnamesePhone
      
      expect(validator('0901234567')).toBe(true)
      expect(validator('0912345678')).toBe(true)
      expect(validator('0987654321')).toBe(true)
      expect(validator('0356789012')).toBe(true)
      expect(validator('0789012345')).toBe(true)
      expect(validator('0812345678')).toBe(true)
      expect(validator('0923456789')).toBe(true)
    })

    it('should handle phone numbers with dashes and spaces', () => {
      const validator = vietnamesePhone.$validator || vietnamesePhone
      
      expect(validator('090-123-4567')).toBe(true)
      expect(validator('090 123 4567')).toBe(true)
      expect(validator('+84-90-123-4567')).toBe(true)
      expect(validator('+84 90 123 4567')).toBe(true)
    })

    it('should reject invalid Vietnamese phone numbers', () => {
      const validator = vietnamesePhone.$validator || vietnamesePhone
      
      expect(validator('0123456789')).toBe(false) // Invalid prefix
      expect(validator('090123456')).toBe(false) // Too short
      expect(validator('09012345678')).toBe(false) // Too long
      expect(validator('abcd123456')).toBe(false) // Contains letters
      expect(validator('+84123456789')).toBe(false) // Invalid prefix after +84
    })

    it('should return true for empty values', () => {
      const validator = vietnamesePhone.$validator || vietnamesePhone
      
      expect(validator('')).toBe(true)
      expect(validator(null)).toBe(true)
      expect(validator(undefined)).toBe(true)
    })
  })

  describe('notFutureDate', () => {
    beforeEach(() => {
      // Mock Date.now to return a fixed date
      jest.spyOn(Date, 'now').mockImplementation(() => 
        new Date('2024-01-15T12:00:00Z').getTime()
      )
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should allow past dates', () => {
      const validator = notFutureDate.$validator || notFutureDate
      
      expect(validator('2024-01-14')).toBe(true)
      expect(validator('2023-12-25')).toBe(true)
      expect(validator('2020-01-01')).toBe(true)
    })

    it('should allow today date', () => {
      const validator = notFutureDate.$validator || notFutureDate
      
      expect(validator('2024-01-15')).toBe(true)
    })

    it('should reject future dates', () => {
      const validator = notFutureDate.$validator || notFutureDate
      
      expect(validator('2024-01-16')).toBe(false)
      expect(validator('2024-02-01')).toBe(false)
      expect(validator('2025-01-01')).toBe(false)
    })

    it('should return true for empty values', () => {
      const validator = notFutureDate.$validator || notFutureDate
      
      expect(validator('')).toBe(true)
      expect(validator(null)).toBe(true)
      expect(validator(undefined)).toBe(true)
    })

    it('should handle different date formats', () => {
      const validator = notFutureDate.$validator || notFutureDate
      
      expect(validator('2024-01-14T10:00:00Z')).toBe(true)
      expect(validator('2024-01-16T10:00:00Z')).toBe(false)
    })
  })

  describe('notFutureYear', () => {
    beforeEach(() => {
      jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should allow current and past years', () => {
      const validator = notFutureYear.$validator || notFutureYear
      
      expect(validator(2024)).toBe(true)
      expect(validator(2023)).toBe(true)
      expect(validator(2020)).toBe(true)
      expect(validator('2024')).toBe(true)
      expect(validator('2023')).toBe(true)
    })

    it('should reject future years', () => {
      const validator = notFutureYear.$validator || notFutureYear
      
      expect(validator(2025)).toBe(false)
      expect(validator(2030)).toBe(false)
      expect(validator('2025')).toBe(false)
      expect(validator('2030')).toBe(false)
    })

    it('should return true for empty values', () => {
      const validator = notFutureYear.$validator || notFutureYear
      
      expect(validator('')).toBe(true)
      expect(validator(null)).toBe(true)
      expect(validator(undefined)).toBe(true)
    })
  })

  describe('vietnameseIdNumber', () => {
    it('should validate 9-digit CMND numbers', () => {
      const validator = vietnameseIdNumber.$validator || vietnameseIdNumber
      
      expect(validator('123456789')).toBe(true)
      expect(validator('987654321')).toBe(true)
    })

    it('should validate 12-digit CCCD numbers', () => {
      const validator = vietnameseIdNumber.$validator || vietnameseIdNumber
      
      expect(validator('123456789012')).toBe(true)
      expect(validator('987654321098')).toBe(true)
    })

    it('should validate CCCD numbers with specific prefixes', () => {
      const validator = vietnameseIdNumber.$validator || vietnameseIdNumber
      
      expect(validator('001234567890')).toBe(true)
      expect(validator('002123456789')).toBe(true)
      expect(validator('038204012567')).toBe(true)
    })

    it('should reject invalid ID numbers', () => {
      const validator = vietnameseIdNumber.$validator || vietnameseIdNumber
      
      expect(validator('12345678')).toBe(false) // Too short
      expect(validator('1234567890123')).toBe(false) // Too long
      expect(validator('12345678a')).toBe(false) // Contains letters
      expect(validator('999234567890')).toBe(false) // Invalid CCCD prefix
    })

    it('should return true for empty values', () => {
      const validator = vietnameseIdNumber.$validator || vietnameseIdNumber
      
      expect(validator('')).toBe(true)
      expect(validator(null)).toBe(true)
      expect(validator(undefined)).toBe(true)
    })
  })

  describe('passportNumber', () => {
    it('should validate passport numbers with correct format', () => {
      const validator = passportNumber.$validator || passportNumber
      
      expect(validator('A1234567')).toBe(true)
      expect(validator('B7654321')).toBe(true)
      expect(validator('AB123456')).toBe(true)
      expect(validator('Z9876543')).toBe(true)
    })

    it('should reject invalid passport numbers', () => {
      const validator = passportNumber.$validator || passportNumber
      
      expect(validator('12345678')).toBe(false) // No letters
      expect(validator('ABC12345')).toBe(false) // Too many letters
      expect(validator('A12345')).toBe(false) // Too short
      expect(validator('A12345678')).toBe(false) // Too long
      expect(validator('a1234567')).toBe(false) // Lowercase letters
    })

    it('should return true for empty values', () => {
      const validator = passportNumber.$validator || passportNumber
      
      expect(validator('')).toBe(true)
      expect(validator(null)).toBe(true)
      expect(validator(undefined)).toBe(true)
    })
  })

  describe('studentIdFormat', () => {
    it('should validate student ID numbers with correct length', () => {
      const validator = studentIdFormat.$validator || studentIdFormat
      
      expect(validator('12345678')).toBe(true) // 8 digits
      expect(validator('123456789')).toBe(true) // 9 digits
      expect(validator('1234567890')).toBe(true) // 10 digits
    })

    it('should reject invalid student ID formats', () => {
      const validator = studentIdFormat.$validator || studentIdFormat
      
      expect(validator('1234567')).toBe(false) // Too short
      expect(validator('12345678901')).toBe(false) // Too long
      expect(validator('1234567a')).toBe(false) // Contains letters
      expect(validator('abcd1234')).toBe(false) // Contains letters
    })

    it('should return true for empty values', () => {
      const validator = studentIdFormat.$validator || studentIdFormat
      
      expect(validator('')).toBe(true)
      expect(validator(null)).toBe(true)
      expect(validator(undefined)).toBe(true)
    })
  })

  describe('isValidStatusTransition', () => {
    const mockTransitionRules = [
      {
        fromStatusId: 'status1',
        toStatus: [
          { _id: 'status2' },
          { _id: 'status3' }
        ]
      },
      {
        fromStatusId: 'status2',
        toStatus: [
          { _id: 'status1' },
          { _id: 'status4' }
        ]
      }
    ]

    it('should allow transitions to same status', () => {
      expect(isValidStatusTransition('status1', 'status1', mockTransitionRules)).toBe(true)
      expect(isValidStatusTransition('status2', 'status2', mockTransitionRules)).toBe(true)
    })

    it('should allow valid transitions based on rules', () => {
      expect(isValidStatusTransition('status1', 'status2', mockTransitionRules)).toBe(true)
      expect(isValidStatusTransition('status1', 'status3', mockTransitionRules)).toBe(true)
      expect(isValidStatusTransition('status2', 'status1', mockTransitionRules)).toBe(true)
      expect(isValidStatusTransition('status2', 'status4', mockTransitionRules)).toBe(true)
    })

    it('should reject invalid transitions', () => {
      expect(isValidStatusTransition('status1', 'status4', mockTransitionRules)).toBe(false)
      expect(isValidStatusTransition('status3', 'status1', mockTransitionRules)).toBe(false)
    })

    it('should return false when no transition rule exists', () => {
      expect(isValidStatusTransition('status5', 'status1', mockTransitionRules)).toBe(false)
      expect(isValidStatusTransition('status1', 'status5', mockTransitionRules)).toBe(false)
    })

    it('should handle empty transition rules', () => {
      expect(isValidStatusTransition('status1', 'status2', [])).toBe(false)
      expect(isValidStatusTransition('status1', 'status1', [])).toBe(true)
    })

    it('should handle null/undefined parameters', () => {
      expect(isValidStatusTransition(null, 'status1', mockTransitionRules)).toBe(false)
      expect(isValidStatusTransition('status1', null, mockTransitionRules)).toBe(false)
      expect(isValidStatusTransition('status1', 'status2', null)).toBe(false)
      expect(isValidStatusTransition('status1', 'status2', undefined)).toBe(false)
    })

    it('should handle malformed transition rules', () => {
      const malformedRules = [
        {
          fromStatusId: 'status1'
          // Missing toStatus
        },
        {
          fromStatusId: 'status2',
          toStatus: null
        },
        {
          fromStatusId: 'status3',
          toStatus: 'not-an-array'
        }
      ]

      expect(isValidStatusTransition('status1', 'status2', malformedRules)).toBe(false)
      expect(isValidStatusTransition('status2', 'status1', malformedRules)).toBe(false)
      expect(isValidStatusTransition('status3', 'status1', malformedRules)).toBe(false)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle non-string inputs for phone validation', () => {
      const validator = vietnamesePhone.$validator || vietnamesePhone
      
      expect(validator(123456789)).toBe(false)
      expect(validator({})).toBe(false)
      expect(validator([])).toBe(false)
    })

    it('should handle non-string inputs for ID validation', () => {
      const validator = vietnameseIdNumber.$validator || vietnameseIdNumber
      
      expect(validator(123456789)).toBe(false)
      expect(validator({})).toBe(false)
      expect(validator([])).toBe(false)
    })

    it('should handle invalid date strings', () => {
      const validator = notFutureDate.$validator || notFutureDate
      
      expect(validator('invalid-date')).toBe(false)
      expect(validator('2024-13-01')).toBe(false)
      expect(validator('2024-01-32')).toBe(false)
    })

    it('should handle non-numeric year inputs', () => {
      const validator = notFutureYear.$validator || notFutureYear
      
      expect(validator('abc')).toBe(false)
      expect(validator({})).toBe(false)
      expect(validator([])).toBe(false)
    })
  })
})