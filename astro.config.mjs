import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Hostnames the server trusts for Host / X-Forwarded-Host (needed for correct URLs
// and Astro's same-origin form check). Add the VPS subdomain via ALLOWED_HOSTS at build time.
const hosts = ['localhost', '127.0.0.1', 'shapeproject.org', 'www.shapeproject.org', ...(process.env.ALLOWED_HOSTS ?? '').split(',').map((h) => h.trim()).filter(Boolean)];

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://shapeproject.org',
  trailingSlash: 'ignore',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: { checkOrigin: true, allowedDomains: hosts.map((hostname) => ({ hostname })) },
  devToolbar: { enabled: false },
  vite: { ssr: { external: ['sharp'] } },
});
