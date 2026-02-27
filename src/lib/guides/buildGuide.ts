import type { GuideCategoryKey, GuideMeta, GuideTopicKey } from './registry';

export type GuideHubLink = { label: string; href: string };

export type GuideFaqItem = { question: string; answer: string };

export type GuideCodeSource =
  | { kind: 'industry'; industry: 'healthcare' | 'irs-tax' | 'banking' | 'gaming'; patterns?: string[]; limit?: number }
  | {
      kind: 'appliances';
      applianceType: string;
      brands?: string[];
      seriesOrModel?: string[];
      limit?: number;
    }
  | { kind: 'systems'; subcategory: string; patterns?: string[]; limit?: number };

export type GuideSection = {
  id: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type GuidePageModel = {
  meta: GuideMeta;
  promise: string;
  tldr: string[];
  quickNav: Array<{ id: string; label: string }>;
  sections: GuideSection[];
  codeDirectory: {
    title: string;
    notes: string[];
    sources: GuideCodeSource[];
  };
  relatedHubs: GuideHubLink[];
  relatedGuides: Array<{ categoryKey: GuideCategoryKey; slug: string; title: string }>;
  faq: GuideFaqItem[];
  references: string[];
};

function defaultQuickNav() {
  return [
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'root-causes', label: 'Root Causes' },
    { id: 'fix-steps', label: 'Step-by-step fixes' },
    { id: 'dont', label: 'What NOT to do' },
    { id: 'escalation', label: 'If it persists' },
    { id: 'code-directory', label: 'Code directory' },
    { id: 'related', label: 'Related guides & hubs' },
    { id: 'faq', label: 'FAQ' },
    { id: 'references', label: 'References' },
  ];
}

function baseHubLinks(categoryKey: GuideCategoryKey): GuideHubLink[] {
  if (categoryKey === 'systems') return [{ label: 'Systems & Devices hub', href: '/systems/' }];
  if (categoryKey === 'irs-tax') return [{ label: 'IRS / Tax hub', href: '/irs-tax/' }];
  return [{ label: `${categoryKey[0].toUpperCase()}${categoryKey.slice(1)} hub`, href: `/${categoryKey}/` }];
}

function pickRelatedGuides(all: GuideMeta[], current: GuideMeta, max: number) {
  return all
    .filter((g) => g.categoryKey === current.categoryKey && g.slug !== current.slug)
    .slice(0, max)
    .map((g) => ({ categoryKey: g.categoryKey, slug: g.slug, title: g.title }));
}

function systemsSubHub(topicKey: GuideTopicKey): GuideHubLink[] {
  const map: Record<string, GuideHubLink[]> = {
    'systems-printers': [
      { label: 'Printers hub', href: '/systems/printers/' },
      { label: 'Printer code directory', href: '/systems/printers/error-codes/' },
    ],
    'systems-windows-startup': [
      { label: 'Operating Systems hub', href: '/systems/operating-systems/' },
      { label: 'BIOS / UEFI hub', href: '/systems/bios-uefi/' },
    ],
    'systems-routers': [
      { label: 'Routers hub', href: '/systems/routers/' },
      { label: 'Router code directory', href: '/systems/routers/error-codes/' },
    ],
    'systems-pos-terminals': [
      { label: 'POS Terminals hub', href: '/systems/pos-terminals/' },
      { label: 'POS Systems hub', href: '/systems/pos-systems/' },
    ],
    'systems-bios-uefi': [
      { label: 'BIOS / UEFI hub', href: '/systems/bios-uefi/' },
      { label: 'BIOS / UEFI code directory', href: '/systems/bios-uefi/error-codes/' },
    ],
    'systems-smart-devices': [
      { label: 'Smart Devices hub', href: '/systems/smart-devices/' },
      { label: 'Smart Devices code directory', href: '/systems/smart-devices/error-codes/' },
    ],
    'systems-security-systems': [
      { label: 'Security Systems hub', href: '/systems/security-systems/' },
      { label: 'Security Systems code directory', href: '/systems/security-systems/error-codes/' },
    ],
    'systems-embedded-iot': [
      { label: 'Embedded Systems hub', href: '/systems/embedded-systems/' },
      { label: 'Embedded Systems code directory', href: '/systems/embedded-systems/error-codes/' },
    ],
  };

  return map[topicKey] ?? [];
}

function getTopicModel(topicKey: GuideTopicKey) {
  switch (topicKey) {
    case 'healthcare-denials':
      return {
        promise:
          'Use this guide to decode the denial family quickly, confirm what the payer is actually asking for, and apply safe fix steps before you appeal or rebill.',
        tldr: [
          'Start with the adjustment group: CO (contractual), PR (patient responsibility), OA/PI (other/payer initiated).',
          'Treat CARC as the “what happened” reason and RARC as the “what to submit next” hint.',
          'Fix claim data and prerequisites (eligibility, auth, NPI/taxonomy, dates, modifiers) before escalating.',
          'Avoid blind resubmits that create duplicate denials and burn timely filing windows.',
        ],
        sections: [
          {
            id: 'symptoms',
            title: 'Symptoms / When you see this',
            bullets: [
              'A claim returns with CO/PR/OA/PI and a short reason code.',
              'The remittance advice includes CARC and sometimes RARC.',
              'Your billing system shows “denied/rejected/not covered/needs info” without detail.',
            ],
          },
          {
            id: 'root-causes',
            title: 'Root causes (grouped)',
            intro: 'Most denials fall into a few buckets that you can validate quickly:',
            bullets: [
              'Eligibility & coverage (plan not active for date of service, COB mismatch).',
              'Authorization & referrals (missing/invalid auth, mismatch on dates/CPT/units).',
              'Claim data quality (member ID, DOB, NPI/taxonomy, service location).',
              'Coding rules (invalid/obsolete code, modifier requirements, diagnosis mismatch).',
              'Contract/policy (out-of-network, non-covered benefit, bundling/edit rules).',
              'Timely filing & duplicates (wrong correction workflow, frequency indicators).',
            ],
          },
          {
            id: 'fix-steps',
            title: 'Step-by-step fixes (safe, prioritized)',
            bullets: [
              'Classify the denial by group code (CO/PR/OA/PI) and by whether it is “data missing” vs “policy decision”.',
              'Read the remittance line detail first; CARC is the category, RARC often hints what to attach or correct.',
              'Validate eligibility and benefits for the date of service, including COB when applicable.',
              'Validate provider identity fields and enrollment (billing/rendering NPI, taxonomy, location).',
              'Validate authorization requirements and match all auth parameters to the claim.',
              'Validate coding: modifiers, units, and diagnosis support for the billed service.',
              'Only resubmit after confirming the payer’s correction workflow (corrected claim vs appeal).',
            ],
          },
          {
            id: 'dont',
            title: 'What NOT to do',
            bullets: [
              'Do not treat denial codes as a single diagnosis; confirm the scenario and remittance details.',
              'Do not rebill as new when the payer expects a corrected claim indicator.',
              'Do not “change codes to make it pay” without documentation support.',
            ],
          },
          {
            id: 'escalation',
            title: 'If it persists (escalation checklist)',
            bullets: [
              'Collect: remittance line detail, CARC/RARC, claim image, and eligibility snapshot for date of service.',
              'Document what changed since initial submission (fields corrected, attachments added).',
              'If policy-driven, submit the minimum required documentation with a concise rationale.',
            ],
          },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: [
            'Payers and contracts vary. The linked pages describe common interpretations and safe next steps.',
            'When a code is ambiguous, the remittance line detail is usually more specific than the code alone.',
          ],
          sources: [{ kind: 'industry', industry: 'healthcare', patterns: ['^CO-', '^PR-', '^OA-', '^PI-', '^CARC', '^RARC'], limit: 24 }],
        },
        references: ['Payer remittance advice and portal guidance', 'X12 / HIPAA code sets (CARC/RARC)', 'Provider manuals and claims submission rules'],
        faq: [
          {
            question: 'Is CO always contractual and PR always patient responsibility?',
            answer:
              'Commonly yes, but payers can apply variations. Treat CO/PR/OA/PI as strong hints, then confirm with the remittance line detail and payer rules.',
          },
          {
            question: 'What is the difference between CARC and RARC?',
            answer:
              'CARC describes why the payer adjusted or denied. RARC adds context and often indicates what documentation or data is required next.',
          },
          {
            question: 'Should I resubmit or appeal?',
            answer:
              'Resubmit when it is a correctable data/documentation issue and the payer supports corrected claims. Appeal when you dispute a coverage/policy determination. When unsure, confirm the payer workflow first.',
          },
          {
            question: 'Can the same denial code have different fixes?',
            answer:
              'Yes. The safest approach is to identify the bucket (eligibility, auth, claim data, coding edits, policy) and validate the most likely inputs in that order.',
          },
          {
            question: 'How do duplicate denials happen?',
            answer:
              'Often from resubmitting as a new claim when a corrected claim indicator is required, or from multiple parties billing similar services. Confirm correction rules before resubmitting.',
          },
          {
            question: 'Does “not covered” always mean excluded?',
            answer:
              'Not always. It can also indicate missing authorization, mismatch in plan eligibility for the date, or coding/benefit rules not met. Validate the basics before concluding exclusion.',
          },
          {
            question: 'What documentation helps most when escalating?',
            answer:
              'Eligibility/benefit responses, authorization confirmations, claim image, and the remittance line details with CARC/RARC. For policy denials, include the minimum clinical documentation the payer requires.',
          },
          {
            question: 'How should I use this site for healthcare codes safely?',
            answer:
              'Use code pages to understand common interpretations and checklists, then confirm your payer’s policy and workflow. When this guide says “commonly,” it’s signaling payer variation.',
          },
        ],
      };

    case 'gaming-xbox':
      return {
        promise:
          'Use this guide to identify whether the failure is account, network, update, or store-related and apply a safe recovery sequence before destructive resets.',
        tldr: [
          'Classify the surface: sign-in, store/purchase, update/install, or gameplay services.',
          'If many users are impacted, check platform status first.',
          'Fix network basics (time/date, DNS reliability, NAT, packet loss) before reinstall loops.',
          'Update failures commonly involve storage headroom or interrupted downloads.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Hex codes like 0x87… or 0x80… during sign-in, updates, store actions.', 'Downloads stall or updates fail repeatedly.', 'Multiplayer or party features fail due to connectivity.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Platform service degradation (auth, store, matchmaking).', 'Account token/state problems.', 'Network issues (DNS, strict NAT, packet loss, time mismatch affecting TLS).', 'Update/install state (storage, corrupted cache, interrupted download).'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Check service status if failures are widespread.', 'Restart console and router to clear stale sessions.', 'Verify time/date and test DNS resolution reliability.', 'Confirm free storage and retry updates after a clean restart.', 'Test a different network/account to see what follows the issue.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not factory reset first; rule out service outages and network health.', 'Do not repeatedly retry purchases; you can create multiple pending authorizations.', 'Do not change advanced router settings without a rollback plan.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Record code + exact screen/app + timestamp.', 'Check whether it follows the account across networks/devices.', 'Use official support for purchase/subscription/account enforcement issues.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Some hex codes overlap with Windows-style result codes. Use the code page context (“where you see this”) to confirm scenario.'],
          sources: [{ kind: 'industry', industry: 'gaming', patterns: ['^0x87', '^0x80', '^0x8', '^0xC'], limit: 24 }],
        },
        references: ['Platform status page', 'Console network test tools', 'Official support articles for exact codes'],
        faq: [
          { question: 'Why do Xbox errors look like Windows errors (0x…)?', answer: 'Some services use Windows-style result codes. The same code can appear in different contexts, so the scenario matters.' },
          { question: 'Should I change DNS to fix store issues?', answer: 'It can help when DNS is unreliable. Use it as a test; revert if it doesn’t change behavior.' },
          { question: 'When is reinstall worth it?', answer: 'After ruling out service outages, storage constraints, and network failures. Reinstalls rarely fix service-side problems.' },
          { question: 'What’s the fastest isolation test?', answer: 'Try a different network (hotspot) or a different account and see what follows the issue.' },
          { question: 'Why do updates fail even with fast internet?', answer: 'Validation and storage requirements can fail regardless of speed. Interrupted downloads and cache state are common factors.' },
          { question: 'Can NAT cause multiplayer issues?', answer: 'Yes. Strict NAT can block peer connectivity even if downloads work.' },
          { question: 'If the error follows my account, what next?', answer: 'That suggests account state or service-side flags. Use official support channels for account-linked issues.' },
          { question: 'What should I capture before escalating?', answer: 'The full code, timestamp, affected app, network type, and whether other devices/accounts are impacted.' },
        ],
      };

    case 'gaming-playstation':
      return {
        promise:
          'Use this guide to spot whether the failure is PSN status, account auth, storage/update state, or local network health and then fix in the safest order.',
        tldr: [
          'Check PSN service status when multiple features fail at once.',
          'Update/download failures often relate to storage headroom and cache state.',
          'Sign-in failures commonly relate to account auth or network time/DNS issues.',
          'If one game fails but others work, treat it as game-service specific first.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['CE-/NP-/SU-/WS- codes during downloads, updates, store, or sign-in.', 'Downloads hang or fail verification.', 'Store pages fail or purchases fail.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['PSN outage/degradation.', 'Local network issues (DNS/TLS/time mismatch, packet loss).', 'Storage/update state (insufficient space, corrupted cache).', 'Account state (password changes, security checks, licensing).'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Confirm service status and retry later if degraded.', 'Restart console/router.', 'Confirm free storage headroom (updates need temp space).', 'Retry a failing download after a clean restart.', 'Verify sign-in credentials and any account verification requirements.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not delete save data unless you are sure what you are removing.', 'Do not repeatedly retry purchases during store instability.', 'Do not factory reset until you rule out service-side causes.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture the full code and exact action (sign-in vs update vs store).', 'Test another network to isolate ISP/router blocks.', 'Use official account support if it follows the account.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Prefixes are code families, not a complete diagnosis. The code page context matters.'],
          sources: [{ kind: 'industry', industry: 'gaming', patterns: ['^CE-', '^NP-', '^SU-', '^WS-'], limit: 24 }],
        },
        references: ['Platform status page', 'Console network test tools', 'Official support for the exact code family'],
        faq: [
          { question: 'What do CE/NP/SU/WS prefixes mean?', answer: 'They commonly indicate a code family. Exact meaning varies by scenario and console generation, so rely on context.' },
          { question: 'Why do downloads fail when streaming works?', answer: 'Downloads and stores use different endpoints; failures can be storage/cache/state or service-side.' },
          { question: 'How much storage do updates need?', answer: 'It varies by title and system. Updates often require temporary working space beyond the patch size.' },
          { question: 'Is changing DNS safe?', answer: 'Generally safe as a test. If it doesn’t help, revert.' },
          { question: 'When should I contact support?', answer: 'When issues follow the account across devices/networks or purchases/subscriptions are involved.' },
          { question: 'Can one game be down while PSN is up?', answer: 'Yes. Game publishers run separate services; treat “one title only” issues as publisher-side first.' },
          { question: 'Why do errors reappear after reboot?', answer: 'If the root cause is service-side, account state, or persistent cache state, reboots may not resolve it.' },
          { question: 'Fastest isolation test?', answer: 'Try a different network (hotspot) and see if behavior changes.' },
        ],
      };

    case 'gaming-nintendo-switch':
      return {
        promise:
          'Use this guide to identify whether the failure is eShop/account auth, network quality, update state, or system time and then apply fixes that don’t risk saves.',
        tldr: [
          'If eShop is the only failing surface, check service status and sign-in state.',
          'Network errors often trace to NAT, DNS, or unstable Wi‑Fi signal.',
          'Update errors often trace to storage headroom and interrupted downloads.',
          'Avoid destructive steps unless you can confirm backups exist.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Numeric codes like 2110-3127 during eShop, updates, or network test.', 'Online play fails while basic browsing works.', 'Downloads fail or hang.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Service-side eShop/account issues.', 'Wi‑Fi quality and NAT restrictions.', 'Update/download cache state and low storage.', 'Account sign-in and verification requirements.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Check service status first if failures appear widespread.', 'Restart console/router and retest.', 'Move closer to router and retest Wi‑Fi stability.', 'Confirm free storage and retry update.', 'Test a different network to isolate router/ISP restrictions.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not delete save data blindly.', 'Do not repeatedly retry downloads on unstable Wi‑Fi.', 'Do not assume numeric codes always mean “network”.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture the full code, timestamps, and which feature it affects.', 'Test another network to isolate local restrictions.', 'Use official account support if it follows the account.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Numeric code families are context-dependent; always correlate with on-screen scenario.'],
          sources: [{ kind: 'industry', industry: 'gaming', patterns: ['^\\d{4}-\\d{4}$'], limit: 24 }],
        },
        references: ['Platform status page', 'Console network test tools', 'Official support for the exact code'],
        faq: [
          { question: 'Are Nintendo numeric codes always network-related?', answer: 'No. Some are network-related; others relate to account, updates, or service availability.' },
          { question: 'Why does eShop fail when browsing works?', answer: 'eShop uses specific endpoints and can fail due to service, DNS filtering, or account auth issues.' },
          { question: 'Is NAT important for online play?', answer: 'Yes. Restrictive NAT can block peer connectivity even when web browsing works.' },
          { question: 'Can storage cause update errors?', answer: 'Yes. Low storage is a common hidden cause, and updates can need extra temp space.' },
          { question: 'Should I reinstall games to fix network errors?', answer: 'Usually not. Fix network stability and NAT/DNS first.' },
          { question: 'What’s the fastest isolation test?', answer: 'Use a hotspot or different network and compare results.' },
          { question: 'Should I change router settings?', answer: 'Only after confirming the issue is local. Document changes so you can revert.' },
          { question: 'What should I capture for support?', answer: 'The full code, timestamps, and the exact feature (eShop, update, online play).'}
        ],
      };

    case 'gaming-steam':
      return {
        promise:
          'Use this guide to separate account enforcement, service outage, and local network issues so you avoid reinstall loops and risky changes.',
        tldr: [
          'Check service status if login or store fails broadly.',
          'Verify time/date and DNS when secure connections fail.',
          'Downloads failing often relate to cache state or disk constraints.',
          'VAC messages are often game-specific; confirm official account status for enforcement concerns.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Login fails or loops, store pages fail, downloads stall.', 'VAC/game authentication messages during multiplayer.', 'Payment failures or blocked purchases.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Service-side issues affecting auth/store/downloads.', 'Local network filtering, DNS, TLS interception, firewall blocks.', 'Launcher cache/state corruption.', 'Game-specific anti-cheat integrity checks and enforcement systems.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Check service status/outages first.', 'Restart PC and router.', 'Verify time/date and test DNS.', 'Confirm disk space and retry downloads after clearing stuck state.', 'For VAC messages, verify game files and check for software conflicts.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not disable security tools permanently; test and re-enable.', 'Do not assume enforcement without checking official account status.', 'Do not spam purchase retries; you can create multiple pending authorizations.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture exact error text and timestamps.', 'Test another network to isolate ISP/router restrictions.', 'Use official support for account/purchase issues.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Not all Steam issues have stable public “codes.” When no code exists, use symptom buckets and logs to diagnose.'],
          sources: [{ kind: 'industry', industry: 'gaming', patterns: ['^LS-', '^IS-', '^0x80', '^0x87'], limit: 18 }],
        },
        references: ['Platform status page', 'Client logs and network diagnostics', 'Official support for account/purchase issues'],
        faq: [
          { question: 'Is every VAC message a ban?', answer: 'No. Some messages indicate integrity checks or local conflicts. Confirm official account status before assuming enforcement.' },
          { question: 'Why can browsing work but Steam fails?', answer: 'Launchers use different endpoints and can be affected by DNS/firewall/TLS interception.' },
          { question: 'What’s the fastest isolation test?', answer: 'Try a different network (hotspot) and see whether behavior changes.' },
          { question: 'Are payment failures always card issues?', answer: 'Not always; they can be issuer declines, processor rules, or store-side restrictions.' },
          { question: 'Should I reinstall first?', answer: 'Usually no. Start with status checks and network/time/DNS verification.' },
          { question: 'Can antivirus affect downloads?', answer: 'It can in some setups by scanning or blocking files. Test carefully and re-enable protections.' },
          { question: 'Why do downloads stall at 0% or 100%?', answer: 'It can be cache state, disk I/O constraints, or final verification steps.' },
          { question: 'What should I log for support?', answer: 'Error text, timestamps, account context, and network environment details.' },
        ],
      };

    case 'gaming-epic-fortnite':
      return {
        promise:
          'Use this guide to separate account auth problems, launcher update state, and network quality issues before reinstalling or changing router settings.',
        tldr: [
          'Check service status first if login/matchmaking fails widely.',
          'Login failures can be account/session or network/TLS related.',
          'Update failures often trace to disk space, cache state, or interrupted downloads.',
          'Matchmaking failures can be region/server load or packet loss/NAT problems.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Launcher login fails, update loops, downloads stall.', 'Matchmaking fails or drops from queues.', 'Connectivity errors spike after patches.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Service-side outage or maintenance.', 'Account auth/session state issues.', 'Network filtering/DNS/TLS issues.', 'Update cache state and disk constraints.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Check service status and retry later if degraded.', 'Restart launcher/PC and router.', 'Verify time/date and test DNS.', 'Confirm disk space and retry update after a clean restart.', 'Test another network to isolate router/ISP restrictions.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not spam login attempts; you can trigger security throttling.', 'Do not disable security permanently; test and revert.', 'Do not reinstall first if services are down.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture exact code/text, timestamp, and region.', 'Confirm whether it follows the account across networks/devices.', 'Use official support for account enforcement or purchase issues.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Not every failure exposes a stable public code. When there is no code, focus on symptom bucket + status page.'],
          sources: [{ kind: 'industry', industry: 'gaming', patterns: ['^LS-', '^IS-', '^AS-'], limit: 18 }],
        },
        references: ['Platform status page', 'Launcher logs', 'Official support for account issues'],
        faq: [
          { question: 'Why does matchmaking fail when login works?', answer: 'Matchmaking relies on different services and can fail due to region/server load even when auth is fine.' },
          { question: 'Do update errors always mean corruption?', answer: 'No. They can be service-side, cache, or disk-space related. Validate those first.' },
          { question: 'Fastest isolation test?', answer: 'Try another network (hotspot). If it works there, your home network path is likely involved.' },
          { question: 'Can DNS affect launcher services?', answer: 'Yes. Unreliable DNS can break endpoint resolution even when browsing seems normal.' },
          { question: 'Should I reinstall first?', answer: 'Usually no. Check status, disk space, and update state first.' },
          { question: 'What if the issue follows the account?', answer: 'That suggests account state/enforcement; use official support channels.' },
          { question: 'Why do errors spike after patches?', answer: 'Patch releases create high demand and temporary service instability.' },
          { question: 'What should I avoid?', answer: 'Avoid repeated retries and risky router changes without a rollback plan.' },
        ],
      };

    case 'irs-notices':
      return {
        promise:
          'Use this guide to identify the notice family, understand what it commonly indicates, and take the safest next step without missing deadlines.',
        tldr: [
          'Read the notice header and deadline first; timing matters more than the family code.',
          'CP and LT are notice families; the content and tax year determine next actions.',
          'Respond through official channels only; avoid third-party links and numbers.',
          'Keep proof of submission and copies of everything you send.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['You receive a letter labeled CP-… or LT-…', 'The notice references a tax year and a response deadline.', 'Your refund status changes after the notice.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Return processing questions and mismatches.', 'Identity verification requests.', 'Refund holds or offsets.', 'Audit or review notices.', 'Balance due or payment-related notices.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Read the deadline and requested action first.', 'Confirm the tax year and taxpayer ID referenced.', 'Use only official IRS response methods printed on the notice.', 'Keep copies and proof of delivery/submission.', 'If you disagree, respond with clear documentation and factual corrections.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not ignore deadlines.', 'Do not share sensitive data through unverified links.', 'Do not assume a notice means fraud; verify via official account tools.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Gather: notice copy, tax return copy, W-2/1099 data, transcripts if available.', 'Follow identity verification steps only through official channels.', 'Consider a tax professional for complex disputes.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Notice meaning depends on the tax year and the notice text. Use linked pages as a plain-language map and confirm using the notice itself.'],
          sources: [{ kind: 'industry', industry: 'irs-tax', patterns: ['^CP', '^LT'], limit: 24 }],
        },
        references: ['The IRS notice itself', 'IRS account tools', 'Official IRS publications and instructions'],
        faq: [
          { question: 'Is a CP notice always bad?', answer: 'Not always. Some notices are informational, while others require action. The deadline tells you what matters.' },
          { question: 'How do I verify a notice is real?', answer: 'Use official IRS account tools and contact methods printed on the notice. Avoid unverified links or phone numbers.' },
          { question: 'Should I respond online or by mail?', answer: 'Follow the notice instructions. Some require online verification; others require mailed documents.' },
          { question: 'What if the notice is wrong?', answer: 'Respond with documentation and factual corrections. Keep proof of submission.' },
          { question: 'Will a notice delay my refund?', answer: 'Commonly yes when verification or review is required. The notice usually explains next steps.' },
          { question: 'What should I keep for records?', answer: 'The notice, your response, supporting documents, and proof of delivery/submission.' },
          { question: 'Do CP/LT notices guarantee an audit?', answer: 'No. Audit language is typically explicit. Many notices are routine processing/verification.' },
          { question: 'Should I call immediately?', answer: 'Only when the notice instructs it or online tools cannot clarify. Documentation-based responses are often more effective.' },
        ],
      };

    case 'irs-transcripts':
      return {
        promise:
          'Use this guide to interpret transcript “TC” entries as a timeline of events, then decide what is safe to do next without guessing.',
        tldr: [
          'Treat transcripts as a timeline: codes show events, not always final outcomes.',
          'Refund holds often require waiting for processing or responding to a notice.',
          'Identity verification signals commonly require action through official channels.',
          'Avoid duplicate filings; they can create delays and confusion.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Your transcript shows TC codes with dates and amounts.', 'Refund is delayed or held.', 'Account timeline includes verification or review signals.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Normal processing steps and adjustments.', 'Refund holds or offsets.', 'Identity verification or fraud screening.', 'Audit/review processes.', 'Balance due or payment posting issues.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Read the newest transcript entries and dates first.', 'Check for a related notice (CP/LT) that requires action.', 'If verification is required, follow only official steps.', 'If offset is indicated, reconcile eligible debts that can reduce refunds.', 'Avoid refiling unless officially instructed.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not rely on informal interpretations as official advice.', 'Do not send sensitive documents to unverified addresses.', 'Do not assume a hold implies wrongdoing; screening is common.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Keep transcript snapshots with dates, plus notices and filing documents.', 'Track communications and submission proof.', 'Consult a tax professional for complex cases.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Transcript codes can be context-dependent. The safest interpretation comes from transcript + notices + your filing facts.'],
          sources: [{ kind: 'industry', industry: 'irs-tax', patterns: ['^TC', '^Tax Topic'], limit: 24 }],
        },
        references: ['IRS transcript definitions', 'Notices and account tools', 'Official IRS publications'],
        faq: [
          { question: 'Are transcript codes the same as notice codes?', answer: 'No. Notice codes label communications; transcript codes log events in the account timeline.' },
          { question: 'Does a hold code mean refund denied?', answer: 'Not necessarily. Many holds are temporary pending verification or processing.' },
          { question: 'How long do holds last?', answer: 'It varies. The most reliable guidance comes from associated notices and subsequent transcript updates.' },
          { question: 'Should I file again if nothing changes?', answer: 'Usually no. Duplicate filings can delay resolution. Follow official instructions first.' },
          { question: 'What if I can’t access transcripts?', answer: 'Notices and official account tools can still guide next steps; identity verification may be required.' },
          { question: 'Can offsets reduce refunds?', answer: 'Yes. Refunds can be offset for certain debts. Notices and transcript entries often indicate offsets.' },
          { question: 'What should I document?', answer: 'Dates, transcript snapshots, notices, and everything submitted.' },
          { question: 'When should I escalate?', answer: 'When deadlines approach, when identity verification is required, or when processing exceeds typical timelines significantly.' },
        ],
      };

    case 'banking-ach':
      return {
        promise:
          'Use this guide to identify whether the return is funds, account status, authorization, or formatting-related and take the safest corrective step.',
        tldr: [
          'Treat ACH returns as categories: funds, account status, authorization, or format/routing issues.',
          'Confirm debit vs credit and who initiated it; next steps differ.',
          'Fix the underlying issue before retrying to avoid repeat returns and risk controls.',
          'Keep an audit trail: authorization, timestamps, and return details.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['ACH payment returns with R01/R03/R10-like codes.', 'Payroll/vendor payments are returned.', 'Repeat returns occur for the same customer/vendor.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Funds-related (insufficient/uncollected funds).', 'Account status (closed/frozen/no account).', 'Authorization/mandate issues (customer disputes debit).', 'Format/routing issues (invalid account/routing details).', 'Timing issues (stop payment, return windows).'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Confirm debit vs credit and the initiating party.', 'Use the return category to choose the fix path (authorization vs details vs funds).', 'If authorization-related, validate mandate and descriptor before retrying.', 'If format-related, re-verify routing/account number and account type.', 'If funds-related, coordinate a new payment date or method instead of repeated retries.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not repeatedly retry on authorization-related returns.', 'Do not ignore high return rates; they can trigger risk controls.', 'Do not store bank details insecurely.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Collect: return code, transaction details, authorization record, bank trace details.', 'Confirm bank restrictions on the account.', 'Use processor/bank support for repeated anomalies.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Return meanings can vary by processor mapping. Always use the return code and bank-provided context together.'],
          sources: [{ kind: 'industry', industry: 'banking', patterns: ['^R\\d{2}$', '^R\\d{2}'], limit: 30 }],
        },
        references: ['Bank/processor ACH return mappings', 'Authorization/mandate records', 'Banking compliance guidance'],
        faq: [
          { question: 'Is an ACH return the same as a card decline?', answer: 'No. ACH returns happen after submission; card declines happen at authorization.' },
          { question: 'Can I retry immediately?', answer: 'It depends on the return reason and your authorization rules. Repeated retries can create disputes.' },
          { question: 'What’s the most common cause?', answer: 'Commonly funds-related or invalid details, but it varies by customer base and payment flow.' },
          { question: 'How do I reduce returns?', answer: 'Validate bank details, keep clean authorization records, and use clear descriptors.' },
          { question: 'What if the customer says their account is fine?', answer: 'Some returns are restrictions-related rather than funds. The return category helps narrow this.' },
          { question: 'Do return windows matter?', answer: 'Yes. Some return types are time-sensitive; track dates and respond quickly.' },
          { question: 'Can banks block debits?', answer: 'Yes, via restrictions or stop payments. The return category often indicates this.' },
          { question: 'When should I switch payment method?', answer: 'If returns repeat, using another method can reduce repeated failures and customer friction.' },
        ],
      };

    case 'banking-card-declines':
      return {
        promise:
          'Use this guide to identify whether the decline is issuer decision, data mismatch, or network issue, then apply the safest next step to complete the payment.',
        tldr: [
          'Issuer responses are category signals, not always a single diagnosis.',
          'AVS/CVV mismatches commonly mean address/ZIP or security code mismatch.',
          'Avoid repeated retries; try chip/tap or another payment method after one clean retry.',
          'If decline follows the card across merchants, the issuer is the next stop.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Declines like 05/51/54/57/91/96.', 'Online payments fail due to AVS/CVV mismatch.', 'Terminal shows “call issuer/do not honor/invalid transaction”.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Issuer decision (risk, limits, account state).', 'Data mismatch (AVS/CVV, expiration, card number).', 'Merchant/terminal rules (not permitted, invalid transaction).', 'Network/processor outages (timeouts, switch inoperative).'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Confirm amount, entry method, expiration, and billing address/ZIP.', 'Retry once after confirming connectivity and avoiding duplicate submission.', 'Try chip/tap rather than manual entry when possible.', 'If mismatch persists, use another payment method or have customer contact issuer.', 'If many cards fail, escalate as a processor/network incident.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not run repeated retries; it can trigger issuer risk controls.', 'Do not request sensitive data beyond what is needed to process.', 'Do not attempt “overrides” without authorization.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture: code, timestamp, amount, entry method, response fields.', 'Check if declines spike across cards (possible outage).', 'Use processor support when many transactions fail similarly.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Issuer response mappings can vary slightly by processor. Use the code and the response text together.'],
          sources: [{ kind: 'industry', industry: 'banking', patterns: ['^(05|12|13|14|51|54|57|58|61|62|65|75|85|91|96)$'], limit: 24 }],
        },
        references: ['Processor response mappings', 'Issuer guidance for cardholders', 'Merchant acquirer support resources'],
        faq: [
          { question: 'Is 05 “Do not honor” always fraud?', answer: 'No. It is a generic issuer decline category that can reflect risk, limits, or issuer rules.' },
          { question: 'What does AVS mismatch mean?', answer: 'Billing address/ZIP did not match issuer records.' },
          { question: 'What does CVV mismatch mean?', answer: 'Security code did not match issuer records.' },
          { question: 'Should merchants auto-retry?', answer: 'Usually no. Retry once after correcting input, then change method or have customer contact issuer.' },
          { question: 'How do I tell if processor is down?', answer: 'Many cards failing with network/timeouts suggests a processor outage, not issuer declines.' },
          { question: 'Why does card work elsewhere but not here?', answer: 'Merchant category, risk scoring, and routing differences can change issuer decisions.' },
          { question: 'If decline follows the card everywhere, what next?', answer: 'Issuer account state is likely; the issuer can clarify blocks and next steps.' },
          { question: 'Is a decline the same as a chargeback?', answer: 'No. Declines happen at authorization; chargebacks happen after transactions settle.' },
        ],
      };

    case 'banking-transfer-failures':
      return {
        promise:
          'Use this guide to identify whether the failure is beneficiary details, compliance screening, routing, or timing, then resolve without creating duplicate payments.',
        tldr: [
          'Start by identifying transfer type (wire/ACH/SEPA/SWIFT); workflows differ.',
          'Most failures trace to beneficiary details, routing, or compliance screening.',
          'Avoid duplicate sends; confirm final status before retrying.',
          'Use trace/reference IDs for escalation; they locate payments fastest.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Transfer shows failed/reversed/pending unusually long.', 'Recipient didn’t receive funds.', 'Platform returns a short error label or rejection.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Beneficiary details mismatch (name/account/IBAN/routing/SWIFT).', 'Compliance screening or bank policy blocks.', 'Intermediary routing issues.', 'Timing/cutoff windows and holidays.', 'Duplicate detection or reversal due to inconsistent state.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Confirm transfer type and expected timeline.', 'Confirm beneficiary details exactly as required by the network.', 'Check final state using trace/reference IDs.', 'If pending too long, request a trace from sender bank.', 'Resend only after confirming a return is final and details are corrected.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not resend blindly; you can double-pay.', 'Do not share sensitive bank details over insecure channels.', 'Do not treat “pending” as “failed” without confirmation.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Collect: trace/reference, timestamps, amount, currency, beneficiary details.', 'Ask for the network message/return reason where available.', 'Coordinate both sending and receiving banks when intermediaries are involved.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Many transfer systems do not expose a short public code. If no code exists, use trace IDs and the resolution flow.'],
          sources: [{ kind: 'industry', industry: 'banking', patterns: ['transfer', 'payment', '^ERR-', '^Z\\d'], limit: 18 }],
        },
        references: ['Bank support and trace processes', 'Transfer network documentation (general)', 'Compliance and AML policies'],
        faq: [
          { question: 'How long do transfers take?', answer: 'It depends on the network and cutoffs. Weekends/holidays can extend timelines.' },
          { question: 'What is a trace/reference ID?', answer: 'A network identifier used by banks to locate a payment through the processing chain.' },
          { question: 'Why are transfers returned?', answer: 'Commonly beneficiary detail mismatch, closed accounts, or compliance screening.' },
          { question: 'Should I resend if recipient didn’t get it?', answer: 'Not until you confirm the first payment’s final state. Use trace first.' },
          { question: 'Can compliance screening delay payments?', answer: 'Yes. Screening can delay or reject transfers based on bank policy and jurisdiction.' },
          { question: 'What if my platform shows no error code?', answer: 'Use the resolution flow: confirm transfer type and request trace details from the sender.' },
          { question: 'Do currencies matter?', answer: 'Yes. Correspondent routing and FX can add steps and delays.' },
          { question: 'Safest escalation path?', answer: 'Start with the sending bank and provide trace/reference IDs, then coordinate with the receiving bank if needed.' },
        ],
      };

    case 'appliances-washer':
      return {
        promise:
          'Use this guide to translate washer code themes into a safe checklist (drain, fill, door lock, balance) without unsafe disassembly.',
        tldr: [
          'Start with the symptom: won’t drain, won’t fill, won’t spin, door lock problem.',
          'Many codes are sensor signals; fix obvious physical causes first (hose, filter, load balance).',
          'Power-cycling can clear transient faults; repeated codes usually indicate a persistent condition.',
          'Stop if there are leaks, burning smell, or repeated breaker trips.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Washer stops mid-cycle with a code.', 'Won’t fill or won’t drain.', 'Spin fails or load becomes unbalanced.', 'Door won’t lock/unlock.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Drain restrictions (filter/hose/pump obstruction).', 'Water supply issues (valves, inlet screens, pressure).', 'Door lock/latch alignment or switch issues.', 'Balance/oversudsing conditions.', 'Model-specific sensor/communication faults.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Note the code and the moment it appears.', 'Check hose kinks and clean accessible filters per manufacturer guidance.', 'Confirm supply valves are open and inlet screens are not blocked.', 'Redistribute load and avoid overloading.', 'Power-cycle and run a rinse/spin test to see if it repeats.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not bypass door locks or safety switches.', 'Do not open electrical panels unless qualified.', 'Do not keep retrying if standing water remains and it won’t drain.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Record code, model number, and symptoms.', 'Stop and service if leaks occur.', 'Use manufacturer service guidance for repeated codes.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Washer codes vary by brand and model. Use the linked pages as a model-family entry point.'],
          sources: [{ kind: 'appliances', applianceType: 'washer', limit: 24 }],
        },
        references: ['Owner manual troubleshooting section', 'Manufacturer service documentation', 'Safe electrical/water handling practices'],
        faq: [
          { question: 'Can I reset a washer error code?', answer: 'Often a power-cycle clears transient faults. If it returns, there is likely an underlying condition.' },
          { question: 'Is it safe to run again after a drain error?', answer: 'If water remains or it repeatedly fails to drain, stop and fix the drain path first.' },
          { question: 'Do all brands use the same codes?', answer: 'No. Some overlap by coincidence. Always use model-specific guidance.' },
          { question: 'Why do unbalanced loads trigger errors?', answer: 'Washers monitor vibration; severe imbalance can stop spin for safety.' },
          { question: 'What if door won’t unlock?', answer: 'Follow manufacturer steps. Forcing the door can damage the latch.' },
          { question: 'Can detergent cause errors?', answer: 'Yes. Oversudsing can cause drain/spin problems. Use correct detergent type and amount.' },
          { question: 'When should I call service?', answer: 'For leaks, burning smells, breaker trips, or repeated codes after basic checks.' },
          { question: 'Where is the model number?', answer: 'Often inside the door frame or on the rear panel, depending on brand.' },
        ],
      };

    case 'appliances-dryer':
      return {
        promise:
          'Use this guide to triage dryer problems safely, with an emphasis on venting/airflow, heat protection, motor issues, and sensor patterns.',
        tldr: [
          'Venting restrictions are common and can trigger safety shutdowns; treat them seriously.',
          'If dryer runs but doesn’t heat, start with airflow and power/fuel basics.',
          'Stop if overheating or burning smells occur.',
          'Codes vary by model; use code pages as model-family entry points where available.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Dryer stops with a code.', 'Runs but no heat.', 'Overheating or burning smell.', 'Long dry times worsening over time.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Restricted venting/airflow (lint, crushed duct, blocked exterior vent).', 'Heating circuit issues (electric vs gas models differ).', 'Motor/drum movement issues.', 'Sensor/control state issues after interruptions.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Clean lint filter and verify strong airflow at the exterior vent.', 'Inspect visible venting for crush points and lint buildup.', 'Power-cycle and retry a short timed cycle.', 'If overheating suspected, stop use until venting is corrected.', 'Use manufacturer guidance for model-specific heating and sensor checks.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not bypass thermal cutoffs or safety devices.', 'Do not operate if overheating repeats.', 'Do not disassemble gas components unless qualified.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Record the code, model number, and symptom (no heat vs no tumble vs overheating).', 'Verify venting is clear end-to-end.', 'Use service guidance for repeated heat/motor faults.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: [
            'Dryer-specific directories may not be fully indexed yet; codes are highly brand/model-specific.',
            'Use the troubleshooting flow above, then pivot into the closest matching appliance directories linked here.',
          ],
          sources: [{ kind: 'appliances', applianceType: 'appliances', seriesOrModel: ['cross-brand-appliances', 'advanced-appliances'], limit: 18 }],
        },
        references: ['Owner manual troubleshooting section', 'Manufacturer venting and safety guidance', 'Safe electrical and gas-handling practices'],
        faq: [
          { question: 'Is poor venting really that important?', answer: 'Yes. Restricted airflow is a common cause of long dry times and overheating, and it can be a safety hazard.' },
          { question: 'Why does dryer run but not heat?', answer: 'Commonly heating circuit/fuel supply issues or safety cutoffs triggered by airflow problems.' },
          { question: 'Can I keep running if it overheats?', answer: 'No. Stop and correct airflow/venting issues first.' },
          { question: 'Do electric and gas dryers share codes?', answer: 'Sometimes, but many codes differ. Always use model-specific guidance.' },
          { question: 'Safe first test?', answer: 'Clean lint filter, confirm exterior vent airflow, and run a short timed cycle.' },
          { question: 'Can lint cause sensor errors?', answer: 'Yes. Lint affects airflow and temperature behavior, triggering protection logic.' },
          { question: 'When should I call service?', answer: 'If overheating repeats, electrical smells occur, or motor/drum issues are present.' },
          { question: 'Where is the model number?', answer: 'Usually inside the door frame or on the rear panel.' },
        ],
      };

    case 'appliances-dishwasher':
      return {
        promise:
          'Use this guide to translate dishwasher codes into safe checks for supply, drain path, leak detection, and heater behavior.',
        tldr: [
          'Start with symptom: not filling, not draining, leaking, or not heating/drying.',
          'Leak protection often stops the unit; check for water in base and visible leaks first.',
          'Drain errors are commonly filter/hose/air gap restrictions.',
          'Avoid electrical repairs unless qualified.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Dishwasher stops with a code.', 'Won’t fill or drains immediately.', 'Water remains in the tub.', 'Leak protection activates.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Supply/inlet issues.', 'Drain path restrictions (filter, hose, air gap).', 'Leak detection triggered by water in base pan.', 'Heater/temperature sensing issues (model-specific).', 'Control state issues after power interruption.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Turn off power before inspecting leaks.', 'Confirm supply valve is open and inlet screen is clear.', 'Clean accessible filters; check drain hose kinks.', 'If leak protection triggered, dry visible water and identify source before restart.', 'Power-cycle after addressing physical causes.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not run repeatedly when leaking.', 'Do not open electrical compartments unless qualified.', 'Do not bypass leak sensors or door switches.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Record code and model number.', 'Document when leak happens (fill vs drain).', 'Use manufacturer service guidance for heater/control faults.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Dishwasher codes vary by brand/model. Use the linked pages to pivot into the correct model directory.'],
          sources: [{ kind: 'appliances', applianceType: 'dishwasher', limit: 20 }],
        },
        references: ['Owner manual troubleshooting section', 'Manufacturer service documentation', 'Safe water/electrical handling practices'],
        faq: [
          { question: 'Can I reset a dishwasher error code?', answer: 'Power-cycling can clear transient faults. If it returns, address physical causes first.' },
          { question: 'Is standing water always pump failure?', answer: 'No. Filters, hose kinks, and clogs are common causes.' },
          { question: 'What if leak protection triggered?', answer: 'Stop operation and identify/dry the water source. Repeated leaks require service.' },
          { question: 'Why does it not dry?', answer: 'Drying depends on heat, rinse aid, and design; a heater error is only one cause.' },
          { question: 'Can power outage cause errors?', answer: 'Yes. Control state can be inconsistent after interruptions; a controlled restart can help after safety checks.' },
          { question: 'When should I call service?', answer: 'For repeated leaks, heater faults, or persistent errors after cleaning/basic checks.' },
          { question: 'Where is model number?', answer: 'Often on the door edge or frame; check the label inside the door.' },
          { question: 'Are codes universal?', answer: 'No. Similar codes can mean different things across brands.' },
        ],
      };

    case 'appliances-refrigerator':
      return {
        promise:
          'Use this guide to interpret refrigerator codes as system signals (defrost, fan, sensor, ice maker) and apply safe steps before parts swapping.',
        tldr: [
          'Temperature and defrost codes often reflect sensor readings or airflow problems.',
          'Fan issues can cause warm compartments even when compressor runs.',
          'Ice maker issues can be supply, frozen lines, or sensor state.',
          'Prioritize food safety if temperatures are unsafe.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['A code appears and alarms sound.', 'Temperatures rise or fluctuate.', 'Excess frost or defrost problems occur.', 'Ice maker stops or leaks.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Airflow/fan issues and blocked vents.', 'Defrost cycle issues (heater/sensor/state).', 'Temperature sensor readings out of range.', 'Water supply and frozen lines for ice maker.', 'Door seal leaks increasing load.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Confirm doors seal and vents aren’t blocked by food.', 'Power-cycle after ensuring food safety and noting the code.', 'Check for abnormal frost buildup indicating defrost issues.', 'Confirm water supply and watch for leaks if ice maker present.', 'Move perishables to safe storage if temps remain unsafe.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not chip ice aggressively; you can puncture lines.', 'Do not ignore food safety temperatures.', 'Do not bypass safety controls.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Record code, model number, and temperature readings.', 'Document frost patterns and fan behavior.', 'Use manufacturer service guidance for sealed-system or electrical faults.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Refrigerator codes vary by model family. Use the linked pages to pivot into the right directory.'],
          sources: [{ kind: 'appliances', applianceType: 'refrigerator', limit: 20 }],
        },
        references: ['Owner manual troubleshooting section', 'Manufacturer service documentation', 'Food safety temperature guidance'],
        faq: [
          { question: 'How urgent is a refrigerator code?', answer: 'If temperatures are in unsafe ranges, prioritize food safety first.' },
          { question: 'Can fan problems cause warming?', answer: 'Yes. Poor airflow can warm compartments even if compressor runs.' },
          { question: 'Are defrost codes always heater failures?', answer: 'Not always. Sensors, control state, and airflow can also trigger defrost-related codes.' },
          { question: 'Should I unplug to reset?', answer: 'A controlled power-cycle can clear transient faults. Note the code and protect food first.' },
          { question: 'Why is there frost buildup?', answer: 'Door seal leaks, frequent openings, and defrost problems are common causes.' },
          { question: 'Can ice maker cause leaks?', answer: 'Yes. Water lines and valves can leak or freeze. Stop if active leaking occurs.' },
          { question: 'When is service required?', answer: 'If temps remain unsafe, leaks persist, or sealed-system faults are suspected.' },
          { question: 'Where is the model label?', answer: 'Often inside the fridge compartment wall or near crisper drawers.' },
        ],
      };

    case 'systems-printers':
      return {
        promise:
          'Use this guide to decide whether a printer issue is a queue/job problem, consumable/mechanical problem, firmware/service error, or connectivity issue—then fix it safely.',
        tldr: [
          'Isolate whether it’s one job/user or all jobs/users.',
          'Clear stuck queues before assuming hardware failure.',
          'Service errors can be job-triggered; isolate the triggering document.',
          'Use manufacturer diagnostics for hardware paths; avoid unsafe disassembly.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Printer shows an error or “service error”.', 'Jobs remain queued or disappear.', 'Recurring jams or quality issues.', 'Network printing fails intermittently.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Queue/job data triggers firmware issues.', 'Consumables/mechanical state (paper path, fuser, cartridges).', 'Firmware/controller faults or unstable memory state.', 'Connectivity: IP changes, DNS, print server issues.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (decision tree)', bullets: ['If one job fails: remove job, print a test page, update driver.', 'If all jobs fail: restart printer and clear queue; confirm IP/connectivity.', 'If jam/feed: clear path, check rollers/tray loading.', 'If service error: isolate triggering job; check firmware updates.', 'If fuser/heater: follow manufacturer maintenance guidance.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not open hot/electrical assemblies without guidance.', 'Do not reboot mid firmware update.', 'Do not ignore recurring jams; debris can compound damage.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Record model/firmware and the exact code.', 'Capture driver type (PCL/PS) and whether issue is job-specific.', 'Use service channels for persistent hardware codes.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Codes vary by brand/model. Use “Where users see this” on each code page to confirm scenario.'],
          sources: [{ kind: 'systems', subcategory: 'printers', limit: 24 }],
        },
        references: ['Manufacturer support docs', 'Print server logs and queue tools', 'Driver language documentation (PCL/PS)'],
        faq: [
          { question: 'Why do service errors repeat on the same document?', answer: 'Some firmware issues are triggered by specific job content. Test with a simple print to isolate.' },
          { question: 'Is clearing the queue safe?', answer: 'Yes, and it’s often the safest first step before hardware troubleshooting.' },
          { question: 'Should I switch drivers (PCL vs PS)?', answer: 'As a test, yes when supported. Driver language can change job interpretation.' },
          { question: 'When is firmware update worth it?', answer: 'When service errors are frequent and the manufacturer recommends it for your model.' },
          { question: 'Can network issues look like printer failures?', answer: 'Yes. IP/DNS/print server issues can mimic device faults.' },
          { question: 'Safest hardware step?', answer: 'Follow manufacturer maintenance kit procedures for user-replaceable parts.' },
          { question: 'Do codes vary by brand?', answer: 'Yes. Similar codes can mean different things across HP/Canon/Brother/Epson families.' },
          { question: 'What should IT capture?', answer: 'Code, model, firmware, driver version, queue logs, and job context.' },
        ],
      };

    case 'systems-windows-startup':
      return {
        promise:
          'Use this guide to identify whether you have a boot-path failure, update/installer failure, or driver/permissions issue, then apply safe recovery steps before risky changes.',
        tldr: [
          'Start with where the code appears: boot screen vs update/install vs app.',
          'Boot failures often relate to boot order, disk detection, or bootloader configuration.',
          'Update failures often relate to prerequisites, component store state, or permissions.',
          'If disk read errors appear, prioritize data recovery.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Bootloader messages like “BOOTMGR is missing”.', 'Hex codes during updates/installs.', 'Upgrade fails and rolls back.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Boot order and UEFI/Legacy mismatch.', 'Disk read issues or unstable storage.', 'Update servicing/prerequisite failures.', 'Connectivity/timeouts during updates.', 'Driver compatibility issues during feature upgrades.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Remove external USB media and confirm correct boot device.', 'Confirm boot mode matches installation (UEFI vs Legacy).', 'Ensure stable internet and sufficient storage for updates.', 'Use official recovery tools for boot repair if needed.', 'Avoid destructive resets until you have a backup path.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not repeatedly force power off; it can worsen corruption.', 'Do not change partitions without backups.', 'Do not trust random “fix” tools; use official recovery workflows.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture exact code and screen context.', 'Check whether drive is detected and has health warnings.', 'Use setup/servicing logs for update failures.', 'Seek help when data recovery is required.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Stop codes vary by Windows version and drivers. When you don’t see your exact stop code, use logs to identify the failing layer.'],
          sources: [
            { kind: 'systems', subcategory: 'operating-systems', patterns: ['^0x', '^0X'], limit: 16 },
            { kind: 'systems', subcategory: 'bios-uefi', limit: 14 },
          ],
        },
        references: ['Official Windows recovery documentation', 'Device OEM support guidance', 'Servicing and setup log references'],
        faq: [
          { question: 'Are boot messages the same as Windows errors?', answer: 'No. Boot messages come from firmware/bootloader stages before Windows fully loads.' },
          { question: 'Safest first check?', answer: 'Confirm boot order and remove external boot media that might take priority.' },
          { question: 'Why do updates fail with generic codes?', answer: 'Many codes are category-level signals; logs are needed for the underlying cause.' },
          { question: 'When should I back up?', answer: 'When disk read errors appear or boot loops repeat. Data recovery becomes priority.' },
          { question: 'Is factory reset always needed?', answer: 'No. Many issues can be resolved via boot repair, update repair, or driver fixes.' },
          { question: 'Can driver cause rollback?', answer: 'Yes. Feature upgrades can roll back due to incompatible drivers or conflicts.' },
          { question: 'Does UEFI/Legacy mode matter?', answer: 'Yes. Mismatch can prevent boot.' },
          { question: 'What logs matter?', answer: 'Setup/servicing logs and installer logs where applicable.' },
        ],
      };

    case 'systems-routers':
      return {
        promise: 'Use this guide to diagnose whether your outage is ISP-side, router/modem session state, DNS, Wi‑Fi quality, or VPN policy blocks.',
        tldr: [
          'Isolate: internet down for all devices or only Wi‑Fi?',
          'PPP/PPPoE errors often point to ISP provisioning, credentials, or negotiation.',
          'DNS failures can mimic “no internet”.',
          'VPN errors are often policy/firewall blocks; confirm requirements.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Connected to Wi‑Fi but no internet.', 'Intermittent drops.', 'PPP/VPN errors like 734/735/809.', 'DNS lookups fail.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['ISP outage/provisioning.', 'Session negotiation failures (PPP/PPPoE).', 'DNS/captive portal restrictions.', 'Wi‑Fi interference and weak signal.', 'VPN policy/firewall blocks.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Test wired connection to separate Wi‑Fi from ISP.', 'Restart modem/router.', 'Test DNS; try alternate DNS as a diagnostic.', 'Verify PPPoE credentials/service type with ISP.', 'Test VPN from another network and confirm required ports/protocols.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not factory reset first; capture settings.', 'Do not open ports blindly; confirm security impact.', 'Do not assume “no internet” is always ISP; DNS can be the culprit.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture errors, timestamps, and whether all devices are impacted.', 'Collect modem status/signals if available.', 'Contact ISP with exact PPP/connection errors and logs.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Router errors can be OS-originated messages (VPN/PPP). Use code page context to confirm where it was observed.'],
          sources: [{ kind: 'systems', subcategory: 'routers', limit: 24 }],
        },
        references: ['ISP support guidance', 'Router logs and status pages', 'VPN documentation from your provider'],
        faq: [
          { question: 'How can DNS break internet if Wi‑Fi is connected?', answer: 'The link can be up while name resolution fails. Without DNS, many apps cannot find servers.' },
          { question: 'Are PPPoE errors always wrong password?', answer: 'Not always. Provisioning, line issues, and ISP policy can cause negotiation failures.' },
          { question: 'Fastest isolation test?', answer: 'Try wired connection or hotspot to separate Wi‑Fi/router from ISP path.' },
          { question: 'Should I change Wi‑Fi security mode?', answer: 'Usually not for drops. Address signal/interference first.' },
          { question: 'Why does VPN fail only on one network?', answer: 'Firewalls/ISPs can block protocols. Testing on another network confirms policy blocks.' },
          { question: 'What should I tell ISP?', answer: 'Exact error codes, timestamps, modem status, and whether other devices are impacted.' },
          { question: 'Is rebooting enough?', answer: 'It often fixes transient state; repeated errors need configuration or ISP-side fixes.' },
          { question: 'Can strong signal still be unstable?', answer: 'Yes. Interference and congestion can cause packet loss despite good signal strength.' },
        ],
      };

    case 'systems-pos-terminals':
      return {
        promise:
          'Use this guide to separate issuer declines from terminal connectivity and device health states so you can restore acceptance safely.',
        tldr: [
          'Separate: card decline vs host connectivity vs device health (tamper/keys).',
          'If many cards fail at once, suspect connectivity or host outage.',
          'If one card fails everywhere, suspect issuer/account state.',
          'Do not DIY security/key handling; follow vendor/processor procedures.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Host unavailable/timeout/communication errors.', 'Tamper or keys-not-loaded messages.', 'Repeated declines with issuer codes.', 'Settlement/batch close failures.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Issuer declines and risk decisions.', 'Host/gateway connectivity failures.', 'Key state and terminal security health (tamper, keys).', 'Duplicate/reversal state after interrupted transactions.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Verify internet and host connectivity if many transactions fail.', 'Restart terminal and network equipment.', 'For tamper/keys issues, remove terminal from service and contact vendor/processor.', 'For declines, confirm entry method and ask customer to contact issuer if persistent.', 'Follow reversal prompts and verify transaction final state before retrying.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not open terminals or attempt key repairs.', 'Do not repeatedly retry after timeouts without verifying previous state.', 'Do not store sensitive payment data outside approved systems.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture message/code, timestamp, amount, entry method, terminal ID.', 'Check if other stores are impacted (outage).', 'Use processor support for key reload and settlement issues.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Some systems have both “POS terminal” and “POS response” codes. Use code page context to confirm layer.'],
          sources: [
            { kind: 'systems', subcategory: 'pos-terminals', limit: 20 },
            { kind: 'systems', subcategory: 'pos-systems', limit: 12 },
          ],
        },
        references: ['Processor support guidance', 'Terminal vendor documentation', 'PCI and key-handling policies'],
        faq: [
          { question: 'Is “declined” always terminal fault?', answer: 'No. Declines are commonly issuer decisions. Terminal faults are more likely when many cards fail or connectivity messages appear.' },
          { question: 'What does “tamper detected” mean?', answer: 'A security mechanism triggered and disabled sensitive functions. It often requires certified service or replacement.' },
          { question: 'Can I fix keys-not-loaded myself?', answer: 'Usually no. Key handling is compliance-sensitive; follow processor/vendor procedures.' },
          { question: 'Why do timeouts cause duplicates?', answer: 'If host response is interrupted, the terminal may not know the outcome. Reversal/duplicate prevention prevents double-charging.' },
          { question: 'Safest retry rule?', answer: 'Retry once after confirming connectivity. If outcome is unknown, verify state before retrying.' },
          { question: 'Why does chip fail but tap works?', answer: 'Chip contact issues or reader wear can cause read failures; contactless may still work depending on rules.' },
          { question: 'When should I call processor?', answer: 'For outages, key issues, settlement failures, and widespread declines with network errors.' },
          { question: 'What should I log?', answer: 'Terminal ID, timestamps, response text, and whether failures are widespread.' },
        ],
      };

    case 'systems-bios-uefi':
      return {
        promise:
          'Use this guide to interpret early-boot failures safely and decide whether the issue is boot order/config, disk detection, or hardware health signals.',
        tldr: [
          'Beep/POST patterns vary by OEM; identify the vendor first.',
          'Start with power/cables/drive detection basics.',
          'Bootloader messages often indicate boot config or drive issues.',
          'Avoid unsafe hardware handling; follow OEM procedures.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['PC powers on but won’t boot OS.', 'Messages like “no bootable device”, “bootmgr is missing”.', 'PXE/network boot messages appear unexpectedly.', 'Beep patterns or POST indicators appear (vendor-specific).'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Boot order and boot mode mismatch.', 'Drive not detected or unreadable.', 'Bootloader/partition issues after cloning or partition edits.', 'Hardware health warnings depending on model.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Remove external boot media and check boot order.', 'Confirm system drive is detected in BIOS/UEFI.', 'Reseat cables on desktops (power off) if applicable.', 'Prioritize data recovery if disk read errors appear.', 'Use official recovery media for boot repair.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not flash firmware without stable power and correct image.', 'Do not change partitions without backups.', 'Do not continue repeated boot attempts on a failing drive without a recovery plan.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Record exact message/beep pattern and hardware model.', 'Use OEM documentation for your board/laptop.', 'Seek professional service when hardware faults are suspected.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Beep codes vary; this directory focuses on widely shown messages and safe interpretation paths.'],
          sources: [{ kind: 'systems', subcategory: 'bios-uefi', limit: 24 }],
        },
        references: ['OEM BIOS/UEFI documentation', 'Drive health diagnostics', 'Official recovery media guidance'],
        faq: [
          { question: 'Are beep codes universal?', answer: 'No. They vary by BIOS vendor and OEM. Identify the exact vendor/model first.' },
          { question: 'Why do I see PXE boot messages?', answer: 'Often because the system didn’t find a bootable local device and moved to network boot.' },
          { question: 'Does BOOTMGR missing mean Windows is unrecoverable?', answer: 'Not necessarily. It often indicates missing boot files or wrong boot device selection.' },
          { question: 'Safest first check?', answer: 'Confirm the OS drive is detected and first in boot order.' },
          { question: 'When should I stop and back up?', answer: 'When disk read errors or health warnings appear.' },
          { question: 'Is firmware update a fix?', answer: 'Sometimes, but it carries risk. Only do it when OEM recommends and power is stable.' },
          { question: 'Can a loose cable cause boot failure?', answer: 'Yes, especially on desktops.' },
          { question: 'What should I capture for support?', answer: 'Exact message text, hardware model, and recent changes (drive swap, BIOS reset).' },
        ],
      };

    case 'systems-smart-devices':
      return {
        promise:
          'Use this guide to isolate whether the failure is Wi‑Fi, cloud service availability, device onboarding, or local power/sensor health—then fix in a safe order.',
        tldr: [
          'Isolate: one device vs many devices vs whole network.',
          'Most smart device failures are connectivity (Wi‑Fi/DNS/service-side).',
          'Onboarding fails often due to captive portals or Wi‑Fi band/security compatibility.',
          'Avoid factory reset until you confirm services and Wi‑Fi stability.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Codes during setup/network test.', 'Devices go offline intermittently.', 'Apps show timeouts or can’t authenticate.', 'Firmware updates fail.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Wi‑Fi signal/interference.', 'DNS/proxy/firewall restrictions.', 'Vendor service outage or account auth problems.', 'Power/battery issues and update state.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Confirm internet works and whether vendor service is down.', 'Restart router and device.', 'Move device closer to router and retest.', 'Verify time/date on phones/routers for secure connections.', 'Reset only after documenting setup/account binding.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not repeatedly reset during onboarding.', 'Do not expose devices directly to the internet without understanding security impact.', 'Do not ignore battery/power warnings.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture code, device model, firmware version, timestamps.', 'Test a hotspot to isolate router/ISP restrictions.', 'Use vendor support for account-binding issues.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Many smart device codes are connectivity-related. Use the code page “where you see this” to confirm whether it is setup, Ethernet, or Wi‑Fi.'],
          sources: [{ kind: 'systems', subcategory: 'smart-devices', limit: 24 }],
        },
        references: ['Vendor support and status pages', 'Home network diagnostics', 'Safe IoT security practices'],
        faq: [
          { question: 'Why do devices disconnect at night?', answer: 'Router reboots, channel changes, ISP maintenance, or power saving can cause intermittent drops.' },
          { question: 'Is 2.4GHz required?', answer: 'Some devices support only 2.4GHz. If onboarding fails, try 2.4GHz where appropriate.' },
          { question: 'Can DNS break onboarding?', answer: 'Yes. Filtering or DNS issues can block activation endpoints.' },
          { question: 'When should I factory reset?', answer: 'After confirming service status and Wi‑Fi stability and documenting account binding.' },
          { question: 'Why app works but device offline?', answer: 'Often device-to-cloud connectivity is blocked, not phone-to-router connectivity.' },
          { question: 'Do firmware updates cause downtime?', answer: 'Sometimes. Interruptions can leave devices temporarily offline.' },
          { question: 'Best isolation test?', answer: 'Use a hotspot to test whether the device connects outside your home network.' },
          { question: 'What should I capture for support?', answer: 'Model, firmware, error code, and timestamps.' },
        ],
      };

    case 'systems-security-systems':
      return {
        promise:
          'Use this guide to identify whether the issue is sensor state, panel communication, battery health, or authentication/certificate policy—then apply safe fixes.',
        tldr: [
          'Start by identifying the layer: sensor, panel, communication path, or account/auth policy.',
          'Battery and communication issues are common and can mimic “system failure”.',
          'For authentication/certificate errors, verify time/date and trust chain before deeper changes.',
          'Avoid disabling security controls; use vendor guidance and logs.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Panel shows trouble codes or communication loss.', 'Sensors report tamper/low battery/offline.', 'Account login fails or certificate errors appear in logs.', 'System intermittently arms/disarms or loses connectivity.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Sensor battery/placement issues.', 'Panel-to-sensor RF range/interference.', 'Internet/cellular path problems (DNS, firewall, carrier issues).', 'Account policy restrictions and auth failures.', 'Certificate trust and time sync problems.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Confirm power and connectivity at the panel (internet/cellular).', 'Check low battery alerts and replace batteries with correct type.', 'Reduce interference and confirm sensor placement/range.', 'Verify system time/date for certificate/auth flows.', 'Use vendor diagnostics for communication and account policy issues.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not disable safety/security features permanently.', 'Do not ignore repeated tamper alerts; verify sensor mounting.', 'Do not share security credentials insecurely.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Capture panel logs, timestamps, and device identifiers.', 'Confirm whether failures follow network changes.', 'Use vendor support for auth/policy issues and persistent comm faults.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Security-related codes often have environment-specific causes. Use code pages as a safe starting point, then confirm with your system vendor.'],
          sources: [{ kind: 'systems', subcategory: 'security-systems', limit: 24 }],
        },
        references: ['Vendor support documentation', 'Security event logs and monitoring tools', 'Certificate validation and time sync guidance'],
        faq: [
          { question: 'Is every security logon error an attack?', answer: 'No. Misconfiguration and automation can generate failures. Correlate with source hosts and timing.' },
          { question: 'Why does time sync matter?', answer: 'Time skew can break authentication and certificate validation.' },
          { question: 'What is the safest first fix?', answer: 'Confirm connectivity/power, replace low batteries, and verify time/date.' },
          { question: 'Should I disable certificate checks?', answer: 'No. Fix trust configuration instead.' },
          { question: 'Do sensor batteries cause communication errors?', answer: 'Yes. Low voltage can cause intermittent sensor drops.' },
          { question: 'When to call vendor?', answer: 'For persistent communication loss, account policy blocks, or system-wide failures.' },
          { question: 'What should I capture?', answer: 'Exact code, timestamp, panel logs, and network environment details.' },
          { question: 'Can firewall rules break security systems?', answer: 'Yes. Cloud-connected systems require outbound access to specific endpoints.' },
        ],
      };

    case 'systems-embedded-iot':
      return {
        promise:
          'Use this guide to recognize firmware, memory, and connectivity fault patterns in embedded/IoT devices and choose safe triage steps before hardware guesswork.',
        tldr: [
          'Fault names often describe CPU exception categories (HardFault, BusFault, etc.).',
          'Memory bugs can look random; logging and crash context are key.',
          'Connectivity issues can be power, RF, or configuration rather than “server down”.',
          'Avoid unsafe hardware changes; isolate with logs and controlled tests.',
        ],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['Device resets, enters safe mode, or reports exception names.', '“Out of memory” or allocation failures occur over time.', 'Connectivity drops under load or after updates.', 'Firmware update failures or boot loops occur.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Memory access bugs (invalid pointers, stack corruption).', 'Allocator issues (fragmentation, leaks, double frees).', 'Peripheral/bus access issues and clock/power configuration.', 'Connectivity issues (RF environment, power, configuration).', 'Update/boot chain issues (rollback, partial update).'] },
          { id: 'fix-steps', title: 'Step-by-step fixes (safe, prioritized)', bullets: ['Capture crash context (PC/LR, fault registers) when available.', 'Check power stability and supply tolerances under load.', 'Review recent firmware changes around buffers, interrupts, and allocation.', 'Reduce allocation churn or use static buffers where appropriate.', 'Use staged rollouts and rollback plans for firmware updates.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Do not guess hardware repairs from exception names alone.', 'Do not disable safety monitors without a documented reason.', 'Do not deploy untested firmware widely after a fault spike.'] },
          { id: 'escalation', title: 'If it persists (escalation checklist)', bullets: ['Collect crash dumps and logs with timestamps.', 'Reproduce in controlled environment with debug symbols.', 'Engage vendor/firmware team for root cause isolation.'] },
        ],
        codeDirectory: {
          title: 'Code directory within this guide',
          notes: ['Embedded fault codes are often firmware-implementation dependent. Use these pages as a general map, then rely on your MCU/vendor docs for exact meaning.'],
          sources: [{ kind: 'systems', subcategory: 'embedded-systems', limit: 24 }],
        },
        references: ['MCU vendor documentation', 'RTOS configuration guides', 'Crash dump and logging best practices'],
        faq: [
          { question: 'Is HardFault always hardware failure?', answer: 'No. It often indicates software faults like invalid memory access or stack corruption.' },
          { question: 'Why do memory bugs look random?', answer: 'Corruption can occur earlier and only crash later when the corrupted state is used.' },
          { question: 'What’s the best first data to capture?', answer: 'Fault registers, stack trace, and the last log lines before reset.' },
          { question: 'Should I avoid dynamic allocation?', answer: 'Not always, but uncontrolled allocation/free can cause fragmentation and failures in constrained systems.' },
          { question: 'Can power issues cause crashes?', answer: 'Yes. Brownouts and supply instability can mimic software faults.' },
          { question: 'Why do updates brick devices?', answer: 'Partial updates, interrupted power, or bootloader rollback issues can leave inconsistent state.' },
          { question: 'How do I reduce field risk?', answer: 'Use staged rollouts, telemetry, and rollback capability.' },
          { question: 'When to involve hardware team?', answer: 'When faults correlate with temperature/power/EMI or reproduce only in specific hardware conditions.' },
        ],
      };

    default:
      return {
        promise: 'Use this guide to troubleshoot safely and quickly.',
        tldr: ['Start with the symptom bucket.', 'Apply safe fixes first.', 'Escalate with logs and timestamps.'],
        sections: [
          { id: 'symptoms', title: 'Symptoms / When you see this', bullets: ['A code appears and you need a safe next step.'] },
          { id: 'root-causes', title: 'Root causes (grouped)', bullets: ['Environment, configuration, and service availability.'] },
          { id: 'fix-steps', title: 'Step-by-step fixes', bullets: ['Restart and validate prerequisites.'] },
          { id: 'dont', title: 'What NOT to do', bullets: ['Avoid destructive actions first.'] },
          { id: 'escalation', title: 'If it persists', bullets: ['Capture logs and escalate via official channels.'] },
        ],
        codeDirectory: { title: 'Code directory within this guide', notes: [], sources: [] },
        references: ['Manufacturer or platform support resources'],
        faq: [],
      };
  }
}

export function buildGuideModel(meta: GuideMeta, allGuides: GuideMeta[]): GuidePageModel {
  const topic = getTopicModel(meta.topicKey);

  const relatedHubs = [
    ...baseHubLinks(meta.categoryKey),
    ...(meta.categoryKey === 'systems' ? systemsSubHub(meta.topicKey) : []),
    ...(meta.categoryKey === 'healthcare' ? [{ label: 'Healthcare code directory', href: '/healthcare/error-codes/' }] : []),
    ...(meta.categoryKey === 'gaming' ? [{ label: 'Gaming code directory', href: '/gaming/error-codes/' }] : []),
    ...(meta.categoryKey === 'irs-tax' ? [{ label: 'IRS / Tax code directory', href: '/irs-tax/error-codes/' }] : []),
    ...(meta.categoryKey === 'banking' ? [{ label: 'Banking code directory', href: '/banking/error-codes/' }] : []),
    ...(meta.categoryKey === 'appliances' ? [{ label: 'Appliances hub', href: '/appliances/' }] : []),
  ];

  return {
    meta,
    promise: topic.promise,
    tldr: topic.tldr,
    quickNav: defaultQuickNav(),
    sections: topic.sections,
    codeDirectory: topic.codeDirectory,
    relatedHubs,
    relatedGuides: pickRelatedGuides(allGuides, meta, 4),
    faq: topic.faq,
    references: topic.references,
  };
}

