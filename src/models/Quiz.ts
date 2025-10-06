import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  type: 'mcq' | 'saq' | 'laq';
  question: string;
  options?: string[]; // Only for MCQs
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IQuiz extends Document {
  pdfId: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    enum: ['mcq', 'saq', 'laq'],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
  }],
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
});

const QuizSchema = new Schema<IQuiz>(
  {
    pdfId: {
      type: Schema.Types.ObjectId,
      ref: 'PDF',
      required: true,
    },
    questions: [QuestionSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
