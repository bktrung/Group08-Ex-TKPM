import { describe, it, expect } from '@jest/globals'
import {
  formatDate,
  formatAddress,
  formatPhoneNumber,
  formatCurrency,
  formatDateForInput,
  getNameFromObjectOrId
} from '@/utils/format'

describe('format utils', () => {
  describe('formatDate', () => {
    it('should format date with default locale', () => {
      const date = '2023-12-25T00:00:00.000Z'
      const result = formatDate(date)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should format date with custom locale', () => {
      const date = '2023-12-25T00:00:00.000Z'
      const result = formatDate(date, 'en-US')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('')).toBe('')
    })

    it('should handle invalid date strings', () => {
      const result = formatDate('invalid-date')
      expect(typeof result).toBe('string')
    })
  })

  describe('formatAddress', () => {
    it('should format complete address', () => {
      const address = {
        houseNumberStreet: '123 Main St',
        wardCommune: 'Ward 1',
        districtCounty: 'District 1',
        provinceCity: 'Ho Chi Minh City',
        country: 'Vietnam'
      }
      const result = formatAddress(address)
      expect(result).toBe('123 Main St, Ward 1, District 1, Ho Chi Minh City, Vietnam')
    })

    it('should handle partial address', () => {
      const address = {
        houseNumberStreet: '123 Main St',
        provinceCity: 'Ho Chi Minh City'
      }
      const result = formatAddress(address)
      expect(result).toBe('123 Main St, Ho Chi Minh City')
    })

    it('should return empty string for null/undefined address', () => {
      expect(formatAddress(null)).toBe('')
      expect(formatAddress(undefined)).toBe('')
    })

    it('should handle empty address object', () => {
      expect(formatAddress({})).toBe('')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format Vietnamese phone number', () => {
      const result = formatPhoneNumber('0123456789')
      expect(result).toBe('0123 456 789')
    })

    it('should return original for non-Vietnamese format', () => {
      const phone = '+1234567890'
      expect(formatPhoneNumber(phone)).toBe(phone)
    })

    it('should return empty string for null/undefined', () => {
      expect(formatPhoneNumber(null)).toBe('')
      expect(formatPhoneNumber(undefined)).toBe('')
      expect(formatPhoneNumber('')).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency with default values', () => {
      const result = formatCurrency(1000000)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should format currency with custom currency', () => {
      const result = formatCurrency(1000, 'USD', 'en-US')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatCurrency(null)).toBe('')
      expect(formatCurrency(undefined)).toBe('')
    })

    it('should handle formatting errors', () => {
      const result = formatCurrency(1000, 'INVALID_CURRENCY')
      expect(typeof result).toBe('string')
    })
  })

  describe('formatDateForInput', () => {
    it('should format date for input field', () => {
      const date = '2023-12-25T10:30:00.000Z'
      const result = formatDateForInput(date)
      expect(result).toBe('2023-12-25')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatDateForInput(null)).toBe('')
      expect(formatDateForInput(undefined)).toBe('')
      expect(formatDateForInput('')).toBe('')
    })

    it('should handle invalid date strings', () => {
      const result = formatDateForInput('invalid-date')
      expect(result).toBe('')
    })
  })

  describe('getNameFromObjectOrId', () => {
    it('should return name from object', () => {
      const obj = { name: 'Test Name', id: '123' }
      expect(getNameFromObjectOrId(obj)).toBe('Test Name')
    })

    it('should return custom property from object', () => {
      const obj = { title: 'Test Title', id: '123' }
      expect(getNameFromObjectOrId(obj, 'title')).toBe('Test Title')
    })

    it('should use getter function for ID', () => {
      const getter = jest.fn().mockReturnValue('Resolved Name')
      const result = getNameFromObjectOrId('123', 'name', getter)
      expect(result).toBe('Resolved Name')
      expect(getter).toHaveBeenCalledWith('123')
    })

    it('should return ID as string when no getter', () => {
      expect(getNameFromObjectOrId('123')).toBe('123')
    })

    it('should return empty string for null/undefined', () => {
      expect(getNameFromObjectOrId(null)).toBe('')
      expect(getNameFromObjectOrId(undefined)).toBe('')
    })
  })
})