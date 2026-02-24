import { SITE } from './site';

export function toCanonical(pathname: string): string {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return new URL(normalized, SITE.baseUrl).toString();
}

export function joinPath(...parts: string[]): string {
  const raw = parts
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\/+$/g, '');
  return raw.startsWith('/') ? `${raw}/` : `/${raw}/`;
}

