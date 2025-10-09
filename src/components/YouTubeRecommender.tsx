'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, Youtube } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  topic: string;
  searchUrl: string;
  thumbnailUrl: string;
}

interface YouTubeRecommenderProps {
  pdfId: string | null;
}

export default function YouTubeRecommender({ pdfId }: YouTubeRecommenderProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetRecommendations = async () => {
    if (!pdfId || pdfId === 'all') {
      setError('Please select a specific PDF');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId }),
      });

      const data = await res.json();

      if (data.success) {
        setVideos(data.videos);
      } else {
        setError(data.error || 'Failed to get recommendations');
      }
    } catch (err) {
      setError('Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          YouTube Video Recommendations
        </CardTitle>
        <CardDescription>
          Get AI-recommended educational videos based on PDF content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!pdfId || pdfId === 'all' ? (
          <div className="text-center py-8 text-muted-foreground">
            <Youtube className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a PDF to get video recommendations</p>
            <p className="text-sm mt-2">Choose a specific PDF from the dropdown above</p>
          </div>
        ) : (
          <>
            {videos.length === 0 ? (
              <div className="text-center py-8">
                <Button
                  onClick={handleGetRecommendations}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finding Topics...
                    </>
                  ) : (
                    <>
                      <Youtube className="h-4 w-4 mr-2" />
                      Get Video Recommendations
                    </>
                  )}
                </Button>
                {error && (
                  <p className="text-destructive text-sm mt-4">{error}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Found {videos.length} topics from your PDF
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGetRecommendations}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {videos.map((video) => (
                    <a
                      key={video.id}
                      href={video.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <Card className="transition-all hover:shadow-lg hover:border-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-red-500/10 p-2 rounded-lg flex-shrink-0">
                              <Youtube className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {video.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                Topic: {video.topic}
                              </p>
                              <div className="flex items-center text-xs text-primary">
                                <span>Search on YouTube</span>
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
