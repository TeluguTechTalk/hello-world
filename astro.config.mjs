// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://krishcodehub.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  adapter: cloudflare(),
  integrations: [
    sitemap() 
  ],
});