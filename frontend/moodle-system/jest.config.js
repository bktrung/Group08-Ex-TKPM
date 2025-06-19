module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/router/index.js',
    '!src/i18n.js',
    '!**/node_modules/**',
    '!**/*.config.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.vue': '@vue/vue3-jest',
    '^.+\\.js': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@vuelidate|vue-i18n|@vue|vue-router|vuex)/)'
  ],
  testMatch: [
    '**/tests/unit/**/*.spec.js',
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.spec.js',
    '**/tests/integration/**/*.test.js'
  ],
  globals: {
    'vue-jest': {
      pug: {
        doctype: 'html'
      }
    }
  }
};