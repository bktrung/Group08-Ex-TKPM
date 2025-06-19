import { describe, it, expect } from '@jest/globals'
import { createI18n } from 'vue-i18n'

// Mock the locale files
jest.mock('@/locales/en.json', () => ({
  common: {
    loading: 'Loading...',
    error: 'Error'
  }
}), { virtual: true })

jest.mock('@/locales/vi.json', () => ({
  common: {
    loading: 'Đang tải...',
    error: 'Lỗi'
  }
}), { virtual: true })

describe('i18n configuration', () => {
  it('should create i18n instance with correct config', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'vi',
      fallbackLocale: 'en',
      messages: {
        en: { common: { loading: 'Loading...', error: 'Error' } },
        vi: { common: { loading: 'Đang tải...', error: 'Lỗi' } }
      }
    })

    expect(i18n.global.locale.value).toBe('vi')
    expect(i18n.global.fallbackLocale.value).toBe('en')
  })

  it('should have Vietnamese as default locale', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'vi',
      fallbackLocale: 'en',
      messages: {
        en: { common: { loading: 'Loading...', error: 'Error' } },
        vi: { common: { loading: 'Đang tải...', error: 'Lỗi' } }
      }
    })

    expect(i18n.global.t('common.loading')).toBe('Đang tải...')
  })

  it('should fallback to English when translation missing', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'vi',
      fallbackLocale: 'en',
      messages: {
        en: { common: { loading: 'Loading...', error: 'Error', missing: 'Missing translation' } },
        vi: { common: { loading: 'Đang tải...', error: 'Lỗi' } }
      }
    })

    expect(i18n.global.t('common.missing')).toBe('Missing translation')
  })
})