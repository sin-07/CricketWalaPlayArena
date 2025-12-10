import mongoose, { Document, Schema } from 'mongoose';

export interface IGalleryImage extends Document {
  url: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  uploadedAt: Date;
  updatedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>(
  {
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'uploadedAt', updatedAt: 'updatedAt' },
  }
);

// Index for efficient querying
galleryImageSchema.index({ order: 1 });
galleryImageSchema.index({ isActive: 1 });

export default mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', galleryImageSchema);
