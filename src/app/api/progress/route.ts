import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const attempts = await QuizAttempt.find()
      .sort({ createdAt: -1 })
      .populate('pdfId', 'title');

    // Aggregate overall statistics
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalQuestions = attempts.reduce(
      (sum, attempt) => sum + attempt.totalQuestions,
      0
    );

    const overallPercentage = totalQuestions > 0
      ? ((totalScore / totalQuestions) * 100).toFixed(2)
      : 0;

    // Aggregate strengths and weaknesses
    const strengthsMap: { [key: string]: number } = {};
    const weaknessesMap: { [key: string]: number } = {};

    attempts.forEach((attempt) => {
      attempt.strengths.forEach((strength: string) => {
        strengthsMap[strength] = (strengthsMap[strength] || 0) + 1;
      });
      attempt.weaknesses.forEach((weakness: string) => {
        weaknessesMap[weakness] = (weaknessesMap[weakness] || 0) + 1;
      });
    });

    const topStrengths = Object.entries(strengthsMap)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([topic]) => topic);

    const topWeaknesses = Object.entries(weaknessesMap)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([topic]) => topic);

    return NextResponse.json({
      success: true,
      stats: {
        totalAttempts,
        totalScore,
        totalQuestions,
        overallPercentage,
        topStrengths,
        topWeaknesses,
      },
      attempts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
