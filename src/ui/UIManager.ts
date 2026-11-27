/**
 * Crystal Viewer 3D - UI Manager
 * UI管理器 - 分离DOM操作和业务逻辑
 */

import type { CrystalViewer } from '../core/CrystalViewer';
import { CellRegistry } from '../core/cells/CellImplementations';
import { UI_SELECTORS, ELEMENT_FORMULAS, ELEMENT_ICONS, APP_CONFIG, KEYBOARD_SHORTCUTS } from '../data/constants';
import type { ViewDirection } from '../data/types';

interface ElectronMenuAPI {
  onMenuScreenshot?: (callback: () => void) => void;
  onMenuResetView?: (callback: () => void) => void;
  removeAllListeners?: (channel: string) => void;
}

/**
 * UI管理器
 * 负责所有DOM操作和事件绑定
 */
export class UIManager {
  private viewer: CrystalViewer;
  private cleanupFns: Array<() => void> = [];

  constructor(viewer: CrystalViewer) {
    this.viewer = viewer;
  }

  /**
   * 初始化所有UI组件
   */
  initialize(): void {
    this.createCellSelect();
    this.bindControlEvents();
    this.bindButtonEvents();
    this.bindKeyboardShortcuts();
    this.bindElectronMenuEvents();

    // 渲染完成后同步信息面板（超胞/截面切换后计数也会更新）
    this.viewer.setRenderCompleteCallback(() => this.updateCellInfo());

    // 默认加载
    this.viewer.loadCell(APP_CONFIG.defaultCellId);
    this.syncCellSelect(APP_CONFIG.defaultCellId);
    this.updateCellInfo();
  }

  /**
   * 创建晶胞选择下拉菜单
   * 直接选择晶胞，用 optgroup 按晶体类型分组保留分类线索
   */
  private createCellSelect(): void {
    const select = document.getElementById(UI_SELECTORS.cellSelect) as HTMLSelectElement | null;
    if (!select) return;

    const groups = new Map<string, HTMLOptGroupElement>();

    CellRegistry.getAll().forEach(cell => {
      const category = cell.getCategory();
      let group = groups.get(category);
      if (!group) {
        group = document.createElement('optgroup');
        group.label = category;
        groups.set(category, group);
        select.appendChild(group);
      }

      const option = document.createElement('option');
      option.value = cell.id;

      const icon = ELEMENT_ICONS[cell.id];
      const formula = ELEMENT_FORMULAS[cell.id];
      option.textContent = [icon, cell.nameZh, formula ? `· ${formula}` : null]
        .filter(Boolean)
        .join(' ');

      group.appendChild(option);
    });

    const changeHandler = () => this.handleCellSelect(select.value);
    select.addEventListener('change', changeHandler);
    this.cleanupFns.push(() => {
      select.removeEventListener('change', changeHandler);
    });
  }

  /**
   * 处理晶胞选择
   */
  private handleCellSelect(cellId: string): void {
    this.syncCellSelect(cellId);

    try {
      this.viewer.loadCell(cellId);
      this.syncViewUi('3d');
      this.updateCellInfo();
    } catch (error) {
      console.error('Failed to load cell:', error);
    }
  }

  /**
   * 同步下拉菜单的选中项
   */
  private syncCellSelect(cellId: string): void {
    const select = document.getElementById(UI_SELECTORS.cellSelect) as HTMLSelectElement | null;
    if (select) select.value = cellId;
  }

  /**
   * 绑定控制面板事件
   */
  private bindControlEvents(): void {
    // 显示选项
    this.bindCheckbox(UI_SELECTORS.controls.showAtoms, (checked) => {
      this.viewer.toggleShowAtoms(checked);
    });
    
    this.bindCheckbox(UI_SELECTORS.controls.showBonds, (checked) => {
      this.viewer.toggleShowBonds(checked);
    });
    
    this.bindCheckbox(UI_SELECTORS.controls.showLattice, (checked) => {
      this.viewer.toggleShowLattice(checked);
    });

    // 滑块控制
    this.bindSlider(UI_SELECTORS.controls.atomScale, UI_SELECTORS.controls.atomScaleValue, (value) => {
      this.viewer.setAtomScale(value);
    });
    
    this.bindSlider(UI_SELECTORS.controls.bondScale, UI_SELECTORS.controls.bondScaleValue, (value) => {
      this.viewer.setBondScale(value);
    });

    // 超胞控制
    this.bindSuperCellControls();

    // 正交投影
    // 手动切换后方位角与投影类型不再对应任何预设按钮，因此清除预设高亮，
    // 避免出现过期的高亮状态（不改变相机方向与取景）。
    this.bindCheckbox(UI_SELECTORS.controls.isOrthographic, (checked) => {
      this.viewer.setCameraType(checked);
      this.clearViewSelection();
    });

    // 截面控制
    this.bindSlicePlaneControls();

    // 投影视角按钮
    this.bindViewButtons();
  }

  /**
   * 绑定投影视角按钮
   */
  private bindViewButtons(): void {
    const container = document.getElementById(UI_SELECTORS.controls.viewButtons);
    if (!container) return;

    const views: ViewDirection[] = ['3d', 'yz', 'xz', 'xy', 'body', 'face'];

    container.querySelectorAll<HTMLButtonElement>('.view-btn').forEach(btn => {
      const view = btn.dataset.view as ViewDirection | undefined;
      if (!view || !views.includes(view)) return;

      const handler = () => {
        this.viewer.setViewDirection(view);
        this.syncViewUi(view);
      };

      btn.addEventListener('click', handler);
      this.cleanupFns.push(() => {
        btn.removeEventListener('click', handler);
      });
    });
  }

  /**
   * 同步投影按钮与正交投影复选框
   */
  private syncViewUi(view: ViewDirection): void {
    document.querySelectorAll<HTMLButtonElement>('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    const orthographic = document.getElementById(UI_SELECTORS.controls.isOrthographic) as HTMLInputElement | null;
    if (orthographic) orthographic.checked = view !== '3d';
  }

  /**
   * 清除投影预设高亮（手动切换正交投影后的"自定义视角"状态）
   */
  private clearViewSelection(): void {
    document.querySelectorAll<HTMLButtonElement>('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  /**
   * 重置视角并同步 UI 状态
   */
  private resetViewMode(): void {
    this.viewer.resetView();
    this.syncViewUi('3d');
  }

  /**
   * 绑定截面控制
   */
  private bindSlicePlaneControls(): void {
    const select = document.getElementById(UI_SELECTORS.controls.slicePlane) as HTMLSelectElement | null;
    if (!select) return;

    const eventHandler = () => {
      const plane = select.value as 'none' | 'yz' | 'xz' | 'xy';
      this.viewer.setSlicePlane(plane);
    };

    select.addEventListener('change', eventHandler);
    this.cleanupFns.push(() => {
      select.removeEventListener('change', eventHandler);
    });
  }

  /**
   * 绑定复选框事件
   */
  private bindCheckbox(id: string, handler: (checked: boolean) => void): void {
    const checkbox = document.getElementById(id) as HTMLInputElement | null;
    if (!checkbox) return;

    const eventHandler = () => handler(checkbox.checked);
    checkbox.addEventListener('change', eventHandler);
    
    this.cleanupFns.push(() => {
      checkbox.removeEventListener('change', eventHandler);
    });
  }

  /**
   * 绑定滑块事件
   */
  private bindSlider(
    sliderId: string, 
    valueId: string, 
    handler: (value: number) => void
  ): void {
    const slider = document.getElementById(sliderId) as HTMLInputElement | null;
    const valueEl = document.getElementById(valueId);
    if (!slider) return;

    const eventHandler = () => {
      const value = parseFloat(slider.value);
      if (valueEl) valueEl.textContent = value.toFixed(1);
      handler(value);
    };

    slider.addEventListener('input', eventHandler);
    
    this.cleanupFns.push(() => {
      slider.removeEventListener('input', eventHandler);
    });
  }

  /**
   * 绑定超胞控制
   */
  private bindSuperCellControls(): void {
    const xInput = document.getElementById(UI_SELECTORS.controls.superCellX) as HTMLInputElement | null;
    const yInput = document.getElementById(UI_SELECTORS.controls.superCellY) as HTMLInputElement | null;
    const zInput = document.getElementById(UI_SELECTORS.controls.superCellZ) as HTMLInputElement | null;

    const updateSuperCell = () => {
      const nx = parseInt(xInput?.value ?? '1', 10);
      const ny = parseInt(yInput?.value ?? '1', 10);
      const nz = parseInt(zInput?.value ?? '1', 10);
      
      try {
        this.viewer.setSuperCell(nx, ny, nz);
      } catch (error) {
        console.error('Invalid supercell dimensions:', error);
      }
    };

    [xInput, yInput, zInput].forEach(input => {
      if (!input) return;
      input.addEventListener('change', updateSuperCell);
      this.cleanupFns.push(() => {
        input.removeEventListener('change', updateSuperCell);
      });
    });
  }

  /**
   * 绑定按钮事件
   */
  private bindButtonEvents(): void {
    // 重置视角
    this.bindButton(UI_SELECTORS.buttons.resetView, () => {
      this.resetViewMode();
    });

    // 截图
    this.bindButton(UI_SELECTORS.buttons.screenshot, () => {
      this.handleScreenshot();
    });

    // 导出视频
    this.bindButton(UI_SELECTORS.buttons.exportVideo, () => {
      this.handleExportVideo();
    });
  }

  /**
   * 绑定单个按钮
   */
  private bindButton(id: string, handler: () => void): void {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('click', handler);
    this.cleanupFns.push(() => {
      btn.removeEventListener('click', handler);
    });
  }

  /**
   * 处理截图
   */
  private handleScreenshot(): void {
    try {
      const dataUrl = this.viewer.takeScreenshot();
      this.downloadFile(dataUrl, `crystal-viewer-${Date.now()}.png`);
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  }

  /**
   * 处理视频导出
   */
  private async handleExportVideo(): Promise<void> {
    const progressEl = document.getElementById(UI_SELECTORS.progress.container);
    const fillEl = document.getElementById(UI_SELECTORS.progress.fill);
    
    if (progressEl) progressEl.classList.add('active');
    
    try {
      const blob = await this.viewer.exportRotationVideo(
        { duration: 5, fps: 30, rotationSpeed: 1 },
        (progress) => {
          if (fillEl) {
            fillEl.style.width = `${progress * 100}%`;
          }
        }
      );
      
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, `crystal-rotation-${Date.now()}.webm`);
      // 立即 revoke 可能导致部分浏览器尚未开始下载，延迟释放
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      if (progressEl) progressEl.classList.remove('active');
      if (fillEl) fillEl.style.width = '0%';
    }
  }

  /**
   * 下载文件
   */
  private downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  }

  /**
   * 绑定键盘快捷键
   */
  private bindKeyboardShortcuts(): void {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      // 在输入框/下拉框中打字时不触发全局快捷键
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      ) return;
      
      switch (e.code) {
        case KEYBOARD_SHORTCUTS.resetView:
          e.preventDefault();
          this.resetViewMode();
          break;
        case KEYBOARD_SHORTCUTS.screenshot:
          e.preventDefault();
          this.handleScreenshot();
          break;
      }
    };

    document.addEventListener('keydown', handler);
    this.cleanupFns.push(() => {
      document.removeEventListener('keydown', handler);
    });
  }

  /**
   * 绑定 Electron 主进程菜单事件
   */
  private bindElectronMenuEvents(): void {
    const api = (window as Window & { electronAPI?: ElectronMenuAPI }).electronAPI;
    if (!api) return;

    api.onMenuScreenshot?.(() => this.handleScreenshot());
    api.onMenuResetView?.(() => this.resetViewMode());

    this.cleanupFns.push(() => {
      api.removeAllListeners?.('menu-screenshot');
      api.removeAllListeners?.('menu-reset-view');
      this.viewer.setRenderCompleteCallback(null);
    });
  }

  /**
   * 更新晶胞信息面板
   */
  updateCellInfo(): void {
    const info = this.viewer.getCurrentCellInfo();
    const panel = document.getElementById(UI_SELECTORS.infoPanel.container);
    
    if (!info || !panel) {
      if (panel) panel.style.display = 'none';
      return;
    }

    panel.style.display = 'block';
    
    this.setText(UI_SELECTORS.infoPanel.title, info.nameZh);
    this.setText(UI_SELECTORS.infoPanel.category, info.category);
    this.setText(UI_SELECTORS.infoPanel.lattice, info.latticeConstants);
    this.setText(UI_SELECTORS.infoPanel.atoms, info.atomCount.toString());
    this.setText(UI_SELECTORS.infoPanel.bonds, info.bondCount.toString());
    this.setText(UI_SELECTORS.infoPanel.coordination, info.coordination || '-');
    this.setText(UI_SELECTORS.infoPanel.description, info.description);
  }

  /**
   * 设置元素文本
   */
  private setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.viewer.setRenderCompleteCallback(null);
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }
}
