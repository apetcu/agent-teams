import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Category from "@/models/Category";
import { slugify } from "@/lib/utils";

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

  const categories = await Category.find()
    .populate("parentCategory", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ categories: JSON.parse(JSON.stringify(categories)) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description, image, parentCategory } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const slug = slugify(name);

  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    return NextResponse.json(
      { error: "A category with this name already exists" },
      { status: 409 }
    );
  }

  const category = await Category.create({
    name,
    slug,
    description: description || "",
    image: image || "",
    parentCategory: parentCategory || null,
  });

  return NextResponse.json(
    { category: JSON.parse(JSON.stringify(category)) },
    { status: 201 }
  );
}
