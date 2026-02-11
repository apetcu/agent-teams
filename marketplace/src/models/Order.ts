import mongoose, { Schema, Document, Model } from "mongoose";

interface OrderItem {
  productId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  variantSelections: { name: string; value: string }[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponUsed?: mongoose.Types.ObjectId;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        variantSelections: [
          {
            name: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponUsed: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    stripePaymentIntentId: { type: String },
    stripeSessionId: { type: String },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
