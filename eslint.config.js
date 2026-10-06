import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    '_unused/**',
    '_archive/**',
    'public/vendor/**',
    'src/components/transition/Portal*/**',
    'src/components/transition/Portal*',
    'src/components/transition/portal*',
    'src/components/transition/scene/**',
    'src/components/transition/transitionState.js',
    'src/components/transition/assetPreload.js',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]|motion',
          argsIgnorePattern: '^[A-Z_]|motion',
          caughtErrorsIgnorePattern: '^[A-Z_]',
        },
      ],
    },
  },
  {
    files: ['vite.config.js', 'api/**/*.js', 'src/app/api/**/*.js', 'src/lib/contactEmail.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        Response: 'readonly',
      },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
