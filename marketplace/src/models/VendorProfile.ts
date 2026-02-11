import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVendorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  storeName: string;
  storeSlug: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  contactEmail: string;
  payoutDetails: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorProfileSchema = new Schema<IVendorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    storeName: { type: String, required: true },
    storeSlug: { type: String, required: true, unique: true },
    storeDescription: { type: String },
    storeLogo: { type: String },
    storeBanner: { type: String },
    contactEmail: { type: String, required: true },
    payoutDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      routingNumber: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const VendorProfile: Model<IVendorProfile> =
  mongoose.models.VendorProfile ||
  mongoose.model<IVendorProfile>("VendorProfile", VendorProfileSchema);

export default VendorProfile;
