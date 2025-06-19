import { describe, it, expect } from '@jest/globals'

// Mock all dependencies
jest.mock('vue', () => ({
  createApp: jest.fn(() => ({
    use: jest.fn().mockReturnThis(),
    mount: jest.fn()
  }))
}))

jest.mock('@/App.vue', () => ({}), { virtual: true })
jest.mock('@/router', () => ({}), { virtual: true })
jest.mock('@/store', () => ({}), { virtual: true })
jest.mock('@/i18n.js', () => ({}), { virtual: true })

// Mock CSS imports
jest.mock('bootstrap/dist/css/bootstrap.min.css', () => {}, { virtual: true })
jest.mock('bootstrap-icons/font/bootstrap-icons.css', () => {}, { virtual: true })
jest.mock('bootstrap/dist/js/bootstrap.bundle.min.js', () => {}, { virtual: true })

describe('main.js', () => {
  it('should create Vue app and mount it', () => {
    const { createApp } = require('vue')
    const mockApp = {
      use: jest.fn().mockReturnThis(),
      mount: jest.fn()
    }
    createApp.mockReturnValue(mockApp)

    // Import main.js to trigger the setup
    require('@/main.js')

    expect(createApp).toHaveBeenCalled()
    expect(mockApp.use).toHaveBeenCalledTimes(3) // store, router, i18n
    expect(mockApp.mount).toHaveBeenCalledWith('#app')
  })
})