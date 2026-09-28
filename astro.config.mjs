import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://piergorelli.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/contact/thanks/') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
