import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  generateNegotiationReply,
  resolveNegotiationProvider,
} from "@/lib/negotiator-ai";
import type {
  CreateNegotiationInput,
  NegotiationMessageDto,
  NegotiationSessionDetailDto,
  NegotiationSessionSummaryDto,
} from "@/lib/negotiator-types";
import {
  getRecentTelegramMessages,
  getTelegramChatLinks,
  normalizePhoneNumber,
  resolveTelegramCustomer,
  sendTelegramText,
  sendTelegramFile,
} from "@/lib/telegram-account";

type SessionWithMessages = Prisma.NegotiationSessionGetPayload<{
  include: {
    messages: {
      orderBy: { createdAt: "asc" };
    };
  };
}>;

const syncLocks = new Map<string, Promise<NegotiationSessionDetailDto | null>>();

function sessionInclude() {
  return {
    messages: {
      orderBy: {
        createdAt: "asc" as const,
      },
    },
  };
}

function buildCustomerLabel(session: {
  customerDisplayName: string | null;
  customerUsername: string | null;
  customerPhone: string;
}) {
  return (
    session.customerDisplayName ||
    session.customerUsername ||
    session.customerPhone
  );
}

function serializeMessage(
  message: SessionWithMessages["messages"][number],
): NegotiationMessageDto {
  return {
    id: message.id,
    telegramMessageId: message.telegramMessageId,
    sender: message.sender,
    direction: message.direction,
    text: message.text,
    priceOffered: message.priceOffered,
    source: message.source,
    createdAt: message.createdAt.toISOString(),
  };
}

function serializeSessionSummary(
  session: SessionWithMessages,
): NegotiationSessionSummaryDto {
  const serializedMessages = session.messages.map(serializeMessage);
  const lastMessage = serializedMessages.at(-1) ?? null;
  const links = getTelegramChatLinks(session.customerPhone);

  return {
    id: session.id,
    customerPhone: session.customerPhone,
    customerDisplayName: session.customerDisplayName,
    customerUsername: session.customerUsername,
    logoLabel: session.logoLabel,
    logoPreviewUrl: session.logoPreviewUrl,
    minPrice: session.minPrice,
    maxPrice: session.maxPrice,
    currentOffer: session.currentOffer,
    agreedPrice: session.agreedPrice,
    aiProvider: session.aiProvider as "gemini" | "groq",
    aiModel: session.aiModel,
    status: session.status,
    manualMode: session.manualMode,
    lastHandledCustomerMessageId: session.lastHandledCustomerMessageId,
    lastSyncedMessageId: session.lastSyncedMessageId,
    lastAiMessageId: session.lastAiMessageId,
    lastSyncedAt: session.lastSyncedAt?.toISOString() ?? null,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    messageCount: serializedMessages.length,
    lastMessage,
    telegramDeepLink: links.app,
    telegramWebLink: links.web,
  };
}

function serializeSessionDetail(
  session: SessionWithMessages,
): NegotiationSessionDetailDto {
  const summary = serializeSessionSummary(session);
  return {
    ...summary,
    messages: session.messages.map(serializeMessage),
  };
}

function createInitialPitch(logoLabel: string, maxPrice: number) {
  return `Hi. I can do ${logoLabel} at $${maxPrice}. If you want, tell me the budget you have in mind and I’ll see how close I can bring it without cutting the quality.`;
}

async function getSessionOrThrow(sessionId: string) {
  const session = await prisma.negotiationSession.findUnique({
    where: { id: sessionId },
    include: sessionInclude(),
  });

  if (!session) {
    throw new Error("Negotiation session not found.");
  }

  return session;
}

async function refreshSession(sessionId: string) {
  return getSessionOrThrow(sessionId);
}

async function storeMessages(
  sessionId: string,
  messages: Array<{
    telegramMessageId: number;
    sender: "customer" | "owner";
    direction: "incoming" | "outgoing";
    text: string;
    source: string;
    createdAt: Date;
  }>,
) {
  if (messages.length === 0) {
    return;
  }

  await prisma.$transaction(
    messages.map((message) =>
      prisma.negotiationMessage.create({
        data: {
          sessionId,
          telegramMessageId: message.telegramMessageId,
          sender: message.sender,
          direction: message.direction,
          text: message.text,
          source: message.source,
          createdAt: message.createdAt,
        },
      }),
    ),
  );
}

function getLatestCustomerMessageId(session: SessionWithMessages) {
  return (
    session.messages
      .filter((message) => message.sender === "customer")
      .at(-1)?.telegramMessageId ?? session.lastHandledCustomerMessageId ?? 0
  );
}

async function syncSessionInternal(sessionId: string) {
  const session = await getSessionOrThrow(sessionId);

  const remoteMessages = await getRecentTelegramMessages(
    session.customerPhone,
    buildCustomerLabel(session),
    40,
  );

  const existingIds = new Set(session.messages.map((message) => message.telegramMessageId));
  const newMessages: Array<{
    telegramMessageId: number;
    sender: "customer" | "owner";
    direction: "incoming" | "outgoing";
    text: string;
    source: string;
    createdAt: Date;
  }> = [];
  let sawManualOwnerMessage = false;
  let highestSeenId = session.lastSyncedMessageId ?? 0;

  for (const remoteMessage of remoteMessages) {
    highestSeenId = Math.max(highestSeenId, remoteMessage.id);

    if (existingIds.has(remoteMessage.id)) {
      continue;
    }

    const text = remoteMessage.message?.trim();
    if (!text) {
      continue;
    }

    if (remoteMessage.out) {
      sawManualOwnerMessage = true;
      newMessages.push({
        telegramMessageId: remoteMessage.id,
        sender: "owner",
        direction: "outgoing",
        text,
        source: "telegram_manual",
        createdAt: new Date(remoteMessage.date * 1000),
      });
      continue;
    }

    newMessages.push({
      telegramMessageId: remoteMessage.id,
      sender: "customer",
      direction: "incoming",
      text,
      source: "telegram_sync",
      createdAt: new Date(remoteMessage.date * 1000),
    });
  }

  await storeMessages(session.id, newMessages);

  let updatedSession = await refreshSession(session.id);
  const latestCustomerMessageId = getLatestCustomerMessageId(updatedSession);

  if (sawManualOwnerMessage && updatedSession.status !== "closed") {
    updatedSession = await prisma.negotiationSession.update({
      where: { id: updatedSession.id },
      data: {
        manualMode: true,
        status: updatedSession.status === "agreed" ? "agreed" : "paused",
        lastHandledCustomerMessageId: latestCustomerMessageId || null,
        lastSyncedMessageId: highestSeenId || updatedSession.lastSyncedMessageId,
        lastSyncedAt: new Date(),
      },
      include: sessionInclude(),
    });
  } else {
    updatedSession = await prisma.negotiationSession.update({
      where: { id: updatedSession.id },
      data: {
        lastSyncedMessageId: highestSeenId || updatedSession.lastSyncedMessageId,
        lastSyncedAt: new Date(),
      },
      include: sessionInclude(),
    });
  }

  if (
    updatedSession.status !== "live" ||
    updatedSession.manualMode ||
    latestCustomerMessageId <= (updatedSession.lastHandledCustomerMessageId ?? 0)
  ) {
    return serializeSessionDetail(updatedSession);
  }

  const ai = await generateNegotiationReply({
    provider:
      updatedSession.aiModel === "fallback-rules"
        ? "auto"
        : updatedSession.aiProvider === "groq"
          ? "groq"
          : "gemini",
    logoLabel: updatedSession.logoLabel,
    minPrice: updatedSession.minPrice,
    maxPrice: updatedSession.maxPrice,
    currentOffer: updatedSession.currentOffer,
    customerLabel: buildCustomerLabel(updatedSession),
    messages: updatedSession.messages.map((message) => ({
      sender: message.sender,
      text: message.text,
      priceOffered: message.priceOffered,
    })),
  });

  const sentMessage = await sendTelegramText(
    updatedSession.customerPhone,
    buildCustomerLabel(updatedSession),
    ai.result.reply,
  );

  const finalSession = await prisma.negotiationSession.update({
    where: { id: updatedSession.id },
    data: {
      currentOffer: ai.result.nextOffer,
      agreedPrice: ai.result.state === "agreed" ? ai.result.nextOffer : updatedSession.agreedPrice,
      aiProvider: ai.provider,
      aiModel: ai.model,
      status: ai.result.state,
      manualMode: ai.result.needsOwner || ai.result.state === "paused",
      lastHandledCustomerMessageId: latestCustomerMessageId,
      lastAiMessageId: sentMessage.id,
      lastSyncedMessageId: Math.max(highestSeenId, sentMessage.id),
      lastSyncedAt: new Date(),
      messages: {
        create: {
          telegramMessageId: sentMessage.id,
          sender: "ai",
          direction: "outgoing",
          text: ai.result.reply,
          priceOffered: ai.result.nextOffer,
          source: "ai_auto",
          createdAt: new Date(sentMessage.date * 1000),
        },
      },
    },
    include: sessionInclude(),
  });

  return serializeSessionDetail(finalSession);
}

export async function createNegotiationSession(input: CreateNegotiationInput) {
  const customerPhone = normalizePhoneNumber(input.customerPhone);
  const logoLabel = input.logoLabel.trim();
  const minPrice = Number(input.minPrice);
  const maxPrice = Number(input.maxPrice);

  if (!logoLabel) {
    throw new Error("Logo is required.");
  }

  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
    throw new Error("Minimum and maximum prices must be valid numbers.");
  }

  if (minPrice <= 0 || maxPrice <= 0) {
    throw new Error("Prices must be greater than zero.");
  }

  if (minPrice > maxPrice) {
    throw new Error("Minimum price cannot be greater than maximum price.");
  }

  const customer = await resolveTelegramCustomer(customerPhone, logoLabel);
  const resolvedProvider = resolveNegotiationProvider(input.provider);
  const initialPitch = createInitialPitch(logoLabel, maxPrice);

  let sentMessage;
  if (input.offerFile) {
    sentMessage = await sendTelegramFile(
      customer.phoneNumber,
      customer.displayName,
      input.offerFile.name,
      input.offerFile.size,
      input.offerFile.buffer,
      initialPitch
    );
  } else {
    sentMessage = await sendTelegramText(
      customer.phoneNumber,
      customer.displayName,
      initialPitch,
    );
  }

  const session = await prisma.negotiationSession.create({
    data: {
      customerPhone: customer.phoneNumber,
      customerDisplayName: customer.displayName,
      customerUsername: customer.username,
      customerPeerId: customer.peerId,
      logoLabel,
      logoPreviewUrl: input.logoPreviewUrl?.trim() || null,
      minPrice,
      maxPrice,
      currentOffer: maxPrice,
      aiProvider: resolvedProvider?.provider ?? "gemini",
      aiModel: resolvedProvider?.model ?? "fallback-rules",
      status: "live",
      manualMode: false,
      lastAiMessageId: sentMessage.id,
      lastSyncedMessageId: sentMessage.id,
      lastSyncedAt: new Date(),
      messages: {
        create: {
          telegramMessageId: sentMessage.id,
          sender: "ai",
          direction: "outgoing",
          text: initialPitch,
          priceOffered: maxPrice,
          source: "ai_opening",
          createdAt: new Date(sentMessage.date * 1000),
        },
      },
    },
    include: sessionInclude(),
  });

  return serializeSessionDetail(session);
}

export async function listNegotiationSessions(options?: { sync?: boolean }) {
  if (options?.sync !== false) {
    const activeSessions = await prisma.negotiationSession.findMany({
      where: {
        status: {
          in: ["live", "paused", "agreed"],
        },
      },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });

    for (const session of activeSessions) {
      await syncNegotiationSession(session.id);
    }
  }

  const sessions = await prisma.negotiationSession.findMany({
    include: sessionInclude(),
    orderBy: { updatedAt: "desc" },
  });

  return sessions.map(serializeSessionSummary);
}

export async function getNegotiationSession(
  sessionId: string,
  options?: { sync?: boolean },
) {
  if (options?.sync === false) {
    return serializeSessionDetail(await getSessionOrThrow(sessionId));
  }

  return syncNegotiationSession(sessionId);
}

export async function sendOwnerMessage(sessionId: string, text: string) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("Message cannot be empty.");
  }

  const session = await getSessionOrThrow(sessionId);
  const sentMessage = await sendTelegramText(
    session.customerPhone,
    buildCustomerLabel(session),
    trimmedText,
  );
  const latestCustomerMessageId = getLatestCustomerMessageId(session);

  const updatedSession = await prisma.negotiationSession.update({
    where: { id: session.id },
    data: {
      manualMode: true,
      status: session.status === "agreed" ? "agreed" : "paused",
      lastHandledCustomerMessageId: latestCustomerMessageId || null,
      lastSyncedMessageId: Math.max(session.lastSyncedMessageId ?? 0, sentMessage.id),
      lastSyncedAt: new Date(),
      messages: {
        create: {
          telegramMessageId: sentMessage.id,
          sender: "owner",
          direction: "outgoing",
          text: trimmedText,
          source: "dashboard_manual",
          createdAt: new Date(sentMessage.date * 1000),
        },
      },
    },
    include: sessionInclude(),
  });

  return serializeSessionDetail(updatedSession);
}

export async function updateNegotiationControl(
  sessionId: string,
  action: "pause" | "resume" | "close",
) {
  const session = await getSessionOrThrow(sessionId);
  const latestCustomerMessageId = getLatestCustomerMessageId(session);

  const updatedSession = await prisma.negotiationSession.update({
    where: { id: session.id },
    data:
      action === "pause"
        ? {
            manualMode: true,
            status: session.status === "agreed" ? "agreed" : "paused",
            lastHandledCustomerMessageId: latestCustomerMessageId || null,
          }
        : action === "resume"
          ? {
              manualMode: false,
              status: session.status === "closed" ? "closed" : "live",
            }
          : {
              manualMode: true,
              status: "closed",
              lastHandledCustomerMessageId: latestCustomerMessageId || null,
            },
    include: sessionInclude(),
  });

  return serializeSessionDetail(updatedSession);
}

export async function syncNegotiationSession(sessionId: string) {
  const existingLock = syncLocks.get(sessionId);
  if (existingLock) {
    return existingLock;
  }

  const lock = syncSessionInternal(sessionId).finally(() => {
    syncLocks.delete(sessionId);
  });

  syncLocks.set(sessionId, lock);

  return lock;
}
