/**
 * Crystal Viewer 3D - UI Manager
 * UI管理器 - 分离DOM操作和业务逻辑
 */

import type { CrystalViewer } from '../core/CrystalViewer';
import { CellRegistry } from '../core/cells/CellImplementations';
import { UI_SELECTORS, ELEMENT_FORMULAS, ELEMENT_ICONS, APP_CONFIG } from '../data/constants';
import type { CellInfoDTO } from '../data/types';

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
    this.createCellButtons();
    this.bindControlEvents();
    this.bindButtonEvents();
    this.bindKeyboardShortcuts();
    
    // 默认加载
    this.selectCellButton(APP_CONFIG.defaultCellId);
    this.updateCellInfo();
  }

  /**
   * 创建晶胞选择按钮
   */
  private createCellButtons(): void {
    const container = document.getElementById(UI_SELECTORS.cellButtons);
    if (!container) return;

    const cells = CellRegistry.getAll();
    
    cells.forEach(cell => {
      const btn = document.createElement('button');
      btn.className = 'cell-btn';
      btn.setAttribute('data-cell-id', cell.id);
      
      const icon = ELEMENT_ICONS[cell.id] ?? '💎';
      const formula = ELEMENT_FORMULAS[cell.id] ?? cell.name;
      
      btn.innerHTML = `
        <div class="icon">${icon}</div>
        <div class="info">
          <div class="name">${cell.nameZh}</div>
          <div class="formula">${formula}</div>
        </div>
      `;
      
      const clickHandler = () => this.handleCellSelect(cell.id, btn);
      btn.addEventListener('click', clickHandler);
      
      this.cleanupFns.push(() => {
        btn.removeEventListener('click', clickHandler);
      });
      
      container.appendChild(btn);
    });
  }

  /**
   * 处理晶胞选择
   */
  private handleCellSelect(cellId: string, btn: HTMLElement): void {
    this.selectCellButton(cellId);
    
    try {
      this.viewer.loadCell(cellId);
      this.updateCellInfo();
    } catch (error) {
      console.error('Failed to load cell:', error);
    }
  }

  /**
   * 选中晶胞按钮
   */
  private selectCellButton(cellId: string): void {
    document.querySelectorAll('.cell-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const btn = document.querySelector(`[data-cell-id="${cellId}"]`);
    if (btn) {
      btn.classList.add('active');
    }
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
    this.bindCheckbox(UI_SELECTORS.controls.isOrthographic, (checked) => {
      this.viewer.setCameraType(checked);
    });

    // 截面控制
    this.bindSlicePlaneControls();
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
      this.viewer.resetView();
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
      const blob = await this.viewer.exportRotationGIF(
        { duration: 5, fps: 30, rotationSpeed: 1 },
        (progress) => {
          if (fillEl) {
            fillEl.style.width = `${progress * 100}%`;
          }
        }
      );
      
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, `crystal-rotation-${Date.now()}.webm`);
      URL.revokeObjectURL(url);
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
      
      switch (e.code) {
        case 'KeyR':
          e.preventDefault();
          this.viewer.resetView();
          break;
        case 'KeyS':
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
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }
}
