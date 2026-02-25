import type { SearchIndexItem } from './searchIndex';
import { getSearchIndexItems } from './searchIndex';

export type HomeFeedItem = {
  industry: string;
  code: string;
  shortLabel: string;
  url: string;
  lastmod?: string;
};

export type PrefixBucket = {
  key: string;
  label: string;
  query: string;
  href: string;
  count: number;
};

export type HomeFeed = {
  trendingCodes: HomeFeedItem[];
  recentlyIndexed: HomeFeedItem[];
  prefixBuckets: PrefixBucket[];
};

function toHomeFeedItem(it: SearchIndexItem): HomeFeedItem {
  return {
    industry: it.industry,
    code: it.code,
    shortLabel: it.shortLabel,
    url: it.url,
    lastmod: it.lastmod,
  };
}

function parseLastmod(lastmod?: string): number {
  if (!lastmod) return 0;
  const t = Date.parse(lastmod);
  return Number.isFinite(t) ? t : 0;
}

function getHttpCode(code: string): number | null {
  if (!/^\d{3}$/.test(code)) return null;
  const n = Number(code);
  if (!Number.isFinite(n)) return null;
  if (n < 100 || n > 599) return null;
  return n;
}

function trendingScore(item: HomeFeedItem): number {
  const code = item.code || '';
  const codeUpper = code.toUpperCase();
  const http = getHttpCode(code);

  let score = 0;

  if (codeUpper.startsWith('0X')) score += 100;
  if (codeUpper.startsWith('ORA-')) score += 95;
  if (http !== null) score += http >= 400 ? 90 : 70;
  if (codeUpper.startsWith('WS-')) score += 60;
  if (/^CP\d+/i.test(codeUpper)) score += 55;
  if (code.length <= 4) score += 50;
  else if (code.length <= 7) score += 20;

  return score;
}

function takeTopStable(items: HomeFeedItem[], count: number): HomeFeedItem[] {
  return items
    .slice()
    .sort((a, b) => {
      const s = trendingScore(b) - trendingScore(a);
      if (s !== 0) return s;
      return (a.code || '').localeCompare(b.code || '', 'en', { numeric: true });
    })
    .slice(0, count);
}

function buildTrending(items: HomeFeedItem[], maxItems: number): HomeFeedItem[] {
  const byIndustry = new Map<string, HomeFeedItem[]>();
  for (const it of items) {
    const arr = byIndustry.get(it.industry) ?? [];
    arr.push(it);
    byIndustry.set(it.industry, arr);
  }

  const picked: HomeFeedItem[] = [];
  const seen = new Set<string>();

  const industries = Array.from(byIndustry.keys()).sort();
  for (const ind of industries) {
    const top = takeTopStable(byIndustry.get(ind) ?? [], 2);
    for (const it of top) {
      if (picked.length >= maxItems) break;
      const key = `${it.industry}:${it.url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(it);
    }
  }

  if (picked.length >= maxItems) return picked.slice(0, maxItems);

  const globalTop = takeTopStable(items, maxItems * 2);
  for (const it of globalTop) {
    if (picked.length >= maxItems) break;
    const key = `${it.industry}:${it.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(it);
  }

  return picked.slice(0, maxItems);
}

function buildRecentlyIndexed(items: HomeFeedItem[], maxItems: number): HomeFeedItem[] {
  const sorted = items
    .slice()
    .sort((a, b) => {
      const t = parseLastmod(b.lastmod) - parseLastmod(a.lastmod);
      if (t !== 0) return t;
      return (a.code || '').localeCompare(b.code || '', 'en', { numeric: true });
    });

  return sorted.slice(0, maxItems);
}

function buildPrefixBuckets(items: HomeFeedItem[]): PrefixBucket[] {
  const defs: Array<{
    key: string;
    label: string;
    query: string;
    match: (code: string) => boolean;
  }> = [
    { key: '0x', label: '0x____', query: '0x', match: (c) => /^0x/i.test(c) },
    { key: 'ora', label: 'ORA-____', query: 'ORA-', match: (c) => /^ORA-/i.test(c) },
    {
      key: 'http',
      label: 'HTTP-___',
      query: '4',
      match: (c) => {
        const http = getHttpCode(c);
        return http !== null;
      },
    },
    { key: 'e', label: 'E-____', query: 'E', match: (c) => /^E/i.test(c) },
    { key: 'ws', label: 'WS-____', query: 'WS-', match: (c) => /^WS-/i.test(c) },
    { key: 'cp', label: 'CP____', query: 'CP', match: (c) => /^CP\d+/i.test(c) },
  ];

  return defs
    .map((d) => {
      const count = items.reduce((acc, it) => (d.match(it.code) ? acc + 1 : acc), 0);
      return {
        key: d.key,
        label: d.label,
        query: d.query,
        href: `/?q=${encodeURIComponent(d.query)}#find-a-code`,
        count,
      } satisfies PrefixBucket;
    })
    .filter((b) => b.count > 0);
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const items = (await getSearchIndexItems()).map(toHomeFeedItem);

  const trendingCodes = buildTrending(items, 9);
  const recentlyIndexed = buildRecentlyIndexed(items, 9);
  const prefixBuckets = buildPrefixBuckets(items);

  return { trendingCodes, recentlyIndexed, prefixBuckets };
}
