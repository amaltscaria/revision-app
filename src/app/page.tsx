'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFSelector from '@/components/PDFSelector';
import PDFViewer from '@/components/PDFViewer';
import QuizInterface from '@/components/QuizInterface';
import ProgressDashboard from '@/components/ProgressDashboard';
import ChatInterface from '@/components/ChatInterface';
import YouTubeRecommender from '@/components/YouTubeRecommender';

export default function Home() {
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const handlePdfSelect = (pdfId: string, url: string) => {
    setSelectedPdfId(pdfId);
    setPdfUrl(url);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b-0">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100 drop-shadow-lg">
            Student Revision App
          </h1>
          <p className="text-xl text-blue-100 font-medium">✨ AI-powered learning companion for modern students</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <PDFSelector onSelect={handlePdfSelect} />
        </div>

        <Tabs defaultValue="quiz" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full lg:grid lg:w-full lg:grid-cols-5">
              <TabsTrigger value="quiz" className="flex-shrink-0">Quiz</TabsTrigger>
              <TabsTrigger value="pdf" className="flex-shrink-0 whitespace-nowrap">PDF Viewer</TabsTrigger>
              <TabsTrigger value="progress" className="flex-shrink-0">Progress</TabsTrigger>
              <TabsTrigger value="chat" className="flex-shrink-0">Chat</TabsTrigger>
              <TabsTrigger value="videos" className="flex-shrink-0">Videos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="quiz" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <QuizInterface pdfId={selectedPdfId} />
              </div>
              <div className="hidden lg:block">
                <PDFViewer url={pdfUrl} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="mt-6">
            <PDFViewer url={pdfUrl} />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <ProgressDashboard />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <ChatInterface pdfId={selectedPdfId} onPdfChange={handlePdfSelect} />
              </div>
              <div className="hidden lg:block">
                <PDFViewer url={pdfUrl} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <YouTubeRecommender pdfId={selectedPdfId} />
              </div>
              <div className="hidden lg:block">
                <PDFViewer url={pdfUrl} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
