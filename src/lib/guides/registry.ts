export type GuideCategoryKey = 'healthcare' | 'gaming' | 'irs-tax' | 'banking' | 'appliances' | 'systems';

export type GuideTopicKey =
  | 'healthcare-denials'
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
  { key: 'healthcare', label: 'Healthcare', href: '/guides/healthcare/', hubHref: '/healthcare/' },
  { key: 'gaming', label: 'Gaming', href: '/guides/gaming/', hubHref: '/gaming/' },
  { key: 'irs-tax', label: 'IRS / Tax', href: '/guides/irs-tax/', hubHref: '/irs-tax/' },
  { key: 'banking', label: 'Banking', href: '/guides/banking/', hubHref: '/banking/' },
  { key: 'appliances', label: 'Appliances', href: '/guides/appliances/', hubHref: '/appliances/' },
  { key: 'systems', label: 'Systems & Devices', href: '/guides/systems/', hubHref: '/systems/' },
];

export const GUIDES: GuideMeta[] = [
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

