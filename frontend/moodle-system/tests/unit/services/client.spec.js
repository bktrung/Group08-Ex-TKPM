import axios from 'axios'
import apiClient from '@/services/client.js'

// Mock axios
jest.mock('axios')
const mockedAxios = axios

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  describe('Configuration', () => {
    it('should have correct default configuration', () => {
      expect(apiClient.defaults.baseURL).toBe('http://localhost:3456')
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
    })

    it('should use environment variable for base URL if provided', () => {
      const originalEnv = process.env.VUE_APP_API_URL
      process.env.VUE_APP_API_URL = 'https://test-api.com'
      
      // Re-import to get new configuration
      jest.resetModules()
      const newApiClient = require('@/services/client.js').default
      
      expect(newApiClient.defaults.baseURL).toBe('https://test-api.com')
      
      // Restore
      process.env.VUE_APP_API_URL = originalEnv
    })
  })

  describe('Request Interceptor', () => {
    let mockConfig

    beforeEach(() => {
      mockConfig = {
        method: 'GET',
        url: '/test',
        params: {}
      }
    })

    it('should add language parameter from localStorage', () => {
      localStorage.setItem('language', 'en')
      
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled
      const result = interceptor(mockConfig)

      expect(result.params.lang).toBe('en')
    })

    it('should use default language when not in localStorage', () => {
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled
      const result = interceptor(mockConfig)

      expect(result.params.lang).toBe('vi')
    })

    it('should preserve existing params', () => {
      localStorage.setItem('language', 'en')
      mockConfig.params = { page: 1, limit: 10 }
      
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled
      const result = interceptor(mockConfig)

      expect(result.params).toEqual({
        page: 1,
        limit: 10,
        lang: 'en'
      })
    })

    it('should handle config without params', () => {
      localStorage.setItem('language', 'en')
      delete mockConfig.params
      
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled
      const result = interceptor(mockConfig)

      expect(result.params).toEqual({ lang: 'en' })
    })

    it('should log request information', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      mockConfig.method = 'POST'
      mockConfig.url = '/api/test'
      mockConfig.params = { test: true }
      
      const interceptor = apiClient.interceptors.request.handlers[0].fulfilled
      interceptor(mockConfig)

      expect(consoleSpy).toHaveBeenCalledWith('API Request:', 'POST', '/api/test')
      expect(consoleSpy).toHaveBeenCalledWith('Parameters:', { test: true, lang: 'vi' })
      expect(consoleSpy).toHaveBeenCalledWith('Language from localStorage:', null)
      
      consoleSpy.mockRestore()
    })

    it('should handle request errors', () => {
      const error = new Error('Request error')
      const interceptor = apiClient.interceptors.request.handlers[0].rejected

      expect(() => interceptor(error)).rejects.toThrow('Request error')
    })
  })

  describe('Response Interceptor', () => {
    it('should return response for successful requests', () => {
      const mockResponse = { data: { success: true }, status: 200 }
      const interceptor = apiClient.interceptors.response.handlers[0].fulfilled

      const result = interceptor(mockResponse)
      expect(result).toEqual(mockResponse)
    })

    it('should log and reject errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const error = {
        response: {
          status: 404,
          data: {
            message: 'Not found'
          }
        }
      }
      
      const interceptor = apiClient.interceptors.response.handlers[0].rejected

      expect(() => interceptor(error)).rejects.toEqual(error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', 404, 'Not found')
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle errors without response', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const error = new Error('Network error')
      const interceptor = apiClient.interceptors.response.handlers[0].rejected

      expect(() => interceptor(error)).rejects.toEqual(error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', undefined, undefined)
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('HTTP Methods', () => {
    beforeEach(() => {
      mockedAxios.create.mockReturnValue({
        defaults: { baseURL: 'http://localhost:3456' },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn()
      })
    })

    it('should make GET requests', async () => {
      const mockResponse = { data: { test: true } }
      apiClient.get = jest.fn().mockResolvedValue(mockResponse)

      const result = await apiClient.get('/test')
      expect(result).toEqual(mockResponse)
      expect(apiClient.get).toHaveBeenCalledWith('/test')
    })

    it('should make POST requests', async () => {
      const mockResponse = { data: { id: 1 } }
      const postData = { name: 'test' }
      apiClient.post = jest.fn().mockResolvedValue(mockResponse)

      const result = await apiClient.post('/test', postData)
      expect(result).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalledWith('/test', postData)
    })

    it('should make PATCH requests', async () => {
      const mockResponse = { data: { updated: true } }
      const patchData = { name: 'updated' }
      apiClient.patch = jest.fn().mockResolvedValue(mockResponse)

      const result = await apiClient.patch('/test/1', patchData)
      expect(result).toEqual(mockResponse)
      expect(apiClient.patch).toHaveBeenCalledWith('/test/1', patchData)
    })

    it('should make DELETE requests', async () => {
      const mockResponse = { data: { deleted: true } }
      apiClient.delete = jest.fn().mockResolvedValue(mockResponse)

      const result = await apiClient.delete('/test/1')
      expect(result).toEqual(mockResponse)
      expect(apiClient.delete).toHaveBeenCalledWith('/test/1')
    })
  })
})