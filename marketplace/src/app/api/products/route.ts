import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const vendor = searchParams.get("vendor");

  const filter: any = { isActive: true };

  if (category) filter.category = category;
  if (vendor) filter.vendorId = vendor;
  if (search) {
    filter.$text = { $search: search };
  }
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = parseInt(minPrice);
    if (maxPrice) filter.basePrice.$lte = parseInt(maxPrice);
  }

  const sortOptions: Record<string, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
  };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category", "name slug")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({
    products: JSON.parse(JSON.stringify(products)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
