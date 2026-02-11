import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await dbConnect();
  const { slug } = await params;

  const product = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .populate("vendorId", "name email")
    .lean();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Get related products from same category
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .lean();

  return NextResponse.json({
    product: JSON.parse(JSON.stringify(product)),
    related: JSON.parse(JSON.stringify(related)),
  });
}
