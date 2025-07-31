// API Health Check
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    phase: '3-enhancement',
    region: 'australia-southeast2'
  });
}