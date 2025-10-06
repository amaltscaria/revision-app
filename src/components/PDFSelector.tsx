'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [selectedPdf, setSelectedPdf] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
        alert('PDF uploaded successfully!');
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
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

  return (
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
            <div>
              <Input
                type="file"
                name="file"
                accept="application/pdf"
                required
                disabled={isUploading}
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
  );
}
