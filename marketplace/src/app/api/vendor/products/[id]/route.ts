import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";

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
  if (!user || (user.role !== "vendor" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.vendorId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates = await req.json();
  const allowedFields = [
    "name",
    "description",
    "category",
    "basePrice",
    "images",
    "variants",
    "tags",
    "isActive",
  ];

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      (product as any)[key] = updates[key];
    }
  }

  await product.save();

  return NextResponse.json({ product: JSON.parse(JSON.stringify(product)) });
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
  if (!user || (user.role !== "vendor" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.vendorId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Product.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
