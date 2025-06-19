import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getCurrentLanguage, addLanguageParam } from '@/utils/api'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentLanguage', () => {
    it('should return language from localStorage if exists', () => {
      localStorageMock.getItem.mockReturnValue('en')
      
      const result = getCurrentLanguage()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('language')
      expect(result).toBe('en')
    })

    it('should return "vi" as default if no language in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const result = getCurrentLanguage()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('language')
      expect(result).toBe('vi')
    })

    it('should return "vi" as default if empty string in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('')
      
      const result = getCurrentLanguage()
      
      expect(result).toBe('vi')
    })

    it('should handle different language codes', () => {
      const languages = ['en', 'vi', 'fr', 'de']
      
      languages.forEach(lang => {
        localStorageMock.getItem.mockReturnValue(lang)
        const result = getCurrentLanguage()
        expect(result).toBe(lang)
      })
    })
  })

  describe('addLanguageParam', () => {
    beforeEach(() => {
      // Default to 'vi' for these tests
      localStorageMock.getItem.mockReturnValue('vi')
    })

    it('should add language param to URL without existing query params', () => {
      const url = 'https://api.example.com/users'
      
      const result = addLanguageParam(url)
      
      expect(result).toBe('https://api.example.com/users?lang=vi')
    })

    it('should add language param to URL with existing query params', () => {
      const url = 'https://api.example.com/users?page=1&limit=10'
      
      const result = addLanguageParam(url)
      
      expect(result).toBe('https://api.example.com/users?page=1&limit=10&lang=vi')
    })

    it('should add language param to relative URL', () => {
      const url = '/api/v1/users'
      
      const result = addLanguageParam(url)
      
      expect(result).toBe('/api/v1/users?lang=vi')
    })

    it('should add language param to URL with fragment', () => {
      const url = 'https://api.example.com/users#section1'
      
      const result = addLanguageParam(url)
      
      expect(result).toBe('https://api.example.com/users?lang=vi#section1')
    })

    it('should work with different language codes', () => {
      localStorageMock.getItem.mockReturnValue('en')
      
      const url = 'https://api.example.com/users'
      const result = addLanguageParam(url)
      
      expect(result).toBe('https://api.example.com/users?lang=en')
    })

    it('should handle URL with trailing slash', () => {
      const url = 'https://api.example.com/users/'
      
      const result = addLanguageParam(url)
      
      expect(result).toBe('https://api.example.com/users/?lang=vi')
    })

    it('should handle empty URL', () => {
      const url = ''
      
      const result = addLanguageParam(url)
      
      expect(result).toBe('?lang=vi')
    })

    it('should handle URL with only query params', () => {
      const url = '?existing=param'
      
      const result = addLanguageParam(url)
      
      expect(result).toBe('?existing=param&lang=vi')
    })

    it('should handle complex URLs with multiple query params', () => {
      const url = 'https://api.example.com/search?q=test&category=books&sort=date&order=desc'
      
      const result = addLanguageParam(url)
      
      expect(result).toBe('https://api.example.com/search?q=test&category=books&sort=date&order=desc&lang=vi')
    })

    it('should work when localStorage returns null', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const url = 'https://api.example.com/users'
      const result = addLanguageParam(url)
      
      expect(result).toBe('https://api.example.com/users?lang=vi')
    })
  })
})