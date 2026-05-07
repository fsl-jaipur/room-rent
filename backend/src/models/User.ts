import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  role: "admin" | "landlord" | "tenant";
  fullName: string;
  email?: string;
  phone: string;
  passwordHash?: string;
  gender?: "Male" | "Female" | "Other";
  aadhaarEncrypted?: Buffer;
  aadhaarHash?: Buffer;
  permanentAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  photoUrl?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  isVerified: boolean;
  isActive: boolean;
  emailVerifyToken?: string;
  emailVerifyExpires?: Date;
  otpResendCount: number;
  otpResendWindowStart?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["admin", "landlord", "tenant"],
      default: "tenant",
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    aadhaarEncrypted: { type: Buffer },
    aadhaarHash: { type: Buffer },
    permanentAddress: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    photoUrl: { type: String },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emailVerifyToken: { type: String },
    emailVerifyExpires: { type: Date },
    otpResendCount: { type: Number, default: 0 },
    otpResendWindowStart: { type: Date },
  },
  {
    timestamps: true, // auto createdAt + updatedAt
  },
);

// Indexes
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ aadhaarHash: 1 }, { unique: true, sparse: true });
// userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ location: "2dsphere" });

export const User = mongoose.model<IUser>("User", userSchema);
export default User;
