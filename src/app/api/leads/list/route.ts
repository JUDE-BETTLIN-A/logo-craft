import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Get all leads with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const campaign = searchParams.get("campaign");

    const leads = await prisma.lead.findMany({
      where: {
        ...(status && { status }),
        ...(campaign && { campaign }),
      },
      include: {
        _count: {
          select: {
            conversations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      leads: leads.map((lead) => ({
        ...lead,
        conversationsCount: lead._count.conversations,
      })),
    });
  } catch (error: any) {
    console.error("Leads list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
