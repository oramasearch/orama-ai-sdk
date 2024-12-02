import type { Message } from 'ai';

export interface OramaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface OramaSearchOptions {
  mode?: "fulltext" | "vector" | "hybrid";
  where?: Record<string, any>;
  sortBy?: Array<{ property: string; order?: "asc" | "desc" }>;
  facets?: Record<string, any>;
  limit?: number;
  boost?: Record<string, number>;
}

export interface OramaProviderConfig {
  endpoint: string;
  apiKey: string;
  userContext?: string | Record<string, any>;
  inferenceType?: "documentation";
  searchMode?: "fulltext" | "vector" | "hybrid";
  searchOptions?: {
    where?: Record<string, any>;
    sortBy?: Array<{ property: string; order?: "asc" | "desc" }>;
    facets?: Record<string, any>;
    limit?: number;
    boost?: Record<string, number>;
  };
  events?: {
    onMessageLoading?: (loading: boolean) => void;
    onMessageChange?: (messages: any[]) => void;
    onAnswerAborted?: (aborted: boolean) => void;
    onSourceChange?: (sources: any) => void;
    onQueryTranslated?: (query: any) => void;
    onStateChange?: (state: any) => void;
    onNewInteractionStarted?: (interactionId: string) => void;
  };
}

export interface OramaStreamResponse extends OramaMessage {
  createdAt: Date;
}