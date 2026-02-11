"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
        <p className="ml-3 text-gray-500">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="bg-emerald-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">
        Order Confirmed!
      </h1>
      <p className="text-gray-500 mb-8">
        Thank you for your purchase. You will receive an email confirmation
        shortly.
      </p>

      {sessionId && (
        <p className="text-sm text-gray-400 mb-8">
          Session: {sessionId.slice(0, 20)}...
        </p>
      )}

      <div className="flex gap-4 justify-center">
        <Link href="/orders">
          <Button>View Orders</Button>
        </Link>
        <Link href="/categories">
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
