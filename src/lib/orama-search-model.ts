import { OramaClient } from "@oramacloud/client";
import type { AnswerSessionParams, Message as OramaClientMessage } from "@oramacloud/client"
import { Message as AIMessage } from 'ai';
import { 
  OramaProviderConfig, 
  OramaSearchParams,
  OramaAnswerSessionConfig,
} from './types';

export class StreamingTextResponse extends Response {
  constructor(stream: ReadableStream) {
    super(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}

export class OramaSearchModel {
  private client: OramaClient;
  private answerSession: any;

  constructor(config: OramaProviderConfig) {
    this.client = new OramaClient({
      endpoint: config.endpoint,
      api_key: config.apiKey,
    });
  }

  async search(
    messages: AIMessage[],
    options: OramaSearchParams = {}
  ): Promise<StreamingTextResponse> {
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage?.content) {
      throw new Error('No search query provided');
    }

    try {
      const { signal, type, ...searchParams } = options;
      
      const results = await this.client.search({
        term: lastMessage.content,
        ...searchParams
      });

      const formattedResponse = {
        searchResults: results?.hits.map(hit => ({
          document: hit.document,
          score: hit.score
        })) || [],
        query: lastMessage.content
      };

      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify(formattedResponse)));
          controller.close();
        }
      });

      return new StreamingTextResponse(stream);
    } catch (error) {
      console.error('Orama search error:', error);
      throw new Error(
        error instanceof Error 
          ? `Orama search failed: ${error.message}` 
          : 'Unknown error during search'
      );
    }
  }

  createAnswerSession(config: OramaAnswerSessionConfig = {}) {
    const convertedConfig: AnswerSessionParams = {
      userContext: config.userContext,
      inferenceType: config.inferenceType,
      initialMessages: config.initialMessages?.map(msg => ({
        role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user',
        content: msg.content,
        id: Date.now().toString()
      })) as OramaClientMessage[],
      events: config.events && {
        onMessageChange: (messages: OramaClientMessage[]) => {
          if (config.events?.onMessageChange) {
            config.events.onMessageChange(messages as any);
          }
        },
        onMessageLoading: config.events?.onMessageLoading,
        onAnswerAborted: config.events?.onAnswerAborted,
        onSourceChange: config.events?.onSourceChange,
        onQueryTranslated: config.events?.onQueryTranslated,
        onStateChange: config.events?.onStateChange,
        onNewInteractionStarted: config.events?.onNewInteractionStarted
      }
    };

    this.answerSession = this.client.createAnswerSession(convertedConfig);
    return this;
  }
}