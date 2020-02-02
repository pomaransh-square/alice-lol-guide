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
    'import/extensions': ['off'],
    'no-unused-vars': ['off'],
    'no-underscore-dangle': ['off'],
    'no-await-in-loop': ['off'],
    'no-restricted-syntax': ['off'],
    'no-return-await': ['off'],
    'implicit-arrow-linebreak': ['off'],
    'no-return-assign': ['off'],
    'no-sequences': ['off'],
    'max-len': ['error', 160],
    'no-param-reassign': ['off'],
    'consistent-return': ['off'],
    'no-shadow': ['off'],
    'no-empty-function': ['off']
  },
};
