import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { getOAuth2Client, loadToken } from './auth';
import { writeFileSync } from 'fs';

export async function sendEmail(
  to: string,
  name: string,
  subject: string,
  content: string,
  contentType: 'text' | 'html',
  image?: Buffer
) {
  const client = getOAuth2Client();
  const tokens = loadToken();
  if (!tokens) throw new Error('No auth tokens found');
  if (!tokens.refresh_token) throw new Error('No refresh token is set');
  client.setCredentials(tokens);

  const gmail = google.gmail({ version: 'v1', auth: client });

  const emailLines = [
    `To: "${name}" <${to}>`,
    'Content-Type: ' + (contentType === 'html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8'),
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
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
    const log = `${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} - ${to}로 발송 성공`;
    appendLog(log);
    return { message: 'Success' };
  } catch (error:any) {
    const log = `${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} - ${to}로 발송 실패: ${error.message}`;
    appendLog(log);
    throw error;
  }
}

function appendLog(log: string) {
  writeFileSync('static/logs/email-logs.txt', log + '\n', { flag: 'a' });
}