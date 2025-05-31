import type { RequestHandler } from '@sveltejs/kit';
import { sendEmail } from '$lib/utils/email';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const to = formData.get('to') as string;
  const name = formData.get('name') as string;
  const subject = formData.get('subject') as string;
  const content = formData.get('content') as string;
  const contentType = formData.get('contentType') as 'text' | 'html';
  const image = formData.get('image') as File | null;

  try {
    const imageBuffer = image ? Buffer.from(await image.arrayBuffer()) : undefined;
    const result = await sendEmail(to, name, subject, content, contentType, imageBuffer);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 });
  }
};