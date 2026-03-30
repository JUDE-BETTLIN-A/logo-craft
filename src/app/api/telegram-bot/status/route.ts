import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Get bot connection status
 */
export async function GET() {
  try {
    const bot = await prisma.telegramBot.findFirst({
      where: { status: "active" },
      select: {
        id: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            leads: true,
          },
        },
      },
    });

    const config = await prisma.negotiationConfig.findFirst({
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      bot: bot ? {
        ...bot,
        leadsCount: bot._count.leads,
      } : null,
      config,
    });
  } catch (error: any) {
    console.error("Bot status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get status" },
      { status: 500 }
    );
  }
}
