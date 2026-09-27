import { defineConfig } from 'astro/config';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://piergorelli.com',
  integrations: [sitemap(), partytown({ config: { forward: ["dataLayer.push"] } })],
  vite: {
    plugins: [tailwindcss()],
  },
});
