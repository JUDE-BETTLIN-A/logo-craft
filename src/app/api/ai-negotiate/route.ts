import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function legacyResponse() {
  return NextResponse.json(
    {
      error:
        "The legacy bot-based negotiation endpoint has been replaced. Use /api/negotiator/account and /api/negotiator/sessions.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return legacyResponse();
}

export async function POST() {
  return legacyResponse();
}
