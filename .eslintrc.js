module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    indent: ['error', 4],
    'import/prefer-default-export': ['off'],
    'no-useless-constructor': ['off'],
    'import/no-unresolved': ['off'],
    'import/extensions': ['off']
  },
};
