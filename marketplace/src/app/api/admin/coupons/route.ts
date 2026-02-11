import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Coupon from "@/models/Coupon";

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

  const coupons = await Coupon.find({ vendorId: null })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ coupons: JSON.parse(JSON.stringify(coupons)) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code, type, value, minOrderAmount, maxUses, expiresAt } =
    await req.json();

  if (!code || !type || value == null || !expiresAt) {
    return NextResponse.json(
      { error: "code, type, value, and expiresAt are required" },
      { status: 400 }
    );
  }

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return NextResponse.json(
      { error: "A coupon with this code already exists" },
      { status: 409 }
    );
  }

  const coupon = await Coupon.create({
    code,
    type,
    value,
    minOrderAmount: minOrderAmount || 0,
    maxUses: maxUses || 0,
    expiresAt: new Date(expiresAt),
  });

  return NextResponse.json(
    { coupon: JSON.parse(JSON.stringify(coupon)) },
    { status: 201 }
  );
}
