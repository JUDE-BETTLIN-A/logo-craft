import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  
  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  try {
    const user = JSON.parse(decodeURIComponent(sessionCookie));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
