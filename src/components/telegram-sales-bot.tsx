"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Upload,
  Send,
  Bot,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Play,
  Wifi,
  WifiOff,
  FileText,
  X,
} from "lucide-react";

interface Lead {
  id: string;
  phoneNumber: string;
  name: string | null;
  campaign: string | null;
  status: string;
  finalPrice: number | null;
  conversationsCount: number;
}

interface BotStatus {
  id: string;
  phoneNumber: string;
  status: string;
  leadsCount: number;
}

interface NegotiationStats {
  total: number;
  active: number;
  closed: number;
  revenue: number;
}

export default function TelegramSalesBot() {
  // Bot connection state
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<"phone" | "code" | "done">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sessionString, setSessionString] = useState("");
  const [phoneCodeHash, setPhoneCodeHash] = useState("");

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [startingCampaign, setStartingCampaign] = useState(false);

  // Negotiations state
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [stats, setStats] = useState<NegotiationStats>({
    total: 0,
    active: 0,
    closed: 0,
    revenue: 0,
  });

  // Fetch bot status
  const fetchBotStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/telegram-bot/status");
      const data = await res.json();
      if (data.success && data.bot) {
        setBotStatus(data.bot);
        setConnectionStep("done");
      }
    } catch (error) {
      console.error("Failed to fetch bot status:", error);
    }
  }, []);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads/list");
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  }, []);

  // Fetch negotiations
  const fetchNegotiations = useCallback(async () => {
    try {
      const res = await fetch("/api/negotiations");
      const data = await res.json();
      if (data.success) {
        setNegotiations(data.conversations);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch negotiations:", error);
    }
  }, []);

  useEffect(() => {
    fetchBotStatus();
    fetchLeads();
    fetchNegotiations();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchLeads();
      fetchNegotiations();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchBotStatus, fetchLeads, fetchNegotiations]);

  // Handle bot connection - Step 1: Send code
  const handleSendCode = async () => {
    if (!phoneNumber) return;
    
    setConnecting(true);
    try {
      const res = await fetch("/api/telegram-bot/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSessionString(data.sessionString);
        setPhoneCodeHash(data.phoneCodeHash);
        setConnectionStep("code");
      } else {
        alert(data.error || "Failed to send code");
      }
    } catch (error) {
      alert("Failed to connect. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  // Handle bot connection - Step 2: Verify code
  const handleVerifyCode = async () => {
    if (!verificationCode) return;

    setConnecting(true);
    try {
      const res = await fetch("/api/telegram-bot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          code: verificationCode,
          sessionString,
          phoneCodeHash,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setConnectionStep("done");
        setBotStatus(data.bot);
        alert("Telegram bot connected successfully!");
      } else if (data.requiresPassword) {
        alert("2FA password required. Please disable 2FA temporarily or contact support.");
      } else {
        alert(data.error || "Invalid code");
      }
    } catch (error) {
      alert("Failed to verify code. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  // Handle file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        fetchLeads();
      } else {
        alert(data.error || "Failed to import");
      }
    } catch (error) {
      alert("Failed to import. Please try again.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  // Handle start campaign
  const handleStartCampaign = async () => {
    if (selectedLeads.length === 0) return;

    if (!confirm(`Start AI outreach to ${selectedLeads.length} leads?`)) return;

    setStartingCampaign(true);
    try {
      const res = await fetch("/api/leads/start-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: selectedLeads }),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setSelectedLeads([]);
        fetchLeads();
        fetchNegotiations();
      } else {
        alert(data.error || "Failed to start campaign");
      }
    } catch (error) {
      alert("Failed to start campaign. Please try again.");
    } finally {
      setStartingCampaign(false);
    }
  };

  // Toggle lead selection
  const toggleLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Select all leads
  const selectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Bot Connection Status */}
      <Card className="bg-white/[0.03] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" />
            Telegram Bot Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionStep === "done" && botStatus ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-white font-medium">{botStatus.phoneNumber}</p>
                  <p className="text-sm text-gray-400">{botStatus.leadsCount} leads imported</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              {connectionStep === "phone" && (
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white"
                  />
                  <Button
                    onClick={handleSendCode}
                    disabled={connecting || !phoneNumber}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Code"}
                  </Button>
                </div>
              )}
              
              {connectionStep === "code" && (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white text-center tracking-widest"
                    maxLength={5}
                  />
                  <Button
                    onClick={handleVerifyCode}
                    disabled={connecting || !verificationCode}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-gray-400">
                💡 You'll receive a verification code from Telegram on your device
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-xs text-gray-400">Active Chats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.closed}</p>
                <p className="text-xs text-gray-400">Deals Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">${stats.revenue}</p>
                <p className="text-xs text-gray-400">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{leads.length}</p>
                <p className="text-xs text-gray-400">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import & Campaign */}
      <Card className="bg-white/[0.03] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            Customer Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileImport}
                disabled={importing || !botStatus}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:opacity-0 disabled:cursor-not-allowed"
              />
              <Button
                variant="outline"
                disabled={importing || !botStatus}
                className="border-white/[0.1] text-gray-300 hover:bg-white/[0.05]"
              >
                <Upload className="w-4 h-4 mr-2" />
                {importing ? "Importing..." : "Import CSV"}
              </Button>
            </div>
            
            <Button
              onClick={handleStartCampaign}
              disabled={startingCampaign || selectedLeads.length === 0 || !botStatus}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {startingCampaign ? "Starting..." : `Start AI Outreach (${selectedLeads.length})`}
            </Button>
          </div>

          {!botStatus && (
            <p className="text-sm text-amber-400">
              ⚠️ Please connect your Telegram bot first
            </p>
          )}

          {/* Leads Table */}
          <div className="border border-white/[0.06] rounded-lg overflow-hidden">
            <div className="bg-white/[0.02] px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-600"
                  disabled={!botStatus}
                />
                <span className="text-sm text-gray-400">{leads.length} leads</span>
              </div>
              <div className="text-sm text-gray-400">
                {selectedLeads.length} selected
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No leads yet. Import a CSV file to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleLead(lead.id)}
                          className="rounded border-gray-600"
                          disabled={!botStatus || lead.status !== "new"}
                        />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {lead.name || lead.phoneNumber}
                          </p>
                          <p className="text-xs text-gray-400">{lead.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={`text-xs ${
                          lead.status === "new" ? "bg-blue-500/20 text-blue-400" :
                          lead.status === "contacted" ? "bg-yellow-500/20 text-yellow-400" :
                          lead.status === "negotiating" ? "bg-purple-500/20 text-purple-400" :
                          lead.status === "closed" ? "bg-green-500/20 text-green-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {lead.status}
                        </Badge>
                        {lead.finalPrice && (
                          <span className="text-sm font-bold text-green-400">
                            ${lead.finalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Negotiations */}
      <Card className="bg-white/[0.03] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            Active Negotiations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {negotiations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active negotiations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {negotiations.map((nego) => (
                <div
                  key={nego.id}
                  className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      nego.status === "negotiating" ? "bg-green-500 animate-pulse" :
                      nego.status === "closed" ? "bg-blue-500" :
                      "bg-gray-500"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {nego.lead?.name || nego.lead?.phoneNumber}
                      </p>
                      <p className="text-xs text-gray-400">{nego.lastMessage?.substring(0, 50) || "No messages yet"}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {nego.currentOffer ? `$${nego.currentOffer}` : "-"}
                    </p>
                    <p className="text-xs text-gray-400">{nego.messageCount} msgs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
