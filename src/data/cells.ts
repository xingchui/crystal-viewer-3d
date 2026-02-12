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

import type { UnitCell } from './types';

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
 * - 晶格类型：面心立方 (FCC)
 * - CO₂分子位于面心立方格点
 * - 每个CO₂分子：1个C + 2个O，沿c轴方向
 */
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
    // ========== 4个格点位置，每个格点有1个CO₂分子 ==========
    
    // 格点1: (0,0,0)
    { element: 'C', x: 0, y: 0, z: 0 },
    { element: 'O', x: 0, y: 0, z: 0.115 },
    { element: 'O', x: 0, y: 0, z: -0.115 },  // 允许负值以显示完整分子
    
    // 格点2: (0,0,1)
    { element: 'C', x: 0, y: 0, z: 1 },
    { element: 'O', x: 0, y: 0, z: 1.115 },   // 允许>1以显示完整分子
    { element: 'O', x: 0, y: 0, z: 0.885 },
    
    // 格点3: (0,1,0)
    { element: 'C', x: 0, y: 1, z: 0 },
    { element: 'O', x: 0, y: 1, z: 0.115 },
    { element: 'O', x: 0, y: 1, z: -0.115 },
    
    // 格点4: (0,1,1)
    { element: 'C', x: 0, y: 1, z: 1 },
    { element: 'O', x: 0, y: 1, z: 1.115 },
    { element: 'O', x: 0, y: 1, z: 0.885 },
    
    // 格点5: (1,0,0)
    { element: 'C', x: 1, y: 0, z: 0 },
    { element: 'O', x: 1, y: 0, z: 0.115 },
    { element: 'O', x: 1, y: 0, z: -0.115 },
    
    // 格点6: (1,0,1)
    { element: 'C', x: 1, y: 0, z: 1 },
    { element: 'O', x: 1, y: 0, z: 1.115 },
    { element: 'O', x: 1, y: 0, z: 0.885 },
    
    // 格点7: (1,1,0)
    { element: 'C', x: 1, y: 1, z: 0 },
    { element: 'O', x: 1, y: 1, z: 0.115 },
    { element: 'O', x: 1, y: 1, z: -0.115 },
    
    // 格点8: (1,1,1)
    { element: 'C', x: 1, y: 1, z: 1 },
    { element: 'O', x: 1, y: 1, z: 1.115 },
    { element: 'O', x: 1, y: 1, z: 0.885 },
    
    // 面心位置
    // 底面面心 (z=0)
    { element: 'C', x: 0.5, y: 0.5, z: 0 },
    { element: 'O', x: 0.5, y: 0.5, z: 0.115 },
    { element: 'O', x: 0.5, y: 0.5, z: -0.115 },
    
    // 顶面面心 (z=1)
    { element: 'C', x: 0.5, y: 0.5, z: 1 },
    { element: 'O', x: 0.5, y: 0.5, z: 1.115 },
    { element: 'O', x: 0.5, y: 0.5, z: 0.885 },
    
    // 前面面心
    { element: 'C', x: 0.5, y: 0, z: 0.5 },
    { element: 'O', x: 0.5, y: 0, z: 0.615 },
    { element: 'O', x: 0.5, y: 0, z: 0.385 },
    
    // 后面面心
    { element: 'C', x: 0.5, y: 1, z: 0.5 },
    { element: 'O', x: 0.5, y: 1, z: 0.615 },
    { element: 'O', x: 0.5, y: 1, z: 0.385 },
    
    // 左面面心
    { element: 'C', x: 0, y: 0.5, z: 0.5 },
    { element: 'O', x: 0, y: 0.5, z: 0.615 },
    { element: 'O', x: 0, y: 0.5, z: 0.385 },
    
    // 右面面心
    { element: 'C', x: 1, y: 0.5, z: 0.5 },
    { element: 'O', x: 1, y: 0.5, z: 0.615 },
    { element: 'O', x: 1, y: 0.5, z: 0.385 },
  ],
  properties: {
    description: '分子晶体，CO₂分子位于面心立方格点。显示完整的8个顶点和6个面心位置的分子。满足晶胞平移对称性要求。',
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
    category: 'covalent',
    coordination: '3 (平面三角形)'
  }
};

// 导出所有晶胞
export const UNIT_CELLS: Record<string, UnitCell> = {
  diamond: diamondCell,
  dryice: dryIceCell,
  sic: sicCell,
  nacl: naclCell,
  cscl: csclCell,
  zns: znsCell,
  caf2: caf2Cell,
  graphite: graphiteCell
};

// 获取晶胞数据
export function getUnitCell(id: string): UnitCell | undefined {
  return UNIT_CELLS[id];
}

// 获取所有晶胞列表
export function getAllUnitCells(): UnitCell[] {
  return Object.values(UNIT_CELLS);
}
