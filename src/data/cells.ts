/**
 * Crystal Viewer 3D - Unit Cell Data
 * 晶胞数据定义 - 满足晶胞平移对称性要求
 * 
 * 晶胞定义要求：
 * 1. 八个顶点原子相同（通过周期性平移等价）
 * 2. 四条平行棱相同（相对棱有相同原子分布）
 * 3. 平行面相同（相对面有相同原子分布）
 * 
 * 本文件定义的是用于可视化的"常规晶胞"(Conventional Cell)
 * 包含完整的8个顶点、12条棱、6个面，以满足教学演示需求
 */

import type { UnitCell, Atom, Bond } from './types';

/**
 * 金刚石 (Diamond) - 面心立方结构
 * 
 * 结构描述：
 * - 晶格类型：面心立方 (FCC)
 * - 为了可视化教学需求，定义完整的常规晶胞
 * - 包含：8个顶点 + 6个面心 + 4个内部原子 = 18个原子位置
 * 
 * 注意：实际物理原胞只有8个原子，这里为了演示晶胞平移对称性，
 * 明确定义了所有顶点位置
 */
export const diamondCell: UnitCell = {
  id: 'diamond',
  name: 'Diamond',
  nameZh: '金刚石',
  latticeType: 'diamond',
  a: 3.56683,
  b: 3.56683,
  c: 3.56683,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    // ========== 8个角顶点 ==========
    // 底面四个顶点 (z=0)
    { element: 'C', x: 0, y: 0, z: 0 },     // 顶点1: 原点
    { element: 'C', x: 1, y: 0, z: 0 },     // 顶点2: x方向
    { element: 'C', x: 0, y: 1, z: 0 },     // 顶点3: y方向
    { element: 'C', x: 1, y: 1, z: 0 },     // 顶点4: xy对角
    // 顶面四个顶点 (z=1)
    { element: 'C', x: 0, y: 0, z: 1 },     // 顶点5: z方向
    { element: 'C', x: 1, y: 0, z: 1 },     // 顶点6: xz对角
    { element: 'C', x: 0, y: 1, z: 1 },     // 顶点7: yz对角
    { element: 'C', x: 1, y: 1, z: 1 },     // 顶点8: xyz对角
    
    // ========== 6个面心位置 ==========
    // 底面面心 (z=0)
    { element: 'C', x: 0.5, y: 0.5, z: 0 },
    // 顶面面心 (z=1)
    { element: 'C', x: 0.5, y: 0.5, z: 1 },
    // 前面面心 (y=0)
    { element: 'C', x: 0.5, y: 0, z: 0.5 },
    // 后面面心 (y=1)
    { element: 'C', x: 0.5, y: 1, z: 0.5 },
    // 左面面心 (x=0)
    { element: 'C', x: 0, y: 0.5, z: 0.5 },
    // 右面面心 (x=1)
    { element: 'C', x: 1, y: 0.5, z: 0.5 },
    
    // ========== 4个内部原子（体对角线1/4处）==========
    { element: 'C', x: 0.25, y: 0.25, z: 0.25 },
    { element: 'C', x: 0.75, y: 0.75, z: 0.25 },
    { element: 'C', x: 0.75, y: 0.25, z: 0.75 },
    { element: 'C', x: 0.25, y: 0.75, z: 0.75 },
  ],
  properties: {
    description: '面心立方结构，显示完整的8个顶点、6个面心和4个内部原子。满足晶胞平移对称性要求：八个顶点都有原子显示，平行棱和面具有相同原子分布。',
    category: 'covalent',
    coordination: '4 (四面体配位)'
  }
};

/**
 * 干冰 (Dry Ice) - CO₂分子晶体，面心立方结构
 *
 * 结构描述：
 * - 空间群 Pa-3（面心立方），常规晶胞含 4 个 CO₂ 分子
 * - CO₂分子位于面心立方格点
 * - 每个CO₂分子：1个C + 2个O
 * - 4 种分子取向分别沿 4 条体对角线：
 *   顶点为 [111]，三组面心分别为 [1-1-1]、[11-1]、[-11-1]
 */

/** CO₂ 中 O 相对 C 的分数坐标偏移（Pa-3 的 8c 位点 x≈0.115） */
const CO2_O_OFFSET = 0.115;

type FractionalVec3 = readonly [number, number, number];

/** 以 center 为中心、沿 offset 的正反方向各放一个 O，生成一个 CO₂ 分子 */
function co2MoleculeAt(center: FractionalVec3, offset: FractionalVec3): Atom[] {
  return [
    { element: 'C', x: center[0], y: center[1], z: center[2] },
    { element: 'O', x: center[0] + offset[0], y: center[1] + offset[1], z: center[2] + offset[2] },
    { element: 'O', x: center[0] - offset[0], y: center[1] - offset[1], z: center[2] - offset[2] },
  ];
}

// 4 个 Pa-3 分子位点对应的分子轴方向；8 个顶点是同一分子的平移等价位置
const CO2_ORIENTATIONS = {
  corner: [CO2_O_OFFSET, CO2_O_OFFSET, CO2_O_OFFSET],
  faceZ: [CO2_O_OFFSET, -CO2_O_OFFSET, -CO2_O_OFFSET],
  faceY: [CO2_O_OFFSET, CO2_O_OFFSET, -CO2_O_OFFSET],
  faceX: [-CO2_O_OFFSET, CO2_O_OFFSET, -CO2_O_OFFSET],
} as const satisfies Record<string, FractionalVec3>;

const DRY_ICE_CORNERS: FractionalVec3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
];

const DRY_ICE_FACE_Z: FractionalVec3[] = [[0.5, 0.5, 0], [0.5, 0.5, 1]];
const DRY_ICE_FACE_Y: FractionalVec3[] = [[0.5, 0, 0.5], [0.5, 1, 0.5]];
const DRY_ICE_FACE_X: FractionalVec3[] = [[0, 0.5, 0.5], [1, 0.5, 0.5]];

export const dryIceCell: UnitCell = {
  id: 'dryice',
  name: 'Dry Ice',
  nameZh: '干冰',
  latticeType: 'fcc',
  a: 5.64,
  b: 5.64,
  c: 5.64,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    // 8 个顶点：同一 CO₂ 分子的平移等价位置，分子轴沿 [111]
    ...DRY_ICE_CORNERS.flatMap(center => co2MoleculeAt(center, CO2_ORIENTATIONS.corner)),

    // z=0 / z=1 面心：分子轴沿 [1-1-1]
    ...DRY_ICE_FACE_Z.flatMap(center => co2MoleculeAt(center, CO2_ORIENTATIONS.faceZ)),

    // y=0 / y=1 面心：分子轴沿 [11-1]
    ...DRY_ICE_FACE_Y.flatMap(center => co2MoleculeAt(center, CO2_ORIENTATIONS.faceY)),

    // x=0 / x=1 面心：分子轴沿 [-11-1]
    ...DRY_ICE_FACE_X.flatMap(center => co2MoleculeAt(center, CO2_ORIENTATIONS.faceX)),
  ],
  properties: {
    description: '分子晶体，空间群 Pa-3（面心立方），每个晶胞含 4 个 CO₂ 分子。分子轴沿 4 条体对角线：8 个顶点为 [111]，三组面心分别为 [1-1-1]、[11-1]、[-11-1]。显示完整的 8 个顶点和 6 个面心分子。',
    category: 'molecular',
    coordination: '12 (分子间)'
  }
};

/**
 * 碳化硅 (SiC) - 闪锌矿结构
 * 
 * 结构描述：
 * - 晶格类型：面心立方 (FCC)
 * - Si和C交替排列
 */
export const sicCell: UnitCell = {
  id: 'sic',
  name: 'Silicon Carbide',
  nameZh: '碳化硅',
  latticeType: 'zincblende',
  a: 4.3596,
  b: 4.3596,
  c: 4.3596,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    // ========== 8个顶点上的Si原子 ==========
    { element: 'Si', x: 0, y: 0, z: 0 },
    { element: 'Si', x: 1, y: 0, z: 0 },
    { element: 'Si', x: 0, y: 1, z: 0 },
    { element: 'Si', x: 1, y: 1, z: 0 },
    { element: 'Si', x: 0, y: 0, z: 1 },
    { element: 'Si', x: 1, y: 0, z: 1 },
    { element: 'Si', x: 0, y: 1, z: 1 },
    { element: 'Si', x: 1, y: 1, z: 1 },
    
    // ========== 6个面心上的Si原子 ==========
    { element: 'Si', x: 0.5, y: 0.5, z: 0 },
    { element: 'Si', x: 0.5, y: 0.5, z: 1 },
    { element: 'Si', x: 0.5, y: 0, z: 0.5 },
    { element: 'Si', x: 0.5, y: 1, z: 0.5 },
    { element: 'Si', x: 0, y: 0.5, z: 0.5 },
    { element: 'Si', x: 1, y: 0.5, z: 0.5 },
    
    // ========== 4个内部C原子 ==========
    { element: 'C', x: 0.25, y: 0.25, z: 0.25 },
    { element: 'C', x: 0.75, y: 0.75, z: 0.25 },
    { element: 'C', x: 0.75, y: 0.25, z: 0.75 },
    { element: 'C', x: 0.25, y: 0.75, z: 0.75 },
  ],
  properties: {
    description: '闪锌矿结构(3C-SiC)，显示完整的8个顶点Si原子、6个面心Si原子和4个内部C原子。满足晶胞平移对称性。',
    category: 'covalent',
    coordination: '4 (四面体配位)'
  }
};

/**
 * 氯化钠 (NaCl) - 岩盐结构
 * 
 * 结构描述：
 * - 晶格类型：面心立方 (FCC)
 * - Na⁺和Cl⁻交替排列
 * - Na⁺位于：8个顶点 + 6个面心
 * - Cl⁻位于：12个棱中点 + 1个体心
 */
export const naclCell: UnitCell = {
  id: 'nacl',
  name: 'Sodium Chloride',
  nameZh: '氯化钠',
  latticeType: 'rocksalt',
  a: 5.64,
  b: 5.64,
  c: 5.64,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    // ========== Na⁺离子：8个顶点 ==========
    { element: 'Na', x: 0, y: 0, z: 0 },
    { element: 'Na', x: 1, y: 0, z: 0 },
    { element: 'Na', x: 0, y: 1, z: 0 },
    { element: 'Na', x: 1, y: 1, z: 0 },
    { element: 'Na', x: 0, y: 0, z: 1 },
    { element: 'Na', x: 1, y: 0, z: 1 },
    { element: 'Na', x: 0, y: 1, z: 1 },
    { element: 'Na', x: 1, y: 1, z: 1 },
    
    // ========== Na⁺离子：6个面心 ==========
    { element: 'Na', x: 0.5, y: 0.5, z: 0 },   // 底面
    { element: 'Na', x: 0.5, y: 0.5, z: 1 },   // 顶面
    { element: 'Na', x: 0.5, y: 0, z: 0.5 },   // 前面
    { element: 'Na', x: 0.5, y: 1, z: 0.5 },   // 后面
    { element: 'Na', x: 0, y: 0.5, z: 0.5 },   // 左面
    { element: 'Na', x: 1, y: 0.5, z: 0.5 },   // 右面
    
    // ========== Cl⁻离子：12个棱中点 ==========
    { element: 'Cl', x: 0.5, y: 0, z: 0 },     // 底面棱
    { element: 'Cl', x: 0, y: 0.5, z: 0 },     // 底面棱
    { element: 'Cl', x: 0.5, y: 1, z: 0 },     // 底面棱
    { element: 'Cl', x: 1, y: 0.5, z: 0 },     // 底面棱
    { element: 'Cl', x: 0.5, y: 0, z: 1 },     // 顶面棱
    { element: 'Cl', x: 0, y: 0.5, z: 1 },     // 顶面棱
    { element: 'Cl', x: 0.5, y: 1, z: 1 },     // 顶面棱
    { element: 'Cl', x: 1, y: 0.5, z: 1 },     // 顶面棱
    { element: 'Cl', x: 0, y: 0, z: 0.5 },     // 竖棱
    { element: 'Cl', x: 1, y: 0, z: 0.5 },     // 竖棱
    { element: 'Cl', x: 0, y: 1, z: 0.5 },     // 竖棱
    { element: 'Cl', x: 1, y: 1, z: 0.5 },     // 竖棱
    
    // ========== Cl⁻离子：1个体心 ==========
    { element: 'Cl', x: 0.5, y: 0.5, z: 0.5 },
  ],
  properties: {
    description: '离子晶体，岩盐结构。Na⁺位于8个顶点和6个面心，Cl⁻位于12个棱中点和体心。显示完整的离子配位环境。',
    category: 'ionic',
    coordination: '6 (八面体配位)'
  }
};

/**
 * 氯化铯 (CsCl) - 铯氯结构
 * 
 * 结构描述：
 * - 晶格类型：简单立方 (SC)
 * - Cs⁺位于8个顶点
 * - Cl⁻位于体心
 * - 配位数：8（立方配位）
 */
export const csclCell: UnitCell = {
  id: 'cscl',
  name: 'Cesium Chloride',
  nameZh: '氯化铯',
  latticeType: 'cesiumchloride',
  a: 4.123,
  b: 4.123,
  c: 4.123,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    // ========== Cs⁺离子：8个顶点 ==========
    { element: 'Cs', x: 0, y: 0, z: 0 },
    { element: 'Cs', x: 1, y: 0, z: 0 },
    { element: 'Cs', x: 0, y: 1, z: 0 },
    { element: 'Cs', x: 1, y: 1, z: 0 },
    { element: 'Cs', x: 0, y: 0, z: 1 },
    { element: 'Cs', x: 1, y: 0, z: 1 },
    { element: 'Cs', x: 0, y: 1, z: 1 },
    { element: 'Cs', x: 1, y: 1, z: 1 },
    
    // ========== Cl⁻离子：1个体心 ==========
    { element: 'Cl', x: 0.5, y: 0.5, z: 0.5 },
  ],
  properties: {
    description: '离子晶体，铯氯结构。Cs⁺位于8个顶点，Cl⁻位于体心。显示完整的8配位立方结构。',
    category: 'ionic',
    coordination: '8 (立方配位)'
  }
};

/**
 * 硫化锌 (ZnS) - 闪锌矿结构
 * 
 * 结构描述：
 * - 晶格类型：面心立方 (FCC)
 * - Zn和S交替排列（类似SiC和金刚石）
 * - Zn位于：8个顶点 + 6个面心
 * - S位于：4个内部四面体位置
 */
export const znsCell: UnitCell = {
  id: 'zns',
  name: 'Zinc Sulfide',
  nameZh: '硫化锌',
  latticeType: 'zincblende',
  a: 5.4093,
  b: 5.4093,
  c: 5.4093,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    // ========== Zn离子：8个顶点 ==========
    { element: 'Zn', x: 0, y: 0, z: 0 },
    { element: 'Zn', x: 1, y: 0, z: 0 },
    { element: 'Zn', x: 0, y: 1, z: 0 },
    { element: 'Zn', x: 1, y: 1, z: 0 },
    { element: 'Zn', x: 0, y: 0, z: 1 },
    { element: 'Zn', x: 1, y: 0, z: 1 },
    { element: 'Zn', x: 0, y: 1, z: 1 },
    { element: 'Zn', x: 1, y: 1, z: 1 },
    
    // ========== Zn离子：6个面心 ==========
    { element: 'Zn', x: 0.5, y: 0.5, z: 0 },
    { element: 'Zn', x: 0.5, y: 0.5, z: 1 },
    { element: 'Zn', x: 0.5, y: 0, z: 0.5 },
    { element: 'Zn', x: 0.5, y: 1, z: 0.5 },
    { element: 'Zn', x: 0, y: 0.5, z: 0.5 },
    { element: 'Zn', x: 1, y: 0.5, z: 0.5 },
    
    // ========== S离子：4个内部位置 ==========
    { element: 'S', x: 0.25, y: 0.25, z: 0.25 },
    { element: 'S', x: 0.75, y: 0.75, z: 0.25 },
    { element: 'S', x: 0.75, y: 0.25, z: 0.75 },
    { element: 'S', x: 0.25, y: 0.75, z: 0.75 },
  ],
  properties: {
    description: '离子晶体，闪锌矿结构。Zn位于8个顶点和6个面心，S位于4个内部四面体位置。显示完整的4配位四面体结构。',
    category: 'ionic',
    coordination: '4 (四面体配位)'
  }
};

/**
 * 氟化钙 (CaF₂) - 萤石结构
 * 
 * 结构描述：
 * - 晶格类型：面心立方 (FCC)
 * - Ca²⁺位于：8个顶点 + 6个面心
 * - F⁻位于：8个内部位置（体对角线1/4和3/4处）
 * - Ca配位数：8，F配位数：4
 */
export const caf2Cell: UnitCell = {
  id: 'caf2',
  name: 'Calcium Fluoride',
  nameZh: '氟化钙',
  latticeType: 'fluorite',
  a: 5.4626,
  b: 5.4626,
  c: 5.4626,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    // ========== Ca离子：8个顶点 ==========
    { element: 'Ca', x: 0, y: 0, z: 0 },
    { element: 'Ca', x: 1, y: 0, z: 0 },
    { element: 'Ca', x: 0, y: 1, z: 0 },
    { element: 'Ca', x: 1, y: 1, z: 0 },
    { element: 'Ca', x: 0, y: 0, z: 1 },
    { element: 'Ca', x: 1, y: 0, z: 1 },
    { element: 'Ca', x: 0, y: 1, z: 1 },
    { element: 'Ca', x: 1, y: 1, z: 1 },
    
    // ========== Ca离子：6个面心 ==========
    { element: 'Ca', x: 0.5, y: 0.5, z: 0 },
    { element: 'Ca', x: 0.5, y: 0.5, z: 1 },
    { element: 'Ca', x: 0.5, y: 0, z: 0.5 },
    { element: 'Ca', x: 0.5, y: 1, z: 0.5 },
    { element: 'Ca', x: 0, y: 0.5, z: 0.5 },
    { element: 'Ca', x: 1, y: 0.5, z: 0.5 },
    
    // ========== F离子：8个内部位置 ==========
    { element: 'F', x: 0.25, y: 0.25, z: 0.25 },
    { element: 'F', x: 0.75, y: 0.75, z: 0.25 },
    { element: 'F', x: 0.75, y: 0.25, z: 0.75 },
    { element: 'F', x: 0.25, y: 0.75, z: 0.75 },
    { element: 'F', x: 0.75, y: 0.25, z: 0.25 },
    { element: 'F', x: 0.25, y: 0.75, z: 0.25 },
    { element: 'F', x: 0.25, y: 0.25, z: 0.75 },
    { element: 'F', x: 0.75, y: 0.75, z: 0.75 },
  ],
  properties: {
    description: '离子晶体，萤石结构。Ca²⁺位于8个顶点和6个面心，F⁻位于8个内部位置。显示Ca的8配位和F的4配位。',
    category: 'ionic',
    coordination: '8 (Ca), 4 (F)'
  }
};

/**
 * 石墨 (Graphite) - 层状六方结构
 * 
 * 结构描述：
 * - 晶格类型：六方 (Hexagonal)
 * - a = b = 2.46Å, c = 6.70Å, γ = 120°
 * - ABA三层堆叠，AB层错位
 * - 层内：六角网格，sp²杂化
 * - A层：4个顶点 + 1个内部（菱形中心）
 * - B层：与A层错位
 * - 层间：范德华力，间距3.35Å
 */
export const graphiteCell: UnitCell = {
  id: 'graphite',
  name: 'Graphite',
  nameZh: '石墨',
  latticeType: 'hexagonal',
  a: 2.46,
  b: 2.46,
  c: 6.70,
  alpha: 90,
  beta: 90,
  gamma: 120,  // 六方晶系关键特征
  atoms: [
    // ========== 第一层 A (z=0) ==========
    // 4个顶点（六方晶胞的顶点）
    { element: 'C', x: 0, y: 0, z: 0 },
    { element: 'C', x: 1, y: 0, z: 0 },
    { element: 'C', x: 0, y: 1, z: 0 },
    { element: 'C', x: 1, y: 1, z: 0 },
    // 1个内部原子（菱形中心）
    { element: 'C', x: 0.3333, y: 0.6667, z: 0 },
    
    // ========== 第二层 B (z=0.5) - AB错位 ==========
    // B层原子位于A层六角环中心上方，与A层错位
    { element: 'C', x: 0, y: 0, z: 0.5 },
    { element: 'C', x: 1, y: 0, z: 0.5 },
    { element: 'C', x: 0, y: 1, z: 0.5 },
    { element: 'C', x: 1, y: 1, z: 0.5 },
    { element: 'C', x: 0.6667, y: 0.3333, z: 0.5 },
    
    // ========== 第三层 A (z=1) - 与第一层对齐 ==========
    // 回到A层位置
    { element: 'C', x: 0, y: 0, z: 1 },
    { element: 'C', x: 1, y: 0, z: 1 },
    { element: 'C', x: 0, y: 1, z: 1 },
    { element: 'C', x: 1, y: 1, z: 1 },
    { element: 'C', x: 0.3333, y: 0.6667, z: 1 },
  ],
  properties: {
    description: '层状结构，六方晶系。ABA三层堆叠，A层4顶点+1内部，AB错位。只显示层内最近邻C-C共价键。',
    category: 'mixed',
    coordination: '3 (平面三角形)'
  }
};

// ==================== 教材补充晶胞 ====================

/** 面心立方格点：8 个顶点 + 6 个面心 */
const FCC_SITES: FractionalVec3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
  [0.5, 0.5, 0], [0.5, 0.5, 1],
  [0.5, 0, 0.5], [0.5, 1, 0.5],
  [0, 0.5, 0.5], [1, 0.5, 0.5],
];

function atomsAt(sites: FractionalVec3[], element: Atom['element']): Atom[] {
  return sites.map(([x, y, z]) => ({ element, x, y, z }));
}

/**
 * 晶体硅 (Silicon) - 金刚石型结构
 *
 * 与金刚石相同的 8 顶点 + 6 面心 + 4 内部原子排布，
 * 只是把 C 换成 Si，a = 5.431 Å。
 */
export const siliconCell: UnitCell = {
  id: 'silicon',
  name: 'Silicon',
  nameZh: '晶体硅',
  latticeType: 'diamond',
  a: 5.431,
  b: 5.431,
  c: 5.431,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: diamondCell.atoms.map((atom): Atom => ({ ...atom, element: 'Si' })),
  properties: {
    description: '共价晶体，金刚石型结构。每个 Si 原子与 4 个 Si 原子形成正四面体配位，Si–Si 键长约 2.35 Å。',
    category: 'covalent',
    coordination: '4 (四面体配位)'
  }
};

/**
 * 二氧化硅 (SiO₂) - 理想立方 β-方石英近似
 *
 * Si 取金刚石的 18 个显示位置（8 顶点 + 6 面心 + 4 内部）；
 * O 位于每个 Si–Si 最近邻键的中点，共 16 个，形成 Si–O–Si 桥。
 * 理想模型 Si–O–Si 为 180°，实际 β-方石英约 147°。
 */
const SIO2_O_SITES: Array<{
  si1: number;
  si2: number;
  x: number;
  y: number;
  z: number;
}> = [
  // 内部 Si 14 (1/4,1/4,1/4) 的 4 条键
  { si1: 14, si2: 0, x: 1 / 8, y: 1 / 8, z: 1 / 8 },
  { si1: 14, si2: 8, x: 3 / 8, y: 3 / 8, z: 1 / 8 },
  { si1: 14, si2: 10, x: 3 / 8, y: 1 / 8, z: 3 / 8 },
  { si1: 14, si2: 12, x: 1 / 8, y: 3 / 8, z: 3 / 8 },
  // 内部 Si 15 (3/4,3/4,1/4) 的 4 条键
  { si1: 15, si2: 3, x: 7 / 8, y: 7 / 8, z: 1 / 8 },
  { si1: 15, si2: 8, x: 5 / 8, y: 5 / 8, z: 1 / 8 },
  { si1: 15, si2: 11, x: 5 / 8, y: 7 / 8, z: 3 / 8 },
  { si1: 15, si2: 13, x: 7 / 8, y: 5 / 8, z: 3 / 8 },
  // 内部 Si 16 (3/4,1/4,3/4) 的 4 条键
  { si1: 16, si2: 5, x: 7 / 8, y: 1 / 8, z: 7 / 8 },
  { si1: 16, si2: 10, x: 5 / 8, y: 1 / 8, z: 5 / 8 },
  { si1: 16, si2: 13, x: 7 / 8, y: 3 / 8, z: 5 / 8 },
  { si1: 16, si2: 9, x: 5 / 8, y: 3 / 8, z: 7 / 8 },
  // 内部 Si 17 (1/4,3/4,3/4) 的 4 条键
  { si1: 17, si2: 6, x: 1 / 8, y: 7 / 8, z: 7 / 8 },
  { si1: 17, si2: 12, x: 1 / 8, y: 5 / 8, z: 5 / 8 },
  { si1: 17, si2: 11, x: 3 / 8, y: 7 / 8, z: 5 / 8 },
  { si1: 17, si2: 9, x: 3 / 8, y: 5 / 8, z: 7 / 8 },
];

export const sio2Cell: UnitCell = {
  id: 'sio2',
  name: 'Silicon Dioxide',
  nameZh: '二氧化硅',
  latticeType: 'cristobalite',
  a: 7.16,
  b: 7.16,
  c: 7.16,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    ...diamondCell.atoms.map((atom): Atom => ({ ...atom, element: 'Si' })),
    ...SIO2_O_SITES.map(({ x, y, z }): Atom => ({ element: 'O', x, y, z })),
  ],
  bonds: SIO2_O_SITES.flatMap((site, index): Bond[] => [
    { atom1: site.si1, atom2: diamondCell.atoms.length + index, type: 'single' },
    { atom1: site.si2, atom2: diamondCell.atoms.length + index, type: 'single' },
  ]),
  properties: {
    description: '共价晶体，理想立方 β-方石英近似（Fd-3m，a≈7.16 Å）。每个 Si 与 4 个 O 形成 SiO₄ 四面体，O 桥接两个 Si。',
    category: 'covalent',
    coordination: '4 (Si), 2 (O)'
  }
};

/**
 * 碘 (I₂) - 教材示意结构
 *
 * 长方体晶胞 a=7.30、b=4.80、c=9.80 Å，I₂ 分子位于 8 个顶点和 6 个面心。
 * 分子轴有两种取向（±32° 倾斜），分子内 I–I 约 2.67 Å。
 * 这是教材化的示意模型，真实晶体为正交 Cmca 结构。
 */
const I2_OFFSET_A: FractionalVec3 = [0, 0.147, 0.116];
const I2_OFFSET_B: FractionalVec3 = [0, -0.147, 0.116];

function i2MoleculeAt(center: FractionalVec3, offset: FractionalVec3): Atom[] {
  return [
    { element: 'I', x: center[0] + offset[0], y: center[1] + offset[1], z: center[2] + offset[2] },
    { element: 'I', x: center[0] - offset[0], y: center[1] - offset[1], z: center[2] - offset[2] },
  ];
}

const IODINE_MOLECULES: Array<{ center: FractionalVec3; offset: FractionalVec3 }> = [
  ...DRY_ICE_CORNERS.map(center => ({ center, offset: I2_OFFSET_A })),
  { center: [0.5, 0.5, 0], offset: I2_OFFSET_A },
  { center: [0.5, 0.5, 1], offset: I2_OFFSET_A },
  { center: [0.5, 0, 0.5], offset: I2_OFFSET_B },
  { center: [0.5, 1, 0.5], offset: I2_OFFSET_B },
  { center: [0, 0.5, 0.5], offset: I2_OFFSET_B },
  { center: [1, 0.5, 0.5], offset: I2_OFFSET_B },
];

export const iodineCell: UnitCell = {
  id: 'iodine',
  name: 'Iodine',
  nameZh: '碘',
  latticeType: 'orthorhombic',
  a: 7.30,
  b: 4.80,
  c: 9.80,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: IODINE_MOLECULES.flatMap(({ center, offset }) => i2MoleculeAt(center, offset)),
  bonds: IODINE_MOLECULES.flatMap((_, index): Bond[] => [
    { atom1: index * 2, atom2: index * 2 + 1, type: 'single' },
  ]),
  properties: {
    description: '分子晶体，教材示意结构：I₂ 分子位于 8 个顶点和 6 个面心，分子轴有两种取向。分子内 I–I 键长约 2.67 Å，分子间靠范德华力结合；实际晶体为正交 Cmca 结构。',
    category: 'molecular',
    coordination: '12 (分子间)'
  }
};

/**
 * 冰 (Ice Ih) - 六方冰结构
 *
 * 采用正交化显示晶胞 a=b=7.82 Å、c=7.36 Å（原始六方晶胞 a₀≈4.52 Å），
 * 空间群 P6₃cm 的有序质子模型。O/H 坐标由对称操作展开；
 * 每个 H 与最近的 O 成共价 O–H 键，与次近的 O 形成氢键。
 * 为显示完整水分子，会补充少量晶胞边界外的 O/H 映像。
 */
const ICE_A = 7.82;
const ICE_C = 7.36;
const ICE_GAMMA = 120;

type IceSite = { element: 'O' | 'H'; x: number; y: number; z: number };

const ICE_SYMMETRY_OPS: Array<(x: number, y: number, z: number) => [number, number, number]> = [
  (x, y, z) => [x, y, z],
  (x, y, z) => [-y, x - y, z],
  (x, y, z) => [y - x, -x, z],
  (x, y, z) => [y, x, z],
  (x, y, z) => [x - y, -y, z],
  (x, y, z) => [-x, y - x, z],
  (x, y, z) => [-x, -y, z + 0.5],
  (x, y, z) => [y, y - x, z + 0.5],
  (x, y, z) => [x - y, x, z + 0.5],
  (x, y, z) => [-y, -x, z + 0.5],
  (x, y, z) => [y - x, y, z + 0.5],
  (x, y, z) => [x, x - y, z + 0.5],
];

const ICE_BASE_SITES: IceSite[] = [
  { element: 'O', x: 1 / 3, y: 0, z: 0.0625 },
  { element: 'O', x: 2 / 3, y: 0, z: 0.9375 },
  { element: 'H', x: 1 / 3, y: 0, z: 0.174 },
  { element: 'H', x: 0.438, y: 0, z: 0.026 },
  { element: 'H', x: 0.772, y: 0.105, z: 0.975 },
];

const ICE_GAMMA_RAD = (ICE_GAMMA * Math.PI) / 180;
const ICE_A2_X = ICE_A * Math.cos(ICE_GAMMA_RAD);
const ICE_A2_Y = ICE_A * Math.sin(ICE_GAMMA_RAD);

function iceCartesian(site: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  return {
    x: site.x * ICE_A + site.y * ICE_A2_X,
    y: site.y * ICE_A2_Y,
    z: site.z * ICE_C,
  };
}

function nearestIceImage(
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number }
): { distance: number; offset: [number, number, number] } {
  const origin = iceCartesian(from);
  let bestDistance = Infinity;
  let bestOffset: [number, number, number] = [0, 0, 0];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        const target = iceCartesian({ x: to.x + dx, y: to.y + dy, z: to.z + dz });
        const distance = Math.hypot(origin.x - target.x, origin.y - target.y, origin.z - target.z);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestOffset = [dx, dy, dz];
        }
      }
    }
  }

  return { distance: bestDistance, offset: bestOffset };
}

function normalizeFractional(value: number): number {
  const wrapped = value % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
}

function iceSiteKey(site: IceSite): string {
  return `${site.element}:${site.x.toFixed(4)},${site.y.toFixed(4)},${site.z.toFixed(4)}`;
}

function expandIceSites(): IceSite[] {
  const sites: IceSite[] = [];
  const seen = new Set<string>();

  for (const base of ICE_BASE_SITES) {
    for (const op of ICE_SYMMETRY_OPS) {
      const [x, y, z] = op(base.x, base.y, base.z);
      const site: IceSite = {
        element: base.element,
        x: normalizeFractional(x),
        y: normalizeFractional(y),
        z: normalizeFractional(z),
      };
      const key = iceSiteKey(site);
      if (!seen.has(key)) {
        seen.add(key);
        sites.push(site);
      }
    }
  }

  return sites;
}

function buildIceStructure(): { atoms: Atom[]; bonds: Bond[] } {
  const baseSites = expandIceSites();
  const baseO = baseSites.filter(site => site.element === 'O');
  const baseH = baseSites.filter(site => site.element === 'H');

  const atoms: IceSite[] = [];
  const atomIndex = new Map<string, number>();

  const addAtom = (element: 'O' | 'H', x: number, y: number, z: number): number => {
    const site: IceSite = { element, x, y, z };
    const key = iceSiteKey(site);
    const existing = atomIndex.get(key);
    if (existing !== undefined) return existing;

    const index = atoms.length;
    atoms.push(site);
    atomIndex.set(key, index);
    return index;
  };

  const bonds: Bond[] = [];
  const bondKeys = new Set<string>();
  const addBond = (atom1: number, atom2: number, type: 'single' | 'hydrogen'): void => {
    const first = Math.min(atom1, atom2);
    const second = Math.max(atom1, atom2);
    const key = `${first}-${second}-${type}`;
    if (bondKeys.has(key)) return;

    bondKeys.add(key);
    bonds.push({ atom1: first, atom2: second, type });
  };

  // 1. 以每个 O 为核心，取最近的 2 个 H 映像组成刚性水分子
  //    （H 的分数坐标可能被平移到晶胞外，保证 O–H 距离不被周期性边界拉长）
  const moleculeHydrogens = new Map<
    IceSite,
    Array<{ hydrogen: IceSite; offset: [number, number, number] }>
  >();

  for (const oxygen of baseO) {
    const candidates = baseH
      .map(hydrogen => ({ hydrogen, ...nearestIceImage(oxygen, hydrogen) }))
      .sort((a, b) => a.distance - b.distance);

    const selected: Array<{ hydrogen: IceSite; offset: [number, number, number] }> = [];
    const used = new Set<string>();
    for (const candidate of candidates) {
      const key = iceSiteKey(candidate.hydrogen);
      if (used.has(key)) continue;
      used.add(key);
      selected.push({ hydrogen: candidate.hydrogen, offset: candidate.offset });
      if (selected.length === 2) break;
    }
    moleculeHydrogens.set(oxygen, selected);
  }

  const moleculeIndex = new Map<string, number>();
  const addMolecule = (
    oxygen: IceSite,
    offset: [number, number, number]
  ): number => {
    const oxygenSite: IceSite = {
      element: 'O',
      x: oxygen.x + offset[0],
      y: oxygen.y + offset[1],
      z: oxygen.z + offset[2],
    };
    const moleculeKey = iceSiteKey(oxygenSite);
    const existing = moleculeIndex.get(moleculeKey);
    if (existing !== undefined) return existing;

    const oxygenIndex = addAtom('O', oxygenSite.x, oxygenSite.y, oxygenSite.z);
    moleculeIndex.set(moleculeKey, oxygenIndex);

    for (const { hydrogen, offset: hydrogenOffset } of moleculeHydrogens.get(oxygen) ?? []) {
      const hydrogenIndex = addAtom(
        'H',
        hydrogen.x + hydrogenOffset[0] + offset[0],
        hydrogen.y + hydrogenOffset[1] + offset[1],
        hydrogen.z + hydrogenOffset[2] + offset[2]
      );
      addBond(oxygenIndex, hydrogenIndex, 'single');
    }

    return oxygenIndex;
  };

  // 2. 晶胞内的 12 个完整水分子
  for (const oxygen of baseO) {
    addMolecule(oxygen, [0, 0, 0]);
  }

  // 3. 每个 O–H 的 H 与最近的另一个 O 形成氢键；受体在胞外时补完整水分子映像
  for (const oxygen of baseO) {
    for (const { hydrogen, offset } of moleculeHydrogens.get(oxygen) ?? []) {
      const hydrogenSite: IceSite = {
        element: 'H',
        x: hydrogen.x + offset[0],
        y: hydrogen.y + offset[1],
        z: hydrogen.z + offset[2],
      };
      const hydrogenIndex = atomIndex.get(iceSiteKey(hydrogenSite))!;

      let bestDistance = Infinity;
      let bestO = baseO[0];
      let bestOffset: [number, number, number] = [0, 0, 0];

      for (const acceptor of baseO) {
        const nearest = nearestIceImage(hydrogenSite, acceptor);
        if (nearest.distance < 1.2) continue; // 跳过共价母 O
        if (nearest.distance < bestDistance) {
          bestDistance = nearest.distance;
          bestO = acceptor;
          bestOffset = nearest.offset;
        }
      }

      const acceptorIndex = addMolecule(bestO, bestOffset);
      addBond(hydrogenIndex, acceptorIndex, 'hydrogen');
    }
  }

  return {
    atoms: atoms.map(({ element, x, y, z }): Atom => ({ element, x, y, z })),
    bonds,
  };
}

const ICE_STRUCTURE = buildIceStructure();

export const iceCell: UnitCell = {
  id: 'ice',
  name: 'Ice',
  nameZh: '冰',
  latticeType: 'hexagonal',
  a: ICE_A,
  b: ICE_A,
  c: ICE_C,
  alpha: 90,
  beta: 90,
  gamma: ICE_GAMMA,
  atoms: ICE_STRUCTURE.atoms,
  bonds: ICE_STRUCTURE.bonds,
  properties: {
    description: '分子晶体，六方 Ih 结构（为便于观察采用正交化显示晶胞 a=b=7.82 Å、c=7.36 Å，原始六方晶胞 a₀≈4.52 Å）。每个水分子与周围 4 个水分子形成氢键，细线表示氢键。',
    category: 'molecular',
    coordination: '4 (氢键)'
  }
};

/** 铜 (Cu) - 面心立方最密堆积 */
export const copperCell: UnitCell = {
  id: 'copper',
  name: 'Copper',
  nameZh: '铜',
  latticeType: 'fcc',
  a: 3.615,
  b: 3.615,
  c: 3.615,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: atomsAt(FCC_SITES, 'Cu'),
  properties: {
    description: '金属晶体，面心立方最密堆积（fcc）。每个 Cu 原子配位数为 12，常规晶胞含 4 个 Cu 原子。',
    category: 'metallic',
    coordination: '12 (面心立方)'
  }
};

/** 镁 (Mg) - 六方最密堆积 */
export const magnesiumCell: UnitCell = {
  id: 'magnesium',
  name: 'Magnesium',
  nameZh: '镁',
  latticeType: 'hcp',
  a: 3.209,
  b: 3.209,
  c: 5.211,
  alpha: 90,
  beta: 90,
  gamma: 120,
  atoms: [
    ...atomsAt(DRY_ICE_CORNERS, 'Mg'),
    { element: 'Mg', x: 1 / 3, y: 2 / 3, z: 0.5 },
  ],
  properties: {
    description: '金属晶体，六方最密堆积（hcp）。每个 Mg 原子配位数为 12，常规六方晶胞含 2 个 Mg 原子。',
    category: 'metallic',
    coordination: '12 (六方最密堆积)'
  }
};

/** α-铁 (Fe) - 体心立方堆积 */
export const ironCell: UnitCell = {
  id: 'iron',
  name: 'Iron',
  nameZh: '铁',
  latticeType: 'bcc',
  a: 2.866,
  b: 2.866,
  c: 2.866,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    ...atomsAt(DRY_ICE_CORNERS, 'Fe'),
    { element: 'Fe', x: 0.5, y: 0.5, z: 0.5 },
  ],
  properties: {
    description: '金属晶体，体心立方堆积（bcc，α-Fe）。每个 Fe 原子配位数为 8，常规晶胞含 2 个 Fe 原子。',
    category: 'metallic',
    coordination: '8 (体心立方)'
  }
};

/**
 * 钙钛矿 (CaTiO₃) - 理想立方结构
 *
 * Ca²⁺ 位于 8 个顶点，Ti⁴⁺ 位于体心，O²⁻ 位于 6 个面心。
 * 只绘制 Ti–O 八面体键；Ca 的 12 配位在描述中说明。
 */
export const perovskiteCell: UnitCell = {
  id: 'perovskite',
  name: 'Perovskite',
  nameZh: '钙钛矿',
  latticeType: 'perovskite',
  a: 3.82,
  b: 3.82,
  c: 3.82,
  alpha: 90,
  beta: 90,
  gamma: 90,
  atoms: [
    ...atomsAt(DRY_ICE_CORNERS, 'Ca'),
    { element: 'Ti', x: 0.5, y: 0.5, z: 0.5 },
    { element: 'O', x: 0.5, y: 0.5, z: 0 },
    { element: 'O', x: 0.5, y: 0.5, z: 1 },
    { element: 'O', x: 0.5, y: 0, z: 0.5 },
    { element: 'O', x: 0.5, y: 1, z: 0.5 },
    { element: 'O', x: 0, y: 0.5, z: 0.5 },
    { element: 'O', x: 1, y: 0.5, z: 0.5 },
  ],
  bonds: [9, 10, 11, 12, 13, 14].map(oxygenIndex => ({
    atom1: 8,
    atom2: oxygenIndex,
    type: 'single' as const,
  })),
  properties: {
    description: '离子晶体，CaTiO₃ 的理想立方钙钛矿结构（Pm-3m，a≈3.82 Å）。Ca²⁺位于顶点，Ti⁴⁺位于体心，O²⁻位于面心；Ti 为 6 配位，Ca 为 12 配位。室温下实际存在正交畸变。',
    category: 'ionic',
    coordination: '6 (Ti), 12 (Ca)'
  }
};
