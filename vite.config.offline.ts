import { defineConfig } from 'vite';

/**
 * 离线单文件构建配置
 *
 * 与常规构建的区别：
 * - 关闭 sourcemap 与 CSS 拆分，减少内联体积
 * - 不拆 manualChunks，保证只产出一个 JS 文件，便于内联
 * - 资源全部内联，避免生成额外的 assets 请求
 *
 * 构建完成后由 scripts/build-offline.mjs 把 JS/CSS 写入 index.html，
 * 产出可双击打开的单个 HTML（file:// 下内联模块脚本可以正常执行）。
 */
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist-offline',
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100 * 1024 * 1024,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      three: 'three',
    },
  },
});
