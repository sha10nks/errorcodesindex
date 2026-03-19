export const SITE = {
  name: 'ErrorCodesIndex.com',
  domain: 'errorcodesindex.com',
  baseUrl: 'https://errorcodesindex.com',
};

export type IndustryKey = 'healthcare' | 'irs-tax' | 'banking' | 'gaming' | 'appliances' | 'systems';

export const INDUSTRIES: Array<{ key: IndustryKey; label: string; href: string }> = [
  { key: 'healthcare', label: 'Healthcare', href: '/insurance/healthcare/' },
  { key: 'irs-tax', label: 'IRS / Tax', href: '/irs-tax/' },
  { key: 'banking', label: 'Banking', href: '/banking/' },
  { key: 'gaming', label: 'Gaming', href: '/gaming/' },
  { key: 'appliances', label: 'Appliances', href: '/appliances/' },
  { key: 'systems', label: 'Systems & Devices', href: '/systems/' },
];

export const INSURANCE_SUBSECTIONS: Array<{ key: string; label: string; href: string }> = [
  { key: 'healthcare', label: 'Healthcare', href: '/insurance/healthcare/' },
  { key: 'auto-insurance', label: 'Auto Insurance', href: '/insurance/auto-insurance/' },
  { key: 'property-insurance', label: 'Property Insurance', href: '/insurance/property-insurance/' },
  { key: 'renters-insurance', label: 'Renters Insurance', href: '/insurance/renters-insurance/' },
  { key: 'life-insurance', label: 'Life Insurance', href: '/insurance/life-insurance/' },
  { key: 'claims-processing', label: 'Claims Processing', href: '/insurance/claims-processing/' },
  { key: 'billing-codes', label: 'Billing Codes', href: '/insurance/billing-codes/' },
  { key: 'medicare-medicaid', label: 'Medicare & Medicaid', href: '/insurance/medicare-medicaid/' },
];

export const INDUSTRY_NAV: Array<{
  key: string;
  label: string;
  href: string;
  children?: Array<{ key: string; label: string; href: string }>;
}> = [
  { key: 'insurance', label: 'Insurance', href: '/insurance/', children: INSURANCE_SUBSECTIONS },
  { key: 'irs-tax', label: 'IRS / Tax', href: '/irs-tax/' },
  { key: 'banking', label: 'Banking', href: '/banking/' },
  { key: 'gaming', label: 'Gaming', href: '/gaming/' },
  { key: 'appliances', label: 'Appliances', href: '/appliances/' },
  { key: 'systems', label: 'Systems & Devices', href: '/systems/' },
];

export const LEGAL_LINKS: Array<{ label: string; href: string }> = [
  { label: 'About', href: '/about/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms of Use', href: '/terms-of-use/' },
  { label: 'Disclaimer', href: '/disclaimer/' },
  { label: 'Contact', href: '/contact/' },
];
