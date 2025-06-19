import { describe, it, expect } from '@jest/globals'
import {
  vietnamesePhone,
  notFutureDate,
  notFutureYear,
  vietnameseIdNumber,
  passportNumber,
  studentIdFormat,
  isValidStatusTransition
} from '@/utils/validation'

describe('validation utils', () => {
  describe('vietnamesePhone', () => {
    it('should validate correct Vietnamese phone numbers', () => {
      expect(vietnamesePhone.$validator('0987654321')).toBe(true)
      expect(vietnamesePhone.$validator('+84987654321')).toBe(true)
      expect(vietnamesePhone.$validator('098-765-4321')).toBe(true)
      expect(vietnamesePhone.$validator('098 765 4321')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(vietnamesePhone.$validator('123456789')).toBe(false)
      expect(vietnamesePhone.$validator('0123456789')).toBe(false)
      expect(vietnamesePhone.$validator('abc')).toBe(false)
    })

    it('should return true for empty values', () => {
      expect(vietnamesePhone.$validator('')).toBe(true)
      expect(vietnamesePhone.$validator(null)).toBe(true)
      expect(vietnamesePhone.$validator(undefined)).toBe(true)
    })
  })

  describe('notFutureDate', () => {
    it('should accept past dates', () => {
      const pastDate = '2020-01-01'
      expect(notFutureDate.$validator(pastDate)).toBe(true)
    })

    it('should accept today\'s date', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(notFutureDate.$validator(today)).toBe(true)
    })

    it('should reject future dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const futureDateString = futureDate.toISOString().split('T')[0]
      expect(notFutureDate.$validator(futureDateString)).toBe(false)
    })

    it('should return true for empty values', () => {
      expect(notFutureDate.$validator('')).toBe(true)
      expect(notFutureDate.$validator(null)).toBe(true)
    })
  })

  describe('notFutureYear', () => {
    it('should accept current year', () => {
      const currentYear = new Date().getFullYear()
      expect(notFutureYear.$validator(currentYear)).toBe(true)
    })

    it('should accept past years', () => {
      const pastYear = new Date().getFullYear() - 1
      expect(notFutureYear.$validator(pastYear)).toBe(true)
    })

    it('should reject future years', () => {
      const futureYear = new Date().getFullYear() + 1
      expect(notFutureYear.$validator(futureYear)).toBe(false)
    })

    it('should return true for empty values', () => {
      expect(notFutureYear.$validator('')).toBe(true)
      expect(notFutureYear.$validator(null)).toBe(true)
    })
  })

  describe('vietnameseIdNumber', () => {
    it('should validate 9-digit CMND', () => {
      expect(vietnameseIdNumber.$validator('123456789')).toBe(true)
    })

    it('should validate 12-digit CCCD', () => {
      expect(vietnameseIdNumber.$validator('123456789012')).toBe(true)
      expect(vietnameseIdNumber.$validator('001234567890')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(vietnameseIdNumber.$validator('12345')).toBe(false)
      expect(vietnameseIdNumber.$validator('abc123456')).toBe(false)
    })

    it('should return true for empty values', () => {
      expect(vietnameseIdNumber.$validator('')).toBe(true)
      expect(vietnameseIdNumber.$validator(null)).toBe(true)
    })
  })

  describe('passportNumber', () => {
    it('should validate correct passport formats', () => {
      expect(passportNumber.$validator('A1234567')).toBe(true)
      expect(passportNumber.$validator('AB123456')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(passportNumber.$validator('123456789')).toBe(false)
      expect(passportNumber.$validator('A12')).toBe(false)
      expect(passportNumber.$validator('ABC123456')).toBe(false)
    })

    it('should return true for empty values', () => {
      expect(passportNumber.$validator('')).toBe(true)
      expect(passportNumber.$validator(null)).toBe(true)
    })
  })

  describe('studentIdFormat', () => {
    it('should validate correct student ID formats', () => {
      expect(studentIdFormat.$validator('12345678')).toBe(true)
      expect(studentIdFormat.$validator('1234567890')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(studentIdFormat.$validator('1234567')).toBe(false)
      expect(studentIdFormat.$validator('12345678901')).toBe(false)
      expect(studentIdFormat.$validator('abc12345')).toBe(false)
    })

    it('should return true for empty values', () => {
      expect(studentIdFormat.$validator('')).toBe(true)
      expect(studentIdFormat.$validator(null)).toBe(true)
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
      }
    ]

    it('should allow transition to same status', () => {
      expect(isValidStatusTransition('status1', 'status1', mockTransitionRules)).toBe(true)
    })

    it('should allow valid transitions', () => {
      expect(isValidStatusTransition('status1', 'status2', mockTransitionRules)).toBe(true)
      expect(isValidStatusTransition('status1', 'status3', mockTransitionRules)).toBe(true)
    })

    it('should reject invalid transitions', () => {
      expect(isValidStatusTransition('status1', 'status4', mockTransitionRules)).toBe(false)
    })

    it('should reject transitions with no rules', () => {
      expect(isValidStatusTransition('status5', 'status6', mockTransitionRules)).toBe(false)
    })
  })
})