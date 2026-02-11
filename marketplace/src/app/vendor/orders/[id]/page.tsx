"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderDetail {
  _id: string;
  userId: { name: string; email: string };
  items: {
    productId: { _id: string; name: string; slug: string; images: string[] };
    variantSelections: { name: string; value: string }[];
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
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

const statusFlow = ["processing", "shipped", "delivered"];

export default function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/vendor/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/vendor/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">{error || "Order not found"}</p>
        <Link
          href="/vendor/orders"
          className="mt-4 inline-block text-sm font-medium text-gray-900 hover:text-gray-700"
        >
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = statusFlow.indexOf(order.status);
  const nextStatus =
    currentStatusIndex >= 0 && currentStatusIndex < statusFlow.length - 1
      ? statusFlow[currentStatusIndex + 1]
      : null;

  return (
    <div>
      <Link
        href="/vendor/orders"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusColors[order.status] || "default"}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          {nextStatus && (
            <Button
              size="sm"
              loading={updating}
              onClick={() => updateStatus(nextStatus)}
            >
              Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
            </Button>
          )}
        </div>
      </div>

      {/* Status update dropdown for flexible control */}
      {["processing", "shipped"].includes(order.status) && (
        <Card className="mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Update Status
          </h2>
          <div className="flex items-center gap-3">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) updateStatus(e.target.value);
              }}
              disabled={updating}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="">Change status...</option>
              {statusFlow
                .filter((s) => statusFlow.indexOf(s) > currentStatusIndex)
                .map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
            </select>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4"
            >
              {item.productId?.images?.[0] ? (
                <img
                  src={item.productId.images[0]}
                  alt={item.productId.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-md bg-gray-100" />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {item.productId?.name || "Product"}
                </p>
                {item.variantSelections?.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {item.variantSelections
                      .map((s) => `${s.name}: ${s.value}`)
                      .join(", ")}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Qty: {item.quantity} &times; {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="font-medium text-gray-900">
                {formatPrice(item.totalPrice)}
              </p>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Customer
            </h2>
            <p className="text-sm text-gray-600">
              {order.userId?.name || "Customer"}
            </p>
            {order.userId?.email && (
              <p className="text-sm text-gray-500">{order.userId.email}</p>
            )}
          </Card>

          {/* Shipping */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Shipping Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </Card>

          {/* Summary */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
