// src/routes/api/oauth-google/login/+server.ts

import type { RequestHandler } from '@sveltejs/kit';
import { getAuthUrl, getOAuth2Client } from '$lib/utils/oauth-google';

export const GET: RequestHandler = async () => {
  const client = getOAuth2Client();        // OAuth2 클라이언트 생성
  const url = getAuthUrl(client);          // 인증 URL 생성
  return new Response(null, {
    status: 302,                            // 302 Redirect 응답
    headers: { Location: url },            // 브라우저를 인증 URL로 리디렉션
  });
};