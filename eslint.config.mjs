import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

import noArrayLogging from "./eslint-rules/no-array-logging.js";
import noBodyJsonLogging from "./eslint-rules/no-body-json-logging.js";
import noObjectLogging from "./eslint-rules/no-object-logging.js";
import noPiiLogging from './eslint-rules/no-pii-logging.js'
import noRequestLogging from "./eslint-rules/no-request-logging.js";
import noResponseLogging from "./eslint-rules/no-response-logging.js";
import noSensitiveObjectLogging from "./eslint-rules/no-sensitive-object-logging.js";

export default defineConfig([
	{ files: ["**/*.js"], languageOptions: { globals: globals.browser } },
	{ files: ["**/*.js"], plugins: { js }, extends: ["js/recommended"] },
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': 'off', // 🔴 Disable unused variable warnings
      'no-undef': 'off'
    },
  },
  {
    files: ['**/*.js'],
    plugins: {
      local: {
        rules: {
          'no-array-logging': noArrayLogging,
          'no-body-json-logging': noBodyJsonLogging,
          'no-object-logging': noObjectLogging,
          'no-pii-logging': noPiiLogging,
          'no-request-logging': noRequestLogging,
          'no-response-logging': noResponseLogging,
          'no-sensitive-object-logging': noSensitiveObjectLogging,
        },
      },
    },
    rules: {
      'local/no-array-logging': 'off',
      'local/no-body-json-logging': 'off',
      'local/no-object-logging': 'off',
      'local/no-pii-logging': 'error',
      'local/no-request-logging': 'off',
      'local/no-response-logging': 'off',
      'local/no-sensitive-object-logging': 'error',
    },
  },
]);
