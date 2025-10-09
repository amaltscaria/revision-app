'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Question {
  type: 'mcq' | 'saq' | 'laq';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: string;
}

interface Quiz {
  _id: string;
  questions: Question[];
}

interface QuizInterfaceProps {
  pdfId: string | null;
}

export default function QuizInterface({ pdfId }: QuizInterfaceProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: '',
    message: '',
  });
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; message: string; onConfirm: () => void }>({
    open: false,
    message: '',
    onConfirm: () => {},
  });

  const generateQuiz = async () => {
    if (!pdfId) {
      setErrorDialog({
        open: true,
        title: 'No PDF Selected',
        message: 'Please select a PDF or "All PDFs" before generating a quiz.',
      });
      return;
    }

    setIsLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setResult(null);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfId,
          questionTypes: ['mcq', 'saq', 'laq'],
          count: 10,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQuiz(data.quiz);
      } else {
        setErrorDialog({
          open: true,
          title: 'Quiz Generation Failed',
          message: data.error || 'Failed to generate quiz',
        });
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      setErrorDialog({
        open: true,
        title: 'Quiz Generation Failed',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unansweredCount = quiz.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      setConfirmDialog({
        open: true,
        message: `You have ${unansweredCount} unanswered question(s). Unanswered questions will be marked as incorrect. Do you want to submit anyway?`,
        onConfirm: () => submitQuizAnswers(),
      });
      return;
    }

    submitQuizAnswers();
  };

  const submitQuizAnswers = async () => {
    if (!quiz) return;

    const answerArray = quiz.questions.map((_, index) => ({
      userAnswer: answers[index] || '',
    }));

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz._id,
          answers: answerArray,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        setSubmitted(true);
      } else {
        setErrorDialog({
          open: true,
          title: 'Submission Failed',
          message: 'Failed to submit quiz. Please try again.',
        });
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      setErrorDialog({
        open: true,
        title: 'Submission Failed',
        message: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  if (!pdfId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎯 Quiz Generator
          </CardTitle>
          <CardDescription className="text-base">Select a PDF (or "All PDFs") to generate a quiz</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎯 Quiz Generator
          </CardTitle>
          <CardDescription className="text-base">AI-powered questions from your coursebook</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateQuiz} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {quiz && (
        <>
          {submitted && result && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-center">
                  {result.score}/{result.totalQuestions} ({result.percentage}%)
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Strengths</p>
                    <div className="flex flex-wrap gap-2">
                      {result.strengths?.map((s: string) => (
                        <Badge key={s} variant="default">{s}</Badge>
                      ))}
                      {result.strengths?.length === 0 && (
                        <p className="text-sm text-muted-foreground">None yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Weaknesses</p>
                    <div className="flex flex-wrap gap-2">
                      {result.weaknesses?.map((w: string) => (
                        <Badge key={w} variant="destructive">{w}</Badge>
                      ))}
                      {result.weaknesses?.length === 0 && (
                        <p className="text-sm text-muted-foreground">None</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      Question {index + 1}
                      <Badge className="ml-2" variant="outline">
                        {question.type.toUpperCase()}
                      </Badge>
                      <Badge className="ml-2" variant="secondary">
                        {question.difficulty}
                      </Badge>
                    </CardTitle>
                    {submitted && result && (
                      <div>
                        {result.attempt.answers[index]?.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <CardDescription>{question.topic}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-medium">{question.question}</p>

                  {question.type === 'mcq' && question.options ? (
                    <RadioGroup
                      value={answers[index] || ''}
                      onValueChange={(value) => handleAnswerChange(index, value)}
                      disabled={submitted}
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                          <Label htmlFor={`q${index}-opt${optIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Input
                      placeholder="Type your answer..."
                      value={answers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={submitted}
                    />
                  )}

                  {submitted && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Correct Answer:</p>
                      <p className="text-sm mb-3">{question.correctAnswer}</p>
                      <p className="text-sm font-medium mb-2">Explanation:</p>
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {!submitted && (
              <Button onClick={handleSubmit} className="w-full" size="lg">
                Submit Quiz
              </Button>
            )}

            {submitted && (
              <Button onClick={generateQuiz} className="w-full" variant="outline" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Quiz
              </Button>
            )}
          </div>
        </>
      )}

      {/* Error Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ ...errorDialog, open: false })}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDialog({ ...confirmDialog, open: false });
                confirmDialog.onConfirm();
              }}
            >
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
