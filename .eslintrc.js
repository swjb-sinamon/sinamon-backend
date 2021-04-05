module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'airbnb-base', 'eslint-config-prettier'],
  rules: {
    'arrow-body-style': 'off',
    'comma-dangle': 'off',
    'object-curly-newline': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'linebreak-style': 'off',
    'import/prefer-default-export': 'off',

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error']
  }
};
