export type AuthoritySections = {
  sectionLabel?: string;
  systemLabel?: string;
  whatMeans: string[];
  whereSeen: string[];
  whyAppears: string[];
  happensNext: string[];
  notThis: string[];
  troubleshooting: string[];
  notes: string[];
  mentionedRelatedCodes: string[];
};

function decodeEntities(input: string): string {
  return input
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, ' ');
}

function toLines(body: string): string[] {
  const normalized = decodeEntities(stripTags(body))
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (!normalized) return [];
  return normalized
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function normKey(s: string): string {
  return s.trim().toLowerCase();
}

function grabSection(lines: string[], startIdx: number, stopKeys: Set<string>): string[] {
  const out: string[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const k = normKey(lines[i]);
    if (stopKeys.has(k)) break;
    if (!lines[i].trim()) continue;
    out.push(lines[i].trim());
  }
  return out;
}

function collectMentionedCodes(lines: string[]): string[] {
  const out: string[] = [];
  for (const l of lines) {
    const m = l.match(/^(?:[A-Z]{1,4}-\d{1,4}|[A-Z]{1,4}\d{1,4}|0x[0-9a-f]{4,}|\d{2,4})\b/i);
    if (!m) continue;
    const code = m[0].trim();
    if (!code) continue;
    out.push(code);
  }
  return Array.from(new Set(out));
}

export function parseAuthoritySectionsFromBody(body: string): AuthoritySections {
  const lines = toLines(body);

  const aliases: Array<{ key: string; matches: string[] }> = [
    { key: 'what', matches: ['what this code means'] },
    { key: 'where', matches: ['where users usually see this code', 'where users see this code'] },
    { key: 'why', matches: ['why this code usually appears', 'why this code appears'] },
    { key: 'next', matches: ['what typically happens next'] },
    { key: 'not', matches: ['what this code is not', 'what this code is not'] },
    { key: 'trouble', matches: ['troubleshooting checklist', 'optional next actions'] },
    { key: 'notes', matches: ['notes and edge cases'] },
    { key: 'related', matches: ['related error codes', 'related codes'] },
  ];

  const allHeaderKeys = new Set<string>();
  for (const a of aliases) for (const m of a.matches) allHeaderKeys.add(normKey(m));
  allHeaderKeys.add(normKey('external help (optional)'));

  const indexOf = (matches: string[]) => {
    const matchSet = new Set(matches.map(normKey));
    return lines.findIndex((l) => matchSet.has(normKey(l)));
  };

  const sectionLabel = lines.find((l) => /^SECTION:\s+/i.test(l))?.replace(/^SECTION:\s+/i, '').trim();
  const systemLabel = lines.find((l) => /^SYSTEM:\s+/i.test(l))?.replace(/^SYSTEM:\s+/i, '').trim();

  const idxWhat = indexOf(aliases.find((a) => a.key === 'what')?.matches ?? []);
  const idxWhere = indexOf(aliases.find((a) => a.key === 'where')?.matches ?? []);
  const idxWhy = indexOf(aliases.find((a) => a.key === 'why')?.matches ?? []);
  const idxNext = indexOf(aliases.find((a) => a.key === 'next')?.matches ?? []);
  const idxNot = indexOf(aliases.find((a) => a.key === 'not')?.matches ?? []);
  const idxTrouble = indexOf(aliases.find((a) => a.key === 'trouble')?.matches ?? []);
  const idxNotes = indexOf(aliases.find((a) => a.key === 'notes')?.matches ?? []);
  const idxRelated = indexOf(aliases.find((a) => a.key === 'related')?.matches ?? []);

  const whatMeans = idxWhat >= 0 ? grabSection(lines, idxWhat, allHeaderKeys) : [];
  const whereSeen = idxWhere >= 0 ? grabSection(lines, idxWhere, allHeaderKeys) : [];
  const whyAppears = idxWhy >= 0 ? grabSection(lines, idxWhy, allHeaderKeys) : [];
  const happensNext = idxNext >= 0 ? grabSection(lines, idxNext, allHeaderKeys) : [];
  const notThis = idxNot >= 0 ? grabSection(lines, idxNot, allHeaderKeys) : [];
  const troubleshooting = idxTrouble >= 0 ? grabSection(lines, idxTrouble, allHeaderKeys) : [];
  const notes = idxNotes >= 0 ? grabSection(lines, idxNotes, allHeaderKeys) : [];

  const relatedLines = idxRelated >= 0 ? grabSection(lines, idxRelated, allHeaderKeys) : [];
  const mentionedRelatedCodes = collectMentionedCodes(relatedLines);

  return {
    sectionLabel,
    systemLabel,
    whatMeans,
    whereSeen,
    whyAppears,
    happensNext,
    notThis,
    troubleshooting,
    notes,
    mentionedRelatedCodes,
  };
}

