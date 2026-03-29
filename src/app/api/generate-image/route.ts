import { NextRequest, NextResponse } from "next/server";
import { buildLogoPrompt, generateLogoImage } from "@/lib/huggingface";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, industry, style, colorHint, keywords } = body;

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const prompt = buildLogoPrompt({
      businessName,
      industry,
      style,
      colorHint,
      keywords,
    });

    const imageBuffer = await generateLogoImage(prompt);

    // Convert to base64 data URL
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      image: dataUrl,
      prompt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Model is loading — tell client to retry
    if (message.startsWith("MODEL_LOADING:")) {
      const waitTime = parseInt(message.split(":")[1], 10);
      return NextResponse.json(
        {
          error: "Model is loading, please retry shortly",
          retryAfter: waitTime,
          loading: true,
        },
        { status: 503 }
      );
    }

    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
