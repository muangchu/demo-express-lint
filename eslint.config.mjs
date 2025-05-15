import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import noPiiLogging from './eslint-rules/no-pii-logging.js'
import noPayloadLogging from './eslint-rules/no-payload-logging.js';


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs", globals: { __dirname: 'readonly',} },
    plugins: {
      local: {
        rules: {
          'no-pii-logging': noPiiLogging,
          'no-payload-logging': noPayloadLogging,
        },
      },
    },
    rules: {
      // Core rules
      'no-console': 'warn',
      'no-debugger': 'error',

      // Ignore unused middleware arguments like `next`
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // PII rules
      'local/no-pii-logging': 'error',
      'local/no-payload-logging': 'error',
    },
  },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
]);