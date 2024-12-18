'use client';
import { generateText } from 'ai';
import { oramaProvider } from '@orama/ai-sdk-provider';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useRef } from 'react';
import Image from 'next/image';

const ResultCard = ({ document }: { document: Record<string, any> }) => {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
      {document.image && (
        <div className="mb-3">
          <Image
            src={document.image}
            alt={`Image for ${document.title || 'result'}`}
            width={300}
            height={200}
            className="rounded-lg object-cover w-full h-48"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
      )}
      <div className="space-y-2">
        {document.title && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 capitalize">Title: </span>
            <span className="text-gray-600">{document.title}</span>
          </div>
        )}
        {document.releaseDate && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 capitalize">Release Date: </span>
            <span className="text-gray-600">{new Date(document.releaseDate).toLocaleDateString()}</span>
          </div>
        )}
        {document.rating && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 capitalize">Rating: </span>
            <span className="text-gray-600">{document.rating}</span>
          </div>
        )}
        {document.genres && Array.isArray(document.genres) && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 capitalize">Genres: </span>
            <span className="text-gray-600">{document.genres.join(', ')}</span>
          </div>
        )}
        {document.description && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 capitalize">Description: </span>
            <span className="text-gray-600">{document.description}</span>
          </div>
        )}
        {document.url && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 capitalize">URL: </span>
            <a href={document.url} className="text-blue-600 underline">{document.url}</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsLoading(true);

    try {
      const provider = oramaProvider({
        endpoint: process.env.NEXT_PUBLIC_ORAMA_API_URL!,
        apiKey: process.env.NEXT_PUBLIC_ORAMA_API_KEY!,
        userContext: "The user is looking for documentation help",
        inferenceType: "documentation",
        ...(activeTab === 'search' && {
          searchMode: "fulltext",
          searchOptions: {
            limit: 5
          }
        })
      });

      const response = await generateText({
        model: provider.ask(),
        prompt: input
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: activeTab === 'chat' ? response.text : '',
        results: activeTab === 'search' ? parseResults(response.text) : null
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const parseResults = (text: string) => {
    const entries = text.split('\n\n').map(entry => {
      const fields = entry.split('\n').reduce((acc, line) => {
        const [key, value] = line.split(': ');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      return { document: fields };
    });
    return { hits: entries };
  };

  return (
    <div className="flex flex-col min-h-screen max-w-6xl mx-auto bg-white p-4 md:p-8">
      <div className="mb-8">
        <Image
          src="https://website-assets.oramasearch.com/orama-when-light.svg"
          alt="Orama Logo"
          width={150}
          height={40}
          className="mb-2"
          priority
        />
      </div>

      <Card className="flex-1 mb-4 overflow-hidden border rounded-xl shadow-sm">
        <CardContent className="h-[calc(100vh-250px)] overflow-y-auto p-6">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl ${
                  message.role === 'assistant' 
                    ? 'bg-[#F9F5FF] border border-[#EEE9F6]' 
                    : 'bg-white border border-gray-100'
                }`}
              >
                <div className="font-medium text-gray-700 mb-2">
                  {message.role === 'assistant' ? 'Assistant' : 'You'}
                </div>
                {message.content && (
                  <div className="text-gray-600 whitespace-pre-wrap mb-4">
                    {message.content}
                  </div>
                )}
                {message.results?.hits && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {message.results.hits.map((hit, idx) => (
                      <ResultCard key={idx} document={hit.document} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative flex items-center">
          <div className="absolute left-3 flex items-center border-r border-gray-200 pr-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as 'chat' | 'search')}
              className="bg-transparent text-gray-600 focus:ring-0 cursor-pointer border-none text-sm font-medium py-2 pl-1 pr-8"
            >
              <option value="chat">Chat</option>
              <option value="search">Search</option>
            </select>
          </div>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask or search about your data..."
            className="flex-1 p-4 pl-32 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#EEE9F6] focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="p-4 bg-[#8152EE] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !input.trim()}
        >
          →
        </button>
      </form>
    </div>
  );
}