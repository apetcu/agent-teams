import mongoose, { Schema, Document, Model } from "mongoose";

interface VariantOption {
  value: string;
  priceModifier: number;
  sku: string;
  stock: number;
}

interface Variant {
  name: string;
  options: VariantOption[];
}

export interface IProduct extends Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  basePrice: number;
  images: string[];
  variants: Variant[];
  totalStock: number;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    basePrice: { type: Number, required: true },
    images: [{ type: String }],
    variants: [
      {
        name: { type: String, required: true },
        options: [
          {
            value: { type: String, required: true },
            priceModifier: { type: Number, default: 0 },
            sku: { type: String },
            stock: { type: Number, default: 0 },
          },
        ],
      },
    ],
    totalStock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ProductSchema.pre("save", function () {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce(
      (total, variant) =>
        total + variant.options.reduce((sum, opt) => sum + opt.stock, 0),
      0
    );
  }
});

ProductSchema.index({ name: "text", description: "text", tags: "text" });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
