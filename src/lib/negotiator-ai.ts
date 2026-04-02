import type {
  NegotiationAiResult,
  NegotiationMessageDto,
  NegotiatorAiProvider,
} from "@/lib/negotiator-types";

const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "openai/gpt-oss-20b";

type ActiveProvider = "gemini" | "groq";

interface GenerateNegotiationReplyInput {
  provider?: NegotiatorAiProvider;
  logoLabel: string;
  minPrice: number;
  maxPrice: number;
  currentOffer: number;
  customerLabel: string;
  messages: Pick<NegotiationMessageDto, "sender" | "text" | "priceOffered">[];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function cleanJsonText(value: string) {
  return value.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function parseMoneyCandidate(value: string) {
  const match = value.match(/\$?\s*(\d{2,5})/);
  return match ? Number(match[1]) : null;
}

function fallbackNegotiation(
  input: GenerateNegotiationReplyInput,
): NegotiationAiResult {
  const lastCustomerMessage =
    [...input.messages].reverse().find((message) => message.sender === "customer")
      ?.text ?? "";
  const lower = lastCustomerMessage.toLowerCase();
  const initialOffer = clamp(input.currentOffer || input.maxPrice, input.minPrice, input.maxPrice);
  const requestedPrice = parseMoneyCandidate(lastCustomerMessage);
  const step = Math.max(5, Math.round((input.maxPrice - input.minPrice) * 0.18));

  if (/\b(ok|okay|deal|accepted?|works|sounds good|let'?s do it|go ahead)\b/i.test(lower)) {
    return {
      reply: `Perfect. We can lock ${input.logoLabel} in at $${initialOffer}. If you're ready, I can move straight to the next step here.`,
      nextOffer: initialOffer,
      state: "agreed",
      confidence: 0.66,
      needsOwner: false,
      reason: "Customer accepted the current offer.",
    };
  }

  if (/\b(not interested|pass|no thanks|stop|leave it|forget it)\b/i.test(lower)) {
    return {
      reply: `Understood. If you want to revisit ${input.logoLabel} later, I can reopen the offer anytime.`,
      nextOffer: initialOffer,
      state: "closed",
      confidence: 0.62,
      needsOwner: false,
      reason: "Customer explicitly declined.",
    };
  }

  if (/\b(call|contract|invoice|payment link|bank|upi|wire|speak with you|human)\b/i.test(lower)) {
    return {
      reply: `I can hand this over directly so we can finalize the details properly. One moment.`,
      nextOffer: initialOffer,
      state: "paused",
      confidence: 0.7,
      needsOwner: true,
      reason: "Customer asked for owner-level handling.",
    };
  }

  if (/\b(price|budget|discount|lower|less|too much|expensive|final)\b/i.test(lower) || requestedPrice) {
    const nextOffer = clamp(
      requestedPrice ? Math.max(requestedPrice, input.minPrice) : initialOffer - step,
      input.minPrice,
      initialOffer,
    );

    if (nextOffer <= input.minPrice) {
      return {
        reply: `I can make $${input.minPrice} work for ${input.logoLabel}, and that is my lowest workable price for this one.`,
        nextOffer: input.minPrice,
        state: "live",
        confidence: 0.63,
        needsOwner: false,
        reason: "Customer pushed pricing to the floor.",
      };
    }

    return {
      reply: `I can adjust this and make it $${nextOffer} for ${input.logoLabel}. That keeps the quality where it should be while giving you a better entry point.`,
      nextOffer,
      state: "live",
      confidence: 0.64,
      needsOwner: false,
      reason: "Customer requested a better price.",
    };
  }

  return {
    reply: `I can do ${input.logoLabel} at $${initialOffer}. If you want, tell me what kind of finish or style you want and I’ll shape the offer around that.`,
    nextOffer: initialOffer,
    state: "live",
    confidence: 0.58,
    needsOwner: false,
    reason: "General fallback response.",
  };
}

function getAvailableProviders() {
  const providers: ActiveProvider[] = [];

  if (process.env.GEMINI_API_KEY) {
    providers.push("gemini");
  }

  if (process.env.GROQ_API_KEY) {
    providers.push("groq");
  }

  return providers;
}

export function resolveNegotiationProvider(
  requestedProvider: NegotiatorAiProvider | undefined,
) {
  const availableProviders = getAvailableProviders();

  if (requestedProvider === "gemini") {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    return { provider: "gemini" as const, model: GEMINI_MODEL };
  }

  if (requestedProvider === "groq") {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured.");
    }

    return { provider: "groq" as const, model: GROQ_MODEL };
  }

  if (availableProviders.includes("gemini")) {
    return { provider: "gemini" as const, model: GEMINI_MODEL };
  }

  if (availableProviders.includes("groq")) {
    return { provider: "groq" as const, model: GROQ_MODEL };
  }

  return null;
}

function buildPrompt(input: GenerateNegotiationReplyInput) {
  const transcript = input.messages
    .slice(-14)
    .map((message) => `${message.sender.toUpperCase()}: ${message.text}`)
    .join("\n");

  return [
    "You are negotiating inside Telegram as a human freelancer selling a logo.",
    "Do not say you are an AI, assistant, bot, or system.",
    "Keep each reply short, natural, and suited for Telegram.",
    `Logo offer: ${input.logoLabel}`,
    `Customer: ${input.customerLabel}`,
    `Lowest acceptable price: $${input.minPrice}`,
    `Highest target price: $${input.maxPrice}`,
    `Current live offer: $${input.currentOffer}`,
    "Rules:",
    "- Never go below the minimum price.",
    "- Stay confident and polite.",
    "- Move price downward only when the customer clearly pushes back.",
    "- If the customer accepts, set state to agreed.",
    "- If the customer wants the owner directly, set state to paused and needsOwner to true.",
    "- If the customer clearly walks away, set state to closed.",
    "- reply must be plain Telegram text, no markdown.",
    "",
    "Conversation:",
    transcript || "No previous messages.",
  ].join("\n");
}

function buildSchema(minPrice: number, maxPrice: number) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      reply: {
        type: "string",
        description: "The exact text to send back in Telegram.",
      },
      nextOffer: {
        type: "integer",
        minimum: minPrice,
        maximum: maxPrice,
        description: "The active offer after sending the reply.",
      },
      state: {
        type: "string",
        enum: ["live", "paused", "agreed", "closed"],
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
      },
      needsOwner: {
        type: "boolean",
      },
      reason: {
        type: "string",
        description: "Short internal explanation.",
      },
    },
    required: ["reply", "nextOffer", "state", "confidence", "needsOwner", "reason"],
  } as const;
}

function normalizeAiResult(
  raw: NegotiationAiResult,
  input: GenerateNegotiationReplyInput,
): NegotiationAiResult {
  return {
    reply: raw.reply.trim() || fallbackNegotiation(input).reply,
    nextOffer: clamp(raw.nextOffer, input.minPrice, input.maxPrice),
    state: raw.state,
    confidence: clamp(raw.confidence, 0, 1),
    needsOwner: Boolean(raw.needsOwner),
    reason: raw.reason.trim() || "No reason provided.",
  };
}

async function callGemini(input: GenerateNegotiationReplyInput) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY ?? "",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildPrompt(input) }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: buildSchema(input.minPrice, input.maxPrice),
          temperature: 0.7,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}.`);
  }

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return normalizeAiResult(
    JSON.parse(cleanJsonText(text)) as NegotiationAiResult,
    input,
  );
}

async function callGroq(input: GenerateNegotiationReplyInput) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: buildPrompt(input),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "negotiation_response",
          schema: buildSchema(input.minPrice, input.maxPrice),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with ${response.status}.`);
  }

  const json = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const text = json.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return normalizeAiResult(
    JSON.parse(cleanJsonText(text)) as NegotiationAiResult,
    input,
  );
}

export async function generateNegotiationReply(
  input: GenerateNegotiationReplyInput,
) {
  const resolvedProvider = resolveNegotiationProvider(input.provider);

  if (!resolvedProvider) {
    return {
      provider: "gemini" as const,
      model: "fallback-rules",
      result: fallbackNegotiation(input),
    };
  }

  try {
    const result =
      resolvedProvider.provider === "gemini"
        ? await callGemini(input)
        : await callGroq(input);

    return {
      provider: resolvedProvider.provider,
      model: resolvedProvider.model,
      result,
    };
  } catch {
    return {
      provider: resolvedProvider.provider,
      model: `${resolvedProvider.model} (fallback)`,
      result: fallbackNegotiation(input),
    };
  }
}

export function listNegotiatorProviders() {
  return getAvailableProviders();
}
