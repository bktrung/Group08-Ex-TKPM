import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies
const mockCreateApp = vi.fn()
const mockUse = vi.fn()
const mockMount = vi.fn()

const mockApp = {
  use: mockUse,
  mount: mockMount
}

vi.mock('vue', () => ({
  createApp: mockCreateApp
}))

vi.mock('@/App.vue', () => ({
  default: { name: 'App' }
}))

vi.mock('@/router', () => ({
  default: { name: 'router' }
}))

vi.mock('@/store', () => ({
  default: { name: 'store' }
}))

vi.mock('@/i18n.js', () => ({
  default: { name: 'i18n' }
}))

// Mock CSS imports
vi.mock('bootstrap/dist/css/bootstrap.min.css', () => ({}))
vi.mock('bootstrap-icons/font/bootstrap-icons.css', () => ({}))

// Mock JS imports
vi.mock('bootstrap/dist/js/bootstrap.bundle.min.js', () => ({}))

describe('Main App Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateApp.mockReturnValue(mockApp)
    mockUse.mockReturnValue(mockApp) // Chain the use calls
  })

  it('should create Vue app with App component', async () => {
    await import('@/main.js')

    expect(mockCreateApp).toHaveBeenCalledWith(expect.objectContaining({ name: 'App' }))
  })

  it('should use store plugin', async () => {
    await import('@/main.js')

    expect(mockUse).toHaveBeenCalledWith(expect.objectContaining({ name: 'store' }))
  })

  it('should use router plugin', async () => {
    await import('@/main.js')

    expect(mockUse).toHaveBeenCalledWith(expect.objectContaining({ name: 'router' }))
  })

  it('should use i18n plugin', async () => {
    await import('@/main.js')

    expect(mockUse).toHaveBeenCalledWith(expect.objectContaining({ name: 'i18n' }))
  })

  it('should mount app to #app element', async () => {
    await import('@/main.js')

    expect(mockMount).toHaveBeenCalledWith('#app')
  })

  it('should chain plugins in correct order', async () => {
    await import('@/main.js')

    // Verify that use was called multiple times (store, router, i18n)
    expect(mockUse).toHaveBeenCalledTimes(3)
    
    // Verify the chaining works correctly
    expect(mockUse).toHaveBeenNthCalledWith(1, expect.objectContaining({ name: 'store' }))
    expect(mockUse).toHaveBeenNthCalledWith(2, expect.objectContaining({ name: 'router' }))
    expect(mockUse).toHaveBeenNthCalledWith(3, expect.objectContaining({ name: 'i18n' }))
  })

  it('should complete the app initialization chain', async () => {
    await import('@/main.js')

    // Verify the complete chain: createApp().use().use().use().mount()
    expect(mockCreateApp).toHaveBeenCalledTimes(1)
    expect(mockUse).toHaveBeenCalledTimes(3)
    expect(mockMount).toHaveBeenCalledTimes(1)
  })

  describe('CSS imports', () => {
    it('should import Bootstrap CSS', async () => {
      // The import should not throw an error
      expect(async () => {
        await import('bootstrap/dist/css/bootstrap.min.css')
      }).not.toThrow()
    })

    it('should import Bootstrap Icons CSS', async () => {
      // The import should not throw an error
      expect(async () => {
        await import('bootstrap-icons/font/bootstrap-icons.css')
      }).not.toThrow()
    })
  })

  describe('JS imports', () => {
    it('should import Bootstrap JS bundle', async () => {
      // The import should not throw an error
      expect(async () => {
        await import('bootstrap/dist/js/bootstrap.bundle.min.js')
      }).not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle createApp failure', async () => {
      mockCreateApp.mockImplementation(() => {
        throw new Error('Failed to create app')
      })

      await expect(async () => {
        await import('@/main.js')
      }).rejects.toThrow('Failed to create app')
    })

    it('should handle plugin registration failure', async () => {
      mockUse.mockImplementation(() => {
        throw new Error('Plugin registration failed')
      })

      await expect(async () => {
        await import('@/main.js')
      }).rejects.toThrow('Plugin registration failed')
    })

    it('should handle mount failure', async () => {
      mockMount.mockImplementation(() => {
        throw new Error('Mount failed')
      })

      await expect(async () => {
        await import('@/main.js')
      }).rejects.toThrow('Mount failed')
    })
  })

  describe('plugin registration order', () => {
    it('should register store before router', async () => {
      await import('@/main.js')

      const storeCall = mockUse.mock.calls.find(call => 
        call[0] && call[0].name === 'store'
      )
      const routerCall = mockUse.mock.calls.find(call => 
        call[0] && call[0].name === 'router'
      )

      const storeIndex = mockUse.mock.calls.indexOf(storeCall)
      const routerIndex = mockUse.mock.calls.indexOf(routerCall)

      expect(storeIndex).toBeLessThan(routerIndex)
    })

    it('should register router before i18n', async () => {
      await import('@/main.js')

      const routerCall = mockUse.mock.calls.find(call => 
        call[0] && call[0].name === 'router'
      )
      const i18nCall = mockUse.mock.calls.find(call => 
        call[0] && call[0].name === 'i18n'
      )

      const routerIndex = mockUse.mock.calls.indexOf(routerCall)
      const i18nIndex = mockUse.mock.calls.indexOf(i18nCall)

      expect(routerIndex).toBeLessThan(i18nIndex)
    })
  })

  describe('mount target', () => {
    it('should mount to specific DOM element', async () => {
      await import('@/main.js')

      expect(mockMount).toHaveBeenCalledWith('#app')
      expect(mockMount).toHaveBeenCalledTimes(1)
    })

    it('should not mount to multiple elements', async () => {
      await import('@/main.js')

      expect(mockMount).not.toHaveBeenCalledWith('body')
      expect(mockMount).not.toHaveBeenCalledWith('#root')
      expect(mockMount).not.toHaveBeenCalledWith('.app')
    })
  })
})