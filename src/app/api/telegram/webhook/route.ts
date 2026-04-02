import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function botApiDeprecated() {
  return NextResponse.json(
    {
      error:
        "The webhook path is no longer used. This build negotiates through a connected Telegram user account instead of the Bot API.",
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
