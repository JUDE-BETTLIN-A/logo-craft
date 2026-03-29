import { NextRequest, NextResponse } from "next/server";
import {
  type TelegramUpdate,
  sendMessage,
  addMessage,
  upsertConversation,
  getConversation,
  getClientKeyboard,
} from "@/lib/telegram";
import { negotiate } from "@/lib/ai-negotiate";

/**
 * Telegram Webhook — receives every message sent to the bot.
 * Processes the message through the AI negotiation engine and replies.
 */
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    /* ── Handle callback queries (button presses) ── */
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat.id;
      if (!chatId) return NextResponse.json({ ok: true });

      let replyText = "";
      switch (cb.data) {
        case "view_pricing":
          replyText =
            "💰 *Logo Design Pricing*\n\n" +
            "💎 Basic — $49\n⭐ Standard — $99\n🏆 Premium — $199\n🎯 Brand Kit — $499\n\n" +
            "Reply with the package you're interested in!";
          break;
        case "see_portfolio":
          replyText =
            "🎨 Check out our live Logo Maker to see design examples!\n\n" +
            "Tell me your business name and industry, and I'll describe what we can create for you.";
          break;
        case "request_custom":
          replyText =
            "📩 Custom logo request noted!\n\n" +
            "Please share:\n1️⃣ Business name\n2️⃣ Industry\n3️⃣ Preferred colors/style\n4️⃣ Budget range\n\n" +
            "I'll prepare a tailored proposal!";
          break;
        case "accept_offer": {
          const conv = getConversation(chatId);
          const price = conv?.proposedPrice || 99;
          replyText = `✅ Wonderful! Deal confirmed at $${price}!\n\nOur designer will begin working on your logo immediately. Expect first concepts within 24-48 hours.\n\nThank you for choosing LogoCraft AI! 🚀`;
          if (conv) {
            upsertConversation(chatId, {
              status: "agreed",
              agreedPrice: price,
            });
          }
          break;
        }
        default:
          replyText = "Thanks for your interest! How can I help?";
      }

      addMessage(chatId, "client", `[Button: ${cb.data}]`);
      addMessage(chatId, "bot", replyText);
      await sendMessage(chatId, replyText, { parseMode: "Markdown" });
      return NextResponse.json({ ok: true });
    }

    /* ── Handle regular text messages ── */
    const message = update.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const clientName = [message.from.first_name, message.from.last_name]
      .filter(Boolean)
      .join(" ");
    const clientUsername = message.from.username;
    const clientMessage = message.text;

    // Update or create conversation
    let conv = getConversation(chatId);
    if (!conv) {
      conv = upsertConversation(chatId, {
        clientName,
        clientUsername,
        status: "new",
      });
    }
    addMessage(chatId, "client", clientMessage);

    // Run AI negotiation
    const result = await negotiate({
      clientName,
      clientMessage,
      conversationHistory: conv.messages.map((m) => ({
        role: m.role,
        text: m.text,
      })),
      proposedPrice: conv.proposedPrice,
      designerMinPrice: undefined, // designer can set this from the dashboard
      status: conv.status,
    });

    // Update conversation status
    const statusMap: Record<string, Conversation["status"]> = {
      greet: "new",
      pitch: "negotiating",
      negotiate: "negotiating",
      counter: "negotiating",
      accept: "agreed",
      reject: "closed",
      info: conv.status === "new" ? "negotiating" : conv.status,
    };
    type Conversation = typeof conv;

    upsertConversation(chatId, {
      status: statusMap[result.action] || conv.status,
      proposedPrice: result.suggestedPrice || conv.proposedPrice,
    });

    addMessage(chatId, "bot", result.reply);

    // Send reply with keyboard buttons for new/first conversations
    const isFirstInteraction = conv.messages.length <= 2;
    await sendMessage(chatId, result.reply, {
      parseMode: "Markdown",
      replyMarkup: isFirstInteraction ? getClientKeyboard() : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// Telegram verifies webhook with GET
export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" });
}
