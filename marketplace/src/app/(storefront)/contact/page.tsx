"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSent(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">
        Contact Us
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {sent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-emerald-900">Message Sent!</h2>
              <p className="mt-2 text-sm text-emerald-700">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-sm text-emerald-600 hover:text-emerald-800"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                id="name"
                required
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
              />
              <Input
                label="Email"
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
              />
              <Input
                label="Subject"
                id="subject"
                required
                value={form.subject}
                onChange={(e) => updateForm("subject", e.target.value)}
              />
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => updateForm("message", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <Button type="submit" loading={loading}>
                Send Message
              </Button>
            </form>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Get in Touch</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900">Email</h3>
              <p>support@marketplace.com</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Hours</h3>
              <p>Monday - Friday, 9am - 5pm EST</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">FAQ</h2>
            <div className="space-y-4">
              {[
                { q: "How do I become a vendor?", a: "Click 'Become a Vendor' on the homepage and fill out the registration form." },
                { q: "What payment methods are accepted?", a: "We accept all major credit and debit cards through Stripe." },
                { q: "How long does shipping take?", a: "Shipping times vary by vendor. Check the product page for details." },
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900">{faq.q}</h3>
                  <p className="mt-1 text-sm text-gray-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
