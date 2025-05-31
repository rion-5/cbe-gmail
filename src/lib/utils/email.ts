import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { getOAuth2Client, loadToken, refreshAccessToken } from './auth';
import { promises as fs } from 'fs';

// 한글 제목을 RFC 2047에 따라 인코딩
function encodeSubject(subject: string): string {
  if (/^[\x00-\x7F]*$/.test(subject)) {
    // ASCII 문자만 포함된 경우 인코딩 불필요
    return subject;
  }
  // Base64 인코딩: =?UTF-8?B?{base64}?= 형식
  const encoded = Buffer.from(subject).toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}
export async function sendEmail(
  to: string,
  name: string,
  subject: string,
  content: string,
  contentType: 'text' | 'html',
  image?: Buffer
) {
  const client = getOAuth2Client();
  let tokens = loadToken();
  if (!tokens) throw new Error('No auth tokens found');

  // 토큰 갱신 시도
  try {
    await refreshAccessToken(client);
  } catch (error) {
    const err = error as Error;
    await appendLog(`${new Date().toISOString()} - Token refresh failed: ${err.message}`);
    throw error;
  }

  const gmail = google.gmail({ version: 'v1', auth: client });

  const emailLines = [
    `To: "${name}" <${to}>`,
    'Content-Type: ' + (contentType === 'html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8'),
    'MIME-Version: 1.0',
    `Subject: ${encodeSubject(subject)}`,
    '',
  ];

  if (contentType === 'html' && image) {
    emailLines.push('Content-Type: multipart/related; boundary="foo_bar_baz"');
    emailLines.push('');
    emailLines.push('--foo_bar_baz');
    emailLines.push('Content-Type: text/html; charset=utf-8');
    emailLines.push('');
    emailLines.push(content.replace('{{image}}', 'cid:image1'));
    emailLines.push('');
    emailLines.push('--foo_bar_baz');
    emailLines.push('Content-Type: image/jpeg');
    emailLines.push('Content-ID: <image1>');
    emailLines.push('Content-Transfer-Encoding: base64');
    emailLines.push('');
    emailLines.push(image.toString('base64'));
    emailLines.push('--foo_bar_baz--');
  } else {
    emailLines.push(content);
  }

  const email = emailLines.join('\r\n').trim();
  const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedEmail },
    });
    const log = `${new Date().toISOString()} - Sent to ${to}: Success`;
    await appendLog(log);
    return { message: 'Success' };
  } catch (error) {
    const err = error as Error; // 타입 단언
    const log = `${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} - ${to}로 발송 실패: ${err.message}`;
    appendLog(log);
    throw error;
  }
}

async function appendLog(log: string) {
  await fs.appendFile('static/logs/email-logs.txt', log + '\n');
}