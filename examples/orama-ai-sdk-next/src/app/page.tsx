'use client';
import { useChat } from 'ai/react';
import { Send } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    onResponse: async (response) => {
      const text = await response.text();
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: text,
          createdAt: new Date()
        }
      ]);
      return null;
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Video Game Assistant</h1>
        <p className="text-gray-600">Ask me anything about video games!</p>
      </div>
      <Card className="flex-1 mb-4 overflow-hidden">
        <CardContent className="h-full overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map(message => {
              return (
                <div key={message.id} className={`p-4 rounded-lg ${
                  message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <div className="font-semibold mb-1">
                    {message.role === 'assistant' ? 'Assistant' : 'You'}:
                  </div>
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              );
            })}
            {isLoading && <div className="loading-indicator">...</div>}
          </div>
        </CardContent>
      </Card>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about any video game..."
          className="flex-1 p-3 rounded-lg border"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}