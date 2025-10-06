'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFSelector from '@/components/PDFSelector';
import PDFViewer from '@/components/PDFViewer';
import QuizInterface from '@/components/QuizInterface';
import ProgressDashboard from '@/components/ProgressDashboard';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const handlePdfSelect = (pdfId: string, url: string) => {
    setSelectedPdfId(pdfId);
    setPdfUrl(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Student Revision App</h1>
          <p className="text-muted-foreground">AI-powered learning companion</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <PDFSelector onSelect={handlePdfSelect} />
        </div>

        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="pdf">PDF Viewer</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

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
                <ChatInterface pdfId={selectedPdfId} />
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
