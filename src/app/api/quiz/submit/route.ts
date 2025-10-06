import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { quizId, answers } = await request.json();

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: 'Quiz ID and answers are required' },
        { status: 400 }
      );
    }

    // Get quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Score the quiz
    const scoredAnswers = answers.map((answer: any, index: number) => {
      const question = quiz.questions[index];
      const isCorrect =
        answer.userAnswer.toLowerCase().trim() ===
        question.correctAnswer.toLowerCase().trim();

      return {
        questionIndex: index,
        userAnswer: answer.userAnswer,
        isCorrect,
        topic: question.topic,
      };
    });

    const score = scoredAnswers.filter((a: any) => a.isCorrect).length;
    const totalQuestions = quiz.questions.length;

    // Calculate strengths and weaknesses
    const topicPerformance: { [key: string]: { correct: number; total: number } } = {};

    scoredAnswers.forEach((answer: any) => {
      const topic = answer.topic;
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 };
      }
      topicPerformance[topic].total++;
      if (answer.isCorrect) {
        topicPerformance[topic].correct++;
      }
    });

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(topicPerformance).forEach(([topic, perf]) => {
      const percentage = (perf.correct / perf.total) * 100;
      if (percentage >= 70) {
        strengths.push(topic);
      } else if (percentage < 50) {
        weaknesses.push(topic);
      }
    });

    // Save attempt
    const attempt = await QuizAttempt.create({
      quizId,
      pdfId: quiz.pdfId,
      answers: scoredAnswers,
      score,
      totalQuestions,
      topics: Object.keys(topicPerformance),
      strengths,
      weaknesses,
    });

    return NextResponse.json({
      success: true,
      attempt,
      score,
      totalQuestions,
      percentage: ((score / totalQuestions) * 100).toFixed(2),
      strengths,
      weaknesses,
    });
  } catch (error: any) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
