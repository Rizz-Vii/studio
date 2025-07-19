/**
 * NeuroSEO™ API Routes - TEMPORARILY DISABLED FOR BUILD
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "NeuroSEO functionality temporarily disabled" },
    { status: 503 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "NeuroSEO functionality temporarily disabled" },
    { status: 503 }
  );
}
