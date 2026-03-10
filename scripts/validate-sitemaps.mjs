import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'node-html-parser'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const DOMAIN = 'https://errorcodesindex.com'

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function exists(p) {
  return fs.existsSync(p)
}

function extractLocs(xml) {
  const locs = []
  const re = /<loc>([^<]+)<\/loc>/g
  let m
  while ((m = re.exec(xml))) locs.push(m[1].trim())
  return locs
}

function toDistCandidates(absUrl) {
  if (!absUrl.startsWith(DOMAIN)) return []
  const url = new URL(absUrl)
  let pathname = url.pathname
  if (!pathname.startsWith('/')) pathname = `/${pathname}`
  const clean = pathname.replace(/\/+$/, '')
  // prefer directory with index.html
  return [
    path.join(DIST_DIR, clean.slice(1), 'index.html'),
    path.join(DIST_DIR, `${clean.slice(1)}.html`),
    pathname === '/' ? path.join(DIST_DIR, 'index.html') : ''
  ].filter(Boolean)
}

function assertCanonical(html, expectedUrl) {
  const root = parse(html)
  const link = root.querySelector('link[rel="canonical"]')
  if (!link) return { ok: false, reason: 'missing_canonical' }
  const href = (link.getAttribute('href') || '').trim()
  if (href !== expectedUrl) return { ok: false, reason: `canonical_mismatch: ${href}` }
  return { ok: true }
}

function assertIndexable(html) {
  const root = parse(html)
  const robots = root.querySelector('meta[name="robots"]')
  if (!robots) return { ok: false, reason: 'missing_robots_meta' }
  const content = (robots.getAttribute('content') || '').toLowerCase()
  if (content.includes('noindex')) return { ok: false, reason: 'noindex' }
  const hasIndex = /\bindex\b/.test(content)
  const hasFollow = /\bfollow\b/.test(content)
  if (!hasIndex || !hasFollow) return { ok: false, reason: 'robots_not_index_follow' }
  return { ok: true }
}

function main() {
  const indexPath = path.join(DIST_DIR, 'sitemap.xml')
  if (!exists(indexPath)) {
    console.error('Missing dist sitemap index:', indexPath)
    process.exit(1)
  }
  const indexXml = read(indexPath)
  const childSitemaps = extractLocs(indexXml)
  if (!childSitemaps.length) {
    console.error('No child sitemaps found in index')
    process.exit(1)
  }

  const problems = []
  for (const sm of childSitemaps) {
    if (!sm.startsWith(DOMAIN)) {
      problems.push({ url: sm, issue: 'non_canonical_domain' })
      continue
    }
    const smRel = new URL(sm).pathname.replace(/^\//, '')
    const smFile = path.join(DIST_DIR, smRel)
    if (!exists(smFile)) {
      problems.push({ url: sm, issue: 'missing_child_sitemap' })
      continue
    }
    const smXml = read(smFile)
    const urls = extractLocs(smXml)
    for (const loc of urls) {
      // domain checks
      const u = new URL(loc)
      if (u.protocol !== 'https:') problems.push({ url: loc, issue: 'non_https' })
      if (u.hostname !== 'errorcodesindex.com') problems.push({ url: loc, issue: 'www_or_alt_host' })
      if (!u.pathname.endsWith('/')) problems.push({ url: loc, issue: 'missing_trailing_slash' })

      const candidates = toDistCandidates(loc)
      const hit = candidates.find((p) => exists(p))
      if (!hit) {
        problems.push({ url: loc, issue: 'missing_dist_file' })
        continue
      }
      const html = read(hit)
      const can = assertCanonical(html, loc)
      if (!can.ok) problems.push({ url: loc, issue: can.reason })
      const idx = assertIndexable(html)
      if (!idx.ok) problems.push({ url: loc, issue: idx.reason })
    }
  }

  if (problems.length) {
    console.error(`Sitemap validation FAILED with ${problems.length} issue(s):`)
    for (const p of problems.slice(0, 50)) console.error(`- ${p.issue} :: ${p.url}`)
    if (problems.length > 50) console.error(`...and ${problems.length - 50} more`)
    process.exit(1)
  } else {
    console.log('Sitemap validation passed. All URLs are canonical, indexable, and mapped to 200 pages.')
  }
}

main()
