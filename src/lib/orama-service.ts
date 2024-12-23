import { OramaClient } from "@oramacloud/client";
import type { OramaProviderConfig, SearchResponse, SearchHit, SearchResult } from './types';
import { LanguageModelV1 } from '@ai-sdk/provider'
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
      modelId: "orama-default" as const,
      defaultObjectGenerationMode: "json" as const,
      doGenerate: async (prompt: any): Promise<{
        text: string;
        finishReason: 'stop';
        usage: { promptTokens: number; completionTokens: number; totalTokens: number };
        toolCalls?: any[];
        functionCall?: any;
        logprobs?: any;
        systemFingerprint?: string;
        choices: any[];
        rawCall: any;
      }> => {
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
                finishReason: 'stop' as const,
                usage: {
                  promptTokens: promptText.length,
                  completionTokens: 'No results found.'.length,
                  totalTokens: promptText.length + 'No results found.'.length
                },
                toolCalls: undefined,
                functionCall: undefined,
                logprobs: undefined,
                systemFingerprint: undefined,
                choices: [],
                rawCall: {}
              };
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
              finishReason: 'stop' as const,
              usage: {
                promptTokens: promptText.length,
                completionTokens: formattedText.length,
                totalTokens: promptText.length + formattedText.length
              },
              toolCalls: undefined,
              functionCall: undefined,
              logprobs: undefined,
              systemFingerprint: undefined,
              choices: [],
              rawCall: {}
            };
          } catch (error) {
            console.error('Search error:', error);
            throw error;
          }
        }

        return {
          text: '',
          finishReason: 'stop' as const,
          usage: {
            promptTokens: promptText.length,
            completionTokens: 0,
            totalTokens: promptText.length
          },
          toolCalls: undefined,
          functionCall: undefined,
          logprobs: undefined,
          systemFingerprint: undefined,
          choices: [],
          rawCall: {}
        };
      },
      doStream: async (prompt: any) => {
        const promptText = prompt.prompt?.[0]?.content?.[0]?.text || prompt;
        
        const answerSession = self.client.createAnswerSession({
          userContext: self.config.userContext,
          inferenceType: self.config.inferenceType || 'documentation',
        });

        try {
          const oramaStream = await answerSession.askStream({
            term: promptText
          });

          const stream = new ReadableStream({
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
                    totalTokens: promptText.length
                  }
                });
                controller.close();
              } catch (error) {
                console.error('Stream processing error:', error);
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
              rawSettings: {} as Record<string, unknown>
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
}
