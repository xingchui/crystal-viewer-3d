/**
 * Crystal Viewer 3D - Type Definitions
 * 晶胞可视化应用类型定义 - 增强类型安全版本
 */

// ==================== 基础类型 ====================

/** 元素符号类型 - 严格限制常见元素 */
export type ElementSymbol = 
  | 'H' | 'He' | 'Li' | 'Be' | 'B' | 'C' | 'N' | 'O' | 'F' | 'Ne'
  | 'Na' | 'Mg' | 'Al' | 'Si' | 'P' | 'S' | 'Cl' | 'Ar'
  | 'K' | 'Ca' | 'Fe' | 'Cu' | 'Zn' | 'Ag' | 'Au'
  | 'Cs';

/** 键类型 */
export type BondType = 'single' | 'double' | 'triple';

/** 晶格类型 */
export type LatticeType = 
  | 'cubic' | 'fcc' | 'bcc' | 'diamond' | 'zincblende' 
  | 'rocksalt' | 'cesiumchloride' | 'fluorite' | 'hexagonal';

/** 晶体类别 */
export type CrystalCategory = 'covalent' | 'molecular' | 'ionic' | 'metallic';

// ==================== 实体类型 ====================

/** 原子定义 */
export interface Atom {
  readonly element: ElementSymbol;
  x: number;
  y: number;
  z: number;
  color?: string;
  radius?: number;
}

/** 化学键定义 */
export interface Bond {
  atom1: number;
  atom2: number;
  type?: BondType;
}

/** 晶胞数据接口 */
export interface UnitCell {
  id: string;
  name: string;
  nameZh: string;
  latticeType: LatticeType;
  a: number;
  b: number;
  c: number;
  alpha: number;
  beta: number;
  gamma: number;
  atoms: Atom[];
  bonds?: Bond[];
  properties?: {
    description: string;
    category: CrystalCategory;
    coordination?: string;
  };
}

/** 元素属性 */
export interface ElementData {
  symbol: ElementSymbol;
  name: string;
  nameZh: string;
  atomicNumber: number;
  atomicRadius: number;
  vdwRadius: number;
  color: string;
  metalColor?: string;
}

/** 渲染选项 */
export interface RenderOptions {
  showAtoms: boolean;
  showBonds: boolean;
  showLattice: boolean;
  atomScale: number;
  bondScale: number;
  superCell: [number, number, number];
  isOrthographic: boolean;
  backgroundColor: string;
}

/** 导出设置 */
export interface ExportSettings {
  width: number;
  height: number;
  fps: number;
  duration: number;
  rotationSpeed: number;
  quality: number;
}

/** 晶胞信息DTO */
export interface CellInfoDTO {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  category: string;
  coordination: string;
  latticeConstants: string;
  atomCount: number;
  bondCount: number;
}

/** 可用晶胞列表项 */
export interface AvailableCellDTO {
  id: string;
  name: string;
  nameZh: string;
  category: string;
}

/** 导出进度回调 */
export type ExportProgressCallback = (progress: number) => void;
