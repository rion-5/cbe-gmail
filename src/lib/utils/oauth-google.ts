import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { readFileSync, writeFileSync } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';

export function getOAuth2Client(): OAuth2Client {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export function getAuthUrl(client: OAuth2Client): string {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // 항상 사용자 동의를 요구해서 refresh_token을 다시 받게 함
  });
}

export function saveToken(token: any) {
  writeFileSync(TOKEN_PATH, JSON.stringify(token));
}

export function loadToken(): any {
  try {
    return JSON.parse(readFileSync(TOKEN_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

export async function getAccessToken(client: OAuth2Client, code: string) {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  saveToken(tokens);
  return tokens;
}

export async function refreshAccessToken(client: OAuth2Client) {
  const tokens = loadToken();
  if (tokens && tokens.refresh_token) {
    try {
      client.setCredentials({ refresh_token: tokens.refresh_token });
      const { credentials } = await client.refreshAccessToken();
      saveToken(credentials);
      client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to refresh token: ${err.message}`);
    }
  } else {
    throw new Error('No refresh token available');
  }
}