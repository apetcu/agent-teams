import Link from "next/link";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import ProductCard from "@/components/product/ProductCard";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CategoryFilters from "./CategoryFilters";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string; page?: string }>;
}

async function getCategoryData(slug: string, searchParams: any) {
  await dbConnect();

  const category = await Category.findOne({ slug }).lean();
  if (!category) return { category: null, products: [], total: 0, totalPages: 0, page: 1 };

  const filter: any = {
    category: category._id,
    isActive: true,
  };

  if (searchParams.minPrice) filter.basePrice = { ...filter.basePrice, $gte: parseInt(searchParams.minPrice) };
  if (searchParams.maxPrice) filter.basePrice = { ...filter.basePrice, $lte: parseInt(searchParams.maxPrice) };

  const sortOptions: Record<string, any> = {
    newest: { createdAt: -1 },
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
  };

  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const sort = sortOptions[searchParams.sort || "newest"] || sortOptions.newest;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return {
    category: JSON.parse(JSON.stringify(category)),
    products: JSON.parse(JSON.stringify(products)),
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const { category, products, total, totalPages, page } = await getCategoryData(slug, sp);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Category not found</h1>
        <Link href="/categories" className="mt-4 text-sm text-gray-600 hover:text-gray-900">
          &larr; Back to categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 text-gray-500">{category.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-400">{total} products</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <CategoryFilters />
        </aside>

        {/* Products */}
        <div className="flex-1">
          {products.length > 0 ? (
            <>
              <ProductGrid columns={3}>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/categories/${slug}?page=${p}&sort=${sp.sort || "newest"}`}
                      className={`px-3 py-1 rounded-md text-sm ${
                        p === page
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
