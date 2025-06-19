import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { getCurrentLanguage, addLanguageParam } from '@/utils/api'

describe('api utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('getCurrentLanguage', () => {
    it('should return default language when none stored', () => {
      expect(getCurrentLanguage()).toBe('vi')
    })

    it('should return stored language', () => {
      localStorage.setItem('language', 'en')
      expect(getCurrentLanguage()).toBe('en')
    })
  })

  describe('addLanguageParam', () => {
    it('should add language param to URL without existing params', () => {
      localStorage.setItem('language', 'en')
      const result = addLanguageParam('https://api.example.com/users')
      expect(result).toBe('https://api.example.com/users?lang=en')
    })

    it('should add language param to URL with existing params', () => {
      localStorage.setItem('language', 'vi')
      const result = addLanguageParam('https://api.example.com/users?page=1')
      expect(result).toBe('https://api.example.com/users?page=1&lang=vi')
    })

    it('should use default language when none stored', () => {
      const result = addLanguageParam('https://api.example.com/users')
      expect(result).toBe('https://api.example.com/users?lang=vi')
    })
  })
})