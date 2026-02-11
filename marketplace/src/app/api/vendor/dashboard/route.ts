import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
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

  const [productCount, orders] = await Promise.all([
    Product.countDocuments({ vendorId: user._id }),
    Order.find({ "items.vendorId": user._id })
      .populate("items.productId", "name slug images")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  let totalSales = 0;
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.vendorId.toString() === user._id.toString()) {
        totalSales += item.totalPrice;
      }
    });
  });

  const recentOrders = orders.slice(0, 5).map((order) => ({
    ...order,
    items: order.items.filter(
      (item) => item.vendorId.toString() === user._id.toString()
    ),
  }));

  return NextResponse.json({
    stats: {
      totalSales,
      orderCount: orders.length,
      productCount,
    },
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
  });
}
