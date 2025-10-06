'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  if (!url) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            📚 PDF Viewer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-96">
          <FileText className="h-16 w-16 text-purple-400 mb-4" />
          <p className="text-muted-foreground text-lg">Select a PDF to view</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          📚 PDF Viewer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <iframe
          src={url}
          className="w-full h-[calc(100vh-200px)] border-0"
          title="PDF Viewer"
        />
      </CardContent>
    </Card>
  );
}
