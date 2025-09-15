import nodePath from 'node:path';
import {fileURLToPath} from 'node:url';
import {FlatCompat} from '@eslint/eslintrc';

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  ...compat.extends('next/core-web-vitals'),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Add any other custom rule overrides here
      // "some-rule": "warn",
    },
  },

  // Prettier configuration
  // IMPORTANT: This MUST be the last configuration in the array.
  prettierConfig,
];

export default eslintConfig;
