export const SITE = {
  name: 'ErrorCodesIndex.com',
  domain: 'errorcodesindex.com',
  baseUrl: 'https://errorcodesindex.com',
};

export type IndustryKey = 'healthcare' | 'irs-tax' | 'banking' | 'gaming' | 'appliances';

export const INDUSTRIES: Array<{ key: IndustryKey; label: string; href: string }> = [
  { key: 'healthcare', label: 'Healthcare', href: '/healthcare/' },
  { key: 'irs-tax', label: 'IRS / Tax', href: '/irs-tax/' },
  { key: 'banking', label: 'Banking', href: '/banking/' },
  { key: 'gaming', label: 'Gaming', href: '/gaming/' },
  { key: 'appliances', label: 'Appliances', href: '/appliances/' },
];

export const LEGAL_LINKS: Array<{ label: string; href: string }> = [
  { label: 'About', href: '/about/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms of Use', href: '/terms-of-use/' },
  { label: 'Disclaimer', href: '/disclaimer/' },
  { label: 'Contact', href: '/contact/' },
];

