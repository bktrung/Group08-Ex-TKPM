/**
 * Format a date to local date string
 * @param {string|Date} dateString - The date to format
 * @param {string} locale - The locale to use, defaults to 'vi-VN'
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString, locale = 'vi-VN') {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(locale)
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }
  
  /**
   * Format address object to string
   * @param {Object} address - The address object 
   * @returns {string} - Formatted address string
   */
  export function formatAddress(address) {
    if (!address) return ''
    
    const parts = []
    if (address.houseNumberStreet) parts.push(address.houseNumberStreet)
    if (address.wardCommune) parts.push(address.wardCommune)
    if (address.districtCounty) parts.push(address.districtCounty)
    if (address.provinceCity) parts.push(address.provinceCity)
    if (address.country) parts.push(address.country)
    
    return parts.join(', ')
  }
  
  /**
   * Format a phone number to a standardized format
   * @param {string} phoneNumber - The phone number to format
   * @returns {string} - Formatted phone number
   */
  export function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return ''
    
    // Simple Vietnamese phone number formatting
    if (phoneNumber.startsWith('0') && phoneNumber.length === 10) {
      return phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
    }
    
    return phoneNumber
  }
  
  /**
   * Format a number as currency
   * @param {number} amount - The amount
   * @param {string} currency - The currency code, defaults to 'VND'
   * @param {string} locale - The locale to use, defaults to 'vi-VN'
   * @returns {string} - Formatted currency string
   */
  export function formatCurrency(amount, currency = 'VND', locale = 'vi-VN') {
    if (amount === undefined || amount === null) return ''
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount)
    } catch (error) {
      console.error('Error formatting currency:', error)
      return `${amount} ${currency}`
    }
  }
  
  /**
   * Format a date to YYYY-MM-DD format for input[type="date"]
   * @param {string|Date} dateString - The date to format
   * @returns {string} - Date in YYYY-MM-DD format
   */
  export function formatDateForInput(dateString) {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error formatting date for input:', error)
      return ''
    }
  }
  
  /**
   * Get name from an object or ID
   * @param {string|Object} item - The item or ID
   * @param {string} nameProperty - The name property to use if item is an object
   * @param {Function} getter - Getter function to use if item is an ID
   * @returns {string} - The name
   */
  export function getNameFromObjectOrId(item, nameProperty = 'name', getter = null) {
    if (!item) return ''
    
    if (typeof item === 'object') {
      return item[nameProperty] || ''
    }
    
    if (getter && typeof getter === 'function') {
      return getter(item) || item
    }
    
    return item
  }