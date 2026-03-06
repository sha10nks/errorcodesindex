import type { APIRoute } from 'astro';

export const prerender = true;

function xmlEscape(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site || new URL('https://errorcodesindex.com')).toString().replace(/\/+$/, '');

  const sitemaps = [
    `${base}/sitemap-categories.xml`,
    `${base}/sitemap-guides.xml`,
    `${base}/sitemap-codes.xml`,
  ];

  const now = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps
    .map((loc) => `  <sitemap><loc>${xmlEscape(loc)}</loc><lastmod>${xmlEscape(now)}</lastmod></sitemap>`)
    .join('\n')}\n</sitemapindex>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
