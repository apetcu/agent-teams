"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    storeName: "",
    storeDescription: "",
    contactEmail: "",
    storeLogo: "",
    storeBanner: "",
    payoutDetails: "",
  });

  useEffect(() => {
    fetch("/api/vendor/settings")
      .then((res) => res.json())
      .then((data) => {
        const profile = data.profile || data;
        setForm({
          storeName: profile.storeName || "",
          storeDescription: profile.storeDescription || "",
          contactEmail: profile.contactEmail || "",
          storeLogo: profile.storeLogo || "",
          storeBanner: profile.storeBanner || "",
          payoutDetails: profile.payoutDetails || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaved(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save settings");
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
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
        Store Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Store Profile
          </h2>
          <div className="space-y-4">
            <Input
              label="Store Name"
              id="storeName"
              required
              value={form.storeName}
              onChange={(e) => updateForm("storeName", e.target.value)}
            />
            <div>
              <label
                htmlFor="storeDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Store Description
              </label>
              <textarea
                id="storeDescription"
                rows={4}
                value={form.storeDescription}
                onChange={(e) =>
                  updateForm("storeDescription", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <Input
              label="Contact Email"
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => updateForm("contactEmail", e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Branding
          </h2>
          <div className="space-y-4">
            <div>
              <Input
                label="Store Logo (URL)"
                id="storeLogo"
                value={form.storeLogo}
                onChange={(e) => updateForm("storeLogo", e.target.value)}
                placeholder="https://..."
              />
              {form.storeLogo && (
                <img
                  src={form.storeLogo}
                  alt="Store Logo"
                  className="mt-2 w-16 h-16 rounded-md object-cover border border-gray-200"
                />
              )}
            </div>
            <div>
              <Input
                label="Store Banner (URL)"
                id="storeBanner"
                value={form.storeBanner}
                onChange={(e) => updateForm("storeBanner", e.target.value)}
                placeholder="https://..."
              />
              {form.storeBanner && (
                <img
                  src={form.storeBanner}
                  alt="Store Banner"
                  className="mt-2 w-full h-32 rounded-md object-cover border border-gray-200"
                />
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payout Details
          </h2>
          <div>
            <label
              htmlFor="payoutDetails"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bank / Payout Information
            </label>
            <textarea
              id="payoutDetails"
              rows={3}
              value={form.payoutDetails}
              onChange={(e) => updateForm("payoutDetails", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter your bank account details or payout instructions"
            />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            Save Settings
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600">
              Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
