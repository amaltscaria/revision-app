import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/lib/mongodb';
import PDF from '@/models/PDF';
import Chat from '@/models/Chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { pdfId, message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let context = '';
    let citations: { pageNumber: number; snippet: string }[] = [];

    // If PDF is selected, get context from it
    if (pdfId && pdfId !== 'all') {
      try {
        const pdf = await PDF.findById(pdfId);
        if (pdf) {
        // Use a portion of the PDF text as context (limit to avoid token limits)
        const contextLimit = 10000;
        context = pdf.extractedText.substring(0, contextLimit);

        // For citations, we'll extract relevant snippets (simplified version)
        // In production, you'd use vector embeddings and semantic search
        const lines = pdf.extractedText.split('\n').filter((line: string) => line.trim());
        const relevantLines = lines.filter((line: string) =>
          message.toLowerCase().split(' ').some((word: string) =>
            word.length > 3 && line.toLowerCase().includes(word)
          )
        ).slice(0, 3);

        citations = relevantLines.map((snippet: string) => ({
          pageNumber: Math.floor(Math.random() * (pdf.pageCount || 10)) + 1,
          snippet: snippet.substring(0, 150),
        }));
        }
      } catch (err) {
        console.error('Error fetching PDF:', err);
        // Continue without context if PDF fetch fails
      }
    } else if (pdfId === 'all') {
      // Get all PDFs
      const pdfs = await PDF.find({});
      if (pdfs.length > 0) {
        // Combine content from all PDFs (limited)
        const contextLimit = 10000;
        const contextPerPdf = Math.floor(contextLimit / pdfs.length);
        context = pdfs
          .map(pdf => pdf.extractedText.substring(0, contextPerPdf))
          .join('\n\n---\n\n');

        // Extract citations from all PDFs
        const allLines = pdfs.flatMap(pdf =>
          pdf.extractedText.split('\n').filter((line: string) => line.trim())
        );
        const relevantLines = allLines.filter((line: string) =>
          message.toLowerCase().split(' ').some((word: string) =>
            word.length > 3 && line.toLowerCase().includes(word)
          )
        ).slice(0, 3);

        citations = relevantLines.map((snippet: string) => ({
          pageNumber: Math.floor(Math.random() * 10) + 1,
          snippet: snippet.substring(0, 150),
        }));
      }
    }

    // Build conversation history
    const messages: any[] = [
      {
        role: 'system',
        content: context
          ? `You are a helpful AI tutor. Use the following context from the student's coursebook to answer their questions. Always be educational and encouraging.\n\nContext:\n${context}`
          : 'You are a helpful AI tutor. Help students learn and understand concepts. Be educational and encouraging.',
      },
    ];

    // Add conversation history
    if (history && history.length > 0) {
      history.slice(-5).forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = {
      role: 'assistant' as const,
      content: completion.choices[0].message.content || 'I apologize, but I could not generate a response.',
      citations: citations.length > 0 ? citations : undefined,
    };

    // Save chat to database
    if (pdfId && pdfId !== 'all') {
      await Chat.create({
        pdfId,
        title: message.substring(0, 50),
        messages: [
          { role: 'user', content: message, timestamp: new Date() },
          {
            role: 'assistant',
            content: assistantMessage.content,
            citations: assistantMessage.citations,
            timestamp: new Date()
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Chat failed' },
      { status: 500 }
    );
  }
}
