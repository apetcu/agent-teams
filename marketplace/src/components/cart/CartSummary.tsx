"use client";

import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string;
  onCouponChange: (code: string) => void;
  onApplyCoupon: () => void;
  couponError?: string;
  couponApplied?: boolean;
}

export default function CartSummary({
  subtotal,
  discount,
  total,
  couponCode,
  onCouponChange,
  onApplyCoupon,
  couponError,
  couponApplied,
}: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Coupon */}
      <div className="mt-6">
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Coupon Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponChange(e.target.value)}
            placeholder="Enter code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <Button size="sm" variant="secondary" onClick={onApplyCoupon}>
            Apply
          </Button>
        </div>
        {couponError && (
          <p className="mt-1 text-xs text-red-600">{couponError}</p>
        )}
        {couponApplied && (
          <p className="mt-1 text-xs text-emerald-600">Coupon applied!</p>
        )}
      </div>

      <div className="mt-6">
        <Link href="/checkout">
          <Button className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
