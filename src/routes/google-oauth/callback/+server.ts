// src/routes/google-oauth/callback/+server.ts

import type { RequestHandler } from '@sveltejs/kit';
import { getOAuth2Client, getAccessToken } from '$lib/utils/oauth-google';

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  try {
    const client = getOAuth2Client();
    await getAccessToken(client, code);
    return new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
  } catch (error) {
    return new Response(`Authentication failed: ${(error as Error).message}`, { status: 500 });
  }
};