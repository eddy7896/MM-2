// ESLint v9+ config for React
module.exports = [
  {
    files: ["**/*.js", "**/*.jsx"],
    ignores: ["node_modules/**", "build/**", "dist/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: require("@babel/eslint-parser"),
      parserOptions: {
        requireConfigFile: false,
        babelOptions: { presets: ["@babel/preset-react"] },
        ecmaFeatures: { jsx: true }
      },
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
