// src/routes/api/auth/extend/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { extendSession } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies }) => {
    const success = await extendSession(cookies);
    if (!success) {
        return json({ error: '세션 연장에 실패했습니다.' }, { status: 400 });
    }
    return json({ success: true });
};