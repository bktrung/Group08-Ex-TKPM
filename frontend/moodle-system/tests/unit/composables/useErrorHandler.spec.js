import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useErrorHandler } from '@/composables/useErrorHandler'

// Mock vue-i18n
const mockT = vi.fn()
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT
  })
}))

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockT.mockImplementation((key) => key)
  })

  it('should initialize with default values', () => {
    const { errorMessage, isErrorTranslated, showErrorModal } = useErrorHandler()
    
    expect(errorMessage.value).toBe('')
    expect(isErrorTranslated.value).toBe(false)
    expect(showErrorModal.value).toBe(false)
  })

  it('should handle error with response.data.message', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    const error = {
      response: {
        data: {
          message: 'Server error message'
        }
      }
    }
    
    handleError(error)
    
    expect(errorMessage.value).toBe('Server error message')
    expect(isErrorTranslated.value).toBe(true)
    expect(showErrorModal.value).toBe(true)
  })

  it('should handle error with error.message', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    const error = {
      message: 'Client error message'
    }
    
    handleError(error)
    
    expect(errorMessage.value).toBe('Client error message')
    expect(isErrorTranslated.value).toBe(false)
    expect(showErrorModal.value).toBe(true)
  })

  it('should handle error with fallback key', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    mockT.mockReturnValue('Fallback error message')
    
    const error = {}
    
    handleError(error, 'custom.fallback.key')
    
    expect(mockT).toHaveBeenCalledWith('custom.fallback.key')
    expect(errorMessage.value).toBe('Fallback error message')
    expect(isErrorTranslated.value).toBe(false)
    expect(showErrorModal.value).toBe(true)
  })

  it('should handle course deletion timeout error', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    const error = {
      message: 'Cannot delete course after 30 minutes - course created 45 minutes ago'
    }
    
    handleError(error)
    
    expect(errorMessage.value).toContain('Không thể xóa khóa học sau 30 phút')
    expect(errorMessage.value).toContain('45 phút trước')
    expect(isErrorTranslated.value).toBe(false)
    expect(showErrorModal.value).toBe(true)
  })

  it('should handle course deletion timeout error without minutes match', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    const error = {
      message: 'Cannot delete course after 30 minutes'
    }
    
    handleError(error)
    
    expect(errorMessage.value).toContain('Không thể xóa khóa học sau 30 phút')
    expect(errorMessage.value).toContain('nhiều phút trước')
    expect(isErrorTranslated.value).toBe(false)
    expect(showErrorModal.value).toBe(true)
  })

  it('should handle email domain error in English', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    const error = {
      message: 'Email must belong to one of the accepted domains'
    }
    
    handleError(error)
    
    expect(errorMessage.value).toBe('Email must belong to one of the accepted domains')
    expect(isErrorTranslated.value).toBe(true)
    expect(showErrorModal.value).toBe(true)
  })

  it('should handle email domain error in Vietnamese', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    const error = {
      message: 'Email phải thuộc một trong những miền được chấp nhận'
    }
    
    handleError(error)
    
    expect(errorMessage.value).toBe('Email phải thuộc một trong những miền được chấp nhận')
    expect(isErrorTranslated.value).toBe(true)
    expect(showErrorModal.value).toBe(true)
  })

  it('should try to translate error message', () => {
    const { errorMessage, handleError } = useErrorHandler()
    
    mockT.mockImplementation((key) => {
      if (key === 'error.key') return 'Translated error'
      return key
    })
    
    const error = {
      message: 'error.key'
    }
    
    handleError(error)
    
    expect(errorMessage.value).toBe('Translated error')
  })

  it('should handle translation failure gracefully', () => {
    const { errorMessage, handleError } = useErrorHandler()
    
    mockT.mockImplementation(() => {
      throw new Error('Translation failed')
    })
    
    const error = {
      message: 'Original error message'
    }
    
    handleError(error)
    
    expect(errorMessage.value).toBe('Original error message')
  })

  it('should clear error state', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError, clearError } = useErrorHandler()
    
    // Set error first
    handleError({ message: 'Test error' })
    expect(errorMessage.value).toBe('Test error')
    expect(showErrorModal.value).toBe(true)
    
    // Clear error
    clearError()
    
    expect(errorMessage.value).toBe('')
    expect(isErrorTranslated.value).toBe(false)
    expect(showErrorModal.value).toBe(false)
  })

  it('should handle response.data.message with translated flag', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    const error = {
      response: {
        data: {
          message: 'Server translated message'
        }
      }
    }
    
    handleError(error)
    
    expect(errorMessage.value).toBe('Server translated message')
    expect(isErrorTranslated.value).toBe(true)
    expect(showErrorModal.value).toBe(true)
  })
})