import type { APIRoute } from 'astro';
import { adsenseClientId } from '../config/ads';

export const GET: APIRoute = () => {
  const publisherId = adsenseClientId?.replace(/^ca-/, '');
  const body = publisherId ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n` : '';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
