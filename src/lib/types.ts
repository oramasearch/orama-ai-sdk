

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
}

export interface SearchHit {
  document: Record<string, any>;
  score: number;
}

export interface SearchResponse {
  hits: SearchHit[];
}

export interface SearchResult {
  text: string;
  results?: any;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

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

export interface OramaStreamResponse extends OramaMessage {
  createdAt: Date;
}