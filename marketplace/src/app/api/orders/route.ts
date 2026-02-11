import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const orders = await Order.find({ userId: session.user.id })
    .populate("items.productId", "name slug images")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
}
