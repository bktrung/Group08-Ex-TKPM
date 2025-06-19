import {
  formatDate,
  formatAddress,
  formatPhoneNumber,
  formatCurrency,
  formatDateForInput,
  getNameFromObjectOrId
} from '@/utils/format.js'

describe('Format Utils', () => {
  describe('formatDate', () => {
    it('should format valid date strings with default locale', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should format valid date strings with specific locale', () => {
      const result = formatDate('2024-01-15T10:30:00Z', 'en-US')
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should format Date objects', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('')).toBe('')
    })

    it('should handle invalid date strings gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const result = formatDate('invalid-date')
      expect(result).toBe('invalid-date')
      expect(consoleSpy).toHaveBeenCalledWith('Error formatting date:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should format with different locales', () => {
      const dateString = '2024-01-15T10:30:00Z'
      
      const viResult = formatDate(dateString, 'vi-VN')
      const enResult = formatDate(dateString, 'en-US')
      const deResult = formatDate(dateString, 'de-DE')
      
      expect(viResult).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
      expect(enResult).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
      expect(deResult).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/)
    })
  })

  describe('formatAddress', () => {
    it('should format complete address object', () => {
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

    it('should format partial address object', () => {
      const address = {
        houseNumberStreet: '123 Main St',
        provinceCity: 'Ho Chi Minh City',
        country: 'Vietnam'
      }
      
      const result = formatAddress(address)
      expect(result).toBe('123 Main St, Ho Chi Minh City, Vietnam')
    })

    it('should handle single field address', () => {
      const address = { country: 'Vietnam' }
      const result = formatAddress(address)
      expect(result).toBe('Vietnam')
    })

    it('should return empty string for null/undefined address', () => {
      expect(formatAddress(null)).toBe('')
      expect(formatAddress(undefined)).toBe('')
    })

    it('should return empty string for empty address object', () => {
      expect(formatAddress({})).toBe('')
    })

    it('should handle address with empty string values', () => {
      const address = {
        houseNumberStreet: '',
        wardCommune: 'Ward 1',
        districtCounty: '',
        provinceCity: 'Ho Chi Minh City',
        country: ''
      }
      
      const result = formatAddress(address)
      expect(result).toBe('Ward 1, Ho Chi Minh City')
    })

    it('should handle address with special characters', () => {
      const address = {
        houseNumberStreet: '123/45 Phạm Ngũ Lão',
        wardCommune: 'Phường Bến Thành',
        districtCounty: 'Quận 1',
        provinceCity: 'TP. Hồ Chí Minh',
        country: 'Việt Nam'
      }
      
      const result = formatAddress(address)
      expect(result).toBe('123/45 Phạm Ngũ Lão, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh, Việt Nam')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format 10-digit Vietnamese phone numbers starting with 0', () => {
      expect(formatPhoneNumber('0901234567')).toBe('0901 234 567')
      expect(formatPhoneNumber('0912345678')).toBe('0912 345 678')
      expect(formatPhoneNumber('0987654321')).toBe('0987 654 321')
    })

    it('should not format phone numbers that do not match Vietnamese format', () => {
      expect(formatPhoneNumber('123456789')).toBe('123456789')
      expect(formatPhoneNumber('01234567890')).toBe('01234567890')
      expect(formatPhoneNumber('+84901234567')).toBe('+84901234567')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatPhoneNumber(null)).toBe('')
      expect(formatPhoneNumber(undefined)).toBe('')
      expect(formatPhoneNumber('')).toBe('')
    })

    it('should handle non-string inputs', () => {
      expect(formatPhoneNumber(123456789)).toBe('123456789')
      expect(formatPhoneNumber(901234567)).toBe('901234567')
    })

    it('should handle phone numbers with special characters', () => {
      expect(formatPhoneNumber('090-123-4567')).toBe('090-123-4567')
      expect(formatPhoneNumber('090.123.4567')).toBe('090.123.4567')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency with default settings (VND, vi-VN)', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1,000,000')
      expect(result).toContain('₫')
    })

    it('should format currency with custom currency', () => {
      const result = formatCurrency(1000, 'USD', 'en-US')
      expect(result).toContain('$1,000')
    })

    it('should format currency with different locales', () => {
      const amount = 1234.56
      
      const usdResult = formatCurrency(amount, 'USD', 'en-US')
      const eurResult = formatCurrency(amount, 'EUR', 'de-DE')
      
      expect(usdResult).toContain('$1,234.56')
      expect(eurResult).toContain('1.234,56')
      expect(eurResult).toContain('€')
    })

    it('should handle zero and negative amounts', () => {
      expect(formatCurrency(0)).toContain('0')
      
      const negativeResult = formatCurrency(-1000, 'USD', 'en-US')
      expect(negativeResult).toContain('-$1,000')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatCurrency(null)).toBe('')
      expect(formatCurrency(undefined)).toBe('')
    })

    it('should handle formatting errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Test with invalid currency code
      const result = formatCurrency(1000, 'INVALID', 'en-US')
      expect(result).toBe('1000 INVALID')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should format decimal amounts correctly', () => {
      const result = formatCurrency(1234.567, 'USD', 'en-US')
      expect(result).toContain('$1,234.57')
    })
  })

  describe('formatDateForInput', () => {
    it('should format date strings for HTML date input', () => {
      expect(formatDateForInput('2024-01-15T10:30:00Z')).toBe('2024-01-15')
      expect(formatDateForInput('2024-12-25T23:59:59Z')).toBe('2024-12-25')
    })

    it('should format Date objects for HTML date input', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDateForInput(date)).toBe('2024-01-15')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatDateForInput(null)).toBe('')
      expect(formatDateForInput(undefined)).toBe('')
      expect(formatDateForInput('')).toBe('')
    })

    it('should handle invalid date strings gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const result = formatDateForInput('invalid-date')
      expect(result).toBe('')
      expect(consoleSpy).toHaveBeenCalledWith('Error formatting date for input:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should handle different date string formats', () => {
      expect(formatDateForInput('01/15/2024')).toBe('2024-01-15')
      expect(formatDateForInput('2024/01/15')).toBe('2024-01-15')
    })
  })

  describe('getNameFromObjectOrId', () => {
    const mockGetter = jest.fn()

    beforeEach(() => {
      mockGetter.mockClear()
    })

    it('should return name property from object', () => {
      const item = { id: '123', name: 'Test Name', description: 'Test Description' }
      const result = getNameFromObjectOrId(item)
      expect(result).toBe('Test Name')
    })

    it('should return custom property from object', () => {
      const item = { id: '123', title: 'Test Title', name: 'Test Name' }
      const result = getNameFromObjectOrId(item, 'title')
      expect(result).toBe('Test Title')
    })

    it('should use getter function for string ID', () => {
      mockGetter.mockReturnValue('Getter Result')
      const result = getNameFromObjectOrId('123', 'name', mockGetter)
      
      expect(mockGetter).toHaveBeenCalledWith('123')
      expect(result).toBe('Getter Result')
    })

    it('should return ID when getter returns falsy value', () => {
      mockGetter.mockReturnValue(null)
      const result = getNameFromObjectOrId('123', 'name', mockGetter)
      
      expect(result).toBe('123')
    })

    it('should return ID when no getter provided', () => {
      const result = getNameFromObjectOrId('123')
      expect(result).toBe('123')
    })

    it('should return empty string for null/undefined item', () => {
      expect(getNameFromObjectOrId(null)).toBe('')
      expect(getNameFromObjectOrId(undefined)).toBe('')
    })

    it('should return empty string when object has no requested property', () => {
      const item = { id: '123', description: 'Test Description' }
      const result = getNameFromObjectOrId(item, 'name')
      expect(result).toBe('')
    })

    it('should handle nested object properties', () => {
      const item = { 
        id: '123', 
        user: { 
          profile: { 
            displayName: 'John Doe' 
          } 
        } 
      }
      // This would require custom logic, but we test current functionality
      const result = getNameFromObjectOrId(item, 'user')
      expect(result).toEqual(item.user)
    })

    it('should handle getter errors gracefully', () => {
      const errorGetter = jest.fn().mockImplementation(() => {
        throw new Error('Getter error')
      })
      
      const result = getNameFromObjectOrId('123', 'name', errorGetter)
      expect(result).toBe('123')
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle very large numbers in currency formatting', () => {
      const result = formatCurrency(999999999999, 'USD', 'en-US')
      expect(result).toContain('999,999,999,999')
    })

    it('should handle very small decimal numbers', () => {
      const result = formatCurrency(0.01, 'USD', 'en-US')
      expect(result).toContain('$0.01')
    })

    it('should handle international characters in addresses', () => {
      const address = {
        houseNumberStreet: '123 Straße',
        wardCommune: 'München',
        districtCounty: 'Bayern',
        country: 'Deutschland'
      }
      
      const result = formatAddress(address)
      expect(result).toBe('123 Straße, München, Bayern, Deutschland')
    })

    it('should handle extremely long phone numbers', () => {
      const longNumber = '012345678901234567890'
      expect(formatPhoneNumber(longNumber)).toBe(longNumber)
    })

    it('should handle leap year dates', () => {
      expect(formatDateForInput('2024-02-29T10:30:00Z')).toBe('2024-02-29')
    })

    it('should handle different timezone inputs', () => {
      const utcDate = '2024-01-15T10:30:00Z'
      const offsetDate = '2024-01-15T10:30:00+07:00'
      
      const utcResult = formatDateForInput(utcDate)
      const offsetResult = formatDateForInput(offsetDate)
      
      expect(utcResult).toMatch(/2024-01-\d{2}/)
      expect(offsetResult).toMatch(/2024-01-\d{2}/)
    })
  })
})