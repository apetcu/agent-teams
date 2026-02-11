import Link from "next/link";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import VendorProfile from "@/models/VendorProfile";
import ProductCard from "@/components/product/ProductCard";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ImageGallery from "@/components/product/ImageGallery";
import ProductActions from "./ProductActions";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  await dbConnect();

  const product = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .lean();

  if (!product) return null;

  const [vendor, related] = await Promise.all([
    VendorProfile.findOne({ userId: product.vendorId }).lean(),
    Product.find({
      category: product.category?._id || product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .lean(),
  ]);

  return {
    product: JSON.parse(JSON.stringify(product)),
    vendor: vendor ? JSON.parse(JSON.stringify(vendor)) : null,
    related: JSON.parse(JSON.stringify(related)),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Product not found</h1>
        <Link href="/categories" className="mt-4 text-sm text-gray-600 hover:text-gray-900">
          &larr; Continue shopping
        </Link>
      </div>
    );
  }

  const { product, vendor, related } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          ...(product.category
            ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <ImageGallery images={product.images || []} alt={product.name} />

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {formatPrice(product.basePrice)}
          </p>

          {/* Stock */}
          <div className="mt-4">
            {product.totalStock > 0 ? (
              <span className="text-sm text-emerald-600 font-medium">In Stock</span>
            ) : (
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Variant Selectors + Add to Cart (client component) */}
          <ProductActions product={product} />

          {/* Description */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Description</h2>
            <div className="prose prose-sm text-gray-600 max-w-none">
              {product.description}
            </div>
          </div>

          {/* Vendor Card */}
          {vendor && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <Link
                href={`/store/${vendor.storeSlug}`}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {vendor.storeName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{vendor.storeName}</p>
                  <p className="text-xs text-gray-500">Visit store &rarr;</p>
                </div>
              </Link>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-8">
            Related Products
          </h2>
          <ProductGrid>
            {related.map((p: any) => (
              <ProductCard
                key={p._id}
                name={p.name}
                slug={p.slug}
                price={p.basePrice}
                image={p.images?.[0] || "/placeholder.svg"}
              />
            ))}
          </ProductGrid>
        </section>
      )}
    </div>
  );
}
