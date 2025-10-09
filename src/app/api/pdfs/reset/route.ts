import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await dbConnect();

    // Drop the PDF collection to reset the schema
    await mongoose.connection.dropCollection('pdfs').catch(() => {
      // Collection might not exist, that's OK
    });

    return NextResponse.json({
      success: true,
      message: 'PDF collection reset successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Reset failed' },
      { status: 500 }
    );
  }
}
