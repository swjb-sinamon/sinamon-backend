module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'airbnb-base'],
  rules: {
    'arrow-body-style': 'off',
    'comma-dangle': 'off',
    'object-curly-newline': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'linebreak-style': 'off'
  }
};
