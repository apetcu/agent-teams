import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

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

  const orders = await Order.find({ "items.vendorId": user._id })
    .populate("items.productId", "name slug images")
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const vendorOrders = orders.map((order) => ({
    ...order,
    items: order.items.filter(
      (item) => item.vendorId.toString() === user._id.toString()
    ),
  }));

  return NextResponse.json({
    orders: JSON.parse(JSON.stringify(vendorOrders)),
  });
}
