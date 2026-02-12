/**
 * Crystal Viewer 3D - Main Entry
 * 应用入口文件 - 重构版本
 */

import { CrystalViewer } from './core/CrystalViewer';
import { UIManager } from './ui/UIManager';
import { APP_CONFIG } from './data/constants';

/**
 * 应用主类
 * 负责初始化和协调Viewer与UIManager
 */
class CrystalViewerApp {
  private viewer: CrystalViewer | null = null;
  private uiManager: UIManager | null = null;

  /**
   * 启动应用
   */
  start(): void {
    const container = document.getElementById('canvas-wrapper');
    if (!container) {
      console.error('Canvas wrapper not found');
      this.showError('应用初始化失败：找不到画布容器');
      return;
    }

    try {
      // 创建核心组件
      this.viewer = new CrystalViewer(container);
      this.uiManager = new UIManager(this.viewer);

      // 初始化UI
      this.uiManager.initialize();

      // 绑定窗口关闭事件
      window.addEventListener('beforeunload', () => this.dispose());

      console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} 启动成功`);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('应用初始化失败，请刷新页面重试');
    }
  }

  /**
   * 显示错误消息
   */
  private showError(message: string): void {
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          color: #e94560;
          font-family: sans-serif;
        ">
          <div style="text-align: center;">
            <h2>⚠️ 错误</h2>
            <p>${message}</p>
            <button onclick="location.reload()" style="
              margin-top: 20px;
              padding: 10px 20px;
              background: #4a90e2;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">刷新页面</button>
          </div>
        </div>
      `;
    }
  }

  /**
   * 清理资源
   */
  private dispose(): void {
    this.uiManager?.dispose();
    this.viewer?.dispose();
    this.uiManager = null;
    this.viewer = null;
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  const app = new CrystalViewerApp();
  app.start();
});
