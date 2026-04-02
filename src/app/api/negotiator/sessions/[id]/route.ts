import { NextRequest, NextResponse } from "next/server";
import {
  getNegotiationSession,
  updateNegotiationControl,
} from "@/lib/negotiation-service";
import { ensureNegotiationWorkerStarted } from "@/lib/negotiation-worker";
import { getErrorMessage } from "@/lib/telegram-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

ensureNegotiationWorkerStarted();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const sync = request.nextUrl.searchParams.get("sync") !== "0";
    const session = await getNegotiationSession(id, { sync });
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 404 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      action?: "pause" | "resume" | "close";
    };

    if (!body.action) {
      return NextResponse.json(
        { error: "Control action is required." },
        { status: 400 },
      );
    }

    const session = await updateNegotiationControl(id, body.action);
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}
