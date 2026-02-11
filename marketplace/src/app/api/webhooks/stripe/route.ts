import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  await dbConnect();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) break;

      const order = await Order.findById(orderId);
      if (!order) break;

      order.status = "paid";
      order.stripePaymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      await order.save();

      // Deduct inventory
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        for (const sel of item.variantSelections) {
          const variant = product.variants.find(
            (v: { name: string }) => v.name === sel.name
          );
          if (variant) {
            const option = variant.options.find(
              (o: { value: string }) => o.value === sel.value
            );
            if (option) {
              option.stock = Math.max(0, option.stock - item.quantity);
            }
          }
        }

        await product.save();
      }

      // Increment coupon usage
      if (order.couponUsed) {
        await Coupon.findByIdAndUpdate(order.couponUsed, {
          $inc: { usedCount: 1 },
        });
      }

      // Clear the user's cart
      await Cart.findOneAndDelete({ userId: order.userId });

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { status: "cancelled" });
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (paymentIntentId) {
        await Order.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntentId },
          { status: "refunded" }
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
