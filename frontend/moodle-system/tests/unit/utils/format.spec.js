import { 
  formatDate, 
  formatAddress, 
  formatPhoneNumber, 
  formatCurrency, 
  formatDateForInput, 
  getNameFromObjectOrId 
} from '@/utils/format.js'

describe('Format utils', () => {
  describe('formatDate', () => {
    it('should format date string to local date', () => {
      const dateString = '2023-01-15T10:30:00.000Z'
      
      const result = formatDate(dateString)
      
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should format date with custom locale', () => {
      const dateString = '2023-01-15T10:30:00.000Z'
      
      const result = formatDate(dateString, 'en-US')
      
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should return empty string for null date', () => {
      const result = formatDate(null)
      
      expect(result).toBe('')
    })

    it('should return empty string for undefined date', () => {
      const result = formatDate(undefined)
      
      expect(result).toBe('')
    })

    it('should return original string for invalid date', () => {
      const invalidDate = 'invalid-date'
      
      const result = formatDate(invalidDate)
      
      expect(result).toBe(invalidDate)
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

    it('should format partial address', () => {
      const address = {
        houseNumberStreet: '123 Main St',
        provinceCity: 'Ho Chi Minh City',
        country: 'Vietnam'
      }
      
      const result = formatAddress(address)
      
      expect(result).toBe('123 Main St, Ho Chi Minh City, Vietnam')
    })

    it('should return empty string for null address', () => {
      const result = formatAddress(null)
      
      expect(result).toBe('')
    })

    it('should return empty string for undefined address', () => {
      const result = formatAddress(undefined)
      
      expect(result).toBe('')
    })

    it('should handle empty address object', () => {
      const result = formatAddress({})
      
      expect(result).toBe('')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format Vietnamese phone number', () => {
      const phoneNumber = '0901234567'
      
      const result = formatPhoneNumber(phoneNumber)
      
      expect(result).toBe('0901 234 567')
    })

    it('should return original number for non-Vietnamese format', () => {
      const phoneNumber = '+1234567890'
      
      const result = formatPhoneNumber(phoneNumber)
      
      expect(result).toBe('+1234567890')
    })

    it('should return empty string for null phone number', () => {
      const result = formatPhoneNumber(null)
      
      expect(result).toBe('')
    })

    it('should return empty string for undefined phone number', () => {
      const result = formatPhoneNumber(undefined)
      
      expect(result).toBe('')
    })

    it('should handle invalid length phone number', () => {
      const phoneNumber = '123456'
      
      const result = formatPhoneNumber(phoneNumber)
      
      expect(result).toBe('123456')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency with default VND', () => {
      const amount = 1000000
      
      const result = formatCurrency(amount)
      
      expect(result).toContain('VND')
      expect(result).toContain('1')
    })

    it('should format currency with custom currency', () => {
      const amount = 1000
      
      const result = formatCurrency(amount, 'USD', 'en-US')
      
      expect(result).toContain('USD')
    })

    it('should return empty string for null amount', () => {
      const result = formatCurrency(null)
      
      expect(result).toBe('')
    })

    it('should return empty string for undefined amount', () => {
      const result = formatCurrency(undefined)
      
      expect(result).toBe('')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0)
      
      expect(result).toContain('0')
      expect(result).toContain('VND')
    })

    it('should handle formatting error gracefully', () => {
      const amount = 1000
      
      const result = formatCurrency(amount, 'INVALID_CURRENCY')
      
      expect(result).toBe('1000 INVALID_CURRENCY')
    })
  })

  describe('formatDateForInput', () => {
    it('should format date for input field', () => {
      const dateString = '2023-01-15T10:30:00.000Z'
      
      const result = formatDateForInput(dateString)
      
      expect(result).toBe('2023-01-15')
    })

    it('should return empty string for null date', () => {
      const result = formatDateForInput(null)
      
      expect(result).toBe('')
    })

    it('should return empty string for invalid date', () => {
      const result = formatDateForInput('invalid-date')
      
      expect(result).toBe('')
    })
  })

  describe('getNameFromObjectOrId', () => {
    it('should get name from object', () => {
      const item = { id: '1', name: 'Test Name' }
      
      const result = getNameFromObjectOrId(item)
      
      expect(result).toBe('Test Name')
    })

    it('should get name from object with custom property', () => {
      const item = { id: '1', title: 'Test Title' }
      
      const result = getNameFromObjectOrId(item, 'title')
      
      expect(result).toBe('Test Title')
    })

    it('should get name from ID using getter', () => {
      const getter = jest.fn().mockReturnValue('Resolved Name')
      
      const result = getNameFromObjectOrId('123', 'name', getter)
      
      expect(getter).toHaveBeenCalledWith('123')
      expect(result).toBe('Resolved Name')
    })

    it('should return ID when no getter provided', () => {
      const result = getNameFromObjectOrId('123')
      
      expect(result).toBe('123')
    })

    it('should return empty string for null item', () => {
      const result = getNameFromObjectOrId(null)
      
      expect(result).toBe('')
    })

    it('should handle getter returning null', () => {
      const getter = jest.fn().mockReturnValue(null)
      
      const result = getNameFromObjectOrId('123', 'name', getter)
      
      expect(result).toBe('123')
    })
  })
})