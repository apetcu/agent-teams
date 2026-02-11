import Image from "next/image";
import Link from "next/link";

interface VendorCardProps {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  productCount?: number;
}

export default function VendorCard({ name, slug, logo, description, productCount }: VendorCardProps) {
  return (
    <Link
      href={`/store/${slug}`}
      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
        {logo ? (
          <Image src={logo} alt={name} width={48} height={48} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
        {description && (
          <p className="text-xs text-gray-500 truncate">{description}</p>
        )}
        {productCount !== undefined && (
          <p className="text-xs text-gray-400">{productCount} products</p>
        )}
      </div>
    </Link>
  );
}
