import { NextRequest, NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram";

/**
 * Step 1: Send auth code to your Telegram number
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const client = new TelegramClient(
      new StringSession(""),
      parseInt(process.env.TELEGRAM_API_ID || "0"),
      process.env.TELEGRAM_API_HASH || "",
      { connectionRetries: 5 }
    );

    await client.connect();

    // Send code to phone
    const result = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber,
        apiId: client.apiId,
        apiHash: client.apiHash,
      })
    );

    // Save session string temporarily (will be updated after verification)
    const sessionString = client.session.save();

    return NextResponse.json({
      success: true,
      phoneCodeHash: (result as any).phoneCodeHash,
      sessionString,
      message: "Code sent! Check your Telegram app.",
    });
  } catch (error: any) {
    console.error("Telegram send code error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send code" },
      { status: 500 }
    );
  }
}
