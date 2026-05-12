import mongoose, { Schema, type Document } from "mongoose";

export interface IRating extends Document {
  _id: mongoose.Types.ObjectId;
  targetUserId: mongoose.Types.ObjectId;
  ratedByUserId: mongoose.Types.ObjectId;
  connectionId: mongoose.Types.ObjectId;
  type: "landlord" | "tenant";
  score: number;
  category?: string;
  comment?: string;
  createdAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    targetUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ratedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    connectionId: { type: Schema.Types.ObjectId, ref: "ContactRequest", required: true },
    type: { type: String, enum: ["landlord", "tenant"], required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    category: { type: String, trim: true },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One rating per connection per direction
ratingSchema.index({ connectionId: 1, type: 1 }, { unique: true });
ratingSchema.index({ targetUserId: 1, type: 1 });

export const Rating = mongoose.model<IRating>("Rating", ratingSchema);
export default Rating;
