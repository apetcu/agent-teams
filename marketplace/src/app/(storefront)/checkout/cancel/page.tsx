"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">
        Payment Cancelled
      </h1>
      <p className="text-gray-500 mb-8">
        Your payment was cancelled. Your cart items are still saved — you can try
        again when you&apos;re ready.
      </p>

      <div className="flex gap-4 justify-center">
        <Link href="/cart">
          <Button>Return to Cart</Button>
        </Link>
        <Link href="/categories">
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
