import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

import noPiiLogging from './eslint-rules/no-pii-logging.js'
import noPayloadLogging from './eslint-rules/no-payload-logging.js';
import noBodyJsonLogging from "./eslint-rules/no-body-json-logging.js";

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
          'no-pii-logging': noPiiLogging,
          'no-payload-logging': noPayloadLogging,
          'no-body-json-logging': noBodyJsonLogging
        },
      },
    },
    rules: {
      'local/no-pii-logging': 'error',
      'local/no-payload-logging': 'error',
      'local/no-body-json-logging': 'error',
    },
  },
]);
