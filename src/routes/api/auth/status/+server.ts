import type { RequestHandler } from '@sveltejs/kit';
import { loadToken } from '$lib/utils/auth';
import dotenv from 'dotenv';

dotenv.config();

export const GET: RequestHandler = async () => {
  const tokens = loadToken();
  const authenticated = !!tokens;
  const gmailUser = process.env.GMAIL_USER || 'Unknown';

  console.log(`tokens: ${tokens}`);
  console.log(`authenticated: ${authenticated}`);
  console.log(`gmailUser: ${gmailUser}`);
  return new Response(JSON.stringify({ authenticated, gmailUser }), { status: 200 });
};