// src/hooks.server.ts - 최적화된 버전
import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

// 경로 설정을 더 체계적으로 관리
const ROUTE_CONFIG = {
  // 완전히 공개된 경로 (인증 불필요)
  public: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/oauth-google/login',
    '/api/auth/register',
  ],

  // 인증된 사용자만 접근 가능한 경로
  protected: [
    '/',
    '/reading',
    '/study',
    '/classroom',
    '/profile',
    '/settings',
    '/api/user',
  ],

  // 로그인한 사용자는 접근할 수 없는 경로 (게스트 전용)
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
  // 세션 정보를 한 번만 조회하여 이벤트에 저장
  const session = await getSession(event.cookies);
  event.locals.session = session;
  const { pathname } = event.url;
  const routeType = getRouteType(pathname);

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
  // 인증이 필요한 경로인데 로그인하지 않은 경우
  if (routeType === 'protected' && !session.user) {
    const redirectUrl = `${event.url.origin}/login?redirect=${encodeURIComponent(pathname + event.url.search)}`;
    return Response.redirect(redirectUrl, 302);
  }

  // 이미 로그인한 사용자가 게스트 전용 페이지에 접근하는 경우
  if (routeType === 'guestOnly' && session.user) {
    const redirectUrl = `${event.url.origin}/`; // 또는 메인 페이지
    return Response.redirect(redirectUrl, 302);
  }

  // return resolve(event);
    // 실제 응답 처리
  const response = await resolve(event);

  // CORS 헤더를 모든 응답에 추가
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
};
