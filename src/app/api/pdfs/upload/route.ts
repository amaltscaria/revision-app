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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For now, skip PDF text extraction (can be added later with proper server-side PDF parsing)
    const extractedText = `Sample content from ${file.name}. This would contain the actual PDF text in production.`;
    const pageCount = 1;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'pdfs',
          format: 'pdf',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const cloudinaryResult = uploadResult as any;

    // Save to database
    const pdfDoc = await PDF.create({
      title: file.name.replace('.pdf', ''),
      filename: file.name,
      url: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
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
