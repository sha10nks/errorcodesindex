import { SITE } from './site';

export type BreadcrumbItem = { label: string; href: string };

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.baseUrl,
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[], canonicalUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: new URL(item.href, SITE.baseUrl).toString(),
    })),
    url: canonicalUrl,
  };
}

export function collectionPageSchema(opts: { name: string; canonicalUrl: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    url: opts.canonicalUrl,
  };
}

export function webPageSchema(opts: { name: string; canonicalUrl: string; dateModified?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    url: opts.canonicalUrl,
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}
