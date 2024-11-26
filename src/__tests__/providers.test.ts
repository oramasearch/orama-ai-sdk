import { describe, it, expect } from 'vitest';
import { oramaProvider } from '../lib';

describe('Orama Provider', () => {
  it('should create a provider instance', () => {
    const provider = oramaProvider({
      endpoint: 'https://example.orama.com',
      apiKey: 'test-key'
    });
    
    expect(provider).toBeDefined();
    expect(typeof provider.chat).toBe('function');
  });

  it('should create a chat model instance', () => {
    const provider = oramaProvider({
      endpoint: 'https://example.orama.com',
      apiKey: 'test-key'
    });
    
    const model = provider('orama.search.v1');
    expect(model.specificationVersion).toBe('v1');
    expect(model.provider).toBe('orama.search');
  });
});