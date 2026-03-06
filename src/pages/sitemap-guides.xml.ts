import type { APIRoute } from 'astro';
import { GUIDES } from '../lib/guides/registry';

export const prerender = true;

function isoDate(input?: string) {
  if (!input) return new Date().toISOString().slice(0, 10);
  return input.slice(0, 10);
}

function xmlEscape(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function urlTag(loc: string, lastmod: string) {
  return `  <url><loc>${xmlEscape(loc)}</loc><lastmod>${xmlEscape(lastmod)}</lastmod></url>`;
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site || new URL('https://errorcodesindex.com')).toString().replace(/\/+$/, '');

  const urls = GUIDES.map((g) => ({
    loc: `${base}/guides/${g.categoryKey}/${g.slug}/`,
    lastmod: isoDate(g.lastUpdated),
  }));

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => urlTag(u.loc, u.lastmod))
    .join('\n')}\n</urlset>\n`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

