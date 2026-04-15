import mongoose, { Schema, type Document } from "mongoose";

export interface ITestimonial extends Document {
  _id: mongoose.Types.ObjectId;
  // The user who wrote the review
  reviewerId: mongoose.Types.ObjectId;
  // The user being reviewed (landlord or tenant)
  subjectId: mongoose.Types.ObjectId;
  // Listing the review is attached to (optional context)
  listingId?: mongoose.Types.ObjectId;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  // Who the reviewer is in this context
  reviewerRole: "Tenant" | "Landlord";
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId:  { type: Schema.Types.ObjectId, ref: "Listing" },
    rating:     { type: Number, required: true, min: 1, max: 5 },
    body:       { type: String, required: true, trim: true, maxlength: 1000 },
    reviewerRole: { type: String, enum: ["Tenant", "Landlord"], required: true },
  },
  { timestamps: true }
);

// One review per reviewer per subject per listing
testimonialSchema.index({ reviewerId: 1, subjectId: 1, listingId: 1 }, { unique: true, sparse: true });
testimonialSchema.index({ subjectId: 1, createdAt: -1 });

export const Testimonial = mongoose.model<ITestimonial>("Testimonial", testimonialSchema);
export default Testimonial;
