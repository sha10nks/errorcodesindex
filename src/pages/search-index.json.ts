import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const healthcare = await getCollection('healthcareCodes');
  const irsTax = await getCollection('irsTaxCodes');
  const banking = await getCollection('bankingCodes');
  const gaming = await getCollection('gamingCodes');
  const appliances = await getCollection('applianceCodes');

  const items: Array<Record<string, string>> = [];

  for (const e of healthcare) {
    items.push({
      industry: 'healthcare',
      code: e.data.code,
      shortLabel: e.data.shortLabel,
      url: `/healthcare/error-codes/${e.slug}/`,
    });
  }
  for (const e of irsTax) {
    items.push({
      industry: 'irs-tax',
      code: e.data.code,
      shortLabel: e.data.shortLabel,
      url: `/irs-tax/error-codes/${e.slug}/`,
    });
  }
  for (const e of banking) {
    items.push({
      industry: 'banking',
      code: e.data.code,
      shortLabel: e.data.shortLabel,
      url: `/banking/error-codes/${e.slug}/`,
    });
  }
  for (const e of gaming) {
    items.push({
      industry: 'gaming',
      code: e.data.code,
      shortLabel: e.data.shortLabel,
      url: `/gaming/error-codes/${e.slug}/`,
    });
  }
  for (const e of appliances) {
    const codeSlug = e.slug.split('/').slice(-1)[0];
    items.push({
      industry: 'appliances',
      code: e.data.code,
      shortLabel: e.data.shortLabel,
      applianceType: e.data.applianceType,
      brand: e.data.brand,
      seriesOrModel: e.data.seriesOrModel,
      url: `/appliances/${e.data.applianceType}/${e.data.brand}/${e.data.seriesOrModel}/error-codes/${codeSlug}/`,
    });
  }

  items.sort((a, b) => (a.code || '').localeCompare(b.code || '', 'en', { numeric: true }));

  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), items }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

