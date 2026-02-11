import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Category from "@/models/Category";

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

  const category = await Category.findById(id);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const updates = await req.json();
  const allowedFields = ["name", "description", "image", "parentCategory"];

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      (category as any)[key] = updates[key];
    }
  }

  await category.save();

  return NextResponse.json({ category: JSON.parse(JSON.stringify(category)) });
}

export async function DELETE(
  _req: NextRequest,
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

  const category = await Category.findById(id);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await Category.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
