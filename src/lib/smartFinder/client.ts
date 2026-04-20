export type SearchIndexItem = {
  industry: string;
  code: string;
  shortLabel: string;
  url: string;
  lastmod?: string;
  applianceType?: string;
  brand?: string;
  seriesOrModel?: string;
};

export type FinderSelection = {
  industryKey?: string;
  subcategoryKey?: string;
  applianceType?: string;
  brand?: string;
  seriesOrModel?: string;
};

export type AugmentedIndexItem = SearchIndexItem & {
  topIndustryKey: string;
  subcategoryKey?: string;
  normCode: string;
  normCodeLoose: string;
  normLabel: string;
};

export type TaxonomyModel = {
  industries: Array<{ key: string; label: string }>;
  insuranceSubcategories: Array<{ key: string; label: string }>;
  systemsSubcategories: Array<{ key: string; label: string }>;
  appliances: {
    types: Array<{ key: string; label: string }>;
    brandsByType: Record<string, Array<{ key: string; label: string }>>;
    modelsByTypeBrand: Record<string, Array<{ key: string; label: string }>>;
  };
};

export type MatchResult = {
  item: AugmentedIndexItem;
  score: number;
  reasons: string[];
};

export function normalizeText(v: unknown): string {
  return String(v ?? '').trim().toLowerCase();
}

export function normalizeCode(v: unknown): string {
  const raw = String(v ?? '').trim();
  if (!raw) return '';
  const up = raw.toUpperCase();
  return up.replaceAll(' ', '').replaceAll('_', '-');
}

export function normalizeCodeLoose(v: unknown): string {
  const up = normalizeCode(v);
  return up.replaceAll('-', '');
}

function titleFromKey(key: string): string {
  return key
    .split('-')
    .filter(Boolean)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export function augmentIndexItem(it: SearchIndexItem): AugmentedIndexItem {
  const url = String(it.url || '');
  const parts = url.split('/').filter(Boolean);

  let topIndustryKey = it.industry;
  let subcategoryKey: string | undefined;

  if (url.startsWith('/insurance/healthcare/')) {
    topIndustryKey = 'healthcare';
  } else if (url.startsWith('/insurance/')) {
    topIndustryKey = it.industry === 'healthcare' ? 'healthcare' : 'insurance';
    if (topIndustryKey === 'insurance') {
      const idx = parts.indexOf('insurance');
      const errIdx = parts.indexOf('error-codes');
      if (idx !== -1 && errIdx !== -1 && errIdx === idx + 2) subcategoryKey = parts[idx + 1];
    }
  } else if (url.startsWith('/systems/')) {
    topIndustryKey = 'systems';
    const idx = parts.indexOf('systems');
    const errIdx = parts.indexOf('error-codes');
    if (idx !== -1 && errIdx !== -1 && errIdx === idx + 2) subcategoryKey = parts[idx + 1];
  } else if (url.startsWith('/appliances/')) {
    topIndustryKey = 'appliances';
  } else {
    topIndustryKey = it.industry;
  }

  return {
    ...it,
    topIndustryKey,
    subcategoryKey,
    normCode: normalizeCode(it.code),
    normCodeLoose: normalizeCodeLoose(it.code),
    normLabel: normalizeText(it.shortLabel),
  };
}

function stableSort<T>(arr: T[], cmp: (a: T, b: T) => number): T[] {
  return arr
    .map((v, idx) => ({ v, idx }))
    .sort((a, b) => {
      const d = cmp(a.v, b.v);
      return d !== 0 ? d : a.idx - b.idx;
    })
    .map((x) => x.v);
}

export function buildTaxonomy(items: AugmentedIndexItem[]): TaxonomyModel {
  const industries = new Set<string>();
  const insuranceSubs = new Set<string>();
  const systemsSubs = new Set<string>();
  const applianceTypes = new Set<string>();
  const brandsByType = new Map<string, Set<string>>();
  const modelsByTypeBrand = new Map<string, Set<string>>();

  for (const it of items) {
    industries.add(it.topIndustryKey);
    if (it.topIndustryKey === 'insurance' && it.subcategoryKey) insuranceSubs.add(it.subcategoryKey);
    if (it.topIndustryKey === 'systems' && it.subcategoryKey) systemsSubs.add(it.subcategoryKey);
    if (it.topIndustryKey === 'appliances') {
      const t = it.applianceType || '';
      const b = it.brand || '';
      const m = it.seriesOrModel || '';
      if (t) applianceTypes.add(t);
      if (t && b) {
        if (!brandsByType.has(t)) brandsByType.set(t, new Set());
        brandsByType.get(t)?.add(b);
      }
      if (t && b && m) {
        const k = `${t}::${b}`;
        if (!modelsByTypeBrand.has(k)) modelsByTypeBrand.set(k, new Set());
        modelsByTypeBrand.get(k)?.add(m);
      }
    }
  }

  const industryLabel: Record<string, string> = {
    insurance: 'Insurance',
    healthcare: 'Healthcare',
    'irs-tax': 'IRS / Tax',
    banking: 'Banking',
    gaming: 'Gaming',
    appliances: 'Appliances',
    systems: 'Systems & Devices',
  };

  const industriesArr = stableSort(Array.from(industries), (a, b) => {
    const ai = Object.keys(industryLabel).indexOf(a);
    const bi = Object.keys(industryLabel).indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  }).map((k) => ({ key: k, label: industryLabel[k] || titleFromKey(k) }));

  const insuranceSubArr = stableSort(Array.from(insuranceSubs), (a, b) => a.localeCompare(b)).map((k) => ({
    key: k,
    label: titleFromKey(k),
  }));

  const systemsSubArr = stableSort(Array.from(systemsSubs), (a, b) => a.localeCompare(b)).map((k) => ({
    key: k,
    label: titleFromKey(k),
  }));

  const typesArr = stableSort(Array.from(applianceTypes), (a, b) => a.localeCompare(b)).map((k) => ({
    key: k,
    label: titleFromKey(k),
  }));

  const brandsObj: Record<string, Array<{ key: string; label: string }>> = {};
  for (const [t, s] of brandsByType.entries()) {
    brandsObj[t] = stableSort(Array.from(s), (a, b) => a.localeCompare(b)).map((k) => ({ key: k, label: titleFromKey(k) }));
  }

  const modelsObj: Record<string, Array<{ key: string; label: string }>> = {};
  for (const [k, s] of modelsByTypeBrand.entries()) {
    modelsObj[k] = stableSort(Array.from(s), (a, b) => a.localeCompare(b)).map((m) => ({ key: m, label: m }));
  }

  return {
    industries: industriesArr,
    insuranceSubcategories: insuranceSubArr,
    systemsSubcategories: systemsSubArr,
    appliances: {
      types: typesArr,
      brandsByType: brandsObj,
      modelsByTypeBrand: modelsObj,
    },
  };
}

export function applySelectionFilter(items: AugmentedIndexItem[], sel: FinderSelection): AugmentedIndexItem[] {
  let out = items;
  if (sel.industryKey) {
    out = out.filter((it) => it.topIndustryKey === sel.industryKey);
  }
  if (sel.industryKey === 'insurance' && sel.subcategoryKey) {
    out = out.filter((it) => it.subcategoryKey === sel.subcategoryKey);
  }
  if (sel.industryKey === 'systems' && sel.subcategoryKey) {
    out = out.filter((it) => it.subcategoryKey === sel.subcategoryKey);
  }
  if (sel.industryKey === 'appliances') {
    if (sel.applianceType) out = out.filter((it) => (it.applianceType || '') === sel.applianceType);
    if (sel.brand) out = out.filter((it) => (it.brand || '') === sel.brand);
    if (sel.seriesOrModel) out = out.filter((it) => (it.seriesOrModel || '') === sel.seriesOrModel);
  }
  return out;
}

function scoreMatch(it: AugmentedIndexItem, q: string, qLoose: string): MatchResult {
  const reasons: string[] = [];
  if (!q) return { item: it, score: 0, reasons };

  let score = 0;
  if (it.normCode === q) {
    score = 1000;
    reasons.push('exact-code');
  } else if (it.normCodeLoose === qLoose && qLoose.length >= 2) {
    score = 900;
    reasons.push('exact-code-loose');
  } else if (it.normCode.startsWith(q) && q.length >= 2) {
    score = 650;
    reasons.push('code-prefix');
  } else if (it.normCodeLoose.startsWith(qLoose) && qLoose.length >= 2) {
    score = 620;
    reasons.push('code-prefix-loose');
  } else {
    const hay = `${it.normCode} ${it.normLabel} ${normalizeText(it.topIndustryKey)} ${normalizeText(it.subcategoryKey || '')}`;
    const h = normalizeText(hay);
    const qt = normalizeText(q);
    if (h.includes(qt) && qt.length >= 2) {
      score = 220;
      reasons.push('text-contains');
      if (it.normLabel.includes(qt)) score += 40;
      if (it.normCode.includes(qt)) score += 60;
    }
  }
  return { item: it, score, reasons };
}

export function findMatches(items: AugmentedIndexItem[], queryRaw: string, sel: FinderSelection, limit = 12): MatchResult[] {
  const q = normalizeCode(queryRaw);
  const qLoose = normalizeCodeLoose(queryRaw);
  const filtered = applySelectionFilter(items, sel);
  const scored = filtered
    .map((it) => scoreMatch(it, q, qLoose))
    .filter((m) => m.score > 0);

  const sorted = stableSort(scored, (a, b) => b.score - a.score);
  return sorted.slice(0, limit);
}

export function inferSelection(items: AugmentedIndexItem[], queryRaw: string, current: FinderSelection): { next: FinderSelection; confidence: 'high' | 'medium' | 'low' | 'none' } {
  const q = normalizeCode(queryRaw);
  if (!q) return { next: current, confidence: 'none' };

  const exact = items.filter((it) => it.normCode === q || it.normCodeLoose === normalizeCodeLoose(q));
  if (exact.length === 0) return { next: current, confidence: 'none' };

  const byIndustry = new Map<string, AugmentedIndexItem[]>();
  for (const it of exact) {
    const k = it.topIndustryKey;
    if (!byIndustry.has(k)) byIndustry.set(k, []);
    byIndustry.get(k)?.push(it);
  }

  const industries = Array.from(byIndustry.entries()).sort((a, b) => b[1].length - a[1].length);
  const top = industries[0];
  const next: FinderSelection = { ...current };

  if (!next.industryKey) next.industryKey = top[0];

  if (next.industryKey === 'insurance' && !next.subcategoryKey) {
    const subs = new Set(exact.filter((it) => it.topIndustryKey === 'insurance').map((it) => it.subcategoryKey).filter(Boolean) as string[]);
    if (subs.size === 1) next.subcategoryKey = Array.from(subs)[0];
  }

  if (next.industryKey === 'systems' && !next.subcategoryKey) {
    const subs = new Set(exact.filter((it) => it.topIndustryKey === 'systems').map((it) => it.subcategoryKey).filter(Boolean) as string[]);
    if (subs.size === 1) next.subcategoryKey = Array.from(subs)[0];
  }

  if (next.industryKey === 'appliances') {
    const match = exact.find((it) => it.topIndustryKey === 'appliances');
    if (match) {
      if (!next.applianceType && match.applianceType) next.applianceType = match.applianceType;
      if (!next.brand && match.brand) next.brand = match.brand;
      if (!next.seriesOrModel && match.seriesOrModel) next.seriesOrModel = match.seriesOrModel;
    }
  }

  if (industries.length === 1 && exact.length === 1) return { next, confidence: 'high' };
  if (industries.length === 1) return { next, confidence: 'medium' };
  return { next, confidence: 'low' };
}

function withQ(url: string, q: string): string {
  if (!q) return url;
  const has = url.includes('?');
  const sep = has ? '&' : '?';
  return `${url}${sep}q=${encodeURIComponent(q)}`;
}

export function getFallbackUrl(sel: FinderSelection, queryRaw: string): string {
  const q = normalizeCode(queryRaw);
  if (sel.industryKey === 'banking') return withQ('/banking/error-codes/', q);
  if (sel.industryKey === 'gaming') return withQ('/gaming/error-codes/', q);
  if (sel.industryKey === 'irs-tax') return withQ('/irs-tax/error-codes/', q);
  if (sel.industryKey === 'healthcare') return withQ('/insurance/healthcare/error-codes/', q);
  if (sel.industryKey === 'insurance') {
    if (sel.subcategoryKey) return withQ(`/insurance/${sel.subcategoryKey}/error-codes/`, q);
    return '/insurance/';
  }
  if (sel.industryKey === 'systems') {
    if (sel.subcategoryKey) return withQ(`/systems/${sel.subcategoryKey}/error-codes/`, q);
    return '/systems/';
  }
  if (sel.industryKey === 'appliances') {
    if (sel.applianceType && sel.brand && sel.seriesOrModel) return `/appliances/${sel.applianceType}/${sel.brand}/${sel.seriesOrModel}/`;
    if (sel.applianceType && sel.brand) return `/appliances/${sel.applianceType}/${sel.brand}/`;
    if (sel.applianceType) return `/appliances/${sel.applianceType}/`;
    return '/appliances/';
  }
  return '/';
}

export function getIndustryDirectory(industryKey: string, queryRaw: string): string {
  return getFallbackUrl({ industryKey }, queryRaw);
}

