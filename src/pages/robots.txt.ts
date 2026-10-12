import type { APIRoute } from 'astro';
import { SITE_URL } from 'astro:env/server';
export const GET: APIRoute = () => new Response(
  SITE_URL ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap-index.xml', SITE_URL).href}\n` : 'User-agent: *\nDisallow: /\n',
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
