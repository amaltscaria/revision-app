import mongoose, { Schema, Document } from 'mongoose';

export interface IPDF extends Document {
  title: string;
  filename: string;
  url: string;
  cloudinaryId?: string;
  pdfData?: string;
  pageCount: number;
  extractedText: string;
  isSeeded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PDFSchema = new Schema<IPDF>(
  {
    title: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: false,
    },
    pdfData: {
      type: String,
      required: false,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    extractedText: {
      type: String,
      default: '',
    },
    isSeeded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PDF || mongoose.model<IPDF>('PDF', PDFSchema);
