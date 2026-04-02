import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function botApiDeprecated() {
  return NextResponse.json(
    {
      error:
        "Bot API setup is deprecated in this app. Use the MTProto account flow at /api/negotiator/account instead.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return botApiDeprecated();
}

export async function POST() {
  return botApiDeprecated();
}

export async function DELETE() {
  return botApiDeprecated();
}
