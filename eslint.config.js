import js from '@eslint/js';

// Базовая конфигурация проекта; конфигурация преподавателя не приложена.
export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { document: 'readonly', localStorage: 'readonly' },
    },
    rules: { eqeqeq: 'error', 'no-var': 'error', 'prefer-const': 'error' },
  },
];
