import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/lib/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['ai', '@oramacloud/client'],
  treeshake: true,
  sourcemap: true,
  splitting: false,
  dtsExternal: ['ai', '@oramacloud/client']
});