import { GUIDES, type GuideCategoryKey, type GuideMeta, type GuideTopicKey } from './registry';

export type LearnMoreLink = { label: string; href: string };

function guideByTopic(topicKey: GuideTopicKey): GuideMeta | undefined {
  return GUIDES.find((g) => g.topicKey === topicKey);
}

function guideHref(g: GuideMeta): LearnMoreLink {
  return { label: g.title, href: `/guides/${g.categoryKey}/${g.slug}/` };
}

export function pickGuidesForCode(args: {
  industryKey: GuideCategoryKey;
  code: string;
  systemSubcategory?: string;
  applianceType?: string;
}) {
  const code = args.code;
  const upper = code.toUpperCase();

  const topics: GuideTopicKey[] = [];

  if (args.industryKey === 'healthcare') topics.push('healthcare-denials');

  if (args.industryKey === 'irs-tax') {
    if (/^(CP|LT)/i.test(upper)) topics.push('irs-notices');
    if (/^TC/i.test(upper)) topics.push('irs-transcripts');
    if (topics.length === 0) topics.push('irs-notices', 'irs-transcripts');
  }

  if (args.industryKey === 'banking') {
    if (/^R\d{2}/i.test(upper)) topics.push('banking-ach');
    if (/^(05|12|13|14|51|54|57|58|61|62|65|75|85|91|96)$/.test(code)) topics.push('banking-card-declines');
    if (topics.length === 0) topics.push('banking-transfer-failures');
  }

  if (args.industryKey === 'gaming') {
    if (/^0X(80|87)/i.test(upper)) topics.push('gaming-xbox');
    if (/^(CE-|NP-|SU-|WS-)/i.test(upper)) topics.push('gaming-playstation');
    if (/^\d{4}-\d{4}$/.test(code)) topics.push('gaming-nintendo-switch');
    if (/^(LS-|IS-|AS-)/i.test(upper)) topics.push('gaming-epic-fortnite');
    if (topics.length === 0) topics.push('gaming-steam');
  }

  if (args.industryKey === 'appliances') {
    const t = (args.applianceType ?? '').toLowerCase();
    if (t === 'washer') topics.push('appliances-washer');
    else if (t === 'dishwasher') topics.push('appliances-dishwasher');
    else if (t === 'refrigerator') topics.push('appliances-refrigerator');
    else topics.push('appliances-dryer');
  }

  if (args.industryKey === 'systems') {
    const sub = (args.systemSubcategory ?? '').toLowerCase();
    if (sub === 'printers') topics.push('systems-printers');
    else if (sub === 'routers') topics.push('systems-routers');
    else if (sub === 'pos-terminals' || sub === 'pos-systems') topics.push('systems-pos-terminals');
    else if (sub === 'bios-uefi') topics.push('systems-bios-uefi');
    else if (sub === 'smart-devices') topics.push('systems-smart-devices');
    else if (sub === 'security-systems') topics.push('systems-security-systems');
    else if (sub === 'embedded-systems') topics.push('systems-embedded-iot');
    else if (sub === 'operating-systems') topics.push('systems-windows-startup');
    else topics.push('systems-windows-startup');
  }

  const unique = Array.from(new Set(topics));
  return unique
    .map((t) => guideByTopic(t))
    .filter((g): g is GuideMeta => Boolean(g))
    .slice(0, 2)
    .map(guideHref);
}

export function pickHubsForCode(args: {
  industryKey: GuideCategoryKey;
  systemSubcategory?: string;
  applianceType?: string;
  brand?: string;
  seriesOrModel?: string;
}) {
  const hubs: LearnMoreLink[] = [];

  if (args.industryKey === 'systems') {
    hubs.push({ label: 'Systems & Devices', href: '/systems/' });
    if (args.systemSubcategory) {
      hubs.push({
        label: args.systemSubcategory.replace(/-/g, ' '),
        href: `/systems/${args.systemSubcategory}/`,
      });
    }
    return hubs.slice(0, 2);
  }

  if (args.industryKey === 'appliances') {
    hubs.push({ label: 'Appliances', href: '/appliances/' });
    if (args.applianceType) hubs.push({ label: args.applianceType.replace(/-/g, ' '), href: `/appliances/${args.applianceType}/` });
    return hubs.slice(0, 2);
  }

  const label = args.industryKey === 'irs-tax' ? 'IRS / Tax' : args.industryKey[0].toUpperCase() + args.industryKey.slice(1);
  hubs.push({ label, href: `/${args.industryKey}/` });
  hubs.push({ label: 'Error Codes directory', href: `/${args.industryKey}/error-codes/` });
  return hubs.slice(0, 2);
}

