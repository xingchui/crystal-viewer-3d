/**
 * Electron Main Process
 * Electron主进程入口 (ES Module)
 */

import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取__dirname的ESM等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 保持全局窗口引用，防止被垃圾回收
let mainWindow = null;

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Crystal Viewer 3D - 晶体结构可视化',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.mjs')
    },
    show: false, // 准备就绪后再显示
    center: true,
    titleBarStyle: 'default'
  });

  // 加载应用
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口准备就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // 处理新窗口打开（在外部浏览器中打开链接）
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建应用菜单
  createMenu();
}

/**
 * 创建应用菜单
 */
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '截图',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-screenshot');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '重置视角',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.webContents.send('menu-reset-view');
          }
        },
        { type: 'separator' },
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+F5',
          click: () => {
            mainWindow?.webContents.reload();
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 Crystal Viewer 3D',
              message: 'Crystal Viewer 3D',
              detail: '版本: 1.0.0\n基于 Three.js + Electron 构建\n© 2026 Crystal Viewer Team'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 应用事件处理
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS: 点击dock图标时重新创建窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（Windows/Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 防止多开
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 如果尝试打开第二个实例，聚焦到已有窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
