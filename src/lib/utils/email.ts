import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { getOAuth2Client, loadToken, refreshAccessToken } from './oauth-google';
import { promises as fs } from 'fs';

// 한글 문자열을 RFC 2047에 따라 인코딩
function encodeRFC2047(text: string): string {
  if (/^[\x00-\x7F]*$/.test(text)) {
    // ASCII 문자만 포함된 경우 인코딩 불필요
    return text;
  }
  // Base64 인코딩: =?UTF-8?B?{base64}?= 형식
  const encoded = Buffer.from(text).toString('base64');
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
    appendLog(`${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} - Token refresh failed: ${err.message}`);
    throw error;
  }

  const gmail = google.gmail({ version: 'v1', auth: client });

  const boundary = 'foo_bar_baz';
  const emailLines = [
    `To: ${encodeRFC2047(name)} <${to}>`,
    `Subject: ${encodeRFC2047(subject)}`,
    'MIME-Version: 1.0',
  ];

 if (contentType === 'html' && image) {
    emailLines.push(`Content-Type: multipart/related; boundary="${boundary}"`);
    emailLines.push('');
    emailLines.push(`--${boundary}`);
    emailLines.push('Content-Type: text/html; charset=utf-8');
    emailLines.push('Content-Transfer-Encoding: quoted-printable');
    emailLines.push('');
    emailLines.push(content.replace('{{image}}', 'cid:image1')); // HTML에서 이미지 참조
    emailLines.push('');
    emailLines.push(`--${boundary}`);
    emailLines.push('Content-Type: image/jpeg');
    emailLines.push('Content-ID: <image1>'); // Content-ID 명확히 설정
    emailLines.push('Content-Transfer-Encoding: base64');
    emailLines.push('');
    emailLines.push(image.toString('base64'));
    emailLines.push(`--${boundary}--`);
  } else {
    emailLines.push('Content-Type: ' + (contentType === 'html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8'));
    emailLines.push('');
    emailLines.push(content);
  }

  const email = emailLines.join('\r\n').trim();
  appendLog(`${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} - MIME Message:\n${email}`); // MIME 메시지 디버깅 로그
  const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedEmail },
    });
    const log = `${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} - Sent to ${to} ${name}: Success`;
    appendLog(log);
    return { message: 'Success' };
  } catch (error) {
    const err = error as Error; // 타입 단언
    const log = `${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} - ${to} ${name}로 발송 실패: ${err.message}`;
    appendLog(log);
    throw error;
  }
}

function appendLog(log: string) {
  fs.appendFile('static/logs/email-logs.txt', log + '\n');
}