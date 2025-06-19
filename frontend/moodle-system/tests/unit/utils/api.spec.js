import { getCurrentLanguage, addLanguageParam } from '@/utils/api';

describe('API Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getCurrentLanguage', () => {
    it('should return stored language', () => {
      localStorage.setItem('language', 'en');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('should return default language when none stored', () => {
      expect(getCurrentLanguage()).toBe('vi');
    });
  });

  describe('addLanguageParam', () => {
    beforeEach(() => {
      localStorage.setItem('language', 'en');
    });

    it('should add language param to URL without existing params', () => {
      const result = addLanguageParam('/api/test');
      expect(result).toBe('/api/test?lang=en');
    });

    it('should add language param to URL with existing params', () => {
      const result = addLanguageParam('/api/test?id=123');
      expect(result).toBe('/api/test?id=123&lang=en');
    });
  });
});