'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProgressData {
  stats: {
    totalAttempts: number;
    totalScore: number;
    totalQuestions: number;
    overallPercentage: string;
    topStrengths: string[];
    topWeaknesses: string[];
  };
  attempts: any[];
}

export default function ProgressDashboard() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      const data = await res.json();
      if (data.success) {
        setProgress(data);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!progress || progress.stats.totalAttempts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Dashboard</CardTitle>
          <CardDescription>Track your learning journey</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Take a quiz to start tracking your progress</p>
        </CardContent>
      </Card>
    );
  }

  const { stats } = progress;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>Your learning statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{stats.totalAttempts}</p>
              <p className="text-sm text-muted-foreground">Quiz Attempts</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">
                {stats.totalScore}/{stats.totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground">Total Score</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{stats.overallPercentage}%</p>
              <p className="text-sm text-muted-foreground">Overall Accuracy</p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Overall Performance</p>
              <p className="text-sm text-muted-foreground">{stats.overallPercentage}%</p>
            </div>
            <Progress value={parseFloat(stats.overallPercentage)} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle>Strengths</CardTitle>
            </div>
            <CardDescription>Topics you excel at</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topStrengths.length > 0 ? (
                stats.topStrengths.map((strength) => (
                  <Badge key={strength} variant="default" className="bg-green-600">
                    {strength}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete more quizzes to identify strengths
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <CardTitle>Areas to Improve</CardTitle>
            </div>
            <CardDescription>Topics that need more practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topWeaknesses.length > 0 ? (
                stats.topWeaknesses.map((weakness) => (
                  <Badge key={weakness} variant="destructive">
                    {weakness}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Great job! No major weaknesses identified
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attempts</CardTitle>
          <CardDescription>Your quiz history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.attempts.slice(0, 5).map((attempt) => (
              <div
                key={attempt._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {attempt.pdfId?.title || 'Unknown PDF'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {attempt.score}/{attempt.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {((attempt.score / attempt.totalQuestions) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
