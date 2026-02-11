import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
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

  const completedOrders = await Order.find({ status: "delivered" }).lean();

  const vendorEarnings: Record<string, number> = {};
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const vendorId = item.vendorId.toString();
      vendorEarnings[vendorId] = (vendorEarnings[vendorId] || 0) + item.totalPrice;
    });
  });

  const vendorIds = Object.keys(vendorEarnings);
  const vendors = await VendorProfile.find({ userId: { $in: vendorIds } })
    .populate("userId", "name email")
    .lean();

  const payouts = vendors.map((vendor) => ({
    vendor: JSON.parse(JSON.stringify(vendor)),
    totalEarnings: vendorEarnings[vendor.userId.toString()] || 0,
  }));

  return NextResponse.json({ payouts });
}
