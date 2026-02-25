// src/data/c70.ts
import type { UnitCell, Bond, Atom } from './types';

/**
 * 生成C70富勒烯的原子坐标（球壳近似，教学演示用）
 * 基于黄金角分布算法生成70个碳原子在球面上的近似位置
 */
function generateC70Atoms(): Atom[] {
  const N = 70; // C70的原子数量
  const R = 3.55; // 富勒烯球壳半径（Å）
  const atoms: Atom[] = [];
  const phi = (3 - Math.sqrt(5)); // 黄金角系数（≈0.38197）
  for (let i = 0; i < N; i++) {
    const z = 1 - (2 * i) / (N - 1); // z坐标归一化到 [-1, 1]
    const r = Math.sqrt(Math.max(0, 1 - z * z)); // 横截面半径
    const theta = i * phi * Math.PI * 2; // 方位角
    // 球坐标转笛卡尔坐标
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    // 缩放至实际半径，并映射到8x8x8的晶胞范围内
    const X = x * R;
    const Y = y * R;
    const Z = z * R;
    atoms.push({
      element: 'C', // 元素类型：碳
      x: (X + 4) / 8, // 归一化到 [0, 1] 范围（适配8Å晶胞）
      y: (Y + 4) / 8,
      z: (Z + 4) / 8
    });
  }
  return atoms;
}

/**
 * 生成C70原子间的键信息
 * 基于原子间距离判断成键（阈值：2.5Å，接近C-C单键长度）
 * @param atomCount 原子总数
 * @param atoms 原子坐标数组
 */
function generateC70Bonds(atomCount: number, atoms: Atom[]): Bond[] {
  const bonds: Bond[] = [];
  const threshold = 2.5; // 成键距离阈值（Å）
  // 还原原子的实际坐标（从归一化值转回Å）
  const realCoords = atoms.map(a => ({
    x: a.x * 8 - 4,
    y: a.y * 8 - 4,
    z: a.z * 8 - 4
  }));
  
  // 遍历所有原子对，判断是否成键（避免重复，j从i+1开始）
  for (let i = 0; i < atomCount; i++) {
    for (let j = i + 1; j < atomCount; j++) {
      const dx = realCoords[i].x - realCoords[j].x;
      const dy = realCoords[i].y - realCoords[j].y;
      const dz = realCoords[i].z - realCoords[j].z;
      const dsq = dx * dx + dy * dy + dz * dz; // 距离平方（避免开方，提升性能）
      if (dsq <= threshold * threshold) {
        bonds.push({ 
          atom1: i,    // 第一个原子索引
          atom2: j,    // 第二个原子索引
          type: 'single' // 键类型：单键
        });
      }
    }
  }
  return bonds;
}

// 生成C70的原子和键数据
const c70Atoms = generateC70Atoms();
const c70Bonds = generateC70Bonds(c70Atoms.length, c70Atoms);

// 导出完整的C70晶胞数据（符合UnitCell类型）
export const c70Cell: UnitCell = {
  id: 'c70',
  name: 'C70 Fullerene',
  nameZh: '碳70富勒烯',
  latticeType: 'hexagonal', // 晶格类型：六方（近似）
  // 晶胞参数（Å）：8x8x8的立方体晶胞
  a: 8.0, 
  b: 8.0, 
  c: 8.0,
  alpha: 90, // 晶胞角（°）
  beta: 90,
  gamma: 90,
  atoms: c70Atoms, // 原子坐标数组
  bonds: c70Bonds, // 键信息数组
  properties: {
    description: 'C70 富勒烯的近似外壳结构，教学演示用途。',
    category: 'molecular',
    coordination: '3 (近似，每个碳原子与3个邻近碳原子成键)'
  }
};