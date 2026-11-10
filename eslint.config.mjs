import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import pluginQuery from '@tanstack/eslint-plugin-query';
import prettier from 'eslint-config-prettier/flat';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'references/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...pluginQuery.configs['flat/recommended'],
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'axios', message: 'Use the api instance from @/lib/api/client.' },
            { name: 'react-hot-toast', message: 'Use sonner.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/api/**', 'src/features/**/api.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
];

export default config;
