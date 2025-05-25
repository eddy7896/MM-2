// ESLint v9+ config for React
export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    ignores: ["node_modules/**", "build/**", "dist/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        React: true,
        JSX: true
      }
    },
    plugins: {
      react: require("eslint-plugin-react"),
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off"
    }
  }
];
