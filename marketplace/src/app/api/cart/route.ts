import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const cart = await Cart.findOne({ userId: session.user.id })
    .populate("items.productId", "name slug images basePrice variants isActive")
    .lean();

  return NextResponse.json({ cart: cart ? JSON.parse(JSON.stringify(cart)) : { items: [] } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { productId, variantSelections, quantity } = await req.json();

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Calculate price with variant modifiers
  let price = product.basePrice;
  if (variantSelections && variantSelections.length > 0) {
    for (const selection of variantSelections) {
      const variant = product.variants.find((v: any) => v.name === selection.name);
      if (variant) {
        const option = variant.options.find((o: any) => o.value === selection.value);
        if (option) {
          price += option.priceModifier;
        }
      }
    }
  }

  let cart = await Cart.findOne({ userId: session.user.id });

  if (!cart) {
    cart = new Cart({
      userId: session.user.id,
      items: [],
    });
  }

  // Check if item with same product and variant selections exists
  const existingIndex = cart.items.findIndex(
    (item: any) =>
      item.productId.toString() === productId &&
      JSON.stringify(item.variantSelections) === JSON.stringify(variantSelections || [])
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity || 1;
  } else {
    cart.items.push({
      productId,
      variantSelections: variantSelections || [],
      quantity: quantity || 1,
      priceAtAdd: price,
    });
  }

  await cart.save();

  return NextResponse.json({ cart: JSON.parse(JSON.stringify(cart)) });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { itemIndex, quantity } = await req.json();

  const cart = await Cart.findOne({ userId: session.user.id });
  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  if (itemIndex < 0 || itemIndex >= cart.items.length) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();

  return NextResponse.json({ cart: JSON.parse(JSON.stringify(cart)) });
}
