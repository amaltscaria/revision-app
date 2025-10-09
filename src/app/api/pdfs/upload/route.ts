import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/mongodb';
import PDF from '@/models/PDF';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer and base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // For now, skip PDF text extraction (can be added later with proper server-side PDF parsing)
    const extractedText = `Sample content from ${file.name}. This would contain the actual PDF text in production.`;
    const pageCount = 1;

    // Create data URL for PDF
    const pdfDataUrl = `data:application/pdf;base64,${base64Data}`;

    // Save to database with base64 data
    const pdfDoc = await PDF.create({
      title: file.name.replace('.pdf', ''),
      filename: file.name,
      url: pdfDataUrl,
      pdfData: base64Data,
      pageCount,
      extractedText,
      isSeeded: false,
    });

    return NextResponse.json({
      success: true,
      pdf: pdfDoc,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
