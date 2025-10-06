import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionIndex: number;
  userAnswer: string;
  isCorrect: boolean;
  topic: string;
}

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  pdfId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalQuestions: number;
  topics: string[];
  strengths: string[];
  weaknesses: string[];
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionIndex: {
    type: Number,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
});

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    pdfId: {
      type: Schema.Types.ObjectId,
      ref: 'PDF',
      required: true,
    },
    answers: [AnswerSchema],
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    topics: [{
      type: String,
    }],
    strengths: [{
      type: String,
    }],
    weaknesses: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
