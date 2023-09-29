module.exports = {
  root: true,
  env: { browser: true, es2015: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  
  ignorePatterns: ['.eslintrc.cjs', '*.spec.ts', "index.js"],
  parser: '@typescript-eslint/parser',
  plugins: [],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "prefer-spread": "off",
    "prefer-rest-params": "off",
  }
}
