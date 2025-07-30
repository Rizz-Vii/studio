// Real-time Streaming API
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('data: {"type":"connection_established"}\n\n');
      setTimeout(() => controller.close(), 1000);
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}