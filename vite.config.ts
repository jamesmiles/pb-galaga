import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';

/** Strip type="module" from script tags since we output IIFE format */
function stripModuleType(): Plugin {
  return {
    name: 'strip-module-type',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && file.fileName.endsWith('.html')) {
          file.source = (file.source as string)
            .replace(/ type="module"/g, '')
            .replace(/ crossorigin/g, '');
        }
      }
    },
  };
}

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        format: 'iife',
      },
    },
  },
  plugins: [stripModuleType()],
  server: {
    port: 3000,
    open: true,
  },
});
