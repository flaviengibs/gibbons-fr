import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';

// eslint-config-next exporte un tableau de configs plat
const { default: nextConfig } = await import('eslint-config-next/core-web-vitals.js');

const eslintConfig = defineConfig([
  ...(Array.isArray(nextConfig) ? nextConfig : [nextConfig]),
  prettierConfig,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
