import { useErrorHandler } from '@/composables/useErrorHandler';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

describe('useErrorHandler', () => {
  let app;
  let i18n;

  beforeEach(() => {
    i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          'common.error': 'Common Error',
          'specific.error': 'Specific Error Message'
        }
      }
    });

    app = createApp({
      setup() {
        return useErrorHandler();
      }
    });
    app.use(i18n);
  });

  it('should initialize with default values', () => {
    const { errorMessage, isErrorTranslated, showErrorModal } = useErrorHandler();

    expect(errorMessage.value).toBe('');
    expect(isErrorTranslated.value).toBe(false);
    expect(showErrorModal.value).toBe(false);
  });

  it('should handle error with response data message', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler();

    const error = {
      response: {
        data: {
          message: 'Server error message'
        }
      }
    };

    handleError(error);

    expect(errorMessage.value).toBe('Server error message');
    expect(isErrorTranslated.value).toBe(true);
    expect(showErrorModal.value).toBe(true);
  });

  it('should handle error with direct message', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler();

    const error = {
      message: 'Direct error message'
    };

    handleError(error);

    expect(errorMessage.value).toBe('Direct error message');
    expect(isErrorTranslated.value).toBe(false);
    expect(showErrorModal.value).toBe(true);
  });

  it('should handle error with fallback key', () => {
    const { errorMessage, showErrorModal, handleError } = useErrorHandler();

    const error = {};

    handleError(error, 'specific.error');

    expect(errorMessage.value).toBe('specific.error'); // In test, $t returns the key
    expect(showErrorModal.value).toBe(true);
  });

  it('should handle special delete course error', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler();

    const error = {
      response: {
        data: {
          message: 'Cannot delete course after 30 minutes. Course was created 45 minutes ago.'
        }
      }
    };

    handleError(error);

    expect(errorMessage.value).toContain('Không thể xóa khóa học sau 30 phút');
    expect(errorMessage.value).toContain('45 phút');
    expect(isErrorTranslated.value).toBe(false);
    expect(showErrorModal.value).toBe(true);
  });

  it('should handle email domain error', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler();

    const error = {
      response: {
        data: {
          message: 'Email must belong to one of the accepted domains'
        }
      }
    };

    handleError(error);

    expect(errorMessage.value).toBe('Email must belong to one of the accepted domains');
    expect(isErrorTranslated.value).toBe(true);
    expect(showErrorModal.value).toBe(true);
  });

  it('should clear error state', () => {
    const { errorMessage, isErrorTranslated, showErrorModal, handleError, clearError } = useErrorHandler();

    // Set an error first
    handleError({ message: 'Test error' });

    expect(errorMessage.value).toBe('Test error');
    expect(showErrorModal.value).toBe(true);

    // Clear the error
    clearError();

    expect(errorMessage.value).toBe('');
    expect(isErrorTranslated.value).toBe(false);
    expect(showErrorModal.value).toBe(false);
  });

  it('should try to translate untranslated messages', () => {
    const { errorMessage, handleError } = useErrorHandler();

    const error = {
      message: 'common.error'
    };

    handleError(error);

    // Since our test setup returns the key, it should remain the same
    expect(errorMessage.value).toBe('common.error');
  });
});