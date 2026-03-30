import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { generateOutreachMessage } from "@/lib/groq-sales";

/**
 * Start AI outreach campaign - send initial messages to selected leads
 */
export async function POST(req: NextRequest) {
  try {
    const { leadIds } = await req.json();

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json({ error: "No leads selected" }, { status: 400 });
    }

    // Get active bot
    const bot = await prisma.telegramBot.findFirst({
      where: { status: "active" },
    });

    if (!bot) {
      return NextResponse.json(
        { error: "No active Telegram bot. Please connect your bot first." },
        { status: 400 }
      );
    }

    // Connect bot client
    const client = new TelegramClient(
      new StringSession(bot.sessionString),
      bot.apiId,
      bot.apiHash,
      {}
    );
    await client.connect();

    const results = [];

    for (const leadId of leadIds) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { conversations: true },
      });

      if (!lead) {
        results.push({ leadId, success: false, error: "Lead not found" });
        continue;
      }

      // Skip if already contacted
      if (lead.status !== "new") {
        results.push({ leadId, success: false, error: "Already contacted" });
        continue;
      }

      try {
        // Generate and send initial message
        const message = generateOutreachMessage({ name: lead.name || undefined, campaign: lead.campaign || undefined });

        await client.sendMessage(lead.phoneNumber, { message });

        // Update lead status
        await prisma.lead.update({
          where: { id: leadId },
          data: { status: "contacted" },
        });

        // Create conversation record
        await prisma.conversation.create({
          data: {
            leadId,
            telegramChatId: 0, // Will update when customer responds
            status: "started",
            messages: {
              create: {
                direction: "outgoing",
                text: message,
                aiGenerated: true,
              },
            },
          },
        });

        results.push({ leadId, success: true, message: "Message sent" });
      } catch (error: any) {
        console.error(`Failed to message lead ${leadId}:`, error);
        results.push({ 
          leadId, 
          success: false, 
          error: error.message || "Failed to send message",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: leadIds.length,
        success: successCount,
        failed: failCount,
      },
      message: `Sent ${successCount} messages${failCount > 0 ? `, ${failCount} failed` : ""}`,
    });
  } catch (error: any) {
    console.error("Start campaign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start campaign" },
      { status: 500 }
    );
  }
}
