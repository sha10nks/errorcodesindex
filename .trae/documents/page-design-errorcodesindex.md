# Page Design Spec — ErrorCodesIndex.com (Desktop-first)

## Global Styles (all pages)
- Layout system: Hybrid CSS Grid + Flexbox (Grid for page scaffolding, Flex for inline alignment).
- Max width: 1120–1200px content container; full-bleed background.
- Spacing scale: 4/8/12/16/24/32/48.
- Typography: system sans (e.g., Inter/system-ui); base 16px; headings 32/24/20/18.
- Colors:
  - Background: white / near-white.
  - Text: neutral-900; muted text neutral-600.
  - Accent: a single blue (links/buttons) with hover darkening + underline on hover.
  - Borders: neutral-200.
- Components:
  - Buttons: solid accent for primary; outline for secondary; focus ring visible.
  - Links: underlined on hover; visited state slightly muted.
  - Code styling: monospace for error codes; subtle background chip for inline code.
- Responsive behavior:
  - Desktop-first; collapse multi-column layouts into single column under ~768px.

## SEO / Meta Information (all pages)
- Title template: `{PageTitle} | ErrorCodesIndex.com`.
- Description: from page frontmatter/metadata; fallback to concise generic description for index pages.
- Open Graph: `og:title`, `og:description`, `og:type=website`, `og:url` (canonical), optional `og:image`.
- Canonicals: `<link rel="canonical" href="https://errorcodesindex.com/<locked-path>/" />`.
- Robots meta: default `index,follow` on canonical pages; ensure non-canonical utility pages are not generated.
- JSON-LD: emit per error-code page with identifier fields (see Error Code Page).

---

## Page: Home (/)
### Layout
- Single-column container with a top nav; primary content in stacked sections.

### Page Structure
1. Header / Top Nav
2. Hero + Search
3. Browse entry cards
4. Recently updated list
5. Footer

### Sections & Components
- Header
  - Left: site logo/text.
  - Center/Right: nav links to Vendor/Product/Platform browse roots.
- Hero + Search
  - H1 describing the site.
  - Search input (large) with helper text: “Search by code (e.g., 0x80070005)”.
  - Results dropdown/panel:
    - Shows top matches with code + title + vendor/product.
    - Keyboard navigation (up/down/enter) and clear button.
- Browse entry cards
  - 3–6 cards linking to major index pages (Vendor/Product/Platform).
- Recently updated
  - Simple list/table: code, title, lastUpdated; links to error pages.
- Footer
  - Links: Sitemap, Robots, About/Contact if present (optional).

---

## Page: Error Code Page (/error/<code>/)
### Layout
- Two-column desktop layout:
  - Main content (left, ~8/12)
  - Sticky aside (right, ~4/12) for metadata + related links

### Page Structure
1. Breadcrumbs
2. Title block (code + title)
3. Verbatim content body
4. Related links
5. Footer

### Sections & Components
- Breadcrumbs
  - Home → Vendor/Product/Platform (when available) → Current code.
- Title block
  - H1: error code (monospace) + human title.
  - Metadata row: vendor, product, platform, last updated.
- Verbatim content body (critical requirement)
  - Render the imported Google Doc content **verbatim**.
  - Allowed transformations: structural formatting required for Markdown/MDX rendering (headings/lists/code blocks) without changing wording.
  - Disallowed: paraphrasing, rewriting, summarization, or “improving” text.
- Aside (sticky)
  - “On this page” TOC (if headings exist).
  - Quick facts: code, vendor/product/platform.
  - Related codes (by tags/vendor/product).
- SEO specifics
  - Canonical matches `/error/<code>/`.
  - JSON-LD block includes:
    - `headline`/name, `description`, `identifier` (the code), `dateModified`, `url`.

---

## Page: Index / Category Listing (e.g., /vendor/<vendor>/)
### Layout
- Header + filter/search row + grid/list results; optional right rail for popular filters.

### Page Structure
1. Title + description
2. Filter row
3. Result list
4. Pagination

### Sections & Components
- Title
  - H1: Vendor/Product/Platform name.
  - Short description derived from metadata.
- Filter row
  - Inline search within listing.
  - Optional chips: platform/product/vendor (context-aware).
- Result list
  - Table-like rows: code (monospace), title, updated date.
  - Each row links to `/error/<code>/`.
- Pagination (static)
  - Prev/Next + page numbers.
  - Canonical on page 1 points to the base listing URL.
  - Use rel prev/next where appropriate.

---

## System pages: sitemap.xml, robots.txt, 404
### sitemap.xml
- Machine-generated, includes only canonical locked URLs.

### robots.txt
- References sitemap location.
- Allows crawling of canonical routes.

### 404
- Simple explanation + search bar + links back to indices.
