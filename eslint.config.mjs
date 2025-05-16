import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

import noBodyJsonLogging from "./eslint-rules/no-body-json-logging.js";
import noPiiLogging from './eslint-rules/no-pii-logging.js'
import noRequestLogging from "./eslint-rules/no-request-logging.js";
import noResponseLogging from "./eslint-rules/no-response-logging.js";

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
          'no-body-json-logging': noBodyJsonLogging,
          'no-pii-logging': noPiiLogging,
          'no-request-logging': noRequestLogging,
          'no-response-logging': noResponseLogging,
        },
      },
    },
    rules: {
      'local/no-body-json-logging': 'error',
      'local/no-pii-logging': 'error',
      'local/no-request-logging': 'error',
      'local/no-response-logging': 'error',
    },
  },
]);
