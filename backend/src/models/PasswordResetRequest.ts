import mongoose, { Schema, type Document } from "mongoose";

export interface IPasswordResetRequest extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  otpHash: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const passwordResetRequestSchema = new Schema<IPasswordResetRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

passwordResetRequestSchema.index({ email: 1 });
passwordResetRequestSchema.index({ userId: 1 });
// Auto-delete expired records after 24 hours past expiry
passwordResetRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export const PasswordResetRequest = mongoose.model<IPasswordResetRequest>(
  "PasswordResetRequest",
  passwordResetRequestSchema
);
export default PasswordResetRequest;
