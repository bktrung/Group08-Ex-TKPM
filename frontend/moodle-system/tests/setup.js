import { config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

// Mock i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add'
      },
      student: {
        name: 'Student Name',
        student_id: 'Student ID',
        email: 'Email',
        phone: 'Phone',
        add_student: 'Add Student'
      }
    }
  }
});

// Global test configuration
config.global.plugins = [i18n];
config.global.mocks = {
  $t: (key) => key,
  $route: {
    params: {},
    query: {},
    path: '/'
  },
  $router: {
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    back: jest.fn()
  }
};

// Mock window methods
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock Bootstrap
global.bootstrap = {
  Modal: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn()
  })),
  Toast: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn()
  }))
};