import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Charger .env.local en priorité (Next.js convention)
config({ path: '.env.local' });
config(); // fallback sur .env

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
});
