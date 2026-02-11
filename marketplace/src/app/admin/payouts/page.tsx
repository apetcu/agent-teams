"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { formatPrice, formatDateShort } from "@/lib/utils";

interface Payout {
  vendorId: string;
  storeName: string;
  totalEarnings: number;
  pendingPayout: number;
  lastPayout: string | null;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payouts")
      .then((res) => res.json())
      .then((data) => setPayouts(data.payouts || []))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkPaid(vendorId: string) {
    setPayingId(vendorId);
    try {
      const res = await fetch(`/api/admin/payouts/${vendorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setPayouts((prev) =>
          prev.map((p) =>
            p.vendorId === vendorId
              ? { ...p, pendingPayout: 0, lastPayout: new Date().toISOString() }
              : p
          )
        );
      }
    } catch {
      // silently fail
    } finally {
      setPayingId(null);
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
        Payouts
      </h1>

      {payouts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No vendor payouts to display.</p>
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Vendor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Total Earnings</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Pending Payout</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Last Payout</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr
                    key={payout.vendorId}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {payout.storeName}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatPrice(payout.totalEarnings)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {formatPrice(payout.pendingPayout)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {payout.lastPayout
                        ? formatDateShort(payout.lastPayout)
                        : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        disabled={payout.pendingPayout === 0}
                        loading={payingId === payout.vendorId}
                        onClick={() => handleMarkPaid(payout.vendorId)}
                      >
                        Mark Paid
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
