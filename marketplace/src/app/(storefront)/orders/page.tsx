"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  _id: string;
  items: {
    productId: { name: string; images: string[] };
    quantity: number;
    totalPrice: number;
  }[];
  total: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, "default" | "success" | "warning" | "error"> = {
  pending: "warning",
  paid: "success",
  processing: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/categories"
            className="mt-4 inline-block text-sm font-medium text-gray-900 hover:text-gray-700"
          >
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={statusColors[order.status] || "default"}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {order.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex-shrink-0">
                    {item.productId?.images?.[0] ? (
                      <img
                        src={item.productId.images[0]}
                        alt={item.productId.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-100" />
                    )}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
