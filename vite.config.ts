import { defineConfig } from 'vite';

export default defineConfig({
  // 基础配置
  base: './',
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three']
        }
      }
    }
  },
  
  // 解析配置
  resolve: {
    alias: {
      'three': 'three'
    }
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    host: true
  }
});
