import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id)
    .populate("wishlist", "name slug images basePrice isActive")
    .lean();

  return NextResponse.json({
    wishlist: user ? JSON.parse(JSON.stringify(user.wishlist)) : [],
  });
}
