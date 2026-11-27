/**
 * Crystal Viewer 3D - Constants
 * 集中式配置管理 - 消除Magic Numbers和硬编码字符串
 */

import type { RenderOptions, ExportSettings } from './types';

/** 应用信息 */
export const APP_CONFIG = {
  name: 'Crystal Viewer 3D',
  version: '1.1.0',
  defaultCellId: 'diamond' as const,
  defaultBackgroundColor: '#1a1a2e',
} as const;

/** 渲染配置 */
export const RENDER_CONFIG = {
  defaultOptions: {
    showAtoms: true,
    showBonds: true,
    showLattice: true,
    atomScale: 1.0,
    bondScale: 1.0,
    superCell: [1, 1, 1] as [number, number, number],
    isOrthographic: false,  // 修正命名：useOrthographic -> isOrthographic
    backgroundColor: APP_CONFIG.defaultBackgroundColor,
  } satisfies RenderOptions,

  scaleLimits: {
    atom: { min: 0.5, max: 2.0, step: 0.1 },
    bond: { min: 0.5, max: 2.0, step: 0.1 },
  },

  superCellLimits: {
    min: 1,
    max: 5,
  },

  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
  },
} as const;

/** 导出配置 */
export const EXPORT_CONFIG = {
  defaultSettings: {
    width: 800,
    height: 600,
    fps: 30,
    duration: 5,
    rotationSpeed: 1.0,
    quality: 10,
  } satisfies ExportSettings,

  mimeType: 'video/webm;codecs=vp9' as const,
  fileExtensions: {
    screenshot: 'png',
    video: 'webm',
  } as const,
} as const;

/** 元素化学式映射 */
export const ELEMENT_FORMULAS: Record<string, string> = {
  diamond: 'C',
  silicon: 'Si',
  sic: 'SiC',
  sio2: 'SiO₂',
  dryice: 'CO₂',
  iodine: 'I₂',
  ice: 'H₂O',
  copper: 'Cu',
  magnesium: 'Mg',
  iron: 'Fe',
  nacl: 'NaCl',
  cscl: 'CsCl',
  zns: 'ZnS',
  caf2: 'CaF₂',
  perovskite: 'CaTiO₃',
  graphite: 'C',
} as const;

/** 元素图标映射 */
export const ELEMENT_ICONS: Record<string, string> = {
  diamond: '💎',
  silicon: '🔶',
  sic: '🔷',
  sio2: '🔮',
  dryice: '❄️',
  iodine: '🟣',
  ice: '🧊',
  copper: '🟠',
  magnesium: '⚪',
  iron: '⚙️',
  nacl: '🧂',
  cscl: '⬜',
  zns: '🟡',
  caf2: '💠',
  perovskite: '🔲',
  graphite: '✏️',
} as const;

/** UI选择器常量 - 避免硬编码字符串 */
export const UI_SELECTORS = {
  canvasWrapper: 'canvas-wrapper',
  cellSelect: 'cell-select',
  infoPanel: {
    container: 'info-panel',
    title: 'info-title',
    category: 'info-category',
    lattice: 'info-lattice',
    atoms: 'info-atoms',
    bonds: 'info-bonds',
    coordination: 'info-coordination',
    description: 'info-description',
  },
  controls: {
    showAtoms: 'show-atoms',
    showBonds: 'show-bonds',
    showLattice: 'show-lattice',
    atomScale: 'atom-scale',
    atomScaleValue: 'atom-scale-value',
    bondScale: 'bond-scale',
    bondScaleValue: 'bond-scale-value',
    superCellX: 'supercell-x',
    superCellY: 'supercell-y',
    superCellZ: 'supercell-z',
    isOrthographic: 'orthographic',
    slicePlane: 'slice-plane',  // 截面选择
    viewButtons: 'view-buttons', // 投影视角按钮组
  },
  buttons: {
    resetView: 'reset-view',
    screenshot: 'screenshot',
    exportVideo: 'export-video',
  },
  progress: {
    container: 'export-progress',
    fill: 'progress-fill',
  },
} as const;

/** 键盘快捷键 */
export const KEYBOARD_SHORTCUTS = {
  resetView: 'KeyR',
  screenshot: 'KeyS',
  toggleAtoms: 'Digit1',
  toggleBonds: 'Digit2',
  toggleLattice: 'Digit3',
} as const;

/** 性能配置 */
export const PERFORMANCE_CONFIG = {
  renderDebounceMs: 50,  // 渲染防抖延迟
} as const;

/** 键计算常量 */
export const BOND_CALCULATION_CONFIG = {
  /** 最小键长（排除自键，单位：Å） */
  minBondLength: 0.01,
  /** 最近邻判定容差（2%） */
  nearestNeighborTolerance: 0.02,
  /** 坐标范围配置 */
  coordinateRanges: {
    default: { lower: 0.0, upper: 1.0 },
    molecular: { lower: -0.2, upper: 1.2 },  // 分子晶体（干冰）
    hexagonal: { lower: -0.6, upper: 1.6 },  // 六方晶系（石墨）
  },
  /** 键半径配置 */
  bondRadius: {
    single: 0.08,
    double: 0.12,
    triple: 0.15,
    hydrogen: 0.05,
  },
} as const;

/** 截面显示配置 */
export const SLICE_PLANE_CONFIG = {
  /** 截面容差范围 */
  tolerance: 0.05,
  /** 原子边界边距 */
  padding: 0.5,
} as const;

/** 错误消息 */
export const ERROR_MESSAGES = {
  cellNotFound: (id: string) => `晶胞未找到: ${id}`,
  canvasNotFound: 'Canvas容器未找到',
  exportFailed: '导出失败，请重试',
  invalidSuperCell: (max: number) => `超胞尺寸必须在 1-${max} 之间`,
} as const;

/** 成功消息 */
export const SUCCESS_MESSAGES = {
  screenshotSaved: '截图已保存',
  videoExported: '视频已导出',
} as const;