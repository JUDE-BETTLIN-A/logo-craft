/**
 * AI Negotiation Engine for B2B logo sales.
 *
 * Uses HuggingFace Inference API for smart text generation,
 * with a rule-based fallback so it always works even without
 * a working AI model.
 */

/* ─── Types ─── */
export interface NegotiationContext {
  clientName: string;
  clientMessage: string;
  conversationHistory: { role: "client" | "bot"; text: string }[];
  logoStyle?: string;
  proposedPrice?: number;
  designerMinPrice?: number; // designer's floor price
  status: "new" | "negotiating" | "agreed" | "closed" | "rejected";
}

export interface NegotiationResponse {
  reply: string;
  suggestedPrice?: number;
  action: "greet" | "pitch" | "negotiate" | "counter" | "accept" | "reject" | "info";
  confidence: number; // 0-1
}

/* ─── Pricing defaults ─── */
const DEFAULT_PRICES = {
  basic: 49,
  standard: 99,
  premium: 199,
  custom: 299,
  brandKit: 499,
};

/* ─── Intent detection (rule-based, fast) ─── */
function detectIntent(message: string): string {
  const m = message.toLowerCase();

  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|start)/i.test(m))
    return "greeting";
  if (/price|cost|how much|charge|rate|fee|budget|afford|pay|invoice/i.test(m))
    return "pricing";
  if (/portfolio|sample|example|work|previous|past|show/i.test(m))
    return "portfolio";
  if (/custom|specific|unique|my (brand|business|company)|tailored|bespoke/i.test(m))
    return "custom_request";
  if (/discount|lower|cheaper|reduce|bargain|deal|offer|less/i.test(m))
    return "negotiate_down";
  if (/accept|agree|deal|yes|okay|ok|sure|let.?s do|go ahead|proceed/i.test(m))
    return "accept";
  if (/no|not interested|too (much|expensive|high)|pass|cancel|bye|goodbye/i.test(m))
    return "reject";
  if (/when|how long|deadline|timeline|delivery|turnaround|urgent|rush/i.test(m))
    return "timeline";
  if (/revision|change|modify|update|adjust|edit|tweak/i.test(m))
    return "revision";
  if (/format|file|svg|png|vector|resolution|source/i.test(m))
    return "format";
  if (/brand|identity|guideline|style guide|color palette/i.test(m))
    return "branding";

  return "general";
}

/* ─── Rule-based response generator ─── */
function generateRuleBasedResponse(ctx: NegotiationContext): NegotiationResponse {
  const intent = detectIntent(ctx.clientMessage);
  const name = ctx.clientName.split(" ")[0];
  const minPrice = ctx.designerMinPrice || DEFAULT_PRICES.basic;

  switch (intent) {
    case "greeting":
      return {
        reply: `Hello ${name}! 👋 Welcome to LogoCraft AI!\n\nI'm your AI design assistant. I help businesses get stunning, professional logos that make a lasting impression.\n\nWhat kind of logo are you looking for? Tell me about your business and I'll show you what we can create! 🎨`,
        action: "greet",
        confidence: 0.95,
      };

    case "pricing":
      return {
        reply: `Great question, ${name}! Here's our logo design pricing:\n\n💎 *Basic Logo* — $${DEFAULT_PRICES.basic}\n   Simple, clean logo with 2 revisions\n\n⭐ *Standard Package* — $${DEFAULT_PRICES.standard}\n   Logo + 3 color variations + 5 revisions\n\n🏆 *Premium Package* — $${DEFAULT_PRICES.premium}\n   Logo + brand colors + social media kit + unlimited revisions\n\n🎯 *Custom Brand Kit* — $${DEFAULT_PRICES.brandKit}\n   Full brand identity with guidelines\n\nAll logos come in SVG, PNG, and PDF formats. Which package interests you?`,
        suggestedPrice: DEFAULT_PRICES.standard,
        action: "pitch",
        confidence: 0.9,
      };

    case "portfolio":
      return {
        reply: `I'd love to show you our work, ${name}! 🎨\n\nWe've designed logos for businesses across many industries — tech startups, restaurants, fitness brands, consulting firms, and more.\n\n👉 Visit our gallery at the Logo Maker page to see live examples and generate custom concepts for YOUR business right now!\n\nJust tell me your business name and industry, and I can generate some concepts for you to see what's possible. What's your business about?`,
        action: "info",
        confidence: 0.85,
      };

    case "custom_request":
      return {
        reply: `Absolutely, ${name}! Custom logos are our specialty. 🎯\n\nTo create the perfect logo for your brand, I'd love to know:\n\n1️⃣ What's your business name?\n2️⃣ What industry are you in?\n3️⃣ Any colors, styles, or themes you prefer?\n4️⃣ Do you have any reference logos you like?\n\nOnce I understand your vision, I'll prepare custom concepts and a tailored quote for you!`,
        action: "info",
        confidence: 0.9,
      };

    case "negotiate_down": {
      const currentPrice = ctx.proposedPrice || DEFAULT_PRICES.standard;
      const counterPrice = Math.max(minPrice, Math.round(currentPrice * 0.85));
      const savings = currentPrice - counterPrice;

      if (counterPrice <= minPrice) {
        return {
          reply: `I understand you're looking for the best value, ${name}. I've already offered our most competitive rate.\n\nAt $${minPrice}, you're getting professional quality that would cost 3-5x more at a design agency. Plus, you get vector files you own forever.\n\nThis is genuinely the best I can do — shall we proceed? 🤝`,
          suggestedPrice: minPrice,
          action: "counter",
          confidence: 0.8,
        };
      }

      return {
        reply: `I appreciate you being upfront about budget, ${name}! 💪\n\nI can offer you a special deal: *$${counterPrice}* instead of $${currentPrice} — that's $${savings} off!\n\nThis includes:\n✅ Professional logo design\n✅ SVG + PNG + PDF formats\n✅ 3 revision rounds\n✅ Full ownership rights\n\nThis offer is valid for 48 hours. What do you think? 🎨`,
        suggestedPrice: counterPrice,
        action: "negotiate",
        confidence: 0.85,
      };
    }

    case "accept": {
      const price = ctx.proposedPrice || DEFAULT_PRICES.standard;
      return {
        reply: `Fantastic, ${name}! 🎉 We have a deal at $${price}!\n\nHere's what happens next:\n\n1️⃣ I'll send you an invoice shortly\n2️⃣ Once payment is confirmed, I begin design\n3️⃣ First concepts delivered within 24-48 hours\n4️⃣ Revision rounds until you're 100% happy\n\nYou're going to love your new logo! Thank you for choosing LogoCraft AI. 🚀`,
        suggestedPrice: price,
        action: "accept",
        confidence: 0.95,
      };
    }

    case "reject":
      return {
        reply: `No worries at all, ${name}! I completely understand. 🙏\n\nDesign is an investment, and it needs to feel right. If you change your mind or have any questions in the future, I'm always here.\n\nIn the meantime, feel free to explore our free Logo Maker to see what's possible — no commitment needed!\n\nWishing you all the best with your business! ✨`,
        action: "reject",
        confidence: 0.85,
      };

    case "timeline":
      return {
        reply: `Great question about timing, ${name}! ⏱\n\nHere's our typical timeline:\n\n⚡ *Rush (24 hours)* — +$50 surcharge\n📌 *Standard (2-3 business days)* — included\n🎯 *Complex/Custom (5-7 days)* — for brand kits\n\nRevision rounds typically take 24 hours each.\n\nDo you have a deadline in mind? I'll make sure we accommodate it!`,
        action: "info",
        confidence: 0.9,
      };

    case "revision":
      return {
        reply: `Of course, ${name}! Revisions are a key part of our process. 🔄\n\n• *Basic* package: 2 revisions\n• *Standard* package: 5 revisions\n• *Premium* package: Unlimited revisions\n\nWe want you to be 100% satisfied with your logo. Each revision round, you tell us what to change, and we deliver updated concepts within 24 hours.\n\nWhat would you like adjusted?`,
        action: "info",
        confidence: 0.9,
      };

    case "format":
      return {
        reply: `All our logos are delivered in professional formats, ${name}! 📁\n\n• *SVG* — Scalable vector (infinite resolution)\n• *PNG* — High-res with transparent background\n• *PDF* — Print-ready format\n• *JPG* — Web-optimized\n\nPremium packages also include:\n• Social media sized versions\n• Favicon\n• Business card layout\n\nNeed any specific format? Just ask!`,
        action: "info",
        confidence: 0.9,
      };

    case "branding":
      return {
        reply: `A full brand identity — excellent thinking, ${name}! 🎯\n\nOur *Brand Kit* ($${DEFAULT_PRICES.brandKit}) includes:\n\n🎨 Primary logo + variations\n📊 Color palette with hex codes\n🔤 Typography guidelines\n📐 Logo usage rules\n📱 Social media templates\n📄 Letterhead & business card\n\nThis gives your brand a consistent, professional look across everything. Want me to prepare a custom brand kit proposal?`,
        suggestedPrice: DEFAULT_PRICES.brandKit,
        action: "pitch",
        confidence: 0.9,
      };

    default:
      return {
        reply: `Thanks for reaching out, ${name}! 😊\n\nI'm here to help you get the perfect logo for your business. I can:\n\n🎨 Show you custom logo concepts\n💰 Discuss pricing and packages\n📋 Answer any design questions\n🤝 Create a tailored proposal\n\nWhat would you like to know more about?`,
        action: "info",
        confidence: 0.7,
      };
  }
}

/* ─── HuggingFace AI-enhanced response (optional upgrade) ─── */
async function generateAIEnhancedResponse(
  ctx: NegotiationContext,
): Promise<string | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  try {
    const systemPrompt = `You are a professional B2B sales assistant for LogoCraft AI, a logo design service.
Your goal is to help sell logo design services to business clients in a friendly, persuasive way.
Be concise (3-5 lines max), professional, and use relevant emojis sparingly.
Current conversation status: ${ctx.status}
${ctx.proposedPrice ? `Current proposed price: $${ctx.proposedPrice}` : ""}
${ctx.designerMinPrice ? `Minimum acceptable price: $${ctx.designerMinPrice}` : ""}`;

    const messages = ctx.conversationHistory.slice(-6).map((m) => ({
      role: m.role === "client" ? "user" : "assistant",
      content: m.text,
    }));
    messages.push({ role: "user", content: ctx.clientMessage });

    const res = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${systemPrompt}\n\nClient says: "${ctx.clientMessage}" [/INST]`,
          parameters: {
            max_new_tokens: 250,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    return null;
  } catch {
    return null;
  }
}

/* ─── Main negotiation function ─── */
export async function negotiate(
  ctx: NegotiationContext,
): Promise<NegotiationResponse> {
  // Always start with rule-based for reliability
  const ruleResponse = generateRuleBasedResponse(ctx);

  // Try AI enhancement for non-critical responses
  if (
    ruleResponse.action === "info" ||
    ruleResponse.action === "pitch" ||
    ruleResponse.confidence < 0.85
  ) {
    const aiReply = await generateAIEnhancedResponse(ctx);
    if (aiReply && aiReply.length > 20 && aiReply.length < 1000) {
      return {
        ...ruleResponse,
        reply: aiReply,
        confidence: Math.min(ruleResponse.confidence + 0.1, 1),
      };
    }
  }

  return ruleResponse;
}

/* ─── Generate a sales pitch for a specific logo ─── */
export function generatePitch(logoName: string, style: string, industry: string): string {
  return `🎨 *${logoName}*\n\nA ${style} logo designed for the ${industry} industry.\n\nThis design combines modern aesthetics with brand recognition to help your business stand out. Professional quality, delivered in SVG, PNG, and PDF.\n\n💰 Starting at $${DEFAULT_PRICES.basic}\n\nInterested? Let's discuss how this can be tailored for your brand!`;
}

/* ─── Quick response suggestions for the designer ─── */
export function getSuggestedResponses(lastClientMessage: string): string[] {
  const intent = detectIntent(lastClientMessage);

  switch (intent) {
    case "pricing":
      return [
        "I can offer a special discount for you!",
        "Which package fits your budget best?",
        "Would you like a custom quote?",
      ];
    case "negotiate_down":
      return [
        "I can do 15% off — final offer!",
        "Let me check what I can do for you.",
        "How about we add extra revisions at the same price?",
      ];
    case "accept":
      return [
        "Great! I'll prepare the invoice now.",
        "Wonderful! Let me start on your design right away.",
        "Perfect choice! You won't be disappointed.",
      ];
    case "reject":
      return [
        "No problem! The offer stands if you change your mind.",
        "Would a different package work better for you?",
        "Can I at least show you a free concept?",
      ];
    default:
      return [
        "Would you like to see some examples?",
        "Tell me more about your business!",
        "Let me create a custom proposal for you.",
      ];
  }
}
