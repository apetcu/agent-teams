import Link from "next/link";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

async function getCategories() {
  await dbConnect();
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">
        All Categories
      </h1>
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category: any) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center p-8 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-16 w-16 object-contain mb-4"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-2xl text-gray-400">{category.name.charAt(0)}</span>
                </div>
              )}
              <h2 className="text-sm font-medium text-gray-900 text-center">{category.name}</h2>
              {category.description && (
                <p className="mt-1 text-xs text-gray-500 text-center line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No categories yet.</p>
        </div>
      )}
    </div>
  );
}
