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
npm install ai-sdk-orama-provider
```

## Quick Start

```js
import { generateText } from 'ai';
import { oramaProvider } from 'ai-sdk-orama-provider';

// Create an Orama provider instance
const orama = oramaProvider({
  endpoint: process.env.ORAMA_API_URL!,
  apiKey: process.env.ORAMA_API_KEY!,
  userContext: "The user is looking for documentation help",
  inferenceType: "documentation"
});

// Use it in your component
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { text } = await generateText({
      model: orama.ask(),
      prompt: input
    });

    setMessages(prev => [...prev, { role: 'assistant', content: text }]);
  };

  return (
    // Your chat UI
  );
}
```

## Configuration

### Provider Configuration

```js
interface OramaProviderConfig {
  endpoint: string;    // Your Orama endpoint URL
  apiKey: string;      // Your Orama API key
  userContext?: string | Record<string, any>; // Context for the chat session
  inferenceType?: "documentation" | "chat";   // Type of inference
  searchMode?: "fulltext" | "vector" | "hybrid"; // Search mode
  searchOptions?: OramaSearchOptions;         // Default search options
}
```

### Search Options

```js
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

### Chat/QA Mode

```js
const orama = oramaProvider({
  endpoint: process.env.ORAMA_API_URL!,
  apiKey: process.env.ORAMA_API_KEY!,
  inferenceType: "documentation"
});

const { text } = await generateText({
  model: orama.ask(),
  prompt: "What is Orama?"
});
```

### Search Mode

```js
const orama = oramaProvider({
  endpoint: process.env.ORAMA_API_URL!,
  apiKey: process.env.ORAMA_API_KEY!,
  searchMode: "hybrid",
  searchOptions: {
    sortBy: [{ property: "rating", order: "desc" }],
    where: {
      category: "documentation"
    }
  }
});

const { text } = await generateText({
  model: orama.ask(),
  prompt: "Search query"
});
```


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache 2.0. Read the full license [here](/LICENSE.md)