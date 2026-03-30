import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Get all negotiations with stats
 */
export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            campaign: true,
          },
        },
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Calculate stats
    const stats = {
      total: conversations.length,
      active: conversations.filter((c) => c.status === "negotiating" || c.status === "started").length,
      closed: conversations.filter((c) => c.status === "closed").length,
      rejected: conversations.filter((c) => c.status === "rejected").length,
      revenue: conversations
        .filter((c) => c.status === "closed")
        .reduce((sum, c) => sum + (c.currentOffer || 0), 0),
    };

    return NextResponse.json({
      success: true,
      conversations: conversations.map((c) => ({
        id: c.id,
        lead: c.lead,
        status: c.status,
        currentOffer: c.currentOffer,
        lastMessage: c.messages[0]?.text || null,
        messageCount: c.messages.length,
        updatedAt: c.updatedAt,
      })),
      stats,
    });
  } catch (error: any) {
    console.error("Negotiations list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch negotiations" },
      { status: 500 }
    );
  }
}
