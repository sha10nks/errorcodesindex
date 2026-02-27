import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

function walkHtmlFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) out.push(p);
    }
  }
  return out;
}

function filePathToPagePath(htmlFile) {
  const rel = path.relative(DIST_DIR, htmlFile).replaceAll('\\', '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}/`;
  return `/${rel}`;
}

function hasExtension(p) {
  const last = p.split('/').pop() || '';
  return /\.[a-z0-9]+$/i.test(last);
}

function resolveToDistCandidates(pathname) {
  if (!pathname.startsWith('/')) return [];
  if (pathname === '/') return [path.join(DIST_DIR, 'index.html')];

  const clean = pathname.replace(/^\//, '');
  if (pathname.endsWith('/')) return [path.join(DIST_DIR, clean, 'index.html')];
  if (hasExtension(pathname)) return [path.join(DIST_DIR, clean)];

  return [path.join(DIST_DIR, clean, 'index.html'), path.join(DIST_DIR, `${clean}.html`)];
}

function normalizeHref(href, basePath) {
  const raw = String(href || '').trim();
  if (!raw) return null;
  if (raw.startsWith('#')) return null;
  if (/^(mailto:|tel:|javascript:)/i.test(raw)) return null;
  if (/^https?:\/\//i.test(raw)) return null;

  try {
    const u = new URL(raw, `https://internal.test${basePath}`);
    return u.pathname;
  } catch {
    return null;
  }
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Missing dist directory at ${DIST_DIR}`);
    process.exit(1);
  }

  const htmlFiles = walkHtmlFiles(DIST_DIR);
  const missing = [];

  for (const file of htmlFiles) {
    const basePath = filePathToPagePath(file);
    const html = fs.readFileSync(file, 'utf8');
    const root = parse(html);
    const anchors = root.querySelectorAll('a[href]');

    for (const a of anchors) {
      const href = a.getAttribute('href');
      const pathname = normalizeHref(href, basePath);
      if (!pathname) continue;

      const candidates = resolveToDistCandidates(pathname);
      if (!candidates.length) continue;

      const exists = candidates.some((p) => fs.existsSync(p));
      if (!exists) {
        missing.push({ from: basePath, href, pathname, file });
      }
    }
  }

  if (!missing.length) {
    console.log(`Internal link validation passed (${htmlFiles.length} HTML files checked).`);
    return;
  }

  console.error(`Broken internal links detected: ${missing.length}`);
  for (const m of missing.slice(0, 50)) {
    console.error(`- ${m.from} -> ${m.href} (resolved: ${m.pathname})`);
  }
  if (missing.length > 50) console.error(`...and ${missing.length - 50} more`);
  process.exit(1);
}

main();

