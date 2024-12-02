'use client';
import { useState } from 'react';
import { oramaProvider } from 'ai-sdk-orama-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';

// Create the service instance
const oramaService = oramaProvider({
  endpoint: process.env.ORAMA_API_URL!,
  apiKey: process.env.ORAMA_API_KEY!,
  userContext: "The user is looking for documentation help",
  inferenceType: "documentation",
  events: {
    onMessageLoading: (loading) => {
      console.log('Loading:', loading);
    },
    onMessageChange: (messages) => {
      console.log('Messages changed:', messages);
    }
  }
});

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantMessage = {
        role: 'assistant',
        content: ''
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      let accumulatedText = '';
      for await (const { content } of oramaService.askStream([...messages, userMessage])) {
        accumulatedText += content;
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1].content = accumulatedText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error during chat:', error);
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1].content = 
          'Sorry, I encountered an error while processing your request.';
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Example of how to use search independently
  const handleSearch = async (searchTerm: string) => {
    try {
      const results = await oramaService.search(searchTerm, {
        limit: 5
      });
      // Handle search results as needed
      console.log('Search results:', results);
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Documentation Assistant</h1>
        <p className="text-gray-600">Ask me anything about the documentation!</p>
      </div>

      <Card className="flex-1 mb-4 overflow-hidden">
        <CardContent className="h-full overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg ${
                  message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="font-semibold mb-1">
                  {message.role === 'assistant' ? 'Assistant' : 'You'}:
                </div>
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="font-semibold mb-1">Assistant:</div>
                <div className="animate-pulse">Thinking...</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the documentation..."
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}