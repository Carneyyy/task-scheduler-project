module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaVersion: 2021,
    parser: "@typescript-eslint/parser",
  },
  rules: {
    "no-console": "warn",
    "no-debugger": "warn",
    "vue/multi-word-component-names": "off",
  },
};
