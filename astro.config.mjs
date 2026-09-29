import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://piergorelli.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/contact/thanks/') })],
  // github-dark-default: comments are 6.2:1 on its background (github-dark's are 3:1, below WCAG 1.4.3)
  markdown: { shikiConfig: { theme: 'github-dark-default' } },
  vite: {
    plugins: [tailwindcss()],
  },
});
