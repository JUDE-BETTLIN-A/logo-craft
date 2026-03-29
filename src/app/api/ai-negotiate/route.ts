import { NextRequest, NextResponse } from "next/server";
import { negotiate, getSuggestedResponses, generatePitch } from "@/lib/ai-negotiate";
import { getConversations } from "@/lib/telegram";

/**
 * AI Negotiation API
 *
 * POST /api/ai-negotiate — Run AI negotiation on a message
 * GET  /api/ai-negotiate — Get active conversations + stats
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "negotiate": {
        const {
          clientName,
          clientMessage,
          conversationHistory = [],
          proposedPrice,
          designerMinPrice,
          status = "new",
        } = params;

        if (!clientMessage) {
          return NextResponse.json(
            { error: "clientMessage is required" },
            { status: 400 },
          );
        }

        const result = await negotiate({
          clientName: clientName || "Client",
          clientMessage,
          conversationHistory,
          proposedPrice,
          designerMinPrice,
          status,
        });

        return NextResponse.json(result);
      }

      case "suggest": {
        const { lastMessage } = params;
        const suggestions = getSuggestedResponses(lastMessage || "");
        return NextResponse.json({ suggestions });
      }

      case "pitch": {
        const { logoName, style, industry } = params;
        const pitch = generatePitch(
          logoName || "Custom Logo",
          style || "modern",
          industry || "Business",
        );
        return NextResponse.json({ pitch });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: negotiate, suggest, or pitch" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("AI negotiate error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const conversations = getConversations();
    const stats = {
      total: conversations.length,
      active: conversations.filter((c) => c.status === "negotiating").length,
      agreed: conversations.filter((c) => c.status === "agreed").length,
      closed: conversations.filter((c) => c.status === "closed" || c.status === "rejected").length,
      revenue: conversations
        .filter((c) => c.status === "agreed" && c.agreedPrice)
        .reduce((sum, c) => sum + (c.agreedPrice || 0), 0),
    };
    return NextResponse.json({ conversations, stats });
  } catch {
    return NextResponse.json(
      { conversations: [], stats: { total: 0, active: 0, agreed: 0, closed: 0, revenue: 0 } },
    );
  }
}
