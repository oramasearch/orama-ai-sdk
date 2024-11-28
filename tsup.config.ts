import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/lib/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['ai', '@oramacloud/client'],
});