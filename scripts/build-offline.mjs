/**
 * 离线单文件构建后处理
 *
 * 读取 vite.config.offline.ts 的输出，把外部 JS/CSS 内联进 HTML，
 * 生成可直接双击打开的单个 HTML 文件（不依赖本地服务器）。
 *
 * 用法：node scripts/build-offline.mjs
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist-offline');
const releaseDir = path.join(root, 'release');

const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const htmlPath = path.join(distDir, 'index.html');

let html = await readFile(htmlPath, 'utf8');

const readAsset = async (relativeUrl) => {
  const filePath = path.join(distDir, relativeUrl.replace(/^\.?\//, ''));
  return readFile(filePath, 'utf8');
};

// 内联样式表
const cssLinkPattern = /<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
for (const match of [...html.matchAll(cssLinkPattern)]) {
  const [tag, href] = match;
  const css = await readAsset(href);
  // 用函数形式替换，避免 CSS/JS 中的 $& 等被当作替换模式
  html = html.replace(tag, () => `<style>\n${css}\n</style>`);
}

// 内联脚本（内联的 type="module" 脚本在 file:// 下可以执行）
const scriptPattern = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
for (const match of [...html.matchAll(scriptPattern)]) {
  const [tag, src] = match;
  const js = (await readAsset(src)).replace(/<\/script/gi, '<\\/script');
  html = html.replace(tag, () => `<script type="module">\n${js}\n</script>`);
}

// 脚本已内联，modulepreload 不再需要
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>\s*/g, '');

const outPath = path.join(releaseDir, `Crystal-Viewer-Offline-${pkg.version}.html`);
await mkdir(releaseDir, { recursive: true });
await writeFile(outPath, html, 'utf8');

const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0);
console.log(`离线单文件已生成：${outPath}（${sizeKb} KB）`);
