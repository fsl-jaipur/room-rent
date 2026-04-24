import mongoose, { Schema, type Document } from "mongoose";

export interface IContactRequest extends Document {
  tenantId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  landlordId: mongoose.Types.ObjectId;
  message?: string;
  status: "Pending" | "Accepted" | "Rejected";
  isConnected: boolean;
  createdAt: Date;
  respondedAt?: Date;
}

const contactRequestSchema = new Schema<IContactRequest>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    isConnected: { type: Boolean, default: false },
    respondedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

contactRequestSchema.index({ landlordId: 1, status: 1 });
contactRequestSchema.index({ tenantId: 1, createdAt: -1 });

export const ContactRequest = mongoose.model<IContactRequest>(
  "ContactRequest",
  contactRequestSchema
);
export default ContactRequest;
