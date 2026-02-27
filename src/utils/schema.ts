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

export function techArticleSchema(opts: {
  headline: string;
  description: string;
  canonicalUrl: string;
  industryLabel: string;
  code: string;
  dateModified?: string;
  keywords?: string[];
}) {
  const org = {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.baseUrl,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: opts.headline,
    description: opts.description,
    author: org,
    publisher: org,
    mainEntityOfPage: opts.canonicalUrl,
    articleSection: opts.industryLabel,
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.keywords && opts.keywords.length ? { keywords: opts.keywords.join(', ') } : {}),
    mainEntity: {
      '@type': 'DefinedTerm',
      name: opts.code,
      description: opts.description,
      inDefinedTermSet: opts.industryLabel,
    },
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  canonicalUrl: string;
  dateModified?: string;
  articleSection?: string;
  keywords?: string[];
}) {
  const org = {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.baseUrl,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    author: org,
    publisher: org,
    mainEntityOfPage: opts.canonicalUrl,
    ...(opts.articleSection ? { articleSection: opts.articleSection } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.keywords && opts.keywords.length ? { keywords: opts.keywords.join(', ') } : {}),
  };
}

export function faqPageSchema(opts: {
  canonicalUrl: string;
  items: Array<{ question: string; answer: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: opts.canonicalUrl,
    mainEntity: opts.items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.answer,
      },
    })),
  };
}
