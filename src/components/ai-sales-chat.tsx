"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Lightbulb,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  suggestions?: string[];
}

/**
 * AI Sales Assistant Chat — embedded in the /sell dashboard.
 * Designers can practice negotiation or get AI-crafted responses
 * to copy-paste into their Telegram conversations.
 */
export default function AISalesChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "👋 Hi! I'm your AI Sales Assistant.\n\nI can help you:\n• Draft negotiation responses\n• Suggest pricing strategies\n• Create sales pitches for your logos\n• Handle client objections\n\nPaste a client message or ask me anything!",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      text: msg,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setSuggestions([]);

    try {
      // Get AI negotiation response
      const res = await fetch("/api/ai-negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "negotiate",
          clientName: "Client",
          clientMessage: msg,
          conversationHistory: messages
            .filter((m) => m.role === "user")
            .map((m) => ({
              role: "client" as const,
              text: m.text,
            })),
          status: "negotiating",
        }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        text: data.reply || "I'm not sure how to respond to that. Could you rephrase?",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Get follow-up suggestions
      const sugRes = await fetch("/api/ai-negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest", lastMessage: msg }),
      });
      const sugData = await sugRes.json();
      setSuggestions(sugData.suggestions || []);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again!",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback: create a textarea and copy
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] rounded-xl border border-[#3a3a4d] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#2a2a3d] border-b border-[#3a3a4d] flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Sales Assistant</h3>
          <p className="text-[10px] text-gray-500">Helps you negotiate with clients</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-green-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "assistant"
                  ? "bg-indigo-500/20"
                  : "bg-gray-600/30"
              }`}
            >
              {msg.role === "assistant" ? (
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <User className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-[#2a2a3d] text-gray-200 border border-[#3a3a4d]"
                  : "bg-indigo-500/20 text-indigo-100 border border-indigo-500/20"
              }`}
            >
              {msg.text}
              {msg.role === "assistant" && i > 0 && (
                <button
                  onClick={() => copyToClipboard(msg.text)}
                  className="block mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  📋 Copy to clipboard
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="bg-[#2a2a3d] border border-[#3a3a4d] rounded-xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-1" />
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="text-[11px] px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full hover:bg-amber-500/20 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-[#2a2a3d] border-t border-[#3a3a4d]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a client message or ask for help..."
            className="flex-1 bg-[#1e1e2e] border-[#3a3a4d] text-white text-sm placeholder:text-gray-600"
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
