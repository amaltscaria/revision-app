'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquare, Plus, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: { pageNumber: number; snippet: string }[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  pdfId: string | null;
  createdAt: Date;
}

interface ChatInterfaceProps {
  pdfId: string | null;
}

export default function ChatInterface({ pdfId }: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chatSessions');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSessions(parsed.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })));
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Get current session
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // Create new chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      pdfId,
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setIsDrawerOpen(false);
  };

  // Switch to a different chat
  const handleSelectChat = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setIsDrawerOpen(false);
    }
  };

  // Update session title based on first message
  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, title: title.substring(0, 50) } : s
      )
    );
  };

  // Update current session messages
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages, pdfId } : s
        )
      );

      // Update title with first user message
      if (messages.length === 1 && messages[0].role === 'user') {
        updateSessionTitle(currentSessionId, messages[0].content);
      }
    }
  }, [messages, currentSessionId, pdfId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Create new session if none exists
    if (!currentSessionId) {
      handleNewChat();
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfId,
          message: input,
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Desktop Sidebar */}
      <Card className="hidden md:block w-64 flex-shrink-0">
        <CardHeader className="pb-3">
          <Button onClick={handleNewChat} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-1 p-2">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No chats yet
                </p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSelectChat(session.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors ${
                      currentSessionId === session.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="font-medium truncate">{session.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {session.messages.length} messages
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mobile Sidebar */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-10">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 pb-3">
            <SheetTitle>Chat History</SheetTitle>
            <Button onClick={handleNewChat} className="w-full mt-2">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-1 p-2">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No chats yet
                </p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSelectChat(session.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors ${
                      currentSessionId === session.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="font-medium truncate">{session.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {session.messages.length} messages
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>AI Tutor Chat</CardTitle>
          <CardDescription>
            {pdfId && pdfId !== 'all'
              ? 'Ask questions about the selected PDF'
              : 'Select a PDF to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-16 w-16 mb-4" />
                <p>Start a conversation with your AI tutor</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-medium mb-2">Sources:</p>
                          {message.citations.map((citation, i) => (
                            <div key={i} className="text-xs mb-1">
                              <span className="font-medium">Page {citation.pageNumber}:</span>{' '}
                              "{citation.snippet}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Ask a question..."
                disabled={isLoading || !pdfId || pdfId === 'all'}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
