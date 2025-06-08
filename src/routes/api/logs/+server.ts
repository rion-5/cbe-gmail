// src/routes/api/logs/+server.ts

import type { RequestHandler } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';

export const GET: RequestHandler = async () => {
  try {
    // 로그 파일 경로
    const logPath = join('static', 'logs', 'email-logs.txt');
    // 로그 파일 읽기
    const logContent = readFileSync(logPath, 'utf-8');
    // 로그를 줄 단위로 분리
    const logs = logContent.split('\n').filter(line => line.trim() !== '');
    return new Response(JSON.stringify({ logs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // 파일이 없거나 읽기 오류 발생 시 빈 로그 반환
    return new Response(JSON.stringify({ logs: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};