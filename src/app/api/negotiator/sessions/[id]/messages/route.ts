import { NextRequest, NextResponse } from "next/server";
import { sendOwnerMessage } from "@/lib/negotiation-service";
import { ensureNegotiationWorkerStarted } from "@/lib/negotiation-worker";
import { getErrorMessage } from "@/lib/telegram-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

ensureNegotiationWorkerStarted();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      text?: string;
    };

    const session = await sendOwnerMessage(id, body.text ?? "");
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}
