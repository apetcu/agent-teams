import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import VendorProfile from "@/models/VendorProfile";

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

  const vendorProfile = await VendorProfile.findOne({ userId: user._id }).lean();
  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Vendor profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    vendorProfile: JSON.parse(JSON.stringify(vendorProfile)),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || (user.role !== "vendor" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const vendorProfile = await VendorProfile.findOne({ userId: user._id });
  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Vendor profile not found" },
      { status: 404 }
    );
  }

  const updates = await req.json();
  const allowedFields = [
    "storeName",
    "storeDescription",
    "storeLogo",
    "storeBanner",
    "contactEmail",
    "payoutDetails",
  ];

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      (vendorProfile as any)[key] = updates[key];
    }
  }

  await vendorProfile.save();

  return NextResponse.json({
    vendorProfile: JSON.parse(JSON.stringify(vendorProfile)),
  });
}
