import { Message } from 'ai';

export interface OramaBaseParams {
  signal?: AbortSignal;
  type?: 'search' | 'answer';
}

export interface OramaSearchParams extends OramaBaseParams {
  limit?: number;
  where?: Record<string, any>;
  boost?: Record<string, number>;
}

export interface OramaAnswerParams extends OramaBaseParams {
  related?: {
    howMany?: number;
    format?: 'question' | 'query';
  };
  stream?: boolean;
}

export type OramaParams = OramaSearchParams | OramaAnswerParams;

export interface OramaProviderConfig {
  endpoint: string;
  apiKey: string;
  headers?: Record<string, string>;
}

export interface OramaSearchResult {
  document: Record<string, any>;
  score: number;
}

export interface OramaAnswerSessionConfig {
  userContext?: string | Record<string, any>;
  inferenceType?: 'documentation';
  initialMessages?: Message[];
  events?: {
    onMessageChange?: (messages: Message[]) => void;
    onMessageLoading?: (loading: boolean) => void;
    onAnswerAborted?: (aborted: boolean) => void;
    onSourceChange?: (sources: any) => void;
    onQueryTranslated?: (query: any) => void;
    onStateChange?: (state: any) => void;
    onNewInteractionStarted?: (interactionId: string) => void;
  };
}