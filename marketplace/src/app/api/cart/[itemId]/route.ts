import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Cart from "@/models/Cart";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { itemId } = await params;

  const cart = await Cart.findOne({ userId: session.user.id });
  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  cart.items = cart.items.filter(
    (_: any, index: number) => index.toString() !== itemId
  );

  await cart.save();

  return NextResponse.json({ cart: JSON.parse(JSON.stringify(cart)) });
}
