import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import VendorProfile from "@/models/VendorProfile";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const vendors = await VendorProfile.find()
    .populate("userId", "name email image role")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ vendors: JSON.parse(JSON.stringify(vendors)) });
}
