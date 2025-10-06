import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PDF from '@/models/PDF';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const pdfs = await PDF.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      pdfs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch PDFs' },
      { status: 500 }
    );
  }
}
