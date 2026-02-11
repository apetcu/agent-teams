"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { formatPrice, formatDateShort } from "@/lib/utils";

interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function VendorCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  function fetchCoupons() {
    fetch("/api/vendor/coupons")
      .then((res) => res.json())
      .then((data) => setCoupons(data.coupons || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }

  function resetForm() {
    setForm({
      code: "",
      type: "percentage",
      value: "",
      minOrderAmount: "",
      maxUses: "",
      expiresAt: "",
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/vendor/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value:
            form.type === "fixed"
              ? Math.round(parseFloat(form.value) * 100)
              : parseFloat(form.value),
          minOrderAmount: form.minOrderAmount
            ? Math.round(parseFloat(form.minOrderAmount) * 100)
            : 0,
          maxUses: form.maxUses ? parseInt(form.maxUses) : 0,
          expiresAt: form.expiresAt || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) => [data.coupon, ...prev]);
        setModalOpen(false);
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create coupon");
      }
    } catch {
      alert("Failed to create coupon");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    const res = await fetch(`/api/vendor/coupons/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c._id !== id));
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
          Coupons
        </h1>
        <Button onClick={() => setModalOpen(true)}>Create Coupon</Button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No coupons yet.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 inline-block text-sm text-gray-900 hover:text-gray-700"
          >
            Create your first coupon &rarr;
          </button>
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Value
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Min Order
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Usage
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Expires
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
                {coupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-gray-900">
                      {coupon.code}
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">
                      {coupon.type}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : formatPrice(coupon.value)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {coupon.minOrderAmount
                        ? formatPrice(coupon.minOrderAmount)
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {coupon.expiresAt
                        ? formatDateShort(coupon.expiresAt)
                        : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={coupon.isActive ? "success" : "default"}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(coupon._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Coupon Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="Create Coupon"
        className="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Coupon Code"
            id="coupon-code"
            required
            value={form.code}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, code: e.target.value }))
            }
            placeholder="e.g. SUMMER20"
          />
          <div>
            <label
              htmlFor="coupon-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type
            </label>
            <select
              id="coupon-type"
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  type: e.target.value as "percentage" | "fixed",
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <Input
            label={form.type === "percentage" ? "Value (%)" : "Value ($)"}
            id="coupon-value"
            type="number"
            step={form.type === "percentage" ? "1" : "0.01"}
            min="0"
            required
            value={form.value}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, value: e.target.value }))
            }
          />
          <Input
            label="Minimum Order Amount ($)"
            id="coupon-min"
            type="number"
            step="0.01"
            min="0"
            value={form.minOrderAmount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))
            }
            placeholder="Leave empty for no minimum"
          />
          <Input
            label="Max Uses"
            id="coupon-max-uses"
            type="number"
            min="0"
            value={form.maxUses}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, maxUses: e.target.value }))
            }
            placeholder="Leave empty for unlimited"
          />
          <Input
            label="Expires At"
            id="coupon-expires"
            type="date"
            value={form.expiresAt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, expiresAt: e.target.value }))
            }
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={creating}>
              Create Coupon
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
