"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  productId: { _id: string; name: string; images: string[]; basePrice: number };
  variantSelections: { name: string; value: string }[];
  quantity: number;
  priceAtAdd: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [shipping, setShipping] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setCart(data.cart))
      .catch(() => setCart({ items: [] }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: shipping,
          couponCode: sessionStorage.getItem("couponCode") || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout failed");
        setSubmitting(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                id="fullName"
                value={shipping.fullName}
                onChange={(e) =>
                  setShipping({ ...shipping, fullName: e.target.value })
                }
                required
              />
              <Input
                label="Street Address"
                id="street"
                value={shipping.street}
                onChange={(e) =>
                  setShipping({ ...shipping, street: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  id="city"
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping({ ...shipping, city: e.target.value })
                  }
                  required
                />
                <Input
                  label="State"
                  id="state"
                  value={shipping.state}
                  onChange={(e) =>
                    setShipping({ ...shipping, state: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  id="zip"
                  value={shipping.zip}
                  onChange={(e) =>
                    setShipping({ ...shipping, zip: e.target.value })
                  }
                  required
                />
                <Input
                  label="Country"
                  id="country"
                  value={shipping.country}
                  onChange={(e) =>
                    setShipping({ ...shipping, country: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.productId.name} x {item.quantity}
                      </p>
                      {item.variantSelections.length > 0 && (
                        <p className="text-gray-500">
                          {item.variantSelections
                            .map((s) => `${s.name}: ${s.value}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-900">
                      {formatPrice(item.priceAtAdd * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-sm font-medium text-gray-900">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                loading={submitting}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
