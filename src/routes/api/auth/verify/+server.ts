// src/routes/api/auth/verify/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSession } from '$lib/server/session';

export const GET: RequestHandler = async ({ cookies }) => {
    const session = await getSession(cookies);
    if (!session.user) {
        return json({ isValid: false }, { status: 401 });
    }
    return json({ isValid: true, user: session.user });
};