import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';

/** External links in Markdown open in a new tab, like every external link on the site. */
const externalLinks = {
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href !== 'string' || !/^https?:\/\//.test(href) || href.includes('piergorelli.com')) return;
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', 'noopener');
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://piergorelli.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/contact/thanks/') })],
  // github-dark-default: comments are 6.2:1 on its background (github-dark's are 3:1, below WCAG 1.4.3)
  markdown: { shikiConfig: { theme: 'github-dark-default' }, processor: satteri({ hastPlugins: [externalLinks] }) },
  vite: {
    plugins: [tailwindcss()],
  },
});
