"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { formatPrice, formatDateShort } from "@/lib/utils";

interface VendorOrder {
  _id: string;
  userId: { name: string; email: string };
  items: {
    productId: { name: string };
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

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/orders")
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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
        Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No orders yet.</p>
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Items
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/vendor/orders/${order._id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.userId?.name || order.userId?.email || "Customer"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.items
                        .map(
                          (item) =>
                            `${item.productId?.name || "Product"} (x${item.quantity})`
                        )
                        .join(", ")}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={statusColors[order.status] || "default"}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDateShort(order.createdAt)}
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
