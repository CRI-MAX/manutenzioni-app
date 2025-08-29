module.exports = {
  env: {
    es2020: true,
    node: true,
    mocha: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.eslint.json"]
  },
  extends: [
    "eslint:recommended",
    "google"
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { allowTemplateLiterals: true }],
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "no-console": "warn"
  },
  overrides: [
    {
      files: ["**/*.spec.*", "**/*.test.*"],
      env: {
        mocha: true
      },
      rules: {
        "no-unused-expressions": "off"
      }
    }
  ],
  ignorePatterns: [
    "node_modules/",
    "lib/",
    "dist/"
  ],
  globals: {}
};