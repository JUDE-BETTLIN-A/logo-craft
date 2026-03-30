import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "judebettlin@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if this is the admin email
    const isAdmin = email === ADMIN_EMAIL;

    // Update user's admin status if needed
    if (isAdmin && !user.isAdmin) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true },
      });
    }

    // Create response with user data
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isAdmin,
    };

    // Create session cookie (HTTP-only for security)
    const response = NextResponse.json({
      user: userData,
      isAdmin,
    });

    // Set session cookie (7 days expiry)
    response.cookies.set("session", encodeURIComponent(JSON.stringify(userData)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
