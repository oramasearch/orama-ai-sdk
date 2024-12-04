import type { OramaProviderConfig } from './types';
import { OramaService } from './orama-service';

export function createOramaProvider(config: OramaProviderConfig) {
  if (!config.endpoint || !config.apiKey) {
    throw new Error('Endpoint and API Key are required');
  }

  return new OramaService(config);
}

export const oramaProvider = createOramaProvider;