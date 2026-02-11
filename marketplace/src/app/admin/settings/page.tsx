"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteName: "",
    commissionRate: "",
    contactEmail: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        const settings = data.settings || data;
        setForm({
          siteName: settings.siteName || "",
          commissionRate: settings.commissionRate?.toString() || "",
          contactEmail: settings.contactEmail || "",
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
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: form.siteName,
          commissionRate: parseFloat(form.commissionRate) || 0,
          contactEmail: form.contactEmail,
        }),
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
        Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Site Configuration
          </h2>
          <div className="space-y-4">
            <Input
              label="Site Name"
              id="siteName"
              required
              value={form.siteName}
              onChange={(e) => updateForm("siteName", e.target.value)}
              placeholder="My Marketplace"
            />
            <Input
              label="Commission Rate (%)"
              id="commissionRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={form.commissionRate}
              onChange={(e) => updateForm("commissionRate", e.target.value)}
              placeholder="e.g. 10"
            />
            <Input
              label="Contact Email"
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => updateForm("contactEmail", e.target.value)}
              placeholder="admin@marketplace.com"
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
