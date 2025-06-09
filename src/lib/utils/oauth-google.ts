import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { readFileSync, writeFileSync } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';

/** OAuth2 클라이언트 생성 */
export function getOAuth2Client(): OAuth2Client {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

  // 자동 토큰 갱신 시 저장
  client.on('tokens', (newTokens) => {
    const currentTokens = loadToken();
    if (newTokens.access_token) {
      const mergedTokens = {
        ...currentTokens,
        ...newTokens,
        refresh_token: newTokens.refresh_token || currentTokens?.refresh_token,
      };
      saveToken(mergedTokens);
    }
  });

  return client;
}

/** 인증 URL 생성 */
export function getAuthUrl(client: OAuth2Client): string {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // 항상 사용자 동의를 요구해서 refresh_token을 다시 받게 함
  });
}

/** 토큰 저장 */
export function saveToken(token: any) {
  writeFileSync(TOKEN_PATH, JSON.stringify(token));
}

/** 토큰 로드 */
export function loadToken(): any {
  try {
    return JSON.parse(readFileSync(TOKEN_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

/** 인증 코드로 토큰 발급 및 저장 */
export async function getAccessToken(client: OAuth2Client, code: string) {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  saveToken(tokens);
  return tokens;
}

/** 기존 토큰을 불러와 클라이언트에 설정 */
export function initializeOAuthClient(client: OAuth2Client): void {
  const tokens = loadToken();
  if (!tokens) {
    throw new Error('No tokens found. Please authenticate first.');
  }
  client.setCredentials(tokens);
}
