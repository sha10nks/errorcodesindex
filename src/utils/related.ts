export function pickRelatedSlugs(allSlugs: string[], currentSlug: string, min = 3, max = 10): string[] {
  const slugs = allSlugs.filter((s) => s !== currentSlug).sort();
  if (slugs.length === 0) return [];

  const count = Math.min(Math.max(min, 3), Math.min(max, 10), slugs.length);
  const idx = Math.max(0, slugs.findIndex((s) => s > currentSlug));

  const picked: string[] = [];
  for (let i = 0; i < slugs.length && picked.length < count; i++) {
    const pos = (idx + i) % slugs.length;
    picked.push(slugs[pos]);
  }
  return picked;
}

export type RelatedEntry = {
  slug: string;
  data: {
    code: string;
    shortLabel: string;
    summary?: string;
    lastmod?: string;
    industry?: string;
    applianceType?: string;
    brand?: string;
    seriesOrModel?: string;
  };
};

type RelatedPickOpts = {
  industryKey: string;
  currentSlug: string;
  currentCode: string;
  currentText: string;
  mentionedCodes?: string[];
  appliance?: {
    applianceType: string;
    brand: string;
    seriesOrModel: string;
  };
  max: number;
};

function normTokens(text: string): Set<string> {
  return new Set(
    (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/g)
      .filter((t) => t.length >= 3 && t.length <= 20)
      .slice(0, 80)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function parseTime(s?: string): number {
  if (!s) return 0;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}

function prefixKey(code: string): string {
  const c = (code || '').trim();
  const up = c.toUpperCase();
  const hex = up.match(/^0X[0-9A-F]{4,}/);
  if (hex) return up.slice(0, 6);
  const dash = up.match(/^([A-Z]{1,4}-)/);
  if (dash) return dash[1];
  const two = up.match(/^([A-Z]{2})\b/);
  if (two) return two[1];
  const n = up.match(/^(\d{2,4})\b/);
  if (n) return n[1].slice(0, 1);
  return up.slice(0, 2);
}

export function pickRelatedEntries(entries: RelatedEntry[], opts: RelatedPickOpts): RelatedEntry[] {
  const currentPrefix = prefixKey(opts.currentCode);
  const currentTokens = normTokens(opts.currentText);
  const mentioned = new Set((opts.mentionedCodes ?? []).map((c) => c.toUpperCase()));

  const scored = entries
    .filter((e) => e.slug !== opts.currentSlug)
    .map((e) => {
      const code = e.data.code || '';
      const upCode = code.toUpperCase();
      const p = prefixKey(code);
      const text = `${e.data.shortLabel || ''} ${e.data.summary || ''}`;
      const tokens = normTokens(text);

      let score = 0;
      if ((e.data.industry || opts.industryKey) === opts.industryKey) score += 100;
      if (p && p === currentPrefix) score += 70;
      if (mentioned.has(upCode)) score += 120;

      if (opts.industryKey === 'appliances' && opts.appliance) {
        if (e.data.applianceType === opts.appliance.applianceType) score += 60;
        if (e.data.brand === opts.appliance.brand) score += 55;
        if (e.data.seriesOrModel === opts.appliance.seriesOrModel) score += 50;
      }

      const sim = jaccard(currentTokens, tokens);
      score += Math.round(sim * 80);
      score += Math.min(30, Math.round(parseTime(e.data.lastmod) / (1000 * 60 * 60 * 24 * 365)));

      return { e, score };
    })
    .sort((a, b) => {
      const d = b.score - a.score;
      if (d !== 0) return d;
      return (a.e.data.code || '').localeCompare(b.e.data.code || '', 'en', { numeric: true });
    });

  const picked: RelatedEntry[] = [];
  for (const s of scored) {
    if (picked.length >= opts.max) break;
    picked.push(s.e);
  }
  return picked;
}

