import {FlatCompat} from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({baseDirectory: import.meta.dirname});

// eslint-config-google references valid-jsdoc and require-jsdoc which were
// removed from ESLint core in v9. Strip them before they cause a hard error.
const googleConfig = compat.extends('google').map((config) => {
  if (!config.rules) return config;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {'valid-jsdoc': _a, 'require-jsdoc': _b, ...rules} = config.rules;
  return {...config, rules};
});

export default tseslint.config(
    {ignores: ['node_modules/', '.wrangler/', 'worker-configuration.d.ts']},
    ...googleConfig,
    tseslint.configs.recommended,
    {
      rules: {
      // HTML template literals make 80-char limits impractical
        'max-len': 'off',
        // Workers AI API uses snake_case field names we don't control
        'camelcase': 'off',
      },
    },
);
