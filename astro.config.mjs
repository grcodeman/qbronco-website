// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://qbronco.com',
  // people guess /calendar; the dates live on /schedule
  redirects: {
    '/calendar': '/schedule'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
