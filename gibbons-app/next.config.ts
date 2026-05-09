import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Nécessaire pour Vercel avec les route groups Next.js 15
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['./public/**/*'],
    },
  },
};

export default nextConfig;
