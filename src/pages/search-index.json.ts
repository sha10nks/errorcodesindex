import type { APIRoute } from 'astro';
import { getSearchIndexItems } from '../lib/searchIndex';

export const prerender = true;

export const GET: APIRoute = async () => {
  const items = await getSearchIndexItems();

  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), items }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
