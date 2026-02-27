import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { GUIDE_CATEGORIES, GUIDES } from '../lib/guides/registry';

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

  const healthcare = await getCollection('healthcareCodes');
  const irsTax = await getCollection('irsTaxCodes');
  const banking = await getCollection('bankingCodes');
  const gaming = await getCollection('gamingCodes');
  const appliances = await getCollection('applianceCodes');
  const systems = await getCollection('systemCodes');

  const urls: Array<{ loc: string; lastmod: string }> = [];
  for (const p of staticPaths) {
    urls.push({ loc: `${base}${p}`, lastmod: isoDate() });
  }

  for (const c of GUIDE_CATEGORIES) {
    urls.push({ loc: `${base}${c.href}`, lastmod: isoDate() });
  }
  for (const g of GUIDES) {
    urls.push({ loc: `${base}/guides/${g.categoryKey}/${g.slug}/`, lastmod: isoDate(g.lastUpdated) });
  }

  for (const e of healthcare) {
    urls.push({ loc: `${base}/healthcare/error-codes/${e.slug}/`, lastmod: isoDate(e.data.lastmod) });
  }
  for (const e of irsTax) {
    urls.push({ loc: `${base}/irs-tax/error-codes/${e.slug}/`, lastmod: isoDate(e.data.lastmod) });
  }
  for (const e of banking) {
    urls.push({ loc: `${base}/banking/error-codes/${e.slug}/`, lastmod: isoDate(e.data.lastmod) });
  }
  for (const e of gaming) {
    urls.push({ loc: `${base}/gaming/error-codes/${e.slug}/`, lastmod: isoDate(e.data.lastmod) });
  }

  const typeSet = new Set<string>();
  const brandSet = new Set<string>();
  const modelSet = new Set<string>();

  for (const e of appliances) {
    typeSet.add(e.data.applianceType);
    brandSet.add(`${e.data.applianceType}::${e.data.brand}`);
    modelSet.add(`${e.data.applianceType}::${e.data.brand}::${e.data.seriesOrModel}`);

    const codeSlug = e.slug.split('/').slice(-1)[0];
    urls.push({
      loc: `${base}/appliances/${e.data.applianceType}/${e.data.brand}/${e.data.seriesOrModel}/error-codes/${codeSlug}/`,
      lastmod: isoDate(e.data.lastmod),
    });
  }

  for (const t of Array.from(typeSet).sort()) {
    urls.push({ loc: `${base}/appliances/${t}/`, lastmod: isoDate() });
  }
  for (const k of Array.from(brandSet).sort()) {
    const [t, b] = k.split('::');
    urls.push({ loc: `${base}/appliances/${t}/${b}/`, lastmod: isoDate() });
  }
  for (const k of Array.from(modelSet).sort()) {
    const [t, b, m] = k.split('::');
    urls.push({ loc: `${base}/appliances/${t}/${b}/${m}/`, lastmod: isoDate() });
  }

  const systemSubcategories = new Set<string>([
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
  ]);

  for (const sub of Array.from(systemSubcategories).sort()) {
    urls.push({ loc: `${base}/systems/${sub}/`, lastmod: isoDate() });
    urls.push({ loc: `${base}/systems/${sub}/error-codes/`, lastmod: isoDate() });
  }

  for (const e of systems) {
    const codeSlug = e.slug.split('/').slice(-1)[0];
    urls.push({
      loc: `${base}/systems/${e.data.subcategory}/error-codes/${codeSlug}/`,
      lastmod: isoDate(e.data.lastmod),
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => urlTag(u.loc, u.lastmod))
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
