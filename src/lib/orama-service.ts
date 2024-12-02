import { OramaClient } from "@oramacloud/client";
import type { OramaProviderConfig, OramaMessage } from './types';

interface OramaServiceOptions {
  provider: string;
  client: OramaClient;
  config: OramaProviderConfig;
}

export class OramaService {
  readonly provider: string;
  readonly client: OramaClient;
  readonly config: OramaProviderConfig;

  constructor(options: OramaServiceOptions) {
    this.provider = options.provider;
    this.client = options.client;
    this.config = options.config;
  }

  async *askStream(messages: OramaMessage[]) {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) throw new Error('No query provided');
  
    const answerSession = this.client.createAnswerSession({
      userContext: this.config.userContext,
      inferenceType: this.config.inferenceType || 'documentation',
      events: this.config.events
    });
  
    try {
      const answer = await answerSession.askStream({
        term: lastMessage.content
      });
    
      let text = '';
      for await (const chunk of answer) {
        text += chunk;
        yield {
          role: 'assistant',
          content: text
        };
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }

  async search(query: string, options: any) {
    const searchResponse = await this.client.search({
      term: query,
      mode: this.config.searchMode || 'hybrid',
      ...this.config.searchOptions,
      ...options
    });

    if (!searchResponse?.hits) {
      throw new Error('No search results found');
    }

    return searchResponse.hits.map(hit => ({
      document: hit.document,
      score: hit.score
    }));
  }
}
