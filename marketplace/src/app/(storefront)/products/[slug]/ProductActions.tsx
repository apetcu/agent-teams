"use client";

import { useState } from "react";
import VariantSelector from "@/components/product/VariantSelector";
import Button from "@/components/ui/Button";

interface ProductActionsProps {
  product: any;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  function handleSelect(name: string, value: string) {
    setSelections((prev) => ({ ...prev, [name]: value }));
  }

  async function addToCart() {
    setAdding(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          variantSelections: Object.entries(selections).map(([name, value]) => ({
            name,
            value,
          })),
          quantity,
        }),
      });
      alert("Added to cart!");
    } catch {
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  async function addToWishlist() {
    try {
      await fetch(`/api/wishlist/${product._id}`, { method: "POST" });
      alert("Added to wishlist!");
    } catch {
      alert("Failed to add to wishlist");
    }
  }

  const hasVariants = product.variants && product.variants.length > 0;
  const allSelected = hasVariants
    ? product.variants.every((v: any) => selections[v.name])
    : true;

  return (
    <div className="mt-6 space-y-6">
      {hasVariants && (
        <VariantSelector
          variants={product.variants}
          selections={selections}
          onSelect={handleSelect}
        />
      )}

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium text-gray-900 block mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
          >
            -
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={addToCart}
          loading={adding}
          disabled={!allSelected || product.totalStock === 0}
          className="flex-1"
        >
          {product.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
        <Button variant="secondary" onClick={addToWishlist}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
