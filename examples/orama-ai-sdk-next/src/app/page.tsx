'use client';
import { generateText } from 'ai';
import { oramaProvider } from 'ai-sdk-orama-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

// Create two providers with different configurations
const qaProvider = oramaProvider({
  endpoint: process.env.NEXT_PUBLIC_ORAMA_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_ORAMA_API_KEY!,
  userContext: "The user is looking for documentation help",
  inferenceType: "documentation"
});

const searchProvider = oramaProvider({
  endpoint: process.env.NEXT_PUBLIC_ORAMA_SEARCH_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_ORAMA_SEARCH_API_KEY!,
  searchMode: "fulltext",
  searchOptions: {
    limit: 5
  }
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateText({
        model: activeTab === 'chat' ? qaProvider.ask() : searchProvider.ask(),
        prompt: input
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text,
        results: response.results 
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Data Assistant</h1>
        <div className="flex space-x-4 mt-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'chat' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'search' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Search
          </button>
        </div>
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
                {message.results && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {message.results.map((result, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <Image
                          src={result.photo}
                          alt={result.breed}
                          width={300}
                          height={200}
                          className="rounded-lg object-cover w-full h-48"
                        />
                        <h3 className="font-semibold mt-2">{result.breed}</h3>
                        <p className="text-sm text-gray-600">{result.temperament}</p>
                        <p className="text-sm text-gray-500">Origin: {result.origin}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeTab === 'chat' ? "Ask about the documentation..." : "Search for dog breeds..."}
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