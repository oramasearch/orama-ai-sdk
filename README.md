# AI SDK Orama Provider

A provider for [Vercel's AI SDK](https://sdk.vercel.ai/docs) that enables seamless integration with [Orama](https://docs.oramasearch.com/)'s search and chat capabilities.

## Features

- 🔍 Full-text, vector, and hybrid search
- 💬 Streaming chat/QA functionality
- 🚀 Framework agnostic
- 🔄 Real-time streaming responses

## Installation

```
npm install @oramacloud/ai-sdk-provider
```

## Usage

### Configuration

```typescript
// Create an Orama provider instance
const provider = oramaProvider({
  // Required configurations
  endpoint: process.env.ORAMA_API_URL,
  apiKey: process.env.ORAMA_API_KEY,
  // Optional configurations
  userContext?: string | Record<string, any>;  // Context for QA sessions
  inferenceType?: "documentation";  // Currently only supports "documentation"
  searchMode?: "fulltext" | "vector" | "hybrid";  // Default: "fulltext"
  searchOptions?: OramaSearchOptions;  // Additional search parameters
})
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
### Chat/QA Usage

```typescript
import { streamText } from 'ai';
const response = await streamText({
  model: provider.ask(),
  messages: [{ 
    role: 'user', 
    content: 'What is vector search?' 
  }]
});
```

### Search Usage

```typescript
const response = await generateText({
  model: provider.search(),
  messages: [{ 
    role: 'user', 
    content: 'vector search documentation' 
  }]
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache 2.0. Read the full license [here](/LICENSE.md)
