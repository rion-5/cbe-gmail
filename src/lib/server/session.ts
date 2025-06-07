//  src/lib/server/session.ts
import { type Cookies } from '@sveltejs/kit';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { JWT_SECRET } from '$env/static/private';

// 세션 타입 정의
export interface Session {
    user: {
        id_no: string;
        user_name: string;
    } | null;
}

// JWT 생성
export async function createJWT(user: { id_no: string; user_name: string }): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return new SignJWT({ id_no: user.id_no, user_name: user.user_name })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret);
}

// JWT 검증 , 복호화
export async function verifyJWT(token: string): Promise<Session> {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.id_no && payload.user_name) {
            return {
                user: {
                    id_no: payload.id_no as string,
                    user_name: payload.user_name as string
                }
            };
        }
        return { user: null };
    } catch (err) {
        console.error('verifyJWT Error:', err);
        return { user: null };
    }
}

// 쿠키에서 세션 데이터 가져오기
export async function getSession(cookies: Cookies): Promise<Session> {
    const token = cookies.get('session_token');
    if (!token) {
        return { user: null };
    }
    return verifyJWT(token);
}

// 세션 설정 (로그인 시 호출)
export async function setSession(cookies: Cookies, user: { id_no: string; user_name: string }) {
    try {
        const token = await createJWT(user);
        cookies.set('session_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 // 2시간
        });
    } catch (err) {
        console.error('setSession Error:', err);
        throw new Error('Failed to set session');
    }
}

// 세션 연장
export async function extendSession(cookies: Cookies): Promise<boolean> {
    const token = cookies.get('session_token');
    if (!token) {
        return false;
    }

    try {
        const session = await verifyJWT(token);
        if (!session.user?.id_no || !session.user?.user_name) {
            return false;
        }
        await setSession(cookies, session.user);
        return true;
    } catch (err) {
        console.error('extendSession Error:', err);
        return false;
    }
}

// 세션 삭제 (로그아웃 시 호출)
export function clearSession(cookies: Cookies) {
    cookies.delete('session_token', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
}