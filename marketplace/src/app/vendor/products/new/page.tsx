"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

interface VariantOption {
  value: string;
  priceModifier: number;
  sku: string;
  stock: number;
}

interface VariantGroup {
  name: string;
  options: VariantOption[];
}

interface Category {
  _id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    basePrice: "",
    tags: "",
    images: [] as string[],
  });
  const [variants, setVariants] = useState<VariantGroup[]>([]);
  const [imageInput, setImageInput] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addVariantGroup() {
    setVariants((prev) => [
      ...prev,
      { name: "", options: [{ value: "", priceModifier: 0, sku: "", stock: 0 }] },
    ]);
  }

  function removeVariantGroup(groupIndex: number) {
    setVariants((prev) => prev.filter((_, i) => i !== groupIndex));
  }

  function updateVariantGroupName(groupIndex: number, name: string) {
    setVariants((prev) =>
      prev.map((g, i) => (i === groupIndex ? { ...g, name } : g))
    );
  }

  function addVariantOption(groupIndex: number) {
    setVariants((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              options: [
                ...g.options,
                { value: "", priceModifier: 0, sku: "", stock: 0 },
              ],
            }
          : g
      )
    );
  }

  function removeVariantOption(groupIndex: number, optionIndex: number) {
    setVariants((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? { ...g, options: g.options.filter((_, j) => j !== optionIndex) }
          : g
      )
    );
  }

  function updateVariantOption(
    groupIndex: number,
    optionIndex: number,
    field: string,
    value: string | number
  ) {
    setVariants((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              options: g.options.map((o, j) =>
                j === optionIndex ? { ...o, [field]: value } : o
              ),
            }
          : g
      )
    );
  }

  function addImage() {
    if (imageInput.trim()) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, imageInput.trim()],
      }));
      setImageInput("");
    }
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          basePrice: Math.round(parseFloat(form.basePrice) * 100),
          images: form.images,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          variants: variants.filter((v) => v.name && v.options.length > 0),
        }),
      });

      if (res.ok) {
        router.push("/vendor/products");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create product");
      }
    } catch {
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
        New Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Info
          </h2>
          <div className="space-y-4">
            <Input
              label="Product Name"
              id="name"
              required
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
            />
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                required
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Base Price ($)"
              id="basePrice"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.basePrice}
              onChange={(e) => updateForm("basePrice", e.target.value)}
            />
            <Input
              label="Tags (comma-separated)"
              id="tags"
              value={form.tags}
              onChange={(e) => updateForm("tags", e.target.value)}
              placeholder="e.g. summer, sale, new"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
          <div className="flex gap-2 mb-4">
            <Input
              id="imageUrl"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="Enter image URL"
            />
            <Button type="button" variant="secondary" onClick={addImage}>
              Add
            </Button>
          </div>
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.images.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Product ${i + 1}`}
                    className="w-20 h-20 rounded-md object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addVariantGroup}
            >
              Add Variant Group
            </Button>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-gray-500">
              No variants added. Click &quot;Add Variant Group&quot; to add
              size, color, etc.
            </p>
          ) : (
            <div className="space-y-6">
              {variants.map((group, gi) => (
                <div
                  key={gi}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 mr-3">
                      <Input
                        id={`variant-group-${gi}`}
                        value={group.name}
                        onChange={(e) =>
                          updateVariantGroupName(gi, e.target.value)
                        }
                        placeholder='Variant name (e.g. "Size", "Color")'
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariantGroup(gi)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    {group.options.map((option, oi) => (
                      <div
                        key={oi}
                        className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end"
                      >
                        <Input
                          id={`opt-val-${gi}-${oi}`}
                          label={oi === 0 ? "Value" : undefined}
                          value={option.value}
                          onChange={(e) =>
                            updateVariantOption(gi, oi, "value", e.target.value)
                          }
                          placeholder="e.g. Large"
                        />
                        <Input
                          id={`opt-price-${gi}-${oi}`}
                          label={oi === 0 ? "Price +/-" : undefined}
                          type="number"
                          step="0.01"
                          value={String(option.priceModifier)}
                          onChange={(e) =>
                            updateVariantOption(
                              gi,
                              oi,
                              "priceModifier",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                        <Input
                          id={`opt-sku-${gi}-${oi}`}
                          label={oi === 0 ? "SKU" : undefined}
                          value={option.sku}
                          onChange={(e) =>
                            updateVariantOption(gi, oi, "sku", e.target.value)
                          }
                        />
                        <Input
                          id={`opt-stock-${gi}-${oi}`}
                          label={oi === 0 ? "Stock" : undefined}
                          type="number"
                          min="0"
                          value={String(option.stock)}
                          onChange={(e) =>
                            updateVariantOption(
                              gi,
                              oi,
                              "stock",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantOption(gi, oi)}
                          className="text-sm text-red-600 hover:text-red-800 pb-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addVariantOption(gi)}
                    className="mt-3 text-sm text-gray-600 hover:text-gray-900"
                  >
                    + Add Option
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Create Product
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/vendor/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
