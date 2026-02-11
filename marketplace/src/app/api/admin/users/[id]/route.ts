import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updates = await req.json();
  const allowedFields = ["role", "isDisabled"];

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      (targetUser as any)[key] = updates[key];
    }
  }

  await targetUser.save();

  return NextResponse.json({ user: JSON.parse(JSON.stringify(targetUser)) });
}
