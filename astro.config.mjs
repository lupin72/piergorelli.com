import { defineConfig } from 'astro/config';
import partytown from '@astrojs/partytown'
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://www.piergorelli.com',
  integrations: [tailwind(), sitemap(), partytown({ config: { forward: ["dataLayer.push"] } })]
});