import dbConnect from "@/lib/db";
import VendorProfile from "@/models/VendorProfile";
import Product from "@/models/Product";
import ProductCard from "@/components/product/ProductCard";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getVendorStore(slug: string) {
  await dbConnect();

  const vendor = await VendorProfile.findOne({ storeSlug: slug, isActive: true }).lean();
  if (!vendor) return null;

  const products = await Product.find({ vendorId: vendor.userId, isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  return {
    vendor: JSON.parse(JSON.stringify(vendor)),
    products: JSON.parse(JSON.stringify(products)),
  };
}

export default async function VendorStorePage({ params }: Props) {
  const { slug } = await params;
  const data = await getVendorStore(slug);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Store not found</h1>
        <Link href="/" className="mt-4 text-sm text-gray-600 hover:text-gray-900">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  const { vendor, products } = data;

  return (
    <div>
      {/* Vendor Banner */}
      <div className="bg-gray-900 text-white">
        {vendor.storeBanner && (
          <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${vendor.storeBanner})` }} />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
              {vendor.storeLogo ? (
                <img src={vendor.storeLogo} alt={vendor.storeName} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold">{vendor.storeName.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{vendor.storeName}</h1>
              {vendor.storeDescription && (
                <p className="mt-1 text-gray-300">{vendor.storeDescription}</p>
              )}
              <p className="mt-1 text-sm text-gray-400">{products.length} products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: vendor.storeName },
          ]}
        />

        <div className="mt-8">
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
              <p className="text-gray-500">No products yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
