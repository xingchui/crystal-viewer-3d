/**
 * Electron Preload Script
 * 预加载脚本 - 安全地暴露主进程API给渲染进程 (ES Module)
 */

import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 菜单事件监听
  onMenuScreenshot: (callback) => {
    ipcRenderer.on('menu-screenshot', callback);
  },
  
  onMenuResetView: (callback) => {
    ipcRenderer.on('menu-reset-view', callback);
  },
  
  // 移除监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// 暴露平台信息
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  platform: process.platform,
  versions: {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }
});
