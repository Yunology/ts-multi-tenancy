module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
    },
    extends: [
      'airbnb-base',
      'plugin:@typescript-eslint/recommended',
      //'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    parserOptions: {
      project: './tsconfig.json',
    },
    plugins: [
      '@typescript-eslint',
      'import',
    ],
    rules: {
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          'ts': 'never'
        }
      ],
      'no-console': 'off',
      'import/prefer-default-export': 'off',
      'class-methods-use-this': 'off',
      'lines-between-class-members': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
    },
    settings: {
      react: {
        version: '999.999.999',
      },
      'import/parser': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        }
      }
    },
    overrides: [
      {
        files: [
          'test/**/*.ts',
          'src/**/*.ts',
        ],
        rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
      },
      {
        files: [
          'src/**/entry/*.ts',
        ],
        rules: { '@typescript-eslint/no-unused-vars': 'off' }
      },
      {
        files: [ 'test/**/*.ts' ],
        rules: { 'no-unused-expressions': 'off' },
      },
    ],
  }
