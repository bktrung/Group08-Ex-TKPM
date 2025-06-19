import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear()
    mockedAxios.create.mockReturnValue({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create axios instance with correct config', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:3456',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  it('should setup request interceptor', () => {
    const mockInstance = {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }
    mockedAxios.create.mockReturnValue(mockInstance)

    require('@/services/client')

    expect(mockInstance.interceptors.request.use).toHaveBeenCalled()
  })

  it('should setup response interceptor', () => {
    const mockInstance = {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }
    mockedAxios.create.mockReturnValue(mockInstance)

    require('@/services/client')

    expect(mockInstance.interceptors.response.use).toHaveBeenCalled()
  })
})