import Papa from 'papaparse';
import type { Recipient } from '$lib/types';

export async function parseCsv(file: Buffer): Promise<Recipient[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file.toString('utf-8'), {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      complete: (result) => {
        console.log('Parsed CSV result:', result); // 디버깅용 로그
        const recipients: Recipient[] = result.data.map((row: any) => {
          // 헤더 이름을 유연하게 처리
          const name = row.name || row.Name || row.NAME || '';
          const email = row.email || row.Email || row.EMAIL || '';
          return { name, email };
        }).filter(r => r.email && r.email.includes('@')); // 유효한 이메일만 포함
        console.log('Processed recipients:', recipients); // 디버깅용 로그
        resolve(recipients);
      },
      error: (error: any) => {
        console.error('CSV parsing error:', error); // 에러 로그
        reject(error);
      }
    });
  });
}