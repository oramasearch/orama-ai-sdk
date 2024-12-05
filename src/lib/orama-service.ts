import { OramaClient } from "@oramacloud/client";
import type { OramaProviderConfig, SearchResponse, SearchHit, SearchResult } from './types';

export class OramaService {
  readonly client: OramaClient;
  readonly config: OramaProviderConfig;

  constructor(config: OramaProviderConfig) {
    this.client = new OramaClient({
      endpoint: config.endpoint,
      api_key: config.apiKey,
    });
    this.config = config;
  }

  ask() {
    const self = this;
    return {
      doGenerate: async (prompt: any) => {
        const promptText = prompt.prompt?.[0]?.content?.[0]?.text || prompt;
        
        if (this.config.searchMode) {
          try {
            const results = await self.client.search({
              term: promptText,
              mode: this.config.searchMode,
              ...this.config.searchOptions
            }) as SearchResponse;

            if (!results?.hits?.length) {
              return {
                text: 'No results found.',
                results: [],
                finishReason: 'stop',
                usage: {
                  promptTokens: promptText.length,
                  completionTokens: 'No results found.'.length,
                  totalTokens: promptText.length + 'No results found.'.length
                }
              } as SearchResult;
            }

            const searchResults = results.hits.map((hit: SearchHit) => ({
              document: hit.document,
              score: hit.score
            }));

            const formattedText = searchResults
              .map((result) => {
                return Object.entries(result.document)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n');
              })
              .join('\n\n');

            return {
              text: formattedText,
              results: searchResults,
              finishReason: 'stop',
              usage: {
                promptTokens: promptText.length,
                completionTokens: formattedText.length,
                totalTokens: promptText.length + formattedText.length
              }
            } as SearchResult;
          } catch (error) {
            console.error('Search error:', error);
            throw error;
          }
        }

        const answerSession = self.client.createAnswerSession({
          userContext: self.config.userContext,
          inferenceType: self.config.inferenceType || 'documentation',
        });

        try {
          const stream = await answerSession.askStream({
            term: promptText
          });

          let text = '';
          for await (const chunk of stream) {
            text += chunk;
          }

          return {
            text,
            finishReason: 'stop',
            usage: {
              promptTokens: promptText.length,
              completionTokens: text.length,
              totalTokens: promptText.length + text.length
            }
          };
        } catch (error) {
          console.error('Orama error:', error);
          throw error;
        }
      },

      doStream: async (prompt: any) => {
        const promptText = prompt.prompt?.[0]?.content?.[0]?.text || prompt;
        
        const answerSession = self.client.createAnswerSession({
          userContext: self.config.userContext,
          inferenceType: self.config.inferenceType || 'documentation',
        });

        try {
          const generator = await answerSession.askStream({
            term: promptText
          });

          return {
            stream: new ReadableStream({
              async start(controller) {
                let accumulatedText = '';
                try {
                  for await (const chunk of generator) {
                    accumulatedText += chunk;
                    controller.enqueue({ type: 'text-delta', textDelta: accumulatedText });
                  }
                  controller.enqueue({
                    type: 'finish',
                    finishReason: 'stop',
                    logprobs: undefined,
                    usage: { completionTokens: 10, promptTokens: 3 },
                  });
                  controller.close();
                } catch (e) {
                  controller.error(e);
                }
              }
            }),
            rawCall: { rawPrompt: promptText, rawSettings: {} },
          };
        } catch (error) {
          console.error('Orama error:', error);
          throw error;
        }
      }
    };
  }
}
