import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const base = (site || new URL('https://errorcodesindex.com')).toString().replace(/\/+$/, '');
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

