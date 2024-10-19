// .eslintrc.js
module.exports = {
    root: true,
    extends: [
      'next',
      'next/core-web-vitals',
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020
    },
    rules: {
      // Custom rules can be added here
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
  