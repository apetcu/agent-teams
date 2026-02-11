"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  parent: string | null;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    parent: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }

  function resetForm() {
    setForm({ name: "", description: "", image: "", parent: "" });
    setEditingId(null);
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      parent: cat.parent || "",
    });
    setEditingId(cat._id);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = editingId
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          image: form.image || null,
          parent: form.parent || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingId) {
          setCategories((prev) =>
            prev.map((c) => (c._id === editingId ? data.category : c))
          );
        } else {
          setCategories((prev) => [...prev, data.category]);
        }
        setModalOpen(false);
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save category");
      }
    } catch {
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
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
          Categories
        </h1>
        <Button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
        >
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No categories yet.</p>
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="mt-4 inline-block text-sm text-gray-900 hover:text-gray-700"
          >
            Create your first category &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat._id}>
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-32 object-cover rounded-md mb-3 border border-gray-200"
                />
              )}
              <h3 className="font-medium text-gray-900">{cat.name}</h3>
              {cat.description && (
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
              )}
              {cat.parent && (
                <p className="text-xs text-gray-400 mt-1">
                  Parent: {categories.find((c) => c._id === cat.parent)?.name || cat.parent}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="secondary" onClick={() => openEdit(cat)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={deletingId === cat._id}
                  onClick={() => handleDelete(cat._id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Category" : "Create Category"}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            id="cat-name"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Category name"
          />
          <div>
            <label
              htmlFor="cat-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="cat-description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>
          <Input
            label="Image URL"
            id="cat-image"
            value={form.image}
            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
            placeholder="https://..."
          />
          <div>
            <label
              htmlFor="cat-parent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parent Category
            </label>
            <select
              id="cat-parent"
              value={form.parent}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, parent: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="">None (Top Level)</option>
              {categories
                .filter((c) => c._id !== editingId)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {editingId ? "Save Changes" : "Create Category"}
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
