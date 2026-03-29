/**
 * Telegram Bot API wrapper for B2B logo sales.
 *
 * Flow:
 *   1. Designer creates a bot via @BotFather and stores the token in .env.local
 *   2. The /api/telegram/setup endpoint registers the webhook with Telegram
 *   3. Incoming client messages hit /api/telegram/webhook
 *   4. AI negotiation engine generates a response → bot replies automatically
 *   5. The designer monitors everything from the /sell dashboard
 */

const TELEGRAM_API = "https://api.telegram.org";

/* ─── Types ─── */
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: { id: number; type: string };
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data?: string;
  };
}

/* ─── In-memory conversation store (production would use a database) ─── */
export interface Conversation {
  chatId: number;
  clientName: string;
  clientUsername?: string;
  messages: { role: "client" | "bot"; text: string; timestamp: number }[];
  status: "new" | "negotiating" | "agreed" | "closed" | "rejected";
  logoInterest?: string; // which logo they're interested in
  proposedPrice?: number;
  agreedPrice?: number;
  createdAt: number;
}

// NOTE: This is an in-memory store — it resets when the server restarts.
// In production, replace with Prisma/database calls.
const conversations = new Map<number, Conversation>();

export function getConversations(): Conversation[] {
  return Array.from(conversations.values()).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}

export function getConversation(chatId: number): Conversation | undefined {
  return conversations.get(chatId);
}

export function upsertConversation(
  chatId: number,
  update: Partial<Conversation>,
): Conversation {
  const existing = conversations.get(chatId);
  if (existing) {
    const updated = { ...existing, ...update };
    conversations.set(chatId, updated);
    return updated;
  }
  const newConv: Conversation = {
    chatId,
    clientName: update.clientName || "Unknown",
    clientUsername: update.clientUsername,
    messages: update.messages || [],
    status: update.status || "new",
    createdAt: Date.now(),
    ...update,
  };
  conversations.set(chatId, newConv);
  return newConv;
}

export function addMessage(
  chatId: number,
  role: "client" | "bot",
  text: string,
) {
  const conv = conversations.get(chatId);
  if (conv) {
    conv.messages.push({ role, text, timestamp: Date.now() });
  }
}

/* ─── Telegram Bot API helpers ─── */
function botUrl(method: string): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set in .env.local");
  return `${TELEGRAM_API}/bot${token}/${method}`;
}

export async function sendMessage(
  chatId: number,
  text: string,
  options?: {
    parseMode?: "Markdown" | "HTML";
    replyMarkup?: object;
  },
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
    };
    if (options?.parseMode) body.parse_mode = options.parseMode;
    if (options?.replyMarkup) body.reply_markup = options.replyMarkup;

    const res = await fetch(botUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error("Telegram sendMessage error:", err);
    return false;
  }
}

export async function sendPhoto(
  chatId: number,
  photoUrl: string,
  caption?: string,
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      photo: photoUrl,
    };
    if (caption) body.caption = caption;

    const res = await fetch(botUrl("sendPhoto"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error("Telegram sendPhoto error:", err);
    return false;
  }
}

export async function setWebhook(webhookUrl: string): Promise<{
  ok: boolean;
  description?: string;
}> {
  const res = await fetch(botUrl("setWebhook"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message", "callback_query"],
    }),
  });
  return res.json();
}

export async function deleteWebhook(): Promise<{ ok: boolean }> {
  const res = await fetch(botUrl("deleteWebhook"), { method: "POST" });
  return res.json();
}

export async function getWebhookInfo(): Promise<{
  ok: boolean;
  result: { url: string; has_custom_certificate: boolean; pending_update_count: number };
}> {
  const res = await fetch(botUrl("getWebhookInfo"));
  return res.json();
}

export async function getBotInfo(): Promise<{
  ok: boolean;
  result: TelegramUser;
}> {
  const res = await fetch(botUrl("getMe"));
  return res.json();
}

/* ─── Quick reply keyboard for client conversations ─── */
export function getClientKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "💰 View Pricing", callback_data: "view_pricing" },
        { text: "🎨 See Portfolio", callback_data: "see_portfolio" },
      ],
      [
        { text: "📩 Request Custom Logo", callback_data: "request_custom" },
        { text: "✅ Accept Offer", callback_data: "accept_offer" },
      ],
    ],
  };
}
