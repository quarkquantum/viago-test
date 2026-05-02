import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', './src/rpc.ts'],
  outDir: 'dist',
  format: 'esm',
  platform: 'node',
  clean: true,
  dts: true,
  minify: true,
  treeshake: true,
  inlineOnly: false,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
});
