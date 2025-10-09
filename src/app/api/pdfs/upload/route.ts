import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PDF from '@/models/PDF';
import { pdf } from 'pdf-parse';

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

    // Extract text from PDF
    let extractedText = '';
    let pageCount = 1;

    try {
      const data = await pdf(buffer);
      extractedText = data.text;
      pageCount = data.total;
    } catch (error) {
      console.error('PDF parsing error:', error);
      extractedText = 'Unable to extract text from PDF';
    }

    // Save to database with base64 data (temp URL first)
    const pdfDoc = await PDF.create({
      title: file.name.replace('.pdf', ''),
      filename: file.name,
      url: 'temp', // Temporary placeholder
      pdfData: base64Data,
      pageCount,
      extractedText,
      isSeeded: false,
    });

    // Update with proper viewing URL using the generated ID
    pdfDoc.url = `/api/pdfs/${pdfDoc._id}/view`;
    await pdfDoc.save();

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
