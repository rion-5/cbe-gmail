import type { RequestHandler } from '@sveltejs/kit';
import { parseCsv } from '$lib/utils/csv';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('csv') as File;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const recipients = await parseCsv(buffer);
    return new Response(JSON.stringify({ recipients }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 });
  }
};