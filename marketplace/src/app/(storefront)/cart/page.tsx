"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Spinner from "@/components/ui/Spinner";

interface CartData {
  items: {
    productId: any;
    variantSelections: { name: string; value: string }[];
    quantity: number;
    priceAtAdd: number;
  }[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCart(data.cart);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(index: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIndex: index, quantity }),
    });
    const data = await res.json();
    setCart(data.cart);
  }

  async function removeItem(index: number) {
    const res = await fetch(`/api/cart/${index}`, { method: "DELETE" });
    const data = await res.json();
    setCart(data.cart);
  }

  async function applyCoupon() {
    setCouponError("");
    setCouponApplied(false);

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const res = await fetch("/api/cart/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });

    const data = await res.json();
    if (!res.ok) {
      setCouponError(data.error);
      return;
    }

    setDiscount(data.discount);
    setCouponApplied(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="mt-4 text-gray-500">Your cart is empty</p>
          <Link
            href="/categories"
            className="mt-4 inline-block text-sm font-medium text-gray-900 hover:text-gray-700"
          >
            Continue Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {items.map((item, index) => (
              <CartItem
                key={index}
                index={index}
                product={item.productId}
                variantSelections={item.variantSelections}
                quantity={item.quantity}
                priceAtAdd={item.priceAtAdd}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div>
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              total={total}
              couponCode={couponCode}
              onCouponChange={setCouponCode}
              onApplyCoupon={applyCoupon}
              couponError={couponError}
              couponApplied={couponApplied}
            />
          </div>
        </div>
      )}
    </div>
  );
}
