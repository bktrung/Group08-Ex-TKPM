// tests/setup.js
import { config } from '@vue/test-utils'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.open for export functionality
global.window.open = jest.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Setup Vue Test Utils global config
config.global.mocks = {
  $t: (key, params) => {
    if (params) {
      return key.replace(/\{(\w+)\}/g, (match, param) => params[param] || match)
    }
    return key
  },
  $route: {
    path: '/',
    params: {},
    query: {}
  },
  $router: {
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    back: jest.fn()
  }
}

// Mock process.env
process.env.VUE_APP_API_URL = 'http://localhost:3456'

// Setup fetch mock
global.fetch = jest.fn()

// Setup IntersectionObserver mock
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Setup ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}