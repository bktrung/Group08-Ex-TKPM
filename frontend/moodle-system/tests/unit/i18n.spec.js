import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the locale files
vi.mock('@/locales/en.json', () => ({
  default: {
    common: {
      save: 'Save',
      cancel: 'Cancel'
    },
    student: {
      name: 'Student Name'
    }
  }
}))

vi.mock('@/locales/vi.json', () => ({
  default: {
    common: {
      save: 'Lưu',
      cancel: 'Hủy'
    },
    student: {
      name: 'Tên sinh viên'
    }
  }
}))

// Mock vue-i18n
const mockCreateI18n = vi.fn()
vi.mock('vue-i18n', () => ({
  createI18n: mockCreateI18n
}))

describe('i18n Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create i18n instance with correct configuration', async () => {
    mockCreateI18n.mockReturnValue({
      global: {
        locale: 'vi',
        fallbackLocale: 'en'
      }
    })

    // Import the i18n module to trigger creation
    await import('@/i18n.js')

    expect(mockCreateI18n).toHaveBeenCalledWith({
      legacy: false,
      locale: 'vi',
      fallbackLocale: 'en',
      messages: {
        en: {
          common: {
            save: 'Save',
            cancel: 'Cancel'
          },
          student: {
            name: 'Student Name'
          }
        },
        vi: {
          common: {
            save: 'Lưu',
            cancel: 'Hủy'
          },
          student: {
            name: 'Tên sinh viên'
          }
        }
      }
    })
  })

  it('should use composition API mode (legacy: false)', async () => {
    mockCreateI18n.mockReturnValue({})

    await import('@/i18n.js')

    const callArgs = mockCreateI18n.mock.calls[0][0]
    expect(callArgs.legacy).toBe(false)
  })

  it('should set Vietnamese as default locale', async () => {
    mockCreateI18n.mockReturnValue({})

    await import('@/i18n.js')

    const callArgs = mockCreateI18n.mock.calls[0][0]
    expect(callArgs.locale).toBe('vi')
  })

  it('should set English as fallback locale', async () => {
    mockCreateI18n.mockReturnValue({})

    await import('@/i18n.js')

    const callArgs = mockCreateI18n.mock.calls[0][0]
    expect(callArgs.fallbackLocale).toBe('en')
  })

  it('should include both English and Vietnamese messages', async () => {
    mockCreateI18n.mockReturnValue({})

    await import('@/i18n.js')

    const callArgs = mockCreateI18n.mock.calls[0][0]
    expect(callArgs.messages).toHaveProperty('en')
    expect(callArgs.messages).toHaveProperty('vi')
  })

  it('should have correct English translations', async () => {
    mockCreateI18n.mockReturnValue({})

    await import('@/i18n.js')

    const callArgs = mockCreateI18n.mock.calls[0][0]
    expect(callArgs.messages.en.common.save).toBe('Save')
    expect(callArgs.messages.en.common.cancel).toBe('Cancel')
    expect(callArgs.messages.en.student.name).toBe('Student Name')
  })

  it('should have correct Vietnamese translations', async () => {
    mockCreateI18n.mockReturnValue({})

    await import('@/i18n.js')

    const callArgs = mockCreateI18n.mock.calls[0][0]
    expect(callArgs.messages.vi.common.save).toBe('Lưu')
    expect(callArgs.messages.vi.common.cancel).toBe('Hủy')
    expect(callArgs.messages.vi.student.name).toBe('Tên sinh viên')
  })
})