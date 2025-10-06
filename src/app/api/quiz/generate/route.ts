import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/lib/mongodb';
import PDF from '@/models/PDF';
import Quiz from '@/models/Quiz';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { pdfId, questionTypes, count = 10 } = await request.json();

    if (!pdfId) {
      return NextResponse.json({ error: 'PDF ID is required' }, { status: 400 });
    }

    // Get PDF content
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    // Prepare content (limit to avoid token limits)
    const contentLimit = 15000;
    const content = pdf.extractedText.substring(0, contentLimit);

    // Generate questions using OpenAI
    const types = questionTypes || ['mcq', 'saq', 'laq'];
    const prompt = `Based on the following educational content, generate ${count} diverse questions.

Content:
${content}

Generate a mix of the following question types: ${types.join(', ')}:
- MCQ (Multiple Choice Questions): 4 options each
- SAQ (Short Answer Questions): Brief answer expected
- LAQ (Long Answer Questions): Detailed answer expected

Return a JSON array of questions with this exact structure:
[
  {
    "type": "mcq|saq|laq",
    "question": "Question text",
    "options": ["A", "B", "C", "D"], // only for MCQ
    "correctAnswer": "Correct answer",
    "explanation": "Detailed explanation",
    "topic": "Topic name",
    "difficulty": "easy|medium|hard"
  }
]

Make questions educational, clear, and varied in difficulty. Cover different topics from the content.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator creating high-quality quiz questions. Always return valid JSON only, no other text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content || '{}';
    let questions;

    try {
      const parsed = JSON.parse(responseText);
      questions = parsed.questions || parsed;
      if (!Array.isArray(questions)) {
        questions = [questions];
      }
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Save quiz
    const quiz = await Quiz.create({
      pdfId,
      questions,
    });

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
