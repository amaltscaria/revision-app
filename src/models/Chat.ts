import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: {
    pageNumber: number;
    snippet: string;
  }[];
  timestamp: Date;
}

export interface IChat extends Document {
  pdfId?: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  citations: [{
    pageNumber: Number,
    snippet: String,
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new Schema<IChat>(
  {
    pdfId: {
      type: Schema.Types.ObjectId,
      ref: 'PDF',
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
