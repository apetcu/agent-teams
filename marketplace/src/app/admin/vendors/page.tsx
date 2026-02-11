"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

interface Vendor {
  _id: string;
  storeName: string;
  userId: { name: string; email: string };
  isActive: boolean;
  createdAt: string;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/vendors")
      .then((res) => res.json())
      .then((data) => setVendors(data.vendors || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(vendorId: string, currentActive: boolean) {
    setTogglingId(vendorId);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setVendors((prev) =>
          prev.map((v) =>
            v._id === vendorId ? { ...v, isActive: !currentActive } : v
          )
        );
      }
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
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
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
        Vendors
      </h1>

      {vendors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No vendors registered yet.</p>
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Store Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {vendor.storeName}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {vendor.userId?.name || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {vendor.userId?.email || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={vendor.isActive ? "success" : "error"}>
                        {vendor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant={vendor.isActive ? "danger" : "primary"}
                        loading={togglingId === vendor._id}
                        onClick={() => handleToggle(vendor._id, vendor.isActive)}
                      >
                        {vendor.isActive ? "Deactivate" : "Activate"}
                      </Button>
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
