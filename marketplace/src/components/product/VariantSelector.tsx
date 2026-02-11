"use client";

interface VariantOption {
  value: string;
  priceModifier: number;
  stock: number;
}

interface Variant {
  name: string;
  options: VariantOption[];
}

interface VariantSelectorProps {
  variants: Variant[];
  selections: Record<string, string>;
  onSelect: (name: string, value: string) => void;
}

export default function VariantSelector({
  variants,
  selections,
  onSelect,
}: VariantSelectorProps) {
  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <div key={variant.name}>
          <h3 className="text-sm font-medium text-gray-900 mb-2">{variant.name}</h3>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selections[variant.name] === option.value;
              const isOutOfStock = option.stock === 0;

              return (
                <button
                  key={option.value}
                  onClick={() => !isOutOfStock && onSelect(variant.name, option.value)}
                  disabled={isOutOfStock}
                  className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                    isSelected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : isOutOfStock
                      ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:border-gray-900"
                  }`}
                >
                  {option.value}
                  {option.priceModifier > 0 && (
                    <span className="ml-1 text-xs opacity-75">
                      (+${(option.priceModifier / 100).toFixed(2)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
