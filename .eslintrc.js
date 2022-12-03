module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    mocha: true,
  },
  extends: [
    'airbnb-base',
    "eslint:recommended",
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    'import',
    '@typescript-eslint',
    'prettier',
  ],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        'ts': 'never',
      },
    ],
    'function-paren-newline': ['error', 'consistent'],
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'lines-between-class-members': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
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
  settings: {
    react: {
      version: '999.999.999',
    },
    'import/parser': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  ignorePatterns: [
    '**/migration/*.ts',
  ],
}
