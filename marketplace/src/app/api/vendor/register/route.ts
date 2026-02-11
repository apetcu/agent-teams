import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import VendorProfile from "@/models/VendorProfile";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "vendor") {
    return NextResponse.json(
      { error: "Already registered as a vendor" },
      { status: 400 }
    );
  }

  const { storeName, storeDescription, contactEmail } = await req.json();

  if (!storeName || !contactEmail) {
    return NextResponse.json(
      { error: "storeName and contactEmail are required" },
      { status: 400 }
    );
  }

  const storeSlug = slugify(storeName);

  const existingStore = await VendorProfile.findOne({ storeSlug });
  if (existingStore) {
    return NextResponse.json(
      { error: "A store with this name already exists" },
      { status: 409 }
    );
  }

  const vendorProfile = await VendorProfile.create({
    userId: user._id,
    storeName,
    storeSlug,
    storeDescription,
    contactEmail,
  });

  user.role = "vendor";
  await user.save();

  return NextResponse.json(
    { vendorProfile: JSON.parse(JSON.stringify(vendorProfile)) },
    { status: 201 }
  );
}
