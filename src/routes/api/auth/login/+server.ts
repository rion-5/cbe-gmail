import type { RequestHandler } from '@sveltejs/kit';
import { getAuthUrl, getOAuth2Client } from '$lib/utils/auth';

export const GET: RequestHandler = async () => {
  const client = getOAuth2Client();
  const url = getAuthUrl(client);
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
};