// src/routes/api/auth/session/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setSession } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { id_no, user_name } = await request.json();
    if (!id_no || !user_name) {
        return json({ error: 'id_no와 user_name이 필요합니다.' }, { status: 400 });
    }

    try {
        await setSession(cookies, { id_no, user_name });
        return json({ success: true });
    } catch (err) {
        console.error('Session POST Error:', err);
        return json({ error: '세션 설정에 실패했습니다.' }, { status: 500 });
    }
};