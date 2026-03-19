import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CATALOG_PATH = path.join(ROOT, 'src', 'lib', 'insurance', 'catalog.json');
const OUT_DIR = path.join(ROOT, 'src', 'content', 'insuranceCodes');
const HUBS_DIR = path.join(ROOT, 'src', 'content', 'hubs', 'insurance');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function slugifyCode(code) {
  return String(code || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(s) {
  return String(s || '')
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

function pickSystemLabel(subcategory) {
  const m = {
    'auto-insurance': 'Auto claims workflow',
    'property-insurance': 'Property claims workflow',
    'renters-insurance': 'Renters claims workflow',
    'life-insurance': 'Life claims workflow',
    'claims-processing': 'Claims processing system',
    'billing-codes': 'Billing validation rules',
    'medicare-medicaid': 'Government payer rules',
  };
  return m[subcategory] || 'Insurance claims workflow';
}

function shortOneSentence(code, shortLabel, subLabel) {
  const base = `${code} indicates “${shortLabel}” in ${subLabel.toLowerCase()} workflows.`;
  return base;
}

function makeParagraphsForWhat(code, shortLabel, subLabel) {
  const p1 = `${code} is used when a claim or transaction is blocked by the condition described as “${shortLabel}.” In real-world insurance operations, this is typically a decision or validation checkpoint rather than a mysterious technical fault.`;
  const p2 = `The fastest way to resolve ${code} is to confirm the exact trigger in the claim notes or system audit trail (what field, document, or rule failed), then correct the underlying requirement before resubmitting or escalating. In ${subLabel.toLowerCase()}, the same label can be triggered by different facts, so the scenario matters.`;
  const p3 = `Treat ${code} as a map: it tells you which bucket to investigate (coverage, documentation, eligibility, policy status, processing state, or system validation). Once you confirm the bucket, the fix is usually a short, ordered checklist rather than trial-and-error resubmits.`;
  return [p1, p2, p3];
}

function makeBulletsWhere(subcategory) {
  const common = [
    'Claim status portal messages or claim notes',
    'Adjuster/workflow task queues and triage dashboards',
    'Carrier letters or explanation-of-benefits style summaries',
  ];
  if (subcategory === 'claims-processing') {
    return [
      'Intake and submission acknowledgments',
      'Claim routing and work-queue dashboards',
      'System logs or API response payloads (when integrated)',
      ...common,
    ];
  }
  if (subcategory === 'billing-codes') {
    return [
      'Billing validation reports and scrubber outputs',
      'Claim adjudication results with line-level messages',
      ...common,
    ];
  }
  if (subcategory === 'medicare-medicaid') {
    return [
      'Eligibility and payer-sequencing responses',
      'Government payer remittance and claim status checks',
      ...common,
    ];
  }
  return common;
}

function makeBulletsWhy(code, shortLabel, subcategory) {
  const base = [
    'A required field, document, or eligibility prerequisite is missing or inconsistent',
    'The claim facts do not match the policy or coverage rules for the loss date/service date',
    'A workflow checkpoint flagged the claim for manual review before it can proceed',
  ];
  if (/duplicate/i.test(shortLabel)) base.unshift('A prior submission already exists (or the system believes it does) for the same loss/claim identifiers');
  if (/expired|lapsed|cancellation|not active|suspension/i.test(shortLabel)) base.unshift('Policy status is not active for the relevant date range');
  if (/fraud|investigation/i.test(shortLabel)) base.unshift('The claim meets one or more fraud-screening triggers and requires investigation workflow');
  if (/authorization|out-of-network/i.test(shortLabel)) base.unshift('A network, authorization, or eligibility check failed at validation time');
  if (subcategory === 'claims-processing') base.unshift('A submission payload failed validation or timed out during processing');
  if (subcategory === 'billing-codes') base.unshift('A code-set, modifier/format, or billing rule validation failed');
  if (subcategory === 'medicare-medicaid') base.unshift('Government payer rules (enrollment, COB, state-plan restrictions) created a mismatch');
  return base.slice(0, 6);
}

function makeBulletsNext(shortLabel, subcategory) {
  const out = [
    'The claim is placed into a pending, rejected, or needs-info state',
    'A task is created for documentation, verification, or correction',
    'Processing pauses until the requirement is satisfied or the decision is appealed',
  ];
  if (/closed/i.test(shortLabel)) out.unshift('The claim remains closed unless reopened through the carrier’s reopening process');
  if (/under review|investigation|manual review/i.test(shortLabel) || subcategory === 'claims-processing') out.unshift('A manual review queue may be assigned with a longer turnaround time');
  return out.slice(0, 5);
}

function makeBulletsNot(subcategory) {
  const out = [
    'It is not a guarantee of fraud or wrongdoing by itself',
    'It is not proof the claim will never be paid',
    'It is not a substitute for the carrier’s written policy language and endorsement terms',
  ];
  if (subcategory === 'claims-processing') out.unshift('It is not always a carrier coverage decision; it can be a system validation gate');
  if (subcategory === 'billing-codes') out.unshift('It is not always a denial; it can be a correctable billing edit');
  return out;
}

function makeBulletsTrouble(code, shortLabel, subLabel) {
  return [
    `Confirm where ${code} was generated (carrier portal, billing system, TPA, clearinghouse, or internal workflow).`,
    'Verify the policy number and the effective dates match the loss/service date.',
    'Check for duplicate identifiers (claim ID, loss date, insured, VIN/property address) that could trigger a duplicate workflow.',
    'Validate required documents: proof of loss, police/fire report, photos, invoices/estimates, or beneficiary paperwork as applicable.',
    'If the message is policy/coverage-related, read the specific exclusion/endorsement cited in the decision notes.',
    `If ${shortLabel.toLowerCase()} is disputed, prepare a short factual timeline and supporting documents before escalating.`,
    `When resubmitting, use the carrier’s correct workflow (corrected claim, supplemental, reopened claim, or appeal) to avoid repeat flags.`,
    `If the issue is processing/system-related, capture timestamps, submission IDs, and any API or batch identifiers for support.`
  ];
}

function makeNotes(code, subLabel) {
  return [
    `Some carriers reuse similar labels for different checkpoints. Treat ${code} as a starting signal, then confirm the exact rule that fired in the carrier notes.` ,
    `If you are working with a third-party administrator (TPA) or a vendor portal, the same ${code} can appear with slightly different wording; always reconcile to the carrier’s final decision record.`,
    `For ${subLabel.toLowerCase()} claims, timing rules matter (reporting windows, documentation deadlines, and reopen/supplement rules). Track dates so you do not lose eligibility due to a preventable deadline.`
  ];
}

function externalHelpLine(subcategory) {
  if (subcategory === 'claims-processing') return 'If this is a system submission failure, contact the carrier or vendor support team with the submission ID, timestamp, and payload validation errors.';
  if (subcategory === 'billing-codes') return 'If a billing edit repeats after correction, confirm code-set requirements and request the payer’s published billing rules for the line item.';
  if (subcategory === 'medicare-medicaid') return 'For government payer conflicts, use official eligibility and enrollment tools and confirm payer sequencing rules before resubmitting.';
  return 'If the carrier notes are unclear, request the specific policy provision or documentation requirement tied to the decision before resubmitting.';
}

function mdxForCode({ subcategory, subLabel, code, shortLabel, related }) {
  const now = new Date().toISOString();
  const summary = shortOneSentence(code, shortLabel, subLabel);
  const sectionLabel = `SECTION: Insurance / ${subLabel}`;
  const systemLabel = `SYSTEM: ${pickSystemLabel(subcategory)}`;

  const what = makeParagraphsForWhat(code, shortLabel, subLabel);
  const where = makeBulletsWhere(subcategory);
  const why = makeBulletsWhy(code, shortLabel, subcategory);
  const next = makeBulletsNext(shortLabel, subcategory);
  const notThis = makeBulletsNot(subcategory);
  const trouble = makeBulletsTrouble(code, shortLabel, subLabel);
  const notes = makeNotes(code, subLabel);

  const relatedLines = related.map((r) => `${r.code} — ${r.shortLabel}`);
  const out = [];

  out.push('---');
  out.push(`industry: "insurance"`);
  out.push(`subcategory: "${subcategory}"`);
  out.push(`code: "${code}"`);
  out.push(`shortLabel: "${shortLabel}"`);
  out.push(`summary: "${summary.replace(/"/g, '\\"')}"`);
  out.push(`lastmod: "${now}"`);
  out.push(`source: "manual"`);
  out.push('---');
  out.push('');
  out.push('<div>');
  out.push(`<p class="c1"><span class="c0">${sectionLabel}</span></p>`);
  out.push(`<p class="c1"><span class="c0">${systemLabel}</span></p>`);
  out.push(`<p class="c1"><span class="c0">CODE: ${code}</span></p>`);
  out.push(`<p class="c1"><span class="c0">Title</span></p>`);
  out.push(`<p class="c1"><span class="c0">(${code} — ${shortLabel})</span></p>`);
  out.push(`<p class="c1"><span class="c0">One-sentence summary</span></p>`);
  out.push(`<p class="c1"><span class="c0">${summary}</span></p>`);

  out.push(`<p class="c1"><span class="c0">What this code means</span></p>`);
  for (const p of what) out.push(`<p class="c1"><span class="c0">${p}</span></p>`);

  out.push(`<p class="c1"><span class="c0">Where users usually see this code</span></p>`);
  for (const b of where) out.push(`<p class="c1"><span class="c0">${b}</span></p>`);

  out.push(`<p class="c1"><span class="c0">Why this code usually appears</span></p>`);
  for (const b of why) out.push(`<p class="c1"><span class="c0">${b}</span></p>`);

  out.push(`<p class="c1"><span class="c0">What typically happens next</span></p>`);
  for (const b of next) out.push(`<p class="c1"><span class="c0">${b}</span></p>`);

  out.push(`<p class="c1"><span class="c0">What this code is NOT</span></p>`);
  for (const b of notThis) out.push(`<p class="c1"><span class="c0">${b}</span></p>`);

  out.push(`<p class="c1"><span class="c0">Related error codes</span></p>`);
  for (const l of relatedLines) out.push(`<p class="c1"><span class="c0">${l}</span></p>`);

  out.push(`<p class="c1"><span class="c0">Notes and edge cases</span></p>`);
  for (const p of notes) out.push(`<p class="c1"><span class="c0">${p}</span></p>`);

  out.push(`<p class="c1"><span class="c0">Optional next actions</span></p>`);
  for (const b of trouble) out.push(`<p class="c1"><span class="c0">${b}</span></p>`);

  out.push(`<p class="c1"><span class="c0">External help (optional)</span></p>`);
  out.push(`<p class="c1"><span class="c0">${externalHelpLine(subcategory)}</span></p>`);
  out.push('</div>');
  out.push('');

  return out.join('\n');
}

function hubIntroMarkdown(label) {
  return `## ${label} error codes, explained\n\nThis section maps insurance-facing error codes to plain-language meanings and safe next steps. Each page focuses on what the code usually signals in real claims workflows, what documents or fields to verify first, and what to avoid so you don’t create duplicates or miss deadlines.\n\nUse the code directory if you need a quick lookup, and use the guides when you want an end-to-end workflow (submission → review → decision → payment).`;
}

function hubGuideMarkdown(label) {
  return `## How to troubleshoot ${label.toLowerCase()} codes safely\n\n1. **Confirm the context first**: where did the code appear (carrier portal, billing system, claim platform, or a vendor integration)?\n2. **Validate the time window**: effective dates, reporting deadlines, and any timely filing/reopen rules.\n3. **Check identifiers**: claim ID, policy number, insured name, loss date, address/VIN, and any required documents.\n4. **Fix the cause before resubmitting**: most repeats come from resubmitting unchanged data.\n5. **Escalate with proof**: when disputing a decision, bring a short timeline plus the minimum evidence required for review.\n\nThe code pages link to related codes and relevant guides so you can move quickly between similar failures.`;
}

function hubFaqMarkdown(label) {
  return `### Are these codes official carrier codes?\nThese pages describe common, industry-typical code labels and decision checkpoints. Carriers can implement different wording, but the underlying workflow buckets are consistent.\n\n### Should I resubmit or appeal?\nResubmit when it’s a correctable data/documentation issue and the carrier supports corrected/supplemental workflows. Appeal when you disagree with a coverage or policy determination.\n\n### Why do I keep getting duplicates?\nDuplicates usually happen when a corrected/supplemental workflow is required, or when key identifiers match a prior submission. Verify status and correction rules before sending again.\n\n### What should I collect before contacting support?\nClaim ID, policy number, loss/service date, the code label, timestamps, and any submission or batch IDs if this came from an integrated system.`;
}

function main() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('Missing catalog:', CATALOG_PATH);
    process.exit(1);
  }
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const subs = Array.isArray(catalog?.subcategories) ? catalog.subcategories : [];
  const codesBySub = catalog?.codes || {};

  ensureDir(OUT_DIR);
  ensureDir(HUBS_DIR);

  const created = [];
  for (const sub of subs) {
    const key = sub.key;
    const subLabel = sub.label;
    const list = Array.isArray(codesBySub[key]) ? codesBySub[key] : [];
    const subOut = path.join(OUT_DIR, key);
    ensureDir(subOut);

    const hubOut = path.join(HUBS_DIR, key);
    ensureDir(hubOut);
    fs.writeFileSync(path.join(hubOut, 'intro.md'), hubIntroMarkdown(subLabel), 'utf8');
    fs.writeFileSync(path.join(hubOut, 'guide.md'), hubGuideMarkdown(subLabel), 'utf8');
    fs.writeFileSync(path.join(hubOut, 'faq.md'), hubFaqMarkdown(subLabel), 'utf8');

    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      const code = String(it.code || '').trim();
      const shortLabel = String(it.shortLabel || '').trim();
      if (!code || !shortLabel) continue;

      const slug = slugifyCode(code);
      const related = [];
      const range = 4;
      for (let j = Math.max(0, i - range); j <= Math.min(list.length - 1, i + range); j++) {
        if (j === i) continue;
        const r = list[j];
        if (!r?.code) continue;
        related.push({ code: String(r.code).trim(), shortLabel: String(r.shortLabel || '').trim() });
      }
      while (related.length < 6 && list.length > 1) {
        const idx = Math.floor(Math.random() * list.length);
        if (idx === i) continue;
        const r = list[idx];
        const rc = String(r.code || '').trim();
        if (!rc || related.some((x) => x.code === rc)) continue;
        related.push({ code: rc, shortLabel: String(r.shortLabel || '').trim() });
      }
      const mdx = mdxForCode({ subcategory: key, subLabel: subLabel, code, shortLabel, related: related.slice(0, 8) });
      const outFile = path.join(subOut, `${slug}.mdx`);
      fs.writeFileSync(outFile, mdx, 'utf8');
      created.push(outFile);
    }
  }

  const insuranceIntro = `## Insurance error codes\n\nInsurance workflows generate lots of “codes” that aren’t just technical errors — they’re decision checkpoints. A claim can be rejected because the policy isn’t active, a document is missing, a billing edit failed, or the claim is routed for investigation.\n\nThis hub organizes insurance codes by category so you can diagnose the right bucket first, then apply the safest fix path.`;
  const insuranceGuide = `## How to use this insurance section\n\n- Start with the category hub (auto, property, renters, life, claims processing, billing, or Medicare/Medicaid).\n- Use the code directory for fast lookup and the individual code pages for checklists.\n- Use the insurance guides when you need an end-to-end workflow and internal links to the most common codes.\n\nAll pages are designed for scanability and safe troubleshooting.`;
  const insuranceFaq = `### Why do insurance claims get rejected?\nMost rejections come from missing prerequisites (eligibility, policy status, documentation), data mismatches, or workflow rules like duplicates and timely filing.\n\n### How do I avoid duplicate submissions?\nConfirm whether a corrected/supplemental workflow is required, and verify final status before resending.\n\n### What should I do first when I see a code?\nCapture the code + context, confirm identifiers and dates, then follow the fix checklist on the code page.`;
  ensureDir(HUBS_DIR);
  fs.writeFileSync(path.join(HUBS_DIR, 'intro.md'), insuranceIntro, 'utf8');
  fs.writeFileSync(path.join(HUBS_DIR, 'guide.md'), insuranceGuide, 'utf8');
  fs.writeFileSync(path.join(HUBS_DIR, 'faq.md'), insuranceFaq, 'utf8');

  console.log(`Generated insurance content: ${created.length} code page(s).`);
}

main();

