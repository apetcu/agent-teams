import mongoose, { Schema, Document, Model } from "mongoose";

interface CartItem {
  productId: mongoose.Types.ObjectId;
  variantSelections: { name: string; value: string }[];
  quantity: number;
  priceAtAdd: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: CartItem[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantSelections: [
          {
            name: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
        quantity: { type: Number, required: true, min: 1 },
        priceAtAdd: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
