"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  index: number;
  product: {
    name: string;
    slug: string;
    images: string[];
  };
  variantSelections: { name: string; value: string }[];
  quantity: number;
  priceAtAdd: number;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
}

export default function CartItem({
  index,
  product,
  variantSelections,
  quantity,
  priceAtAdd,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          width={96}
          height={96}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>

        {variantSelections.length > 0 && (
          <p className="mt-0.5 text-xs text-gray-500">
            {variantSelections.map((v) => `${v.name}: ${v.value}`).join(", ")}
          </p>
        )}

        <p className="mt-1 text-sm font-semibold text-gray-900">
          {formatPrice(priceAtAdd)}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(index, quantity - 1)}
              className="w-7 h-7 border border-gray-300 rounded text-sm flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(index, quantity + 1)}
              className="w-7 h-7 border border-gray-300 rounded text-sm flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(index)}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="text-sm font-semibold text-gray-900">
        {formatPrice(priceAtAdd * quantity)}
      </div>
    </div>
  );
}
