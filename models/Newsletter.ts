import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  title: string;
  subject: string;
  content: string;
  sentAt?: Date;
  sentTo: number;
  status: 'draft' | 'sent' | 'failed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Newsletter title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Newsletter content is required'],
    },
    sentAt: {
      type: Date,
    },
    sentTo: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'failed'],
      default: 'draft',
    },
    createdBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
NewsletterSchema.index({ status: 1 });
NewsletterSchema.index({ createdAt: -1 });

const Newsletter =
  mongoose.models.Newsletter ||
  mongoose.model<INewsletter>('Newsletter', NewsletterSchema);

export default Newsletter;
