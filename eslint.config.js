import js from '@eslint/js';

// Базовая конфигурация проекта; конфигурация преподавателя не приложена.
export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly', localStorage: 'readonly', navigator: 'readonly',
        fetch: 'readonly', URL: 'readonly', URLSearchParams: 'readonly',
        AbortController: 'readonly', DOMException: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly',
        location: 'readonly', window: 'readonly',
      },
    },
    rules: { eqeqeq: 'error', 'no-var': 'error', 'prefer-const': 'error' },
  },
];
