import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import ProductGrid from "@/components/product/ProductGrid";
import VendorCard from "@/components/vendor/VendorCard";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import VendorProfile from "@/models/VendorProfile";

async function getFeaturedData() {
  await dbConnect();

  const [products, categories, vendors] = await Promise.all([
    Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Category.find({ parentCategory: null })
      .limit(6)
      .lean(),
    VendorProfile.find({ isActive: true })
      .limit(4)
      .lean(),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    categories: JSON.parse(JSON.stringify(categories)),
    vendors: JSON.parse(JSON.stringify(vendors)),
  };
}

export default async function HomePage() {
  const { products, categories, vendors } = await getFeaturedData();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Discover unique products from independent vendors
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Shop from a curated collection of products across multiple categories, all in one place.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/categories"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/vendor/register"
                className="inline-flex items-center px-6 py-3 border border-gray-400 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Shop by Category
            </h2>
            <Link href="/categories" className="text-sm text-gray-600 hover:text-gray-900">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat: any) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="h-12 w-12 object-contain mb-3" />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mb-3" />
                )}
                <span className="text-sm font-medium text-gray-900 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            New Arrivals
          </h2>
          <Link href="/categories" className="text-sm text-gray-600 hover:text-gray-900">
            View all &rarr;
          </Link>
        </div>
        {products.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Shop by Vendor */}
      {vendors.length > 0 && (
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-8">
              Shop by Vendor
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vendors.map((vendor: any) => (
                <VendorCard
                  key={vendor._id}
                  name={vendor.storeName}
                  slug={vendor.storeSlug}
                  logo={vendor.storeLogo}
                  description={vendor.storeDescription}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
