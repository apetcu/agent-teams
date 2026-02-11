"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { formatPrice, formatDateShort } from "@/lib/utils";

interface DashboardData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  activeCoupons: number;
  recentOrders: {
    _id: string;
    userId: { name: string; email: string };
    total: number;
    status: string;
    createdAt: string;
  }[];
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

export default function VendorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  const stats = [
    { label: "Total Sales", value: formatPrice(data?.totalSales || 0) },
    { label: "Total Orders", value: String(data?.totalOrders || 0) },
    { label: "Total Products", value: String(data?.totalProducts || 0) },
    { label: "Active Coupons", value: String(data?.activeCoupons || 0) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Orders
          </h2>
          <Link
            href="/vendor/orders"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            View all &rarr;
          </Link>
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Order
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Customer
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
                {(data?.recentOrders || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-gray-500"
                    >
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  data?.recentOrders.map((order) => (
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
                        {order.userId?.name ||
                          order.userId?.email ||
                          "Customer"}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
