import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  image: string;
  vendor?: string;
  vendorSlug?: string;
  className?: string;
}

export default function ProductCard({
  name,
  slug,
  price,
  image,
  vendor,
  vendorSlug,
  className,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className={cn("group block", className)}>
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={image}
          alt={name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
        {vendor && vendorSlug && (
          <p className="mt-0.5 text-xs text-gray-500">
            by{" "}
            <Link
              href={`/store/${vendorSlug}`}
              className="hover:text-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {vendor}
            </Link>
          </p>
        )}
        <p className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}
