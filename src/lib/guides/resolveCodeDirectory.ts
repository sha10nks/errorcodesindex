import { getCollection, type CollectionEntry } from 'astro:content';
import type { GuideCodeSource } from './buildGuide';

export type GuideCodeRow = {
  code: string;
  meaning: string;
  nextStep: string;
  href: string;
};

function asRegexList(patterns: string[] | undefined) {
  if (!patterns || patterns.length === 0) return [];
  return patterns.map((p) => new RegExp(p, 'i'));
}

function matchesAny(text: string, regexes: RegExp[]) {
  if (regexes.length === 0) return true;
  return regexes.some((r) => r.test(text));
}

function pickMeaning(data: any) {
  const shortLabel = typeof data.shortLabel === 'string' ? data.shortLabel : '';
  const summary = typeof data.summary === 'string' ? data.summary : '';
  if (shortLabel && summary) return `${shortLabel} — ${summary}`;
  return shortLabel || summary || 'See details';
}

function pickNextStepFromText(text: string) {
  const t = text.toLowerCase();
  if (t.includes('timeout') || t.includes('timed out')) return 'Retry once; validate connectivity and service status';
  if (t.includes('access denied') || t.includes('permission')) return 'Verify account permissions and security policy';
  if (t.includes('not found') || t.includes('missing')) return 'Verify the correct path/resource and prerequisites';
  if (t.includes('dns')) return 'Test DNS resolution and try a known-good resolver';
  if (t.includes('offline') || t.includes('cannot connect')) return 'Check network path, firewall/proxy, and service availability';
  if (t.includes('jam') || t.includes('paper')) return 'Clear paper path and verify feed/pickup components';
  if (t.includes('fuser') || t.includes('heater')) return 'Follow manufacturer maintenance guidance; avoid unsafe disassembly';
  if (t.includes('update') || t.includes('install')) return 'Confirm storage/prerequisites; retry after restart';
  if (t.includes('decline') || t.includes('issuer')) return 'Try another method; contact issuer if it follows the card';
  return 'Follow the checklist on the code page';
}

function industryUrl(industry: string, slug: string) {
  return `/${industry}/error-codes/${slug}/`;
}

function systemsUrl(subcategory: string, slug: string) {
  return `/systems/${subcategory}/error-codes/${slug}/`;
}

function appliancesUrl(e: CollectionEntry<'applianceCodes'>) {
  const codeSlug = e.slug.split('/').slice(-1)[0];
  return `/appliances/${e.data.applianceType}/${e.data.brand}/${e.data.seriesOrModel}/error-codes/${codeSlug}/`;
}

function toRow(args: { code: string; meaning: string; href: string }) {
  return {
    code: args.code,
    meaning: args.meaning,
    nextStep: pickNextStepFromText(`${args.code} ${args.meaning}`),
    href: args.href,
  };
}

export async function resolveGuideCodeDirectory(sources: GuideCodeSource[]): Promise<GuideCodeRow[]> {
  const rows: GuideCodeRow[] = [];
  const seen = new Set<string>();

  for (const src of sources) {
    if (src.kind === 'industry') {
      const collectionName =
        src.industry === 'healthcare'
          ? 'healthcareCodes'
          : src.industry === 'irs-tax'
            ? 'irsTaxCodes'
            : src.industry === 'banking'
              ? 'bankingCodes'
              : 'gamingCodes';

      const entries = await getCollection(collectionName as any);
      const rx = asRegexList(src.patterns);
      const matched = entries.filter((e: any) => matchesAny(`${e.data.code} ${e.slug} ${e.data.shortLabel ?? ''} ${e.data.summary ?? ''}`, rx));
      const limited = matched
        .slice()
        .sort((a: any, b: any) => (b.data.lastmod ?? '').localeCompare(a.data.lastmod ?? ''))
        .slice(0, src.limit ?? 24);

      for (const e of limited) {
        const href = industryUrl(src.industry, e.slug);
        if (seen.has(href)) continue;
        seen.add(href);
        rows.push(
          toRow({
            code: e.data.code,
            meaning: pickMeaning(e.data),
            href,
          }),
        );
      }
    }

    if (src.kind === 'systems') {
      const entries = await getCollection('systemCodes');
      const rx = asRegexList(src.patterns);
      const matched = entries.filter(
        (e) => e.data.subcategory === src.subcategory && matchesAny(`${e.data.code} ${e.slug} ${e.data.shortLabel ?? ''} ${e.data.summary ?? ''}`, rx),
      );
      const limited = matched
        .slice()
        .sort((a, b) => (b.data.lastmod ?? '').localeCompare(a.data.lastmod ?? ''))
        .slice(0, src.limit ?? 24);

      for (const e of limited) {
        const codeSlug = e.slug.split('/').slice(-1)[0];
        const href = systemsUrl(src.subcategory, codeSlug);
        if (seen.has(href)) continue;
        seen.add(href);
        rows.push(toRow({ code: e.data.code, meaning: pickMeaning(e.data), href }));
      }
    }

    if (src.kind === 'appliances') {
      const entries = await getCollection('applianceCodes');
      const typeOk = (e: CollectionEntry<'applianceCodes'>) => e.data.applianceType === src.applianceType;
      const brandOk = (e: CollectionEntry<'applianceCodes'>) => !src.brands || src.brands.includes(e.data.brand);
      const seriesOk = (e: CollectionEntry<'applianceCodes'>) => !src.seriesOrModel || src.seriesOrModel.includes(e.data.seriesOrModel);
      const matched = entries.filter((e) => typeOk(e) && brandOk(e) && seriesOk(e));
      const limited = matched
        .slice()
        .sort((a, b) => (b.data.lastmod ?? '').localeCompare(a.data.lastmod ?? ''))
        .slice(0, src.limit ?? 24);

      for (const e of limited) {
        const href = appliancesUrl(e);
        if (seen.has(href)) continue;
        seen.add(href);
        rows.push(toRow({ code: e.data.code, meaning: pickMeaning(e.data), href }));
      }
    }
  }

  return rows;
}
