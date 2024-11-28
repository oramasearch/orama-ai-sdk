import {
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';

import { OramaSearchModel } from './orama-search-model';
import type {
  OramaParams,
  OramaAnswerParams,
  OramaSearchParams,
  OramaProviderConfig,
  OramaAnswerSessionConfig
} from './types';

export interface OramaProvider {
  (
    settings?: OramaParams,
  ): OramaSearchModel;

  search(
    settings?: OramaSearchParams,
  ): OramaSearchModel;

  answer(
    settings?: OramaAnswerParams,
    sessionConfig?: OramaAnswerSessionConfig
  ): OramaSearchModel;
}

export function createOramaProvider(
  options: Partial<OramaProviderConfig> = {},
): OramaProvider {
  const createModel = (
    settings: OramaParams = {},
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

    return new OramaSearchModel({
      endpoint,
      apiKey,
      headers: options.headers,
    });
  };

  const provider = function (
    settings?: OramaParams,
  ) {
    if (new.target) {
      throw new Error(
        'The model factory function cannot be called with the new keyword.',
      );
    }
    return createModel(settings);
  };

  provider.search = (settings?: OramaSearchParams) => 
    createModel(settings);
    
  provider.answer = (settings?: OramaAnswerParams, sessionConfig?: OramaAnswerSessionConfig) => {
    const model = createModel(settings);
    if (sessionConfig) {
      model.createAnswerSession(sessionConfig);
    }
    return model;
  };

  return provider as OramaProvider;
}

export const oramaProvider = createOramaProvider();

export type {
  OramaParams,
  OramaAnswerParams,
  OramaSearchParams,
  OramaProviderConfig,
  OramaAnswerSessionConfig,
} from './types';

export { OramaSearchModel };