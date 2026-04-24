import mongoose, { Schema, type Document } from "mongoose";

export interface IFavorite extends Document {
  tenantId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

favoriteSchema.index({ tenantId: 1, listingId: 1 }, { unique: true });
favoriteSchema.index({ tenantId: 1, createdAt: -1 });

export const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
export default Favorite;
