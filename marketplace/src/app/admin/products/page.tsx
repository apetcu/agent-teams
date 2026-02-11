"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  images: string[];
  vendorId: { storeName: string };
  price: number;
  stock: number;
  status: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  function fetchProducts() {
    setLoading(true);
    fetch(`/api/admin/products?page=${page}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  async function handleDelete(productId: string) {
    if (!confirm("Are you sure you want to remove this product?")) return;
    setDeletingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  }

  const statusColors: Record<string, "default" | "success" | "warning" | "error"> = {
    active: "success",
    draft: "default",
    archived: "error",
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
        Products
      </h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3 max-w-md">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.vendorId?.storeName || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.stock}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColors[product.status] || "default"}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === product._id}
                        onClick={() => handleDelete(product._id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
