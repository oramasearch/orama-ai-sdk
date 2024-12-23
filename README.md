# AI SDK Orama Provider

A provider for [Vercel's AI SDK](https://sdk.vercel.ai/docs) that enables seamless integration with [Orama](https://docs.oramasearch.com/)'s search and chat capabilities.

## Features

- 🔍 Full-text, vector, and hybrid search
- 💬 Streaming chat/QA functionality
- 🚀 Framework agnostic
- 🔄 Real-time streaming responses
- 🖼️ Rich media search results

## Installation

```
npm install @oramacloud/ai-sdk-provider
```

## Quick Start

```jsx
import { generateText, streamText } from 'ai';
import { oramaProvider } from '@oramacloud/ai-sdk-provider';

// Create an Orama provider instance
const provider = oramaProvider({
  endpoint: process.env.ORAMA_API_URL,
  apiKey: process.env.ORAMA_API_KEY,
  userContext: "The user is looking for documentation help",
  inferenceType: "documentation"
});

// Use it in your component
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setMessages(prev => [...prev, 
      { role: 'user', content: input },
      { role: 'assistant', content: '' }
    ]);

    try {
      const response = await streamText({
        model: provider.ask(),
        prompt: input,
        temperature: 0
      });

      let previousLength = 0;
      for await (const chunk of response.textStream) {
        if (chunk) {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            const currentChunk = chunk.toString();
            const newText = currentChunk.slice(previousLength);
            previousLength = currentChunk.length;
            lastMessage.content += newText;
            return newMessages;
          });
        }
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = 'An error occurred while processing your request.';
        return newMessages;
      });
    }
  };

  return (
    // Your chat UI
  );
}
```

## Configuration

### Provider Configuration

```typescript
interface OramaProviderConfig {
  endpoint: string;    // Your Orama endpoint URL
  apiKey: string;      // Your Orama API key
  userContext?: string; // Context for the chat session
  inferenceType?: "documentation" | "chat";   // Type of inference
  searchMode?: "fulltext" | "vector" | "hybrid"; // Search mode
  searchOptions?: OramaSearchOptions;         // Default search options
}
```

### Search Options

```typescript
interface OramaSearchOptions {
  mode?: "fulltext" | "vector" | "hybrid";
  where?: Record<string, any>;
  sortBy?: Array<{ property: string; order?: "asc" | "desc" }>;
  facets?: Record<string, any>;
  limit?: number;
  boost?: Record<string, number>;
  order?: "asc" | "desc";
}
```


## Usage Examples

### Chat Mode with Streaming

```js
const provider = oramaProvider({
  endpoint: process.env.ORAMA_API_URL,
  apiKey: process.env.ORAMA_API_KEY,
  userContext: "The user is looking for documentation help",
  inferenceType: "documentation"
});

const response = await streamText({
  model: provider.ask(),
  prompt: "What is Orama?",
  temperature: 0
});

for await (const chunk of response.textStream) {
  // Handle streaming chunks
  console.log(chunk);
}
```

### Search Mode

```js
const provider = oramaProvider({
  endpoint: process.env.ORAMA_API_URL,
  apiKey: process.env.ORAMA_API_KEY,
  searchMode: "fulltext",
  searchOptions: {
    sortBy: [{ property: "rating", order: "desc" }],
    where: {
      category: "documentation"
    }
  }
});

const response = await generateText({
  model: provider.ask(),
  prompt: "Search query"
});

// Response will include:
// - text: formatted search results
// - results: array of documents with their scores
// - finishReason: 'stop'
// - usage: token usage statistics
```

### Search Results Structure

Search results are returned with the following structure:

```typescript
interface SearchResult {
  text: string;
  results: Array<{
    document: {
      title?: string;
      description?: string;
      image?: string;
      url?: string;
      releaseDate?: string;
      rating?: string;
      genres?: string[];
      // ... other document fields
    };
    score: number;
  }>;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache 2.0. Read the full license [here](/LICENSE.md)
