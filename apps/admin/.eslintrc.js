module.exports = {
  extends: ['eslint-config-frontend'],
}
/*
TODO: remove old config
module.exports = {
  plugins: ['react', 'react-hooks', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 0,
    'react/jsx-no-target-blank': 0,
    'react/display-name': 0,
    'react/prop-types': 0,
    'no-unused-vars': 'warn',
    'no-empty': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
*/
