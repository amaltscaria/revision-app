import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/lib/mongodb';
import PDF from '@/models/PDF';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { pdfId } = await request.json();

    if (!pdfId || pdfId === 'all') {
      return NextResponse.json(
        { error: 'Please select a specific PDF' },
        { status: 400 }
      );
    }

    // Get PDF to extract topics
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    // Extract key topics using AI
    const contentSample = pdf.extractedText.substring(0, 5000);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract 3-5 key educational topics from this text. Return as a JSON array of topic strings.',
        },
        {
          role: 'user',
          content: contentSample,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    const topics = response.topics || [];

    // Generate YouTube search queries
    const videos = topics.slice(0, 5).map((topic: string, index: number) => {
      const searchQuery = encodeURIComponent(`${topic} tutorial explanation`);
      return {
        id: `video-${index}`,
        title: `Learn: ${topic}`,
        topic: topic,
        searchUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
        thumbnailUrl: `https://via.placeholder.com/320x180?text=${encodeURIComponent(topic)}`,
      };
    });

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error: any) {
    console.error('YouTube recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
