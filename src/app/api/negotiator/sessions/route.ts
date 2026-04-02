import { NextRequest, NextResponse } from "next/server";
import {
  createNegotiationSession,
  listNegotiationSessions,
} from "@/lib/negotiation-service";
import { ensureNegotiationWorkerStarted } from "@/lib/negotiation-worker";
import { getErrorMessage } from "@/lib/telegram-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

ensureNegotiationWorkerStarted();

export async function GET(request: NextRequest) {
  try {
    const sync = request.nextUrl.searchParams.get("sync") !== "0";
    const sessions = await listNegotiationSessions({ sync });
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const customerPhone = formData.get("customerPhone") as string;
    const logoLabel = formData.get("logoLabel") as string;
    const minPrice = Number(formData.get("minPrice"));
    const maxPrice = Number(formData.get("maxPrice"));
    const provider = formData.get("provider") as any;

    const file = formData.get("offerFile") as File | null;
    let offerFileData;

    if (file && typeof file === "object" && file.name) {
      const arrayBuffer = await file.arrayBuffer();
      offerFileData = {
        name: file.name,
        size: file.size,
        buffer: Buffer.from(arrayBuffer),
      };
    }

    const session = await createNegotiationSession({
      customerPhone,
      logoLabel,
      minPrice,
      maxPrice,
      provider,
      offerFile: offerFileData,
    });

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}
