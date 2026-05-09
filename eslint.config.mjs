import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**'],
  },
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
  prettierConfig,
];

export default eslintConfig;
