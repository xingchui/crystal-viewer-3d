/**
 * Crystal Viewer 3D - Periodic Table Data
 * 元素周期表数据 - 原子属性、颜色、半径
 */

import type { ElementData } from './types';

// 元素数据映射表
export const ELEMENT_DATA: Record<string, ElementData> = {
  // 第一周期
  'H': {
    symbol: 'H',
    name: 'Hydrogen',
    nameZh: '氢',
    atomicNumber: 1,
    atomicRadius: 0.31,
    vdwRadius: 1.20,
    color: '#FFFFFF',
    metalColor: '#E0E0E0'
  },
  'He': {
    symbol: 'He',
    name: 'Helium',
    nameZh: '氦',
    atomicNumber: 2,
    atomicRadius: 0.28,
    vdwRadius: 1.40,
    color: '#D9FFFF',
    metalColor: '#C0E0FF'
  },
  
  // 第二周期
  'Li': {
    symbol: 'Li',
    name: 'Lithium',
    nameZh: '锂',
    atomicNumber: 3,
    atomicRadius: 1.28,
    vdwRadius: 1.82,
    color: '#CC80FF',
    metalColor: '#B0A0C0'
  },
  'Be': {
    symbol: 'Be',
    name: 'Beryllium',
    nameZh: '铍',
    atomicNumber: 4,
    atomicRadius: 0.96,
    vdwRadius: 1.53,
    color: '#C2FF00',
    metalColor: '#A0C080'
  },
  'B': {
    symbol: 'B',
    name: 'Boron',
    nameZh: '硼',
    atomicNumber: 5,
    atomicRadius: 0.84,
    vdwRadius: 1.92,
    color: '#FFB5B5',
    metalColor: '#D0A0A0'
  },
  'C': {
    symbol: 'C',
    name: 'Carbon',
    nameZh: '碳',
    atomicNumber: 6,
    atomicRadius: 0.76,
    vdwRadius: 1.70,
    color: '#909090',
    metalColor: '#606060'  // 深灰金属色
  },
  'N': {
    symbol: 'N',
    name: 'Nitrogen',
    nameZh: '氮',
    atomicNumber: 7,
    atomicRadius: 0.71,
    vdwRadius: 1.55,
    color: '#3050F8',
    metalColor: '#4060D0'
  },
  'O': {
    symbol: 'O',
    name: 'Oxygen',
    nameZh: '氧',
    atomicNumber: 8,
    atomicRadius: 0.66,
    vdwRadius: 1.52,
    color: '#FF0D0D',
    metalColor: '#D04040'  // 红色金属色
  },
  'F': {
    symbol: 'F',
    name: 'Fluorine',
    nameZh: '氟',
    atomicNumber: 9,
    atomicRadius: 0.57,
    vdwRadius: 1.47,
    color: '#90E050',
    metalColor: '#70C030'
  },
  'Ne': {
    symbol: 'Ne',
    name: 'Neon',
    nameZh: '氖',
    atomicNumber: 10,
    atomicRadius: 0.58,
    vdwRadius: 1.54,
    color: '#B3E3F5',
    metalColor: '#90C0E0'
  },
  
  // 第三周期
  'Na': {
    symbol: 'Na',
    name: 'Sodium',
    nameZh: '钠',
    atomicNumber: 11,
    atomicRadius: 1.66,
    vdwRadius: 2.27,
    color: '#AB5CF2',
    metalColor: '#B0A0E0'
  },
  'Mg': {
    symbol: 'Mg',
    name: 'Magnesium',
    nameZh: '镁',
    atomicNumber: 12,
    atomicRadius: 1.41,
    vdwRadius: 1.73,
    color: '#8AFF00',
    metalColor: '#90C0A0'
  },
  'Al': {
    symbol: 'Al',
    name: 'Aluminium',
    nameZh: '铝',
    atomicNumber: 13,
    atomicRadius: 1.21,
    vdwRadius: 1.84,
    color: '#BFA6A6',
    metalColor: '#D0D0D0'  // 银白色金属
  },
  'Si': {
    symbol: 'Si',
    name: 'Silicon',
    nameZh: '硅',
    atomicNumber: 14,
    atomicRadius: 1.11,
    vdwRadius: 2.10,
    color: '#F0C8A0',
    metalColor: '#C0B0A0'  // 灰色金属
  },
  'P': {
    symbol: 'P',
    name: 'Phosphorus',
    nameZh: '磷',
    atomicNumber: 15,
    atomicRadius: 1.07,
    vdwRadius: 1.80,
    color: '#FF8000',
    metalColor: '#E08000'
  },
  'S': {
    symbol: 'S',
    name: 'Sulfur',
    nameZh: '硫',
    atomicNumber: 16,
    atomicRadius: 1.05,
    vdwRadius: 1.80,
    color: '#FFFF30',
    metalColor: '#D0D020'
  },
  'Cl': {
    symbol: 'Cl',
    name: 'Chlorine',
    nameZh: '氯',
    atomicNumber: 17,
    atomicRadius: 1.02,
    vdwRadius: 1.75,
    color: '#1FF01F',
    metalColor: '#20D020'
  },
  'Ar': {
    symbol: 'Ar',
    name: 'Argon',
    nameZh: '氩',
    atomicNumber: 18,
    atomicRadius: 1.06,
    vdwRadius: 1.88,
    color: '#80D1E3',
    metalColor: '#70B0D0'
  },
  
  // 第四周期 (常用)
  'K': {
    symbol: 'K',
    name: 'Potassium',
    nameZh: '钾',
    atomicNumber: 19,
    atomicRadius: 2.03,
    vdwRadius: 2.75,
    color: '#8F40D4',
    metalColor: '#A080D0'
  },
  'Ca': {
    symbol: 'Ca',
    name: 'Calcium',
    nameZh: '钙',
    atomicNumber: 20,
    atomicRadius: 1.76,
    vdwRadius: 2.31,
    color: '#3DFF00',
    metalColor: '#90D090'
  },
  'Fe': {
    symbol: 'Fe',
    name: 'Iron',
    nameZh: '铁',
    atomicNumber: 26,
    atomicRadius: 1.32,
    vdwRadius: 2.05,
    color: '#E06633',
    metalColor: '#B87333'  // 铜/铁金属色
  },
  'Cu': {
    symbol: 'Cu',
    name: 'Copper',
    nameZh: '铜',
    atomicNumber: 29,
    atomicRadius: 1.32,
    vdwRadius: 2.05,
    color: '#C78033',
    metalColor: '#B87333'  // 铜色
  },
  'Zn': {
    symbol: 'Zn',
    name: 'Zinc',
    nameZh: '锌',
    atomicNumber: 30,
    atomicRadius: 1.22,
    vdwRadius: 2.10,
    color: '#7D80B0',
    metalColor: '#B0B0B8'  // 锌色
  },
  
  // 第五周期 (常用)
  'Ag': {
    symbol: 'Ag',
    name: 'Silver',
    nameZh: '银',
    atomicNumber: 47,
    atomicRadius: 1.45,
    vdwRadius: 2.20,
    color: '#C0C0C0',
    metalColor: '#C0C0C0'  // 银色
  },
  'Au': {
    symbol: 'Au',
    name: 'Gold',
    nameZh: '金',
    atomicNumber: 79,
    atomicRadius: 1.36,
    vdwRadius: 2.15,
    color: '#FFD123',
    metalColor: '#FFD700'  // 金色
  }
};

// 获取元素数据
export function getElementData(symbol: string): ElementData | undefined {
  return ELEMENT_DATA[symbol];
}

// 获取元素颜色 (支持自定义覆盖)
export function getElementColor(
  symbol: string, 
  customColor?: string,
  useMetallic: boolean = true
): string {
  if (customColor) return customColor;
  const element = ELEMENT_DATA[symbol];
  if (!element) return '#CCCCCC';
  return useMetallic && element.metalColor ? element.metalColor : element.color;
}

// 获取原子半径 (支持自定义覆盖)
export function getAtomRadius(symbol: string, customRadius?: number): number {
  if (customRadius) return customRadius;
  const element = ELEMENT_DATA[symbol];
  if (!element) return 1.0;
  // 使用共价半径，并缩放以适应可视化
  return element.atomicRadius * 0.5;
}

// 元素列表 (用于UI显示)
export const ELEMENT_LIST = Object.values(ELEMENT_DATA);
