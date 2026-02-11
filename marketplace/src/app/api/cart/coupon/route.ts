import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { code, subtotal } = await req.json();

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiresAt: { $gt: new Date() },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
  }

  if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
    return NextResponse.json(
      { error: `Minimum order amount is $${(coupon.minOrderAmount / 100).toFixed(2)}` },
      { status: 400 }
    );
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = Math.round(subtotal * (coupon.value / 100));
  } else {
    discount = coupon.value;
  }

  return NextResponse.json({
    coupon: JSON.parse(JSON.stringify(coupon)),
    discount,
  });
}
