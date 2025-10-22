module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  overrides: [
    {
      files: ["frontend/src/**/*.{ts,tsx}"],
      env: {
        browser: true
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: {
        "react/react-in-jsx-scope": "off"
      }
    },
    {
      files: ["src/**/*.ts", "tests/**/*.ts"],
      env: {
        node: true
      }
    }
  ]
};
