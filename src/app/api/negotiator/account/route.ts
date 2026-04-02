import { NextRequest, NextResponse } from "next/server";
import { listNegotiatorProviders } from "@/lib/negotiator-ai";
import { ensureNegotiationWorkerStarted } from "@/lib/negotiation-worker";
import {
  disconnectTelegramAccount,
  getErrorMessage,
  getTelegramAccountStatus,
  startTelegramLogin,
  verifyTelegramLogin,
} from "@/lib/telegram-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

ensureNegotiationWorkerStarted();

export async function GET() {
  try {
    const status = await getTelegramAccountStatus();
    return NextResponse.json({
      status,
      providers: listNegotiatorProviders(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action?: "sendCode" | "verifyCode";
      phoneNumber?: string;
      code?: string;
      password?: string;
    };

    if (body.action === "sendCode") {
      const status = await startTelegramLogin(body.phoneNumber ?? "");
      return NextResponse.json({
        status,
        providers: listNegotiatorProviders(),
      });
    }

    if (body.action === "verifyCode") {
      const result = await verifyTelegramLogin(body.code ?? "", body.password);
      return NextResponse.json({
        ...result,
        providers: listNegotiatorProviders(),
      });
    }

    return NextResponse.json(
      { error: "Invalid account action." },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  try {
    const status = await disconnectTelegramAccount();
    return NextResponse.json({
      status,
      providers: listNegotiatorProviders(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
