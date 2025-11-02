import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.js'),
      },
      output: { entryFileNames: '[name].js' ,
        format: 'es'
      }
    }
  }
});