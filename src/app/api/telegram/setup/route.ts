import { NextRequest, NextResponse } from "next/server";
import { setWebhook, deleteWebhook, getWebhookInfo, getBotInfo } from "@/lib/telegram";

/**
 * Telegram Bot setup — register/unregister webhook
 *
 * POST — Register the webhook URL with Telegram
 * GET  — Check current webhook status
 * DELETE — Remove the webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl } = body;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "webhookUrl is required" },
        { status: 400 },
      );
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not configured in .env.local" },
        { status: 500 },
      );
    }

    // Get bot info first
    const botInfo = await getBotInfo();
    if (!botInfo.ok) {
      return NextResponse.json(
        { error: "Invalid bot token — check TELEGRAM_BOT_TOKEN" },
        { status: 400 },
      );
    }

    // Set webhook
    const result = await setWebhook(webhookUrl);

    return NextResponse.json({
      ok: result.ok,
      bot: botInfo.result,
      webhook: result,
    });
  } catch (error) {
    console.error("Telegram setup error:", error);
    return NextResponse.json(
      { error: "Failed to set up Telegram bot" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({
        configured: false,
        error: "TELEGRAM_BOT_TOKEN not set",
      });
    }

    const [botInfo, webhookInfo] = await Promise.all([
      getBotInfo(),
      getWebhookInfo(),
    ]);

    return NextResponse.json({
      configured: true,
      bot: botInfo.ok ? botInfo.result : null,
      webhook: webhookInfo.ok ? webhookInfo.result : null,
    });
  } catch {
    return NextResponse.json({
      configured: false,
      error: "Failed to check bot status",
    });
  }
}

export async function DELETE() {
  try {
    const result = await deleteWebhook();
    return NextResponse.json({ ok: result.ok });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove webhook" },
      { status: 500 },
    );
  }
}
