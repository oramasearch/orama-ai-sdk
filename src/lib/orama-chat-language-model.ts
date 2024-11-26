import { Message } from 'ai';
import { OramaClient, ClientSearchParams } from "@oramacloud/client";

export interface OramaConfig {
  endpoint: string;
  apiKey: string;
}

// Extend the ClientSearchParams type
export interface OramaSearchParams extends Omit<ClientSearchParams, 'term'> {
  signal?: AbortSignal;
}

export interface OramaResponse {
  hits: Array<{
    document: any;
    score: number;
  }>;
}

export class OramaChatLanguageModel {
  private client: OramaClient;

  constructor(config: OramaConfig) {
    this.client = new OramaClient({
      endpoint: config.endpoint,
      api_key: config.apiKey,
    });
  }

  async search(
    messages: Message[],
    options: OramaSearchParams = {}
  ): Promise<OramaResponse> {
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage?.content) {
      throw new Error('No message content to search');
    }

    try {
      const { signal, ...searchParams } = options;
      
      const results = await this.client.search({
        term: lastMessage.content,
        limit: searchParams.limit,
        where: searchParams.where,
        mode: searchParams.mode,
        offset: searchParams.offset,
        sortBy: searchParams.sortBy,
        facets: searchParams.facets,
      });

      if (!results) {
        return { hits: [] };
      }

      return {
        hits: results.hits.map(hit => ({
          document: hit.document,
          score: hit.score
        }))
      };
    } catch (error) {
      console.error('Orama search error:', error);
      throw new Error(
        error instanceof Error 
          ? `Orama search failed: ${error.message}` 
          : 'Unknown error during search'
      );
    }
  }
}