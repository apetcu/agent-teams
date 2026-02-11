import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { productId } = await params;

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const index = user.wishlist.findIndex(
    (id: any) => id.toString() === productId
  );

  if (index > -1) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(new mongoose.Types.ObjectId(productId));
  }

  await user.save();

  return NextResponse.json({
    wishlisted: index === -1,
    wishlist: JSON.parse(JSON.stringify(user.wishlist)),
  });
}
