import apiClient from '@/services/client';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should create axios instance with correct config', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:3456',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  it('should add language parameter in request interceptor', () => {
    localStorage.setItem('language', 'en');
    
    const mockConfig = {
      method: 'get',
      url: '/test',
      params: { id: 1 }
    };

    // Mock the request interceptor
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const result = requestInterceptor(mockConfig);

    expect(result.params.lang).toBe('en');
  });

  it('should handle config without existing params', () => {
    localStorage.setItem('language', 'vi');
    
    const mockConfig = {
      method: 'post',
      url: '/test'
    };

    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const result = requestInterceptor(mockConfig);

    expect(result.params).toEqual({ lang: 'vi' });
  });
});