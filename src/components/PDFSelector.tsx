'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PDF {
  _id: string;
  title: string;
  filename: string;
  url: string;
}

interface PDFSelectorProps {
  onSelect: (pdfId: string, url: string) => void;
}

export default function PDFSelector({ onSelect }: PDFSelectorProps) {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      const res = await fetch('/api/pdfs');
      const data = await res.json();
      if (data.success) {
        setPdfs(data.pdfs);
      }
    } catch (error) {
      console.error('Failed to fetch PDFs:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/pdfs/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        await fetchPDFs();
        setIsOpen(false);
        setSelectedFile(null);
        setAlertDialog({
          open: true,
          title: 'Success',
          message: 'PDF uploaded successfully!',
        });
      } else {
        setAlertDialog({
          open: true,
          title: 'Upload Failed',
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setAlertDialog({
        open: true,
        title: 'Upload Failed',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = (value: string) => {
    setSelectedPdf(value);
    if (value !== 'all') {
      const pdf = pdfs.find(p => p._id === value);
      if (pdf) {
        onSelect(pdf._id, pdf.url);
      }
    } else {
      onSelect('all', '');
    }
  };

  const getSelectedPdfName = () => {
    if (!selectedPdf) return null;
    if (selectedPdf === 'all') return 'All PDFs';
    const pdf = pdfs.find(p => p._id === selectedPdf);
    return pdf?.title;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full">
          <Select value={selectedPdf} onValueChange={handleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a PDF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PDFs</SelectItem>
              {pdfs.map((pdf) => (
                <SelectItem key={pdf._id} value={pdf._id}>
                  {pdf.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload PDF Coursebook</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="pdf-file" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-accent transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  {selectedFile ? (
                    <>
                      <p className="text-sm font-medium text-primary mb-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Click to choose a different file
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to choose PDF file
                      </p>
                      <p className="text-xs text-gray-500">
                        or drag and drop
                      </p>
                    </>
                  )}
                </div>
              </label>
              <Input
                id="pdf-file"
                type="file"
                name="file"
                accept="application/pdf"
                required
                disabled={isUploading}
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </div>

      {selectedPdf && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-primary">
            Selected: {getSelectedPdfName()}
          </span>
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog({ ...alertDialog, open: false })}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
