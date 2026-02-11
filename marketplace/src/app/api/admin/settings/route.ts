import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

let platformSettings = {
  siteName: "Marketplace",
  commissionRate: 10,
  contactEmail: "admin@marketplace.com",
};

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

  return NextResponse.json({ settings: platformSettings });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates = await req.json();
  const allowedFields = ["siteName", "commissionRate", "contactEmail"];

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      (platformSettings as any)[key] = updates[key];
    }
  }

  return NextResponse.json({ settings: platformSettings });
}
