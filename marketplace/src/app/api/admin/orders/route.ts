import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (status) {
    query.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("userId", "name email image")
      .populate("items.productId", "name slug images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return NextResponse.json({
    orders: JSON.parse(JSON.stringify(orders)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
