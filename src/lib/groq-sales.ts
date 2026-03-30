/**
 * Groq AI for Telegram Sales Negotiations
 * Fun, casual, friendly tone - like texting with a friend
 */

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You're a friendly sales assistant for LogoCraft AI, a logo design service.

YOUR PERSONALITY:
- Fun, casual, friendly (not robotic or corporate)
- Use emojis sparingly (1-2 per message)
- Short messages (2-3 sentences max)
- Like chatting with a friend, not a salesperson

PRICING (STRICT RULES):
- Minimum: $${49} (NEVER go below this)
- Target: $${199}
- Start high (10-15% above target)
- Make small concessions (5-10% max)

PRICING TIERS:
- Basic Logo: $49-99 (simple design, 2 revisions)
- Standard: $99-199 (3 concepts, unlimited revisions, all formats)
- Premium: $199-299 (full logo suite + social media kit)
- Brand Kit: $299-499 (complete brand identity)

CONVERSATION FLOW:
1. Friendly greeting, ask about their business
2. Understand their needs (style, industry)
3. Quote price with value justification
4. Negotiate if they push back
5. Close with payment link

RESPONSE STYLE:
- Casual like texting a friend
- Use contractions ("I'm", "you're", "we've")
- Occasional humor (light, not cheesy)
- Empathetic to budget concerns
- Confident but not pushy

EXAMPLE MESSAGES:
- "Hey! 👋 I'd love to help you get an awesome logo for your business!"
- "Our Standard package is usually $199, but I can do $179 if you're ready to start today!"
- "I totally get budget concerns! How about we start with Basic at $99 and upgrade later?"
`;

export interface SalesContext {
  customerName?: string;
  businessType?: string;
  customerMessage: string;
  conversationHistory: { role: "customer" | "ai"; text: string }[];
  currentOffer?: number;
  minPrice: number;
  maxPrice: number;
}

export async function negotiateWithGroq(
  ctx: SalesContext
): Promise<{ reply: string; suggestedPrice?: number; action: string }> {
  const dynamicPrompt = SYSTEM_PROMPT
    .replace(/\$\{49\}/g, ctx.minPrice.toString())
    .replace(/\$\{199\}/g, ctx.maxPrice.toString());

  const messages: any[] = [
    { role: "system", content: dynamicPrompt },
    ...ctx.conversationHistory.map((m) => ({
      role: m.role === "customer" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: ctx.customerMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messages as any,
    temperature: 0.8, // More creative/fun
    max_tokens: 150, // Keep it short
    top_p: 0.9,
  });

  const aiResponse = completion.choices[0].message.content || "";

  // Extract price if mentioned
  const priceMatch = aiResponse.match(/\$(\d+)/);
  const suggestedPrice = priceMatch ? parseInt(priceMatch[1]) : undefined;

  // Determine action
  let action = "negotiate";
  if (aiResponse.toLowerCase().includes("deal") || aiResponse.toLowerCase().includes("perfect") || aiResponse.toLowerCase().includes("sold")) {
    action = "accept";
  } else if (aiResponse.toLowerCase().includes("payment") || aiResponse.toLowerCase().includes("invoice") || aiResponse.toLowerCase().includes("link")) {
    action = "close";
  } else if (aiResponse.toLowerCase().includes("no") || aiResponse.toLowerCase().includes("not interested")) {
    action = "rejected";
  }

  return { reply: aiResponse, suggestedPrice, action };
}

// Generate initial outreach message
export function generateOutreachMessage(lead: { name?: string; campaign?: string }): string {
  const templates = [
    `Hey${lead.name ? ` ${lead.name}` : ''}! 👋 I noticed you're looking for a logo design. I'd love to help you create something amazing for your business! What kind of style are you thinking?`,
    `Hi${lead.name ? ` ${lead.name}` : ''}! Saw you're in the market for a new logo. We've got some awesome designs I think you'll love! What's your business about?`,
    `Hello${lead.name ? ` ${lead.name}` : ''}! 🎨 Ready to get a killer logo for your brand? I can help you get professional designs at great prices. What industry are you in?`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// Follow-up message (if no response after 24h)
export function generateFollowUpMessage(lead: { name?: string }): string {
  const templates = [
    `Hey${lead.name ? ` ${lead.name}` : ''}! Just checking in - still interested in getting that logo? I've got some time today to work on your design! 😊`,
    `Hi${lead.name ? ` ${lead.name}` : ''}! Didn't want you to miss out - we're running a special offer this week on logo designs. Want to hear more?`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// Get negotiation config from database or use defaults
export async function getNegotiationConfig() {
  const { prisma } = await import("@/lib/prisma");

  const config = await prisma.negotiationConfig.findFirst({
    where: { isActive: true },
  });

  if (!config) {
    // Create default config
    return prisma.negotiationConfig.create({
      data: {
        globalMinPrice: 49,
        globalMaxPrice: 499,
        initialMessage: generateOutreachMessage({}),
        followUpMessage: generateFollowUpMessage({}),
        tone: "friendly_casual",
        groqModel: "llama-3.3-70b-versatile",
      },
    });
  }

  return config;
}
