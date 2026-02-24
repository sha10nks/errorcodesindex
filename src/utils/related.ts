export function pickRelatedSlugs(allSlugs: string[], currentSlug: string, min = 3, max = 10): string[] {
  const slugs = allSlugs.filter((s) => s !== currentSlug).sort();
  if (slugs.length === 0) return [];

  const count = Math.min(Math.max(min, 3), Math.min(max, 10), slugs.length);
  const idx = Math.max(0, slugs.findIndex((s) => s > currentSlug));

  const picked: string[] = [];
  for (let i = 0; i < slugs.length && picked.length < count; i++) {
    const pos = (idx + i) % slugs.length;
    picked.push(slugs[pos]);
  }
  return picked;
}

