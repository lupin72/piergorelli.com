import { defineConfig } from 'astro/config';
import partytown from '@astrojs/partytown'
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://piergorelli.com',
  integrations: [tailwind(), sitemap(), partytown({ config: { forward: ["dataLayer.push"] } })],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});