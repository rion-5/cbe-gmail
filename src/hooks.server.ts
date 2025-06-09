// src/hooks.server.ts - 최적화된 버전
import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

const ROUTE_CONFIG = {
  public: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/oauth-google/login',
    '/api/auth/register',
    '/api/upload', // 🔑 이 API는 인증 필요 없으면 public에 추가
  ],
  protected: [
    '/',
    '/reading',
    '/study',
    '/classroom',
    '/profile',
    '/settings',
    '/api/user',
  ],
  guestOnly: [
    '/login',
    '/register',
    '/forgot-password',
  ],
};

function isPathMatch(pathname: string, paths: string[]): boolean {
  return paths.some(path => pathname === path || pathname.startsWith(path + '/'));
}

function getRouteType(pathname: string): 'public' | 'protected' | 'guestOnly' {
  if (isPathMatch(pathname, ROUTE_CONFIG.guestOnly)) return 'guestOnly';
  if (isPathMatch(pathname, ROUTE_CONFIG.protected)) return 'protected';
  return 'public';
}

export const handle: Handle = async ({ event, resolve }) => {
  const session = await getSession(event.cookies);
  event.locals.session = session;

  const { pathname } = event.url;
  const routeType = getRouteType(pathname);

  // CORS preflight 요청 처리 (OPTIONS 요청 허용)
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // 인증 체크
  if (routeType === 'protected' && !session.user) {
    const redirectUrl = `${event.url.origin}/login?redirect=${encodeURIComponent(pathname + event.url.search)}`;
    return Response.redirect(redirectUrl, 302);
  }

  if (routeType === 'guestOnly' && session.user) {
    const redirectUrl = `${event.url.origin}/`;
    return Response.redirect(redirectUrl, 302);
  }

  // 실제 응답 처리
  const response = await resolve(event);

  // CORS 헤더를 모든 응답에 추가
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
};
