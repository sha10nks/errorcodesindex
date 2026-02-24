import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { parse } from 'node-html-parser';

const PROJECT_ROOT = process.cwd();

const DOC_ID = '1o9sKjxyBhrNQRxHcyXMq9toYPLqSEgn8kXWqmzQjX1U';
const EXPORT_URL = `https://docs.google.com/document/d/${DOC_ID}/export?format=html`;

const OUTPUTS = {
  healthcare: path.join(PROJECT_ROOT, 'src', 'content', 'healthcareCodes'),
  irsTax: path.join(PROJECT_ROOT, 'src', 'content', 'irsTaxCodes'),
  banking: path.join(PROJECT_ROOT, 'src', 'content', 'bankingCodes'),
  gaming: path.join(PROJECT_ROOT, 'src', 'content', 'gamingCodes'),
  appliances: path.join(PROJECT_ROOT, 'src', 'content', 'applianceCodes'),
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchHtml() {
  const localPath = process.env.GDOC_HTML_PATH;
  if (localPath) {
    const abs = path.isAbsolute(localPath) ? localPath : path.join(PROJECT_ROOT, localPath);
    const html = fs.readFileSync(abs, 'utf8');
    if (process.env.GDOC_DEBUG_WRITE === '1') {
      const outDir = path.join(PROJECT_ROOT, '.cache');
      ensureDir(outDir);
      fs.writeFileSync(path.join(outDir, 'gdoc-export.html'), html, 'utf8');
    }
    return html;
  }

  const url = process.env.GDOC_EXPORT_URL || EXPORT_URL;
  const html = await new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const status = res.statusCode || 0;
          if (status < 200 || status >= 300) {
            reject(new Error(`Google Doc export request failed with status ${status}.`));
            return;
          }
          resolve(data);
        });
      })
      .on('error', reject);
  });

  const looksLikeSignin = html.toLowerCase().includes('to continue to google docs');
  if (looksLikeSignin) {
    throw new Error(
      [
        'Google Doc export is not accessible for build-time import.',
        'Option A: Make the document publicly exportable and keep the default importer.',
        'Option B: Export the document to HTML and set GDOC_HTML_PATH to that file path.',
        'Option C: Set GDOC_EXPORT_URL to a published-to-web or otherwise accessible export endpoint.',
      ].join('\n')
    );
  }

  if (process.env.GDOC_DEBUG_WRITE === '1') {
    const outDir = path.join(PROJECT_ROOT, '.cache');
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'gdoc-export.html'), html, 'utf8');
  }

  return html;
}

function writeEntry({ outDir, relativePath, frontmatter, bodyHtml }) {
  const filePath = path.join(outDir, `${relativePath}.mdx`);
  ensureDir(path.dirname(filePath));
  const fm = Object.entries(frontmatter)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');

  const content = `---\n${fm}\n---\n\n<div>\n${bodyHtml}\n</div>\n`;
  fs.writeFileSync(filePath, content, 'utf8');
}

function detectIndustryHeading(text) {
  const t = text.toLowerCase();
  if (t.includes('healthcare')) return 'healthcare';
  if (t.includes('gaming')) return 'gaming';
  if (t.includes('appliances')) return 'appliances';
  if (t.includes('irs') || t.includes('tax')) return 'irsTax';
  if (t.includes('banking') || t.includes('payment')) return 'banking';
  return null;
}

function isCodeHeading(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return /^[A-Z0-9][A-Z0-9._-]{1,20}\b/.test(trimmed);
}

function extractShortLabel(text) {
  const cleaned = text
    .trim()
    .replace(/^\(|\)$/g, '')
    .replace(/\s+/g, ' ');
  const parts = cleaned.split(/\s+[-–—:]\s+/);
  if (parts.length >= 2) return parts.slice(1).join(' - ').slice(0, 120);
  return cleaned.slice(0, 120);
}

function parseKeyValueLine(line) {
  const m = line.match(/^\s*([A-Z0-9][A-Z0-9 /._-]{1,60})\s*:\s*(.*?)\s*$/i);
  if (!m) return null;
  const key = m[1].trim().toLowerCase().replace(/\s+/g, ' ');
  const value = m[2].trim();
  if (!key || !value) return null;
  return { key, value };
}

function normalizeIndustryFromSection(sectionText) {
  const t = sectionText.toLowerCase();
  if (t.includes('healthcare')) return 'healthcare';
  if (t.includes('gaming')) return 'gaming';
  if (t.includes('appliance')) return 'appliances';
  if (t.includes('irs') || t.includes('tax')) return 'irsTax';
  if (t.includes('banking') || t.includes('payment')) return 'banking';
  return null;
}

function extractSummaryFromBlockTexts(texts) {
  const idx = texts.findIndex((t) => t.toLowerCase() === 'one-sentence summary');
  if (idx === -1) return null;
  for (let i = idx + 1; i < texts.length; i++) {
    const v = texts[i].trim();
    if (v) return v;
  }
  return null;
}

function extractTitleLineFromBlockTexts(texts, code) {
  const lowerCode = code.toLowerCase();
  const candidates = texts.filter((t) => t.trim().startsWith('(') && t.toLowerCase().includes(lowerCode));
  if (candidates.length > 0) return candidates[0];
  const fallback = texts.find((t) => t.toLowerCase().includes(lowerCode) && t.toLowerCase().includes('—'));
  return fallback || null;
}

function inferApplianceHierarchyFromSection(sectionValue) {
  const raw = sectionValue
    .replace(/^appliances\s*/i, '')
    .replace(/\s+error\s+codes?\s*$/i, '')
    .trim();
  const parts = raw
    .split(/\s*\/[\s]*/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    const [applianceType, brand, seriesOrModel] = parts.slice(-3);
    return {
      applianceType: slugify(applianceType),
      brand: slugify(brand),
      seriesOrModel: slugify(seriesOrModel),
    };
  }
  return null;
}

function inferApplianceHierarchyFromSystem(systemValue) {
  const raw = (systemValue || '').trim();
  if (!raw) return null;
  const segments = raw
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  const brandSegment = segments.length >= 2 ? segments[0] : raw;
  const seriesSegment = segments.length >= 2 ? segments.slice(1).join(' / ') : raw;

  const typeCandidates = [
    'washer',
    'dryer',
    'refrigerator',
    'fridge',
    'dishwasher',
    'oven',
    'range',
    'stove',
    'microwave',
    'freezer',
    'air conditioner',
    'ac',
  ];

  const seriesLower = seriesSegment.toLowerCase();
  let type = null;
  for (const candidate of typeCandidates) {
    const re = new RegExp(`\\b${candidate.replace(/ /g, '\\s+')}\\b`, 'i');
    if (re.test(seriesLower)) {
      type = candidate;
      break;
    }
  }

  const applianceType = slugify(type || 'appliances');
  const brand = slugify(brandSegment);
  const seriesOrModel = slugify(seriesSegment);

  if (!brand || !seriesOrModel) return null;
  return { applianceType, brand, seriesOrModel };
}

function parseDelimitedBlocksToEntries(blocks) {
  const entries = [];
  for (const block of blocks) {
    const texts = block.nodes
      .map((n) => (n.text || '').trim())
      .map((t) => t.replace(/\s+/g, ' ').trim());

    const keyValues = texts
      .map(parseKeyValueLine)
      .filter(Boolean)
      .reduce((acc, { key, value }) => {
        if (!acc[key]) acc[key] = [];
        acc[key].push(value);
        return acc;
      }, {});

    const sectionValue = (keyValues['section'] || [])[0] || '';
    const industry = normalizeIndustryFromSection(sectionValue);
    const code = ((keyValues['code'] || [])[0] || '').trim();

    if (!industry || !code) continue;

    const codeSlug = slugify(code);
    const titleLine = extractTitleLineFromBlockTexts(texts, code) || code;
    const shortLabel = extractShortLabel(titleLine);
    const summary = extractSummaryFromBlockTexts(texts);

    const bodyHtml = block.nodes.map((n) => n.toString()).join('\n');

    if (industry === 'appliances') {
      const systemValue = (keyValues['system'] || [])[0] || '';
      const applianceTypeRaw = (keyValues['appliance type'] || keyValues['type'] || [])[0] || '';
      const brandRaw = (keyValues['brand'] || [])[0] || '';
      const modelRaw = (keyValues['series'] || keyValues['series or model'] || keyValues['model'] || [])[0] || '';

      let applianceType = applianceTypeRaw ? slugify(applianceTypeRaw) : null;
      let brand = brandRaw ? slugify(brandRaw) : null;
      let seriesOrModel = modelRaw ? slugify(modelRaw) : null;

      if (!applianceType || !brand || !seriesOrModel) {
        const inferred = inferApplianceHierarchyFromSection(sectionValue);
        if (inferred) {
          applianceType = applianceType || inferred.applianceType;
          brand = brand || inferred.brand;
          seriesOrModel = seriesOrModel || inferred.seriesOrModel;
        }
      }

      if (!applianceType || !brand || !seriesOrModel) {
        const inferred = inferApplianceHierarchyFromSystem(systemValue);
        if (inferred) {
          applianceType = applianceType || inferred.applianceType;
          brand = brand || inferred.brand;
          seriesOrModel = seriesOrModel || inferred.seriesOrModel;
        }
      }

      if (!applianceType || !brand || !seriesOrModel) continue;

      entries.push({
        industry: 'appliances',
        code,
        codeSlug,
        applianceType,
        brand,
        seriesOrModel,
        shortLabel,
        summary,
        bodyHtml,
      });
      continue;
    }

    entries.push({
      industry,
      code,
      codeSlug,
      shortLabel,
      summary,
      bodyHtml,
    });
  }
  return entries;
}

function parseDocToEntries(html) {
  const root = parse(html);
  const body = root.querySelector('body') || root;

  const nodes = body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, table, pre');

  if (process.env.GDOC_DEBUG_WRITE === '1') {
    const outDir = path.join(PROJECT_ROOT, '.cache');
    ensureDir(outDir);
    const counts = nodes.reduce((acc, n) => {
      const tag = n.tagName?.toLowerCase?.() || 'unknown';
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    const keyCounts = {};
    const sectionCounts = {};
    for (const n of nodes) {
      const text = (n.text || '').trim().replace(/\s+/g, ' ');
      const kv = parseKeyValueLine(text);
      if (!kv) continue;
      keyCounts[kv.key] = (keyCounts[kv.key] || 0) + 1;
      if (kv.key === 'section') {
        sectionCounts[kv.value] = (sectionCounts[kv.value] || 0) + 1;
      }
    }

    const sample = nodes.slice(0, 250).map((n) => {
      const tag = n.tagName?.toLowerCase?.() || 'unknown';
      const text = (n.text || '').trim().replace(/\s+/g, ' ').slice(0, 240);
      return { tag, text };
    });
    fs.writeFileSync(
      path.join(outDir, 'gdoc-structure.json'),
      JSON.stringify({ counts, keyCounts, sectionCounts, sample }, null, 2),
      'utf8'
    );
  }

  const START = '=== START ERROR CODE ===';
  const END = '=== END ERROR CODE ===';

  const blocks = [];
  let collecting = false;
  let currentNodes = [];

  for (const node of nodes) {
    const text = (node.text || '').trim().replace(/\s+/g, ' ');
    if (!collecting && text === START) {
      collecting = true;
      currentNodes = [];
      continue;
    }
    if (collecting && text === END) {
      blocks.push({ nodes: currentNodes });
      collecting = false;
      currentNodes = [];
      continue;
    }
    if (collecting) currentNodes.push(node);
  }

  if (process.env.GDOC_DEBUG_WRITE === '1') {
    const outDir = path.join(PROJECT_ROOT, '.cache');
    ensureDir(outDir);
    const applianceSamples = [];
    for (const block of blocks) {
      const texts = block.nodes
        .map((n) => (n.text || '').trim())
        .map((t) => t.replace(/\s+/g, ' ').trim());
      const kv = {};
      for (const t of texts) {
        const parsed = parseKeyValueLine(t);
        if (!parsed) continue;
        kv[parsed.key] = parsed.value;
      }
      if ((kv.section || '').toLowerCase() === 'appliances') {
        applianceSamples.push({ kv, texts: texts.slice(0, 60) });
        if (applianceSamples.length >= 5) break;
      }
    }
    fs.writeFileSync(path.join(outDir, 'gdoc-appliance-sample.json'), JSON.stringify(applianceSamples, null, 2), 'utf8');
  }

  const delimitedEntries = parseDelimitedBlocksToEntries(blocks);
  if (delimitedEntries.length > 0) return delimitedEntries;

  let currentIndustry = null;
  let current = null;
  let applianceType = null;
  let applianceBrand = null;
  let applianceSeries = null;
  const entries = [];

  const pushCurrent = () => {
    if (!current) return;
    if (!currentIndustry) return;

    const { headingText, fragments } = current;
    const code = headingText.trim().split(/\s+/)[0];
    const codeSlug = slugify(code);

    const bodyHtml = fragments.join('\n');

    if (currentIndustry === 'appliances') {
      if (!applianceType || !applianceBrand || !applianceSeries) {
        throw new Error('Appliance entry detected without type/brand/model context.');
      }
      entries.push({
        industry: 'appliances',
        code,
        codeSlug,
        applianceType,
        brand: applianceBrand,
        seriesOrModel: applianceSeries,
        shortLabel: extractShortLabel(headingText),
        bodyHtml,
      });
    } else {
      entries.push({
        industry: currentIndustry,
        code,
        codeSlug,
        shortLabel: extractShortLabel(headingText),
        bodyHtml,
      });
    }

    current = null;
  };

  for (const node of nodes) {
    const text = node.text.trim();
    const maybeIndustry = ['h1', 'h2'].includes(node.tagName.toLowerCase()) ? detectIndustryHeading(text) : null;
    if (maybeIndustry) {
      pushCurrent();
      currentIndustry = maybeIndustry;
      applianceType = null;
      applianceBrand = null;
      applianceSeries = null;
      continue;
    }

    const tag = node.tagName.toLowerCase();
    if (currentIndustry === 'appliances') {
      if (tag === 'h3') {
        pushCurrent();
        applianceType = slugify(text);
        applianceBrand = null;
        applianceSeries = null;
        continue;
      }
      if (tag === 'h4') {
        pushCurrent();
        applianceBrand = slugify(text);
        applianceSeries = null;
        continue;
      }
      if (tag === 'h5') {
        pushCurrent();
        applianceSeries = slugify(text);
        continue;
      }
      if ((tag === 'h6' || tag === 'h5' || tag === 'h4') && isCodeHeading(text)) {
        pushCurrent();
        current = { headingText: text, fragments: [] };
        continue;
      }
    } else {
      if ((tag === 'h2' || tag === 'h3' || tag === 'h4') && isCodeHeading(text)) {
        pushCurrent();
        current = { headingText: text, fragments: [] };
        continue;
      }
    }

    if (current) {
      current.fragments.push(node.toString());
    }
  }

  pushCurrent();
  return entries;
}

async function cleanOutputDirs() {
  for (const dir of Object.values(OUTPUTS)) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        break;
      } catch (err) {
        if (attempt === 4) throw err;
        await sleep(75 * (attempt + 1));
      }
    }
    ensureDir(dir);
  }
}

function writeEntries(entries) {
  const now = new Date().toISOString();

  const merged = [];
  const byKey = new Map();
  for (const e of entries) {
    const key =
      e.industry === 'appliances'
        ? `appliances:${e.applianceType}:${e.brand}:${e.seriesOrModel}:${e.codeSlug}`
        : `${e.industry}:${e.codeSlug}`;

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...e, bodyHtml: e.bodyHtml || '' });
      continue;
    }

    const bodies = new Set([
      ...(existing.bodyHtml ? [existing.bodyHtml] : []),
      ...(e.bodyHtml ? [e.bodyHtml] : []),
    ]);
    existing.bodyHtml = Array.from(bodies).join('\n');
    existing.summary = existing.summary || e.summary || null;
  }

  merged.push(...byKey.values());

  const seen = new Set();
  for (const e of merged.filter((x) => x.industry !== 'appliances')) {
    if (seen.has(`${e.industry}:${e.codeSlug}`)) {
      throw new Error(`Duplicate code slug detected for ${e.industry}: ${e.codeSlug}`);
    }
    seen.add(`${e.industry}:${e.codeSlug}`);
  }

  for (const e of merged) {
    if (e.industry === 'appliances') {
      writeEntry({
        outDir: OUTPUTS.appliances,
        relativePath: path.join(e.applianceType, e.brand, e.seriesOrModel, e.codeSlug),
        frontmatter: {
          industry: 'appliances',
          applianceType: e.applianceType,
          brand: e.brand,
          seriesOrModel: e.seriesOrModel,
          code: e.code,
          shortLabel: e.shortLabel,
          summary: e.summary || undefined,
          lastmod: now,
          source: 'google-doc',
          sourceDocId: DOC_ID,
        },
        bodyHtml: e.bodyHtml,
      });
      continue;
    }

    const outDir =
      e.industry === 'healthcare'
        ? OUTPUTS.healthcare
        : e.industry === 'irsTax'
          ? OUTPUTS.irsTax
          : e.industry === 'banking'
            ? OUTPUTS.banking
            : OUTPUTS.gaming;

    writeEntry({
      outDir,
      relativePath: e.codeSlug,
      frontmatter: {
        industry: e.industry === 'irsTax' ? 'irs-tax' : e.industry,
        code: e.code,
        shortLabel: e.shortLabel,
        summary: e.summary || undefined,
        lastmod: now,
        source: 'google-doc',
        sourceDocId: DOC_ID,
      },
      bodyHtml: e.bodyHtml,
    });
  }
}

async function main() {
  Object.values(OUTPUTS).forEach(ensureDir);

  const html = await fetchHtml();
  const entries = parseDocToEntries(html);

  if (entries.length === 0) {
    throw new Error(
      [
        'No per-code entries were detected in the Google Doc export.',
        'This importer expects industry headings (H1/H2) and per-code headings (H3) inside the Google Doc.',
        'Update the document structure or implement a custom parser for the current document format.',
      ].join('\n')
    );
  }

  await cleanOutputDirs();
  writeEntries(entries);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
