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
    sitemap({
      customPages: [
        `${SITE}/`,
        `${SITE}/about`,
        `${SITE}/java`,
        `${SITE}/java/checked-vs-unchecked-exceptions`,
        `${SITE}/java/common-exception-mistakes`,
        `${SITE}/java/custom-exceptions`,
        `${SITE}/java/exception-best-practices`,
        `${SITE}/java/exception-handling-overview`,
        `${SITE}/java/exception-handling`,
        `${SITE}/java/exception-propagation`,
        `${SITE}/java/java-exception-handling-interview-questions`,
        `${SITE}/java/real-world-exception-handling-examples`,
        `${SITE}/java/throw-vs-throws`,
        `${SITE}/java/throwable-hierarchy`,
        `${SITE}/java/try-catch-finally`,
        `${SITE}/java/try-with-resources`,
        `${SITE}/java/what-is-exception-handling`,
      ],
    }),
  ],
});