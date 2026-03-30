import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram";

/**
 * Step 2: Verify code and save bot to database
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, code, sessionString, phoneCodeHash, password } = await req.json();

    if (!phoneNumber || !code || !sessionString) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = new TelegramClient(
      new StringSession(sessionString),
      parseInt(process.env.TELEGRAM_API_ID || "0"),
      process.env.TELEGRAM_API_HASH || "",
      { connectionRetries: 5 }
    );

    await client.connect();

    try {
      // Try to sign in with code
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber,
          phoneCode: code,
          phoneCodeHash,
        })
      );
    } catch (error: any) {
      // Check if 2FA is required
      if (error.errorMessage?.includes("PASSWORD_HASH_REQUIRED") || error.errorMessage?.includes("SESSION_PASSWORD_NEEDED")) {
        if (!password) {
          return NextResponse.json({ requiresPassword: true, message: "2FA password required" }, { status: 400 });
        }
        
        // Handle 2FA (simplified - production needs proper SRP implementation)
        return NextResponse.json(
          { error: "2FA not fully implemented yet. Please disable 2FA temporarily." },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get final session string after authentication
    // Note: session.save() returns void, so we use session string directly
    const finalSession = sessionString; // Use the original session string as it persists

    // Check if bot already exists
    const existingBot = await prisma.telegramBot.findUnique({
      where: { phoneNumber },
    });

    let bot;
    if (existingBot) {
      // Update existing bot
      bot = await prisma.telegramBot.update({
        where: { id: existingBot.id },
        data: {
          sessionString: finalSession,
          status: "active",
          apiId: parseInt(process.env.TELEGRAM_API_ID || "0"),
          apiHash: process.env.TELEGRAM_API_HASH || "",
        },
      });
    } else {
      // Create new bot
      bot = await prisma.telegramBot.create({
        data: {
          phoneNumber,
          sessionString: finalSession,
          apiId: parseInt(process.env.TELEGRAM_API_ID || "0"),
          apiHash: process.env.TELEGRAM_API_HASH || "",
          status: "active",
        },
      });
    }

    // Create default negotiation config if it doesn't exist
    const configCount = await prisma.negotiationConfig.count();
    if (configCount === 0) {
      await prisma.negotiationConfig.create({
        data: {
          globalMinPrice: 49,
          globalMaxPrice: 499,
          initialMessage: "Hey! 👋 I noticed you're looking for a logo design. I'd love to help you create something amazing!",
          followUpMessage: "Hey! Just checking in - still interested in getting that logo? 😊",
          tone: "friendly_casual",
          groqModel: "llama-3.3-70b-versatile",
        },
      });
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: bot.id,
        phoneNumber: bot.phoneNumber,
        status: bot.status,
      },
      message: "Telegram bot connected successfully!",
    });
  } catch (error: any) {
    console.error("Telegram verify error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid code. Please try again." },
      { status: 500 }
    );
  }
}
