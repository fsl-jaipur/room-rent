import mongoose, { Schema, type Document } from "mongoose";

export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  area: string;
  colonies: string[];
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    area: { type: String, required: true, trim: true },
    colonies: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

locationSchema.index({ area: 1 }, { unique: true });
locationSchema.index({ isActive: 1 });

export const Location = mongoose.model<ILocation>("Location", locationSchema);
export default Location;
