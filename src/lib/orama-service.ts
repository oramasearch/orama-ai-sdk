import { LanguageModelV1, LanguageModelV1CallOptions, LanguageModelV1FinishReason, LanguageModelV1StreamPart } from '@ai-sdk/provider';
import { OramaClient } from '@oramacloud/client';
import type { OramaProviderConfig, SearchResponse, SearchHit, OramaAnswer } from './types';

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

  ask(): LanguageModelV1 {
    const self = this;
    return {
      specificationVersion: "v1" as const,
      provider: "orama" as const,
      modelId: "orama-qa" as const,
      defaultObjectGenerationMode: "json" as const,
      supportsImageUrls: false,
      
      async doGenerate(options: LanguageModelV1CallOptions) {
        const promptText = self.extractPromptText(options);
        const answerSession = self.client.createAnswerSession({
          userContext: self.config.userContext,
          inferenceType: self.config.inferenceType || 'documentation',
        });

        try {
          const answer = await answerSession.ask({
            term: promptText
          }) as string | OramaAnswer;

          if (typeof answer === 'string') {
            return {
              text: answer,
              finishReason: 'stop' as LanguageModelV1FinishReason,
              usage: {
                promptTokens: promptText.length,
                completionTokens: answer.length,
              },
              rawCall: {
                rawPrompt: promptText,
                rawSettings: Object.entries(self.config).reduce((acc, [key, value]) => {
                  acc[key] = value;
                  return acc;
                }, {} as Record<string, unknown>)
              },
              rawResponse: {
                headers: {}
              },
              response: {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                modelId: "orama-qa"
              },
              toolCalls: undefined,
              warnings: undefined,
              providerMetadata: undefined,
              logprobs: undefined,
              request: {
                body: JSON.stringify({
                  term: promptText,
                  userContext: self.config.userContext,
                  inferenceType: self.config.inferenceType
                })
              }
            };
          }

          return {
            text: answer.text || '',
            finishReason: 'stop' as LanguageModelV1FinishReason,
            usage: {
              promptTokens: promptText.length,
              completionTokens: (answer.text || '').length,
            },
            rawCall: {
              rawPrompt: promptText,
              rawSettings: Object.entries(self.config).reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
              }, {} as Record<string, unknown>)
            },
            rawResponse: {
              headers: {}
            },
            response: {
              id: crypto.randomUUID(),
              timestamp: new Date(),
              modelId: "orama-qa"
            },
            toolCalls: undefined,
            warnings: undefined,
            providerMetadata: undefined,
            logprobs: undefined,
            request: {
              body: JSON.stringify({
                term: promptText,
                userContext: self.config.userContext,
                inferenceType: self.config.inferenceType
              })
            }
          };
        } catch (error) {
          console.error('Orama QA error:', error);
          throw error;
        }
      },

      async doStream(options: LanguageModelV1CallOptions) {
        const promptText = self.extractPromptText(options);
        const answerSession = self.client.createAnswerSession({
          userContext: self.config.userContext,
          inferenceType: self.config.inferenceType || 'documentation',
        });

        try {
          const oramaStream = await answerSession.askStream({
            term: promptText
          });

          const stream = new ReadableStream<LanguageModelV1StreamPart>({
            async start(controller) {
              try {
                for await (const chunk of oramaStream) {
                  if (chunk != null) {
                    controller.enqueue({
                      type: 'text-delta',
                      textDelta: chunk.toString()
                    });
                  }
                }
                controller.enqueue({
                  type: 'finish',
                  finishReason: 'stop',
                  usage: {
                    promptTokens: promptText.length,
                    completionTokens: 0,
                  }
                });
                controller.close();
              } catch (error) {
                controller.enqueue({
                  type: 'error',
                  error
                });
                controller.error(error);
              }
            }
          });

          return {
            stream,
            rawCall: {
              rawPrompt: promptText,
              rawSettings: Object.entries(self.config).reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
              }, {} as Record<string, unknown>)
            },
            rawResponse: {
              headers: {}
            }
          };
        } catch (error) {
          console.error('Orama streaming error:', error);
          throw error;
        }
      }
    };
  }

  search(): LanguageModelV1 {
    const self = this;
    return {
      specificationVersion: "v1" as const,
      provider: "orama" as const,
      modelId: "orama-search" as const,
      defaultObjectGenerationMode: "json" as const,
      supportsImageUrls: false,

      async doGenerate(options: LanguageModelV1CallOptions) {
        const promptText = self.extractPromptText(options);
        
        try {
          const results = await self.client.search({
            term: promptText,
            mode: self.config.searchMode || 'fulltext',
            ...self.config.searchOptions
          }) as SearchResponse;

          const formattedResults = self.formatSearchResults(results.hits);

          return {
            text: formattedResults,
            finishReason: 'stop' as LanguageModelV1FinishReason,
            usage: {
              promptTokens: promptText.length,
              completionTokens: formattedResults.length,
            },
            rawCall: {
              rawPrompt: promptText,
              rawSettings: self.config.searchOptions || {}
            },
            rawResponse: {
              headers: {}
            },
            response: {
              id: crypto.randomUUID(),
              timestamp: new Date(),
              modelId: "orama-search"
            }
          };
        } catch (error) {
          console.error('Search error:', error);
          throw error;
        }
      },

      async doStream(options: LanguageModelV1CallOptions) {
        const results = await this.doGenerate(options);
        
        const stream = new ReadableStream<LanguageModelV1StreamPart>({
          start(controller) {
            if (results.text) {
              controller.enqueue({
                type: 'text-delta',
                textDelta: results.text
              });
            }
            
            controller.enqueue({
              type: 'finish',
              finishReason: results.finishReason,
              usage: results.usage
            });
            
            controller.close();
          }
        });

        return {
          stream,
          rawCall: {
            rawPrompt: self.extractPromptText(options),
            rawSettings: self.config.searchOptions || {}
          },
          rawResponse: {
            headers: {}
          }
        };
      }
    };
  }

  private extractPromptText(options: LanguageModelV1CallOptions): string {
    if (!options.prompt?.[0]?.content?.[0]) {
      return '';
    }
    
    const content = options.prompt[0].content[0];
    if (typeof content === 'string') {
      return content;
    }
    
    if ('text' in content) {
      return content.text as string;
    }
    
    return '';
  }

  private formatSearchResults(hits: SearchHit[]): string {
    if (!hits.length) return 'No results found.';
    
    return hits
      .map(hit => {
        return Object.entries(hit.document)
          .filter(([_, value]) => value != null)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      })
      .join('\n\n');
  }
}