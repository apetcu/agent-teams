import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import VendorProfile from "@/models/VendorProfile";

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

  const [totalOrders, totalUsers, totalVendors, totalProducts, completedOrders, recentOrders] =
    await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      VendorProfile.countDocuments(),
      Product.countDocuments(),
      Order.find({ status: "delivered" }).lean(),
      Order.find()
        .populate("userId", "name email image")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

  return NextResponse.json({
    stats: {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalVendors,
      totalProducts,
    },
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
  });
}
