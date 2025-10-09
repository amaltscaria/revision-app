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

    if (!pdf) {
      return NextResponse.json(
        { error: 'PDF not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pdf,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch PDF' },
      { status: 500 }
    );
  }
}
