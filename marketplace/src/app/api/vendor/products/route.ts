import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || (user.role !== "vendor" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await Product.find({ vendorId: user._id })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || (user.role !== "vendor" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description, category, basePrice, images, variants, tags } =
    await req.json();

  if (!name || !description || !category || basePrice == null) {
    return NextResponse.json(
      { error: "name, description, category, and basePrice are required" },
      { status: 400 }
    );
  }

  const slug = slugify(name);

  const existingProduct = await Product.findOne({ slug });
  if (existingProduct) {
    return NextResponse.json(
      { error: "A product with this name already exists" },
      { status: 409 }
    );
  }

  const product = await Product.create({
    vendorId: user._id,
    name,
    slug,
    description,
    category,
    basePrice,
    images: images || [],
    variants: variants || [],
    tags: tags || [],
  });

  return NextResponse.json(
    { product: JSON.parse(JSON.stringify(product)) },
    { status: 201 }
  );
}
