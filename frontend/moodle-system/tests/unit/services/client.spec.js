import axios from 'axios'

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }))
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  error: jest.fn()
}
global.console = mockConsole

describe('API client', () => {
  let mockAxiosInstance
  let requestInterceptor
  let responseInterceptor

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      }
    }
    
    axios.create.mockReturnValue(mockAxiosInstance)
    
    // Capture the interceptor functions
    mockAxiosInstance.interceptors.request.use.mockImplementation((successFn, errorFn) => {
      requestInterceptor = { success: successFn, error: errorFn }
    })
    
    mockAxiosInstance.interceptors.response.use.mockImplementation((successFn, errorFn) => {
      responseInterceptor = { success: successFn, error: errorFn }
    })

    // Re-import to trigger interceptor setup
    jest.resetModules()
    require('@/services/client.js')
  })

  it('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:3456',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  it('should setup request and response interceptors', () => {
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
  })

  describe('request interceptor', () => {
    it('should add language parameter from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('en')
      
      const config = {
        method: 'GET',
        url: '/test',
        params: { existing: 'param' }
      }
      
      const result = requestInterceptor.success(config)
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('language')
      expect(result.params).toEqual({
        existing: 'param',
        lang: 'en'
      })
    })

    it('should add default language when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const config = {
        method: 'POST',
        url: '/test'
      }
      
      const result = requestInterceptor.success(config)
      
      expect(result.params).toEqual({
        lang: 'vi'
      })
    })

    it('should create params object if not exists', () => {
      mockLocalStorage.getItem.mockReturnValue('vi')
      
      const config = {
        method: 'PUT',
        url: '/test'
      }
      
      const result = requestInterceptor.success(config)
      
      expect(result.params).toEqual({
        lang: 'vi'
      })
    })

    it('should log request information', () => {
      const config = {
        method: 'GET',
        url: '/test',
        params: { test: 'value' }
      }
      
      requestInterceptor.success(config)
      
      expect(mockConsole.log).toHaveBeenCalledWith('API Request:', 'GET', '/test')
      expect(mockConsole.log).toHaveBeenCalledWith('Parameters:', { test: 'value', lang: 'vi' })
      expect(mockConsole.log).toHaveBeenCalledWith('Language from localStorage:', null)
    })

    it('should handle request interceptor error', () => {
      const error = new Error('Request error')
      
      expect(() => requestInterceptor.error(error)).rejects.toThrow('Request error')
    })
  })

  describe('response interceptor', () => {
    it('should return response on success', () => {
      const response = { data: { test: 'data' } }
      
      const result = responseInterceptor.success(response)
      
      expect(result).toEqual(response)
    })

    it('should log error and reject on response error', () => {
      const error = {
        response: {
          status: 404,
          data: {
            message: 'Not found'
          }
        }
      }
      
      expect(() => responseInterceptor.error(error)).rejects.toThrow()
      expect(mockConsole.error).toHaveBeenCalledWith('API Error:', 404, 'Not found')
    })

    it('should handle error without response', () => {
      const error = new Error('Network error')
      
      expect(() => responseInterceptor.error(error)).rejects.toThrow('Network error')
      expect(mockConsole.error).toHaveBeenCalledWith('API Error:', undefined, undefined)
    })
  })
})