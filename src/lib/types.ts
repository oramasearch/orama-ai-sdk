export type OramaChatModelId = 'orama.search.v1';

export interface OramaChatSettings {
  limit?: number;
  where?: Record<string, any>;
  boost?: Record<string, number>;
}

export interface OramaProviderConfig {
  endpoint: string;
  apiKey: string;
  headers?: Record<string, string>;
}