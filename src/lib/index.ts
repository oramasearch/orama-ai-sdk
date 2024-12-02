import { OramaClient } from "@oramacloud/client";
import { OramaService } from './orama-service';
import type { OramaProviderConfig } from './types';

export function oramaProvider(config: OramaProviderConfig): OramaService {
  if (!config.endpoint || !config.apiKey) {
    throw new Error('Endpoint and API Key are required');
  }

  const client = new OramaClient({
    endpoint: config.endpoint,
    api_key: config.apiKey,
  });

  return new OramaService({
    provider: 'orama.service',
    client,
    config,
  });
}