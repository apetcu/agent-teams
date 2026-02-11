import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import ProductCard from "@/components/product/ProductCard";
import ProductGrid from "@/components/product/ProductGrid";
import Link from "next/link";

export default async function WishlistPage() {
  const session = await auth();
  await dbConnect();

  const user = await User.findById(session?.user?.id)
    .populate({
      path: "wishlist",
      match: { isActive: true },
      select: "name slug images basePrice",
    })
    .lean();

  const products = user ? JSON.parse(JSON.stringify(user.wishlist || [])) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">
        Wishlist
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="mt-4 text-gray-500">Your wishlist is empty</p>
          <Link href="/categories" className="mt-4 inline-block text-sm text-gray-900 hover:text-gray-700">
            Discover Products &rarr;
          </Link>
        </div>
      ) : (
        <ProductGrid>
          {products.map((product: any) => (
            <ProductCard
              key={product._id}
              name={product.name}
              slug={product.slug}
              price={product.basePrice}
              image={product.images?.[0] || "/placeholder.svg"}
            />
          ))}
        </ProductGrid>
      )}
    </div>
  );
}
