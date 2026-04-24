import mongoose, { Schema, type Document } from "mongoose";

export interface ISavedSearch extends Document {
  tenantId: mongoose.Types.ObjectId;
  searchName?: string;
  filters: {
    colony?: string;
    minRent?: number;
    maxRent?: number;
    maxOccupants?: number;
    floorLevel?: string;
    furnishingType?: string;
    allowSmoking?: boolean;
    foodPreference?: string;
    radiusKm?: number;
    center?: { type: "Point"; coordinates: [number, number] };
  };
  createdAt: Date;
}

const savedSearchSchema = new Schema<ISavedSearch>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    searchName: { type: String, trim: true },
    filters: {
      colony: { type: String },
      minRent: { type: Number },
      maxRent: { type: Number },
      maxOccupants: { type: Number },
      floorLevel: { type: String },
      furnishingType: { type: String },
      allowSmoking: { type: Boolean },
      foodPreference: { type: String },
      radiusKm: { type: Number },
      center: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] },
      },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

savedSearchSchema.index({ tenantId: 1 });

export const SavedSearch = mongoose.model<ISavedSearch>("SavedSearch", savedSearchSchema);
export default SavedSearch;
