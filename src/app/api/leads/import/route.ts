import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Bulk import customer leads from CSV or plain text
 * Format: phone,name (or just phone numbers, one per line)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const campaign = formData.get("campaign") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check for active bot
    const bot = await prisma.telegramBot.findFirst({
      where: { status: "active" },
    });

    if (!bot) {
      return NextResponse.json(
        { error: "No active Telegram bot. Please connect your bot first." },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim().length > 0);

    const leads = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip header row if present
      if (i === 0 && (line.toLowerCase().includes("phone") || line.toLowerCase().includes("name"))) {
        continue;
      }

      // Parse CSV or plain text
      let phone: string;
      let name: string | null = null;

      if (line.includes(",")) {
        const parts = line.split(",");
        phone = parts[0].trim();
        name = parts[1]?.trim() || null;
      } else {
        phone = line;
      }

      // Validate phone number (basic validation)
      if (!phone || phone.length < 7) {
        errors.push({ row: i + 1, reason: "Invalid phone number" });
        continue;
      }

      try {
        const existingLead = await prisma.lead.findUnique({
          where: { phoneNumber: phone },
        });

        if (existingLead) {
          const updatedLead = await prisma.lead.update({
            where: { phoneNumber: phone },
            data: {
              campaign: campaign || "imported",
              name: name || existingLead.name,
              source: "csv_import",
            },
          });
          leads.push(updatedLead);
        } else {
          const newLead = await prisma.lead.create({
            data: {
              phoneNumber: phone,
              name: name,
              campaign: campaign || "imported",
              source: "csv_import",
              assignedBotId: bot.id,
              status: "new",
              minPrice: 49,
              maxPrice: 199,
            },
          });
          leads.push(newLead);
        }
      } catch (error: any) {
        errors.push({ row: i + 1, phone, reason: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      imported: leads.length,
      failed: errors.length,
      errors: errors.slice(0, 10), // Limit errors shown
      message: `Imported ${leads.length} leads${errors.length > 0 ? `, ${errors.length} failed` : ""}`,
    });
  } catch (error: any) {
    console.error("Lead import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import leads" },
      { status: 500 }
    );
  }
}
