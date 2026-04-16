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
  insuranceSubcategory?: string;
}) {
  const code = args.code;
  const upper = code.toUpperCase();

  const topics: GuideTopicKey[] = [];

  const insuranceGuidesBySlug = (slugs: string[]) =>
    slugs
      .map((s) => GUIDES.find((g) => g.categoryKey === 'insurance' && g.slug === s))
      .filter((g): g is GuideMeta => Boolean(g))
      .map(guideHref);

  if (args.industryKey === 'healthcare') topics.push('healthcare-denials');

  if (args.industryKey === 'insurance') {
    const sub = (args.insuranceSubcategory ?? '').toLowerCase();

    const slugs: string[] = ['the-complete-insurance-claim-denial-codes-directory-2026-edition'];
    if (/^(AK5|AK9|IK5|IK3|IK4|TA1)(-|$)/.test(upper)) slugs.unshift('edi-837-and-835-errors-in-insurance-complete-troubleshooting-guide');
    if (/^CLM-/.test(upper) || sub === 'auto-insurance') slugs.unshift('auto-insurance-claim-errors-top-codes-causes-and-fixes');
    else if (/^PRP-/.test(upper) || sub === 'property-insurance') slugs.unshift('property-insurance-claim-denials-explained-with-real-examples');
    else if (/^RNT-/.test(upper) || sub === 'renters-insurance') slugs.unshift('renters-insurance-claim-errors-what-causes-rejections-and-fixes');
    else if (/^LIF-/.test(upper) || sub === 'life-insurance') slugs.unshift('life-insurance-claim-denial-codes-and-payout-issues-explained');
    else if (/^BIL-/.test(upper) || sub === 'billing-codes') slugs.unshift('full-guide-to-insurance-billing-errors-and-how-to-resolve-them');
    else if (/^MCR-/.test(upper) || sub === 'medicare-medicaid') slugs.unshift('insurance-coverage-errors-eligibility-limits-and-policy-issues');
    else if (/^CP-/.test(upper) || sub === 'claims-processing') slugs.unshift('insurance-claims-processing-errors-causes-codes-and-solutions');

    if (/^CP-/.test(upper)) slugs.push('insurance-claim-resubmission-guide-fixing-errors-and-getting-approved');
    if (/^BIL-/.test(upper)) slugs.push('top-billing-code-mistakes-in-insurance-claims-and-fixes');
    if (/^MCR-/.test(upper)) slugs.push('insurance-claim-status-codes-explained-from-submission-to-payment');

    const unique = Array.from(new Set(slugs)).slice(0, 2);
    return insuranceGuidesBySlug(unique);
  }

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
  const byTopic = unique
    .map((t) => guideByTopic(t))
    .filter((g): g is GuideMeta => Boolean(g))
    .slice(0, 2)
    .map(guideHref);

  if (args.industryKey === 'healthcare') {
    const insuranceFallback = insuranceGuidesBySlug(['the-complete-insurance-claim-denial-codes-directory-2026-edition']).slice(0, 1);
    return [...byTopic, ...insuranceFallback].slice(0, 2);
  }

  return byTopic;
}

export function pickHubsForCode(args: {
  industryKey: GuideCategoryKey;
  systemSubcategory?: string;
  applianceType?: string;
  brand?: string;
  seriesOrModel?: string;
  insuranceSubcategory?: string;
}) {
  const hubs: LearnMoreLink[] = [];

  if (args.industryKey === 'insurance') {
    hubs.push({ label: 'Insurance', href: '/insurance/' });
    if (args.insuranceSubcategory) {
      const sub = args.insuranceSubcategory;
      if (sub === 'healthcare') hubs.push({ label: 'Healthcare', href: '/insurance/healthcare/' });
      else hubs.push({ label: sub.replace(/-/g, ' '), href: `/insurance/${sub}/` });
    }
    return hubs.slice(0, 2);
  }

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

  if (args.industryKey === 'healthcare') {
    hubs.push({ label: 'Insurance', href: '/insurance/' });
    hubs.push({ label: 'Healthcare', href: '/insurance/healthcare/' });
    return hubs.slice(0, 2);
  }

  const label = args.industryKey === 'irs-tax' ? 'IRS / Tax' : args.industryKey[0].toUpperCase() + args.industryKey.slice(1);
  hubs.push({ label, href: `/${args.industryKey}/` });
  hubs.push({ label: 'Error Codes directory', href: `/${args.industryKey}/error-codes/` });
  return hubs.slice(0, 2);
}
