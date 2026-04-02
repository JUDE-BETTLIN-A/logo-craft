"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Bot,
  CircleOff,
  MessageSquareShare,
  PauseCircle,
  Phone,
  PlayCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  XCircle,
} from "lucide-react";
import type {
  NegotiationSessionDetailDto,
  NegotiationSessionSummaryDto,
  NegotiatorAiProvider,
  TelegramAccountStatus,
} from "@/lib/negotiator-types";

type AccountResponse = {
  status: TelegramAccountStatus;
  providers: Array<"gemini" | "groq">;
};

type SessionsResponse = {
  sessions: NegotiationSessionSummaryDto[];
};

type SessionResponse = {
  session: NegotiationSessionDetailDto;
};

const emptyAccountStatus: TelegramAccountStatus = {
  apiConfigured: false,
  connected: false,
  state: "disconnected",
  phoneNumber: null,
  displayName: null,
  username: null,
  passwordHint: null,
  codeViaApp: false,
};

function formatTime(value: string | null) {
  if (!value) {
    return "Waiting";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClasses(status: NegotiationSessionSummaryDto["status"]) {
  switch (status) {
    case "live":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
    case "paused":
      return "border-amber-400/25 bg-amber-400/10 text-amber-100";
    case "agreed":
      return "border-cyan-400/25 bg-cyan-400/10 text-cyan-100";
    case "closed":
      return "border-rose-400/25 bg-rose-400/10 text-rose-100";
    default:
      return "border-white/10 bg-white/10 text-white";
  }
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export default function NegotiatorPage() {
  const [accountStatus, setAccountStatus] = useState<TelegramAccountStatus>(emptyAccountStatus);
  const [providers, setProviders] = useState<Array<"gemini" | "groq">>([]);
  const [sessions, setSessions] = useState<NegotiationSessionSummaryDto[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<NegotiationSessionDetailDto | null>(null);

  const [accountPhone, setAccountPhone] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [accountPassword, setAccountPassword] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");
  const [minPrice, setMinPrice] = useState("100");
  const [maxPrice, setMaxPrice] = useState("300");
  const [provider, setProvider] = useState<NegotiatorAiProvider>("auto");
  const [manualMessage, setManualMessage] = useState("");
  const [offerFile, setOfferFile] = useState<File | null>(null);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const messagesRef = useRef<HTMLDivElement>(null);

  const loadAccount = async () => {
    const data = await requestJson<AccountResponse>("/api/negotiator/account");
    setAccountStatus(data.status);
    setProviders(data.providers);
    if (data.providers.length === 1) {
      setProvider(data.providers[0]);
    }
  };

  const loadSessions = async () => {
    const data = await requestJson<SessionsResponse>("/api/negotiator/sessions");
    setSessions(data.sessions);
  };

  const loadSelectedSession = async (sessionId: string) => {
    const data = await requestJson<SessionResponse>(
      `/api/negotiator/sessions/${sessionId}`,
    );
    setSelectedSession(data.session);
  };

  const pollUpdates = useEffectEvent(async () => {
    await loadAccount();
    await loadSessions();
    if (selectedSessionId) {
      await loadSelectedSession(selectedSessionId);
    }
  });

  const loadSelectedSessionEffect = useEffectEvent(async (sessionId: string) => {
    await loadSelectedSession(sessionId);
  });

  useEffect(() => {
    void pollUpdates();

    const intervalId = window.setInterval(() => {
      void pollUpdates();
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId) {
      return;
    }

    void loadSelectedSessionEffect(selectedSessionId);
  }, [selectedSessionId]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [selectedSession?.messages]);

  const handleSendCode = () => {
    startTransition(async () => {
      try {
        setError(null);
        const data = await requestJson<AccountResponse>("/api/negotiator/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "sendCode",
            phoneNumber: accountPhone,
          }),
        });
        setAccountStatus(data.status);
        setProviders(data.providers);
        setFeedback(
          data.status.codeViaApp
            ? "Telegram sent the code inside your Telegram app."
            : "Verification code sent.",
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Could not send the code.",
        );
      }
    });
  };

  const handleVerifyCode = () => {
    startTransition(async () => {
      try {
        setError(null);
        const data = await requestJson<
          AccountResponse & { needsPassword?: boolean }
        >("/api/negotiator/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verifyCode",
            code: accountCode,
            password: accountPassword || undefined,
          }),
        });
        setAccountStatus(data.status);
        setProviders(data.providers);
        setFeedback(
          data.needsPassword
            ? "Telegram requires your 2FA password."
            : "Telegram account connected.",
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Could not verify the code.",
        );
      }
    });
  };

  const handleDisconnect = () => {
    startTransition(async () => {
      try {
        setError(null);
        const data = await requestJson<AccountResponse>("/api/negotiator/account", {
          method: "DELETE",
        });
        setAccountStatus(data.status);
        setFeedback("Telegram account disconnected.");
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Could not disconnect the account.",
        );
      }
    });
  };

  const openTelegramPopup = (session: NegotiationSessionSummaryDto) => {
    const popup = window.open(
      session.telegramWebLink,
      "telegram-negotiation",
      "popup=yes,width=460,height=820,left=120,top=80",
    );
    popup?.focus();
  };

  const handleCreateSession = () => {
    startTransition(async () => {
      try {
        setError(null);
        const formData = new FormData();
        formData.append("customerPhone", customerPhone);
        formData.append("logoLabel", offerFile ? offerFile.name.split(".")[0] : "your requested design");
        formData.append("minPrice", minPrice);
        formData.append("maxPrice", maxPrice);
        formData.append("provider", provider);
        if (offerFile) {
          formData.append("offerFile", offerFile);
        }

        const data = await requestJson<SessionResponse>("/api/negotiator/sessions", {
          method: "POST",
          body: formData,
        });

        setSelectedSessionId(data.session.id);
        setSelectedSession(data.session);
        setManualMessage("");
        setOfferFile(null);
        setFeedback("Negotiation started and the opening message was sent.");
        openTelegramPopup(data.session);
        await loadSessions();
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Could not start the negotiation.",
        );
      }
    });
  };

  const handleSessionControl = (action: "pause" | "resume" | "close") => {
    if (!selectedSessionId) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const data = await requestJson<SessionResponse>(
          `/api/negotiator/sessions/${selectedSessionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
          },
        );
        setSelectedSession(data.session);
        await loadSessions();
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Could not update the session.",
        );
      }
    });
  };

  const handleSendManualMessage = () => {
    if (!selectedSessionId) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const data = await requestJson<SessionResponse>(
          `/api/negotiator/sessions/${selectedSessionId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: manualMessage }),
          },
        );
        setSelectedSession(data.session);
        setManualMessage("");
        await loadSessions();
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Could not send your message.",
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#09111d] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_32%),linear-gradient(180deg,#0d1726_0%,#09111d_100%)]" />
        <div className="relative container-main py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
              <MessageSquareShare className="h-3.5 w-3.5" />
              Live Telegram Negotiator
            </div>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
              Run live price negotiations from your own Telegram account.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Connect a personal Telegram account over MTProto, set the customer
              number, the logo offer, and the negotiation floor and ceiling, then
              let Gemini or Groq negotiate live until you interrupt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                AI replies live inside Telegram
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                Manual interrupt locks AI instantly
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                Uses your account, not Bot API
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-main py-8 sm:py-10">
        {(feedback || error) && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
                : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
            }`}
          >
            {error || feedback}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(2,8,23,0.35)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Telegram Account
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">Connect your number</h2>
                </div>
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    accountStatus.connected
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                      : "border-amber-300/30 bg-amber-300/10 text-amber-100"
                  }`}
                >
                  {accountStatus.connected ? "Connected" : "Not connected"}
                </div>
              </div>

              {!accountStatus.apiConfigured ? (
                <div className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm text-amber-50">
                  <p className="font-semibold">Missing Telegram app credentials.</p>
                  <p className="mt-2 leading-6">
                    Add <code>TELEGRAM_API_ID</code> and{" "}
                    <code>TELEGRAM_API_HASH</code> in your environment before this
                    page can sign in.
                  </p>
                </div>
              ) : accountStatus.connected ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-200" />
                      <div>
                        <p className="font-semibold text-emerald-50">
                          {accountStatus.displayName || accountStatus.phoneNumber}
                        </p>
                        <p className="text-sm text-emerald-100/80">
                          {accountStatus.username
                            ? `@${accountStatus.username}`
                            : accountStatus.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      Your Telegram phone
                    </span>
                    <input
                      value={accountPhone}
                      onChange={(event) => setAccountPhone(event.target.value)}
                      placeholder="+15551234567"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1525] px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={isPending || !accountPhone.trim()}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                    >
                      <Phone className="h-4 w-4" />
                      Send Code
                    </button>
                    <p className="self-center text-sm text-slate-400">
                      Telegram will send the login code to your account.
                    </p>
                  </div>

                  {(accountStatus.state === "code_sent" ||
                    accountStatus.state === "password_required") && (
                    <div className="rounded-3xl border border-white/10 bg-[#0b1525] p-4">
                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                          Verification code
                        </span>
                        <input
                          value={accountCode}
                          onChange={(event) => setAccountCode(event.target.value)}
                          placeholder="12345"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-[#09111d] px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
                        />
                      </label>

                      {(accountStatus.state === "password_required" ||
                        accountPassword.length > 0) && (
                        <label className="mt-4 block">
                          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                            Telegram 2FA password
                          </span>
                          <input
                            type="password"
                            value={accountPassword}
                            onChange={(event) => setAccountPassword(event.target.value)}
                            placeholder={accountStatus.passwordHint || "Password"}
                            className="h-12 w-full rounded-2xl border border-white/10 bg-[#09111d] px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
                          />
                        </label>
                      )}

                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={isPending || !accountCode.trim()}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Verify and connect
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(2,8,23,0.35)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    New Negotiation
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">Start a live chat</h2>
                </div>
                <Sparkles className="h-5 w-5 text-cyan-200" />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Customer number
                  </span>
                  <input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="+919999999999"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1525] px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
                  />
                </label>



                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Minimum price
                  </span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1525] px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Maximum price
                  </span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1525] px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Offer Document (PDF or Image)
                  </span>
                  <div className="relative flex items-center h-12 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b1525] text-sm outline-none transition focus-within:border-cyan-300/50">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(event) => setOfferFile(event.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex h-full items-center px-4 bg-white/5 border-r border-white/10 text-cyan-200 font-semibold pointer-events-none">
                      Choose File
                    </div>
                    <div className="px-4 text-slate-400 pointer-events-none truncate">
                      {offerFile ? offerFile.name : "No file selected..."}
                    </div>
                  </div>
                </label>
              </div>

              {providers.length > 0 && (
                <div className="mt-5">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    AI provider
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(["auto", ...providers] as NegotiatorAiProvider[]).map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setProvider(choice)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          provider === choice
                            ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {choice === "auto" ? "Auto" : choice}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateSession}
                disabled={isPending || !accountStatus.connected}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Negotiate
              </button>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Clicking <b className="text-slate-200">Negotiate</b> sends the opening
                pitch from your Telegram account and opens the Telegram chat in a
                popup window.
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(2,8,23,0.35)] backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Active Sessions
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">Live pipeline</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void loadSessions();
                    if (selectedSessionId) {
                      void loadSelectedSession(selectedSessionId);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {sessions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-[#0b1525] p-8 text-center text-sm text-slate-400">
                    Start a negotiation to see the live transcript and status here.
                  </div>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => {
                        setSelectedSessionId(session.id);
                        setSelectedSession((current) =>
                          current?.id === session.id ? current : null,
                        );
                      }}
                      className={`rounded-3xl border p-4 text-left transition ${
                        selectedSessionId === session.id
                          ? "border-cyan-300/35 bg-cyan-300/10"
                          : "border-white/10 bg-[#0b1525] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-white">
                            {session.customerDisplayName || session.customerPhone}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {session.logoLabel}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusClasses(
                            session.status,
                          )}`}
                        >
                          {session.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          Offer ${session.currentOffer}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          Floor ${session.minPrice}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          {session.manualMode ? "Manual override" : "AI live"}
                        </span>
                      </div>

                      {session.lastMessage && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">
                          {session.lastMessage.sender === "customer" ? "Customer: " : ""}
                          {session.lastMessage.text}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>{session.messageCount} messages</span>
                        <span>{formatTime(session.updatedAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(2,8,23,0.35)] backdrop-blur">
              {selectedSession ? (
                <>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                        Conversation
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">
                        {selectedSession.customerDisplayName || selectedSession.customerPhone}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        {selectedSession.logoLabel} • Current offer $
                        {selectedSession.currentOffer} • Last sync{" "}
                        {formatTime(selectedSession.lastSyncedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openTelegramPopup(selectedSession)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                      >
                        <Bot className="h-4 w-4" />
                        Open Telegram
                      </button>
                      <a
                        href={selectedSession.telegramDeepLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20"
                      >
                        Open App Link
                      </a>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSessionControl("pause")}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/20"
                    >
                      <PauseCircle className="h-4 w-4" />
                      Interrupt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSessionControl("resume")}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Resume AI
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSessionControl("close")}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-300/20"
                    >
                      <CircleOff className="h-4 w-4" />
                      Close
                    </button>
                  </div>

                  <div
                    ref={messagesRef}
                    className="mt-5 max-h-[420px] space-y-3 overflow-y-auto rounded-[28px] border border-white/10 bg-[#07101a] p-4"
                  >
                    {selectedSession.messages.map((message) => {
                      const isCustomer = message.sender === "customer";
                      const isOwner = message.sender === "owner";

                      return (
                        <div
                          key={message.id}
                          className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                            isCustomer
                              ? "mr-auto border border-white/10 bg-white/[0.06] text-slate-100"
                              : isOwner
                                ? "ml-auto border border-amber-300/20 bg-amber-300/10 text-amber-50"
                                : "ml-auto border border-cyan-300/20 bg-cyan-300/10 text-cyan-50"
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                            <span>
                              {isCustomer
                                ? "Customer"
                                : isOwner
                                  ? "You"
                                  : "AI Negotiator"}
                            </span>
                            <span>{formatTime(message.createdAt)}</span>
                          </div>
                          <p>{message.text}</p>
                          {message.priceOffered && (
                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                              Offer ${message.priceOffered}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-[28px] border border-white/10 bg-[#0b1525] p-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Manual takeover
                        </p>
                        <p className="text-xs text-slate-400">
                          Sending a message here pauses AI until you resume it.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                        {selectedSession.manualMode ? "AI paused" : "AI active"}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <textarea
                        value={manualMessage}
                        onChange={(event) => setManualMessage(event.target.value)}
                        placeholder="Type your message to interrupt the negotiation..."
                        className="min-h-[96px] flex-1 rounded-3xl border border-white/10 bg-[#09111d] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
                      />
                      <button
                        type="button"
                        onClick={handleSendManualMessage}
                        disabled={isPending || !manualMessage.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-3xl bg-white px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60 sm:w-44"
                      >
                        <Send className="h-4 w-4" />
                        Send manual reply
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-[#0b1525] p-12 text-center">
                  <Wallet className="mx-auto h-8 w-8 text-slate-500" />
                  <h2 className="mt-4 text-xl font-bold text-white">
                    Choose a negotiation
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    The live transcript, AI status, manual interrupt controls, and
                    Telegram links will appear here once you select a session.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
