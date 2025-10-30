
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import imagekit from "@/lib/imagekit";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const authParams = imagekit.getAuthenticationParameters();
    return NextResponse.json(authParams);
  } catch (err) {
    console.error("ImageKit auth error:", err);
    return NextResponse.json({ error: "Failed to generate auth" }, { status: 500 });
  }
}
