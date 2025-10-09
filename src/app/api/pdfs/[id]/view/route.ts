import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PDF from '@/models/PDF';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const pdf = await PDF.findById(id);

    if (!pdf || !pdf.pdfData) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    // Convert base64 back to binary
    const pdfBuffer = Buffer.from(pdf.pdfData, 'base64');

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pdf.filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error: any) {
    console.error('PDF view error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load PDF' },
      { status: 500 }
    );
  }
}
