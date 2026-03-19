export type GuideCategoryKey = 'healthcare' | 'insurance' | 'gaming' | 'irs-tax' | 'banking' | 'appliances' | 'systems';

export type GuideTopicKey =
  | 'healthcare-denials'
  | 'insurance'
  | 'gaming-xbox'
  | 'gaming-playstation'
  | 'gaming-nintendo-switch'
  | 'gaming-steam'
  | 'gaming-epic-fortnite'
  | 'irs-notices'
  | 'irs-transcripts'
  | 'banking-ach'
  | 'banking-card-declines'
  | 'banking-transfer-failures'
  | 'appliances-washer'
  | 'appliances-dryer'
  | 'appliances-dishwasher'
  | 'appliances-refrigerator'
  | 'systems-printers'
  | 'systems-windows-startup'
  | 'systems-routers'
  | 'systems-pos-terminals'
  | 'systems-bios-uefi'
  | 'systems-smart-devices'
  | 'systems-security-systems'
  | 'systems-embedded-iot';

export type GuideMeta = {
  categoryKey: GuideCategoryKey;
  topicKey: GuideTopicKey;
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
};

export const GUIDE_CATEGORIES: Array<{ key: GuideCategoryKey; label: string; href: string; hubHref: string }> = [
  { key: 'healthcare', label: 'Healthcare', href: '/guides/healthcare/', hubHref: '/insurance/healthcare/' },
  { key: 'insurance', label: 'Insurance', href: '/guides/insurance/', hubHref: '/insurance/' },
  { key: 'gaming', label: 'Gaming', href: '/guides/gaming/', hubHref: '/gaming/' },
  { key: 'irs-tax', label: 'IRS / Tax', href: '/guides/irs-tax/', hubHref: '/irs-tax/' },
  { key: 'banking', label: 'Banking', href: '/guides/banking/', hubHref: '/banking/' },
  { key: 'appliances', label: 'Appliances', href: '/guides/appliances/', hubHref: '/appliances/' },
  { key: 'systems', label: 'Systems & Devices', href: '/guides/systems/', hubHref: '/systems/' },
];

export const GUIDES: GuideMeta[] = [
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'the-complete-insurance-claim-denial-codes-directory-2026-edition',
    title: 'The Complete Insurance Claim Denial Codes Directory (2026 Edition)',
    description: 'A comprehensive, practical directory of insurance claim denial codes with fix checklists and links to canonical code pages.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: '150-plus-insurance-claim-rejection-reasons-explained-with-fixes',
    title: '150+ Insurance Claim Rejection Reasons Explained (With Fixes)',
    description: 'Breaks down the most common rejection reasons by category and shows the safest fix order to get claims moving again.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'ultimate-guide-to-fixing-insurance-claim-errors-step-by-step',
    title: 'Ultimate Guide to Fixing Insurance Claim Errors Step-by-Step',
    description: 'A step-by-step playbook for triaging and fixing insurance claim errors without creating duplicates or missing deadlines.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-claims-processing-errors-causes-codes-and-solutions',
    title: 'Insurance Claims Processing Errors: Causes, Codes & Solutions',
    description: 'Explains the claims processing failure buckets and links to the most common codes with actionable resolution steps.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'full-guide-to-insurance-billing-errors-and-how-to-resolve-them',
    title: 'Full Guide to Insurance Billing Errors and How to Resolve Them',
    description: 'A practical guide to billing validation failures and how to correct the underlying cause before resubmitting.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'edi-837-and-835-errors-in-insurance-complete-troubleshooting-guide',
    title: 'EDI 837 & 835 Errors in Insurance: Complete Troubleshooting Guide',
    description: 'A workflow-first troubleshooting guide for common EDI submission and remittance error patterns with safe fix steps.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'top-100-insurance-claim-errors-that-delay-payments-and-how-to-fix-them',
    title: 'Top 100 Insurance Claim Errors That Delay Payments (And How to Fix Them)',
    description: 'The highest-impact delay causes across claims, billing, and processing—plus fixes that reduce rework and time to payment.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-claim-status-codes-explained-from-submission-to-payment',
    title: 'Insurance Claim Status Codes Explained (From Submission to Payment)',
    description: 'A plain-language map of claim status checkpoints and what to do next at each stage of the lifecycle.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'why-insurance-claims-get-denied-complete-breakdown-by-code-type',
    title: 'Why Insurance Claims Get Denied: Complete Breakdown by Code Type',
    description: 'Explains denial logic by code family so you can separate correctable issues from policy decisions quickly.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-policy-errors-and-validation-codes-full-guide',
    title: 'Insurance Policy Errors & Validation Codes: Full Guide',
    description: 'Covers policy status, eligibility, limits, and validation mismatches with prevention and escalation guidance.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'auto-insurance-claim-errors-top-codes-causes-and-fixes',
    title: 'Auto Insurance Claim Errors: Top Codes, Causes & Fixes',
    description: 'Focuses on auto claim rejection patterns—documentation, VIN issues, coverage disputes—and how to resolve them safely.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'property-insurance-claim-denials-explained-with-real-examples',
    title: 'Property Insurance Claim Denials Explained (With Real Examples)',
    description: 'Real-world property claim scenarios with coverage scope, inspection, valuation, and settlement dispute fix steps.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'renters-insurance-claim-errors-what-causes-rejections-and-fixes',
    title: 'Renters Insurance Claim Errors: What Causes Rejections & Fixes',
    description: 'Explains renters claim rejections—proof, inventory, exclusions, sublease violations—and the fastest safe fixes.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'life-insurance-claim-denial-codes-and-payout-issues-explained',
    title: 'Life Insurance Claim Denial Codes & Payout Issues Explained',
    description: 'A practical guide to life claim payout delays, beneficiary disputes, contestability issues, and documentation fixes.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-claims-processing-workflow-errors-at-every-stage',
    title: 'Insurance Claims Processing Workflow: Errors at Every Stage',
    description: 'Walks the full claims workflow and highlights the most common errors at intake, routing, adjudication, and payment.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-fraud-flags-and-investigation-codes-explained',
    title: 'Insurance Fraud Flags & Investigation Codes Explained',
    description: 'Explains investigation triggers and how to respond with documentation without making your situation worse.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'duplicate-claims-missing-data-and-invalid-submissions-full-error-guide',
    title: 'Duplicate Claims, Missing Data & Invalid Submissions: Full Error Guide',
    description: 'A focused guide on the three biggest operational blockers and how to correct them without repeat rejections.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-coverage-errors-eligibility-limits-and-policy-issues',
    title: 'Insurance Coverage Errors: Eligibility, Limits & Policy Issues',
    description: 'Covers eligibility checks, coverage limits, lapse/expiration rules, and what to verify before disputing a denial.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'claims-adjudication-errors-explained-how-decisions-are-made',
    title: 'Claims Adjudication Errors Explained (How Decisions Are Made)',
    description: 'Shows how adjudication decisions happen and where errors occur—from data quality to policy rules and system edits.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-payment-errors-and-adjustment-codes-explained',
    title: 'Insurance Payment Errors & Adjustment Codes Explained',
    description: 'A guide to payment calculation, adjustments, and downstream billing errors that stall settlement.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'top-billing-code-mistakes-in-insurance-claims-and-fixes',
    title: 'Top Billing Code Mistakes in Insurance Claims (And Fixes)',
    description: 'The most common billing mistakes (format, modifiers, bundling, provider identifiers) and the safest correction approach.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-documentation-errors-that-cause-claim-rejections',
    title: 'Insurance Documentation Errors That Cause Claim Rejections',
    description: 'A documentation-first guide to fixing missing/insufficient evidence, mismatched forms, and verification delays.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'out-of-network-and-authorization-errors-in-insurance-claims',
    title: 'Out-of-Network & Authorization Errors in Insurance Claims',
    description: 'Explains network and authorization failures, how they are checked, and what to correct before resubmitting.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-claim-delays-all-error-codes-that-cause-slow-processing',
    title: 'Insurance Claim Delays: All Error Codes That Cause Slow Processing',
    description: 'A practical playbook for reducing delays by targeting the code families that hold claims in pending or review states.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'high-value-claim-errors-in-insurance-large-claims-and-disputes',
    title: 'High-Value Claim Errors in Insurance (Large Claims & Disputes)',
    description: 'High-value claims attract extra scrutiny. This guide covers disputes, investigations, and documentation expectations.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-system-errors-api-failures-submission-errors-and-fixes',
    title: 'Insurance System Errors: API Failures, Submission Errors & Fixes',
    description: 'A technical guide to submission failures, API errors, batch issues, and how to escalate with the right artifacts.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'end-to-end-insurance-claim-lifecycle-errors-full-technical-guide',
    title: 'End-to-End Insurance Claim Lifecycle Errors (Full Technical Guide)',
    description: 'Covers errors end-to-end from intake to payment with lifecycle checkpoints and fix sequencing.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-error-codes-by-category-claims-billing-policy-processing',
    title: 'Insurance Error Codes by Category: Claims, Billing, Policy, Processing',
    description: 'Organizes insurance error codes by category and links each bucket to actionable code pages and guides.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'beginner-to-advanced-guide-to-insurance-error-codes-full-breakdown',
    title: 'Beginner to Advanced Guide to Insurance Error Codes (Full Breakdown)',
    description: 'A from-scratch breakdown that teaches how to read codes, spot patterns, and fix common failures without guesswork.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'insurance',
    topicKey: 'insurance',
    slug: 'insurance-claim-resubmission-guide-fixing-errors-and-getting-approved',
    title: 'Insurance Claim Resubmission Guide: Fixing Errors and Getting Approved',
    description: 'A practical resubmission workflow: how to correct errors, choose the right resubmit type, and avoid repeat rejections.',
    lastUpdated: '2026-03-19',
  },
  {
    categoryKey: 'healthcare',
    topicKey: 'healthcare-denials',
    slug: 'healthcare-claim-denial-codes-explained-carc-rarc-co-pr-oa-pi-real-fix-steps',
    title: 'Healthcare Claim Denial Codes Explained: CARC/RARC, CO/PR/OA/PI + Real Fix Steps',
    description:
      'An SEO-first, factual guide to denial and adjustment code families (CARC/RARC, CO/PR/OA/PI) with safe fix steps and links to real code pages.',
    lastUpdated: '2026-02-27',
  },

  {
    categoryKey: 'gaming',
    topicKey: 'gaming-xbox',
    slug: 'xbox-error-codes-the-complete-troubleshooting-map',
    title: 'Xbox Error Codes: The Complete Troubleshooting Map (0x87* / 0x80* / Sign-In / Updates)',
    description: 'A structured troubleshooting map for Xbox error code families with safe steps for sign-in, updates, and network issues.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'gaming',
    topicKey: 'gaming-playstation',
    slug: 'playstation-error-codes-explained-psn-sign-in-store-downloads-updates',
    title: 'PlayStation Error Codes Explained: PSN Sign-In, Store, Downloads, and Updates',
    description: 'A practical guide to PSN and PlayStation code families with safe steps for downloads, updates, store, and sign-in.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'gaming',
    topicKey: 'gaming-nintendo-switch',
    slug: 'nintendo-switch-error-codes-eshop-network-updates-account-issues',
    title: 'Nintendo Switch Error Codes: eShop, Network, Updates, and Account Issues',
    description: 'A safety-first guide to common Nintendo Switch numeric error codes and what to do next for eShop, network, and updates.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'gaming',
    topicKey: 'gaming-steam',
    slug: 'steam-error-codes-login-problems-network-vac-downloads-payment-failures',
    title: 'Steam Error Codes & Login Problems: Network, VAC, Downloads, and Payment Failures',
    description: 'A structured guide to Steam error patterns with safe troubleshooting and escalation steps.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'gaming',
    topicKey: 'gaming-epic-fortnite',
    slug: 'epic-games-fortnite-error-codes-login-matchmaking-updates-connectivity',
    title: 'Epic Games / Fortnite Error Codes: Login, Matchmaking, Updates, and Connectivity',
    description: 'A practical guide to Epic launcher and Fortnite error patterns with safe steps for login, matchmaking, updates, and connectivity.',
    lastUpdated: '2026-02-27',
  },

  {
    categoryKey: 'irs-tax',
    topicKey: 'irs-notices',
    slug: 'irs-notice-codes-cp-lt-explained-what-they-mean-what-to-do-next',
    title: 'IRS Notice Codes (CP / LT) Explained: What They Mean + What To Do Next',
    description: 'A factual guide to IRS notice families (CP/LT) with safe next steps and links to real notice pages.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'irs-tax',
    topicKey: 'irs-transcripts',
    slug: 'tax-transcript-codes-tc-explained-refund-holds-audits-identity-verification-timelines',
    title: 'Tax Transcript Codes (TC) Explained: Refund Holds, Audits, Identity Verification + Timelines',
    description: 'A plain-language map of common transcript transaction codes (TC) with safe interpretation and timeline guidance.',
    lastUpdated: '2026-02-27',
  },

  {
    categoryKey: 'banking',
    topicKey: 'banking-ach',
    slug: 'ach-return-codes-r01-r85-explained-meanings-fixes-prevention-checklist',
    title: 'ACH Return Codes (R01–R85) Explained: Meanings, Fixes, and Prevention Checklist',
    description: 'A practical guide to ACH return code families with safe fixes and prevention checklists.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'banking',
    topicKey: 'banking-card-declines',
    slug: 'card-decline-codes-explained-issuer-responses-avs-cvv-mismatches-next-steps',
    title: 'Card Decline Codes Explained: Issuer Responses, AVS/CVV Mismatches, and Next Steps',
    description: 'A structured guide to issuer response codes and what to do next for merchants and customers.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'banking',
    topicKey: 'banking-transfer-failures',
    slug: 'bank-transfer-payment-failure-codes-wire-sepa-swift-errors-resolution-flow',
    title: 'Bank Transfer & Payment Failure Codes: Wire/SEPA/Swift Errors + Resolution Flow',
    description: 'A safe, scenario-first guide to transfer failure patterns and resolution flow without creating duplicates.',
    lastUpdated: '2026-02-27',
  },

  {
    categoryKey: 'appliances',
    topicKey: 'appliances-washer',
    slug: 'washer-error-codes-explained-drain-spin-door-lock-water-level-problems',
    title: 'Washer Error Codes Explained: Drain, Spin, Door Lock, and Water Level Problems',
    description: 'A washer troubleshooting guide focused on drain, spin, door lock, and fill/water level patterns.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'appliances',
    topicKey: 'appliances-dryer',
    slug: 'dryer-error-codes-explained-heat-venting-motor-sensor-failures',
    title: 'Dryer Error Codes Explained: Heat, Venting, Motor, and Sensor Failures',
    description: 'A safety-first dryer guide focused on heat, venting, motor, and sensor patterns.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'appliances',
    topicKey: 'appliances-dishwasher',
    slug: 'dishwasher-error-codes-explained-fill-drain-heater-leaks-control-board-issues',
    title: 'Dishwasher Error Codes Explained: Fill/Drain, Heater, Leaks, and Control Board Issues',
    description: 'A dishwasher troubleshooting guide focused on fill/drain, heater, leaks, and control patterns.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'appliances',
    topicKey: 'appliances-refrigerator',
    slug: 'refrigerator-error-codes-explained-defrost-fans-temperature-sensors-ice-maker',
    title: 'Refrigerator Error Codes Explained: Defrost, Fans, Temperature Sensors, and Ice Maker',
    description: 'A refrigerator troubleshooting guide focused on defrost, fans, temperature sensors, and ice maker patterns.',
    lastUpdated: '2026-02-27',
  },

  {
    categoryKey: 'systems',
    topicKey: 'systems-printers',
    slug: 'printer-error-codes-for-offices-hp-canon-brother-epson-fix-decision-tree',
    title: 'Printer Error Codes for Offices: HP, Canon, Brother, Epson + Fix Decision Tree',
    description: 'A decision-tree guide to office printer errors with links to real printer code pages.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'systems',
    topicKey: 'systems-windows-startup',
    slug: 'windows-startup-blue-screen-codes-what-they-mean-safe-recovery-steps',
    title: 'Windows Startup & Blue Screen Codes: What They Mean + Safe Recovery Steps',
    description: 'A conservative guide to Windows startup failures and common code families with safe recovery steps.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'systems',
    topicKey: 'systems-routers',
    slug: 'router-wi-fi-error-codes-isp-modems-dns-failures-authentication-drops',
    title: 'Router & Wi-Fi Error Codes: ISP Modems, DNS Failures, Authentication, and Drops',
    description: 'A conservative guide to router/Wi‑Fi failures with safe fixes for DNS, PPP, VPN, and drop patterns.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'systems',
    topicKey: 'systems-pos-terminals',
    slug: 'pos-terminal-error-codes-payment-processing-connectivity-device-health',
    title: 'POS Terminal Error Codes: Payment Processing, Connectivity, and Device Health',
    description: 'A practical guide to POS terminal errors covering processing, connectivity, and device health state.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'systems',
    topicKey: 'systems-bios-uefi',
    slug: 'bios-uefi-error-beeps-post-codes-ram-cpu-gpu-diagnosis',
    title: 'BIOS/UEFI Error Beeps & POST Codes: RAM/CPU/GPU Diagnosis',
    description: 'A conservative guide to BIOS/UEFI boot messages and POST/beep patterns with safe diagnosis steps.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'systems',
    topicKey: 'systems-smart-devices',
    slug: 'smart-device-error-codes-cameras-doorbells-thermostats-connectivity-fixes',
    title: 'Smart Device Error Codes: Cameras, Doorbells, Thermostats + Connectivity Fixes',
    description: 'A connectivity-first guide to smart device error patterns with safe fix order and links to real code pages.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'systems',
    topicKey: 'systems-security-systems',
    slug: 'security-system-error-codes-sensors-panels-battery-communication-issues',
    title: 'Security System Error Codes: Sensors, Panels, Battery, and Communication Issues',
    description: 'A conservative guide to security system error patterns with safe diagnostics and links to real code pages.',
    lastUpdated: '2026-02-27',
  },
  {
    categoryKey: 'systems',
    topicKey: 'systems-embedded-iot',
    slug: 'embedded-iot-device-error-codes-firmware-connectivity-hardware-fault-patterns',
    title: 'Embedded / IoT Device Error Codes: Firmware, Connectivity, and Hardware Fault Patterns',
    description: 'A pattern-based guide to embedded/IoT fault codes with safe triage and links to real embedded system code pages.',
    lastUpdated: '2026-02-27',
  },
];

export function getGuidesByCategory(categoryKey: GuideCategoryKey) {
  return GUIDES.filter((g) => g.categoryKey === categoryKey);
}

export function getGuideByRoute(categoryKey: string, slug: string) {
  return GUIDES.find((g) => g.categoryKey === (categoryKey as any) && g.slug === slug);
}
