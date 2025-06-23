
import { NextRequest, NextResponse } from 'next/server';
import { auditUrl } from '@/ai/flows/seo-audit';
import { z } from 'zod';

const RequestBodySchema = z.object({
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = RequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { url } = validationResult.data;
    const auditResult = await auditUrl({ url });
    return NextResponse.json(auditResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred during the audit' }, { status: 500 });
  }
}
