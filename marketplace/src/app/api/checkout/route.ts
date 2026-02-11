import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Coupon from "@/models/Coupon";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { shippingAddress, couponCode } = await req.json();

  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.street ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.zip ||
    !shippingAddress?.country
  ) {
    return NextResponse.json(
      { error: "Complete shipping address is required" },
      { status: 400 }
    );
  }

  const cart = await Cart.findOne({ userId: session.user.id });
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Build order items with current prices from DB
  const orderItems = [];
  const lineItems = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: `Product ${cartItem.productId} is no longer available` },
        { status: 400 }
      );
    }

    // Calculate unit price with variant modifiers
    let unitPrice = product.basePrice;
    for (const sel of cartItem.variantSelections) {
      const variant = product.variants.find(
        (v: { name: string }) => v.name === sel.name
      );
      if (variant) {
        const option = variant.options.find(
          (o: { value: string }) => o.value === sel.value
        );
        if (option) {
          unitPrice += option.priceModifier;
        }
      }
    }

    // Verify stock
    if (cartItem.variantSelections.length > 0) {
      for (const sel of cartItem.variantSelections) {
        const variant = product.variants.find(
          (v: { name: string }) => v.name === sel.name
        );
        if (variant) {
          const option = variant.options.find(
            (o: { value: string }) => o.value === sel.value
          );
          if (option && option.stock < cartItem.quantity) {
            return NextResponse.json(
              {
                error: `Insufficient stock for ${product.name} (${sel.name}: ${sel.value})`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    const totalPrice = unitPrice * cartItem.quantity;
    subtotal += totalPrice;

    orderItems.push({
      productId: product._id,
      vendorId: product.vendorId,
      variantSelections: cartItem.variantSelections,
      quantity: cartItem.quantity,
      unitPrice,
      totalPrice,
    });

    const variantDesc = cartItem.variantSelections
      .map((s: { name: string; value: string }) => `${s.name}: ${s.value}`)
      .join(", ");

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: variantDesc || undefined,
          images: product.images.length > 0 ? [product.images[0]] : undefined,
        },
        unit_amount: Math.round(unitPrice * 100),
      },
      quantity: cartItem.quantity,
    });
  }

  // Apply coupon if provided
  let discount = 0;
  let couponId = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid or expired coupon" },
        { status: 400 }
      );
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount for this coupon is $${coupon.minOrderAmount}`,
        },
        { status: 400 }
      );
    }

    if (coupon.type === "percentage") {
      discount = (subtotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, subtotal);
    couponId = coupon._id;
  }

  const total = subtotal - discount;

  // Create pending order
  const order = await Order.create({
    userId: session.user.id,
    items: orderItems,
    subtotal,
    discount,
    total,
    ...(couponId ? { couponUsed: couponId } : {}),
    status: "pending",
    shippingAddress,
  });

  // Create Stripe Checkout session
  const origin = req.headers.get("origin") || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    ...(discount > 0
      ? {
          discounts: [
            {
              coupon: (
                await stripe.coupons.create({
                  amount_off: Math.round(discount * 100),
                  currency: "usd",
                  duration: "once",
                })
              ).id,
            },
          ],
        }
      : {}),
    metadata: {
      orderId: order._id.toString(),
      userId: session.user.id,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel?order_id=${order._id}`,
  });

  // Store Stripe session ID on the order
  order.stripeSessionId = checkoutSession.id;
  await order.save();

  return NextResponse.json({ url: checkoutSession.url });
}
