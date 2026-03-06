import type { APIRoute } from 'astro';
import { GUIDE_CATEGORIES } from '../lib/guides/registry';

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

  const staticPaths = [
    '/',
    '/about/',
    '/contact/',
    '/privacy-policy/',
    '/terms-of-use/',
    '/disclaimer/',
    '/guides/',
    '/healthcare/',
    '/healthcare/error-codes/',
    '/irs-tax/',
    '/irs-tax/error-codes/',
    '/banking/',
    '/banking/error-codes/',
    '/gaming/',
    '/gaming/error-codes/',
    '/appliances/',
    '/systems/',
  ];

  const urls: Array<{ loc: string; lastmod: string }> = [];
  for (const p of staticPaths) urls.push({ loc: `${base}${p}`, lastmod: isoDate() });
  for (const c of GUIDE_CATEGORIES) urls.push({ loc: `${base}${c.href}`, lastmod: isoDate() });

  // Systems subcategory landing pages
  const systemSubcategories = [
    'operating-systems',
    'business-systems',
    'pos-systems',
    'security-systems',
    'printers',
    'routers',
    'pos-terminals',
    'smart-devices',
    'bios-uefi',
    'embedded-systems',
  ];
  for (const sub of systemSubcategories) {
    urls.push({ loc: `${base}/systems/${sub}/`, lastmod: isoDate() });
    urls.push({ loc: `${base}/systems/${sub}/error-codes/`, lastmod: isoDate() });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => urlTag(u.loc, u.lastmod))
    .join('\n')}\n</urlset>\n`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

