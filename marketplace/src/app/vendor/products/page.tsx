"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  images: string[];
  basePrice: number;
  totalStock: number;
  isActive: boolean;
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/vendor/products/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Products
        </h1>
        <Link href="/vendor/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No products yet.</p>
          <Link
            href="/vendor/products/new"
            className="mt-4 inline-block text-sm text-gray-900 hover:text-gray-700"
          >
            Create your first product &rarr;
          </Link>
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Image
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Stock
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 px-4">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatPrice(product.basePrice)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.totalStock}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={product.isActive ? "success" : "default"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/vendor/products/${product._id}/edit`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
