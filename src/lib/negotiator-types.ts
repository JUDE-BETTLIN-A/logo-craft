export type NegotiatorAiProvider = "auto" | "gemini" | "groq";

export type NegotiationStatus = "live" | "paused" | "agreed" | "closed";

export type NegotiationMessageSender = "customer" | "ai" | "owner" | "system";

export interface TelegramAccountStatus {
  apiConfigured: boolean;
  connected: boolean;
  state: "disconnected" | "code_sent" | "password_required" | "connected";
  phoneNumber: string | null;
  displayName: string | null;
  username: string | null;
  passwordHint: string | null;
  codeViaApp: boolean;
}

export interface NegotiationMessageDto {
  id: string;
  telegramMessageId: number;
  sender: NegotiationMessageSender;
  direction: "incoming" | "outgoing";
  text: string;
  priceOffered: number | null;
  source: string;
  createdAt: string;
}

export interface NegotiationSessionSummaryDto {
  id: string;
  customerPhone: string;
  customerDisplayName: string | null;
  customerUsername: string | null;
  logoLabel: string;
  logoPreviewUrl: string | null;
  minPrice: number;
  maxPrice: number;
  currentOffer: number;
  agreedPrice: number | null;
  aiProvider: "gemini" | "groq";
  aiModel: string;
  status: NegotiationStatus;
  manualMode: boolean;
  lastHandledCustomerMessageId: number | null;
  lastSyncedMessageId: number | null;
  lastAiMessageId: number | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: NegotiationMessageDto | null;
  telegramDeepLink: string;
  telegramWebLink: string;
}

export interface NegotiationSessionDetailDto extends NegotiationSessionSummaryDto {
  messages: NegotiationMessageDto[];
}

export interface CreateNegotiationInput {
  customerPhone: string;
  logoLabel: string;
  minPrice: number;
  maxPrice: number;
  logoPreviewUrl?: string;
  provider?: NegotiatorAiProvider;
  offerFile?: {
    name: string;
    size: number;
    buffer: Buffer;
  };
}

export interface NegotiationAiResult {
  reply: string;
  nextOffer: number;
  state: NegotiationStatus;
  confidence: number;
  needsOwner: boolean;
  reason: string;
}
