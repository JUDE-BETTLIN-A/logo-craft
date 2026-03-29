import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Save a logo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      businessName,
      tagline,
      industry,
      style,
      colors,
      fontFamily,
      iconName,
      layout,
      backgroundColor,
      textColor,
      iconColor,
      fontSize,
      iconSize,
      spacing,
      borderRadius,
      shadow,
    } = body;

    if (!userId || !businessName) {
      return NextResponse.json(
        { error: "User ID and business name are required" },
        { status: 400 }
      );
    }

    const logo = await prisma.logo.create({
      data: {
        name: name || `${businessName} Logo`,
        businessName,
        tagline,
        industry: industry || "General",
        style: style || "modern",
        colors: JSON.stringify(colors || []),
        fontFamily: fontFamily || "Inter",
        iconName: iconName || "Star",
        layout: layout || "icon-left",
        backgroundColor: backgroundColor || "#FFFFFF",
        textColor: textColor || "#000000",
        iconColor: iconColor || "#4F46E5",
        fontSize: fontSize || 24,
        iconSize: iconSize || 40,
        spacing: spacing || 16,
        borderRadius: borderRadius || 0,
        shadow: shadow || false,
        userId,
      },
    });

    return NextResponse.json({ logo }, { status: 201 });
  } catch (error) {
    console.error("Save logo error:", error);
    return NextResponse.json(
      { error: "Failed to save logo" },
      { status: 500 }
    );
  }
}

// Get user's logos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const logos = await prisma.logo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const parsedLogos = logos.map((logo) => ({
      ...logo,
      colors: JSON.parse(logo.colors),
    }));

    return NextResponse.json({ logos: parsedLogos });
  } catch (error) {
    console.error("Get logos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logos" },
      { status: 500 }
    );
  }
}
