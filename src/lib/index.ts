import {
  generateId,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';

import { OramaChatLanguageModel } from './orama-chat-language-model';
import type { OramaChatModelId, OramaChatSettings, OramaProviderConfig } from './types';

export type { 
  OramaConfig,
  OramaSearchParams,
  OramaResponse 
} from './orama-chat-language-model';

export interface OramaProvider {
  (
    modelId: OramaChatModelId,
    settings?: OramaChatSettings,
  ): OramaChatLanguageModel;

  chat(
    modelId: OramaChatModelId,
    settings?: OramaChatSettings,
  ): OramaChatLanguageModel;
}

export interface OramaProviderOptions extends Partial<OramaProviderConfig> {}

export function createOramaProvider(
  options: OramaProviderOptions = {},
): OramaProvider {
  const createModel = (
    modelId: OramaChatModelId,
    settings: OramaChatSettings = {},
  ) => {
    const apiKey = loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'ORAMA_API_KEY',
      description: 'Orama Search',
    });

    const endpoint = withoutTrailingSlash(options.endpoint) ?? 
      loadApiKey({
        apiKey: options.endpoint,
        environmentVariableName: 'ORAMA_API_URL',
        description: 'Orama Endpoint',
      });

    return new OramaChatLanguageModel({
      endpoint,
      apiKey,
    });
  };

  const provider = function (
    modelId: OramaChatModelId,
    settings?: OramaChatSettings,
  ) {
    if (new.target) {
      throw new Error(
        'The model factory function cannot be called with the new keyword.',
      );
    }
    return createModel(modelId, settings);
  };

  provider.chat = createModel;
  return provider as OramaProvider;
}

export const oramaProvider = createOramaProvider();

export type { OramaChatModelId, OramaChatSettings, OramaProviderConfig } from './types';
export { OramaChatLanguageModel };