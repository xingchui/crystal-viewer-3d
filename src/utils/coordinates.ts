/**
 * Crystal Viewer 3D - Coordinate Utilities
 * 坐标转换工具 - 分数坐标与笛卡尔坐标互转
 */

import * as THREE from 'three';
import type { Atom } from '../data/types';

// 晶胞参数接口
export interface CellParams {
  a: number;      // 晶格常数a (Å)
  b: number;      // 晶格常数b (Å)
  c: number;      // 晶格常数c (Å)
  alpha: number;  // α角 (度)
  beta: number;   // β角 (度)
  gamma: number;  // γ角 (度)
}

/**
 * 计算晶胞的变换矩阵
 * 将分数坐标(u, v, w)转换为笛卡尔坐标(x, y, z)
 * 
 * 公式基于: 
 * r = u*a + v*b + w*c
 * 其中a, b, c是晶格向量
 */
export function getTransformationMatrix(params: CellParams): THREE.Matrix4 {
  const { a, b, c, alpha, beta, gamma } = params;
  
  // 转换为弧度
  const alphaRad = (alpha * Math.PI) / 180;
  const betaRad = (beta * Math.PI) / 180;
  const gammaRad = (gamma * Math.PI) / 180;
  
  // 计算晶格向量
  // a向量沿x轴
  const ax = a;
  const ay = 0;
  const az = 0;
  
  // b向量在xy平面
  const bx = b * Math.cos(gammaRad);
  const by = b * Math.sin(gammaRad);
  const bz = 0;
  
  // c向量需要计算三个分量
  const cx = c * Math.cos(betaRad);
  const cy = c * (Math.cos(alphaRad) - Math.cos(betaRad) * Math.cos(gammaRad)) / Math.sin(gammaRad);
  const cz = Math.sqrt(c * c - cx * cx - cy * cy);
  
  // 创建变换矩阵
  const matrix = new THREE.Matrix4();
  matrix.set(
    ax, bx, cx, 0,
    ay, by, cy, 0,
    az, bz, cz, 0,
    0,  0,  0,  1
  );
  
  return matrix;
}

/**
 * 将分数坐标转换为笛卡尔坐标
 */
export function fractionalToCartesian(
  atom: Atom,
  params: CellParams
): THREE.Vector3 {
  const matrix = getTransformationMatrix(params);
  const fractional = new THREE.Vector3(atom.x, atom.y, atom.z);
  const cartesian = fractional.applyMatrix4(matrix);
  return cartesian;
}

/**
 * 将笛卡尔坐标转换为分数坐标
 */
export function cartesianToFractional(
  position: THREE.Vector3,
  params: CellParams
): THREE.Vector3 {
  const matrix = getTransformationMatrix(params);
  const inverseMatrix = new THREE.Matrix4().copy(matrix).invert();
  const fractional = position.clone().applyMatrix4(inverseMatrix);
  return fractional;
}

/**
 * 计算晶胞体积
 */
export function calculateCellVolume(params: CellParams): number {
  const { a, b, c, alpha, beta, gamma } = params;
  
  const alphaRad = (alpha * Math.PI) / 180;
  const betaRad = (beta * Math.PI) / 180;
  const gammaRad = (gamma * Math.PI) / 180;
  
  const cosAlpha = Math.cos(alphaRad);
  const cosBeta = Math.cos(betaRad);
  const cosGamma = Math.cos(gammaRad);
  
  const volume = a * b * c * Math.sqrt(
    1 - cosAlpha * cosAlpha - cosBeta * cosBeta - cosGamma * cosGamma +
    2 * cosAlpha * cosBeta * cosGamma
  );
  
  return volume;
}

/**
 * 生成超胞原子列表
 * 
 * @param atoms - 原胞中的原子列表
 * @param params - 晶胞参数
 * @param nx, ny, nz - 各方向扩展的晶胞数
 */
export function generateSuperCell(
  atoms: Atom[],
  _params: CellParams,
  nx: number,
  ny: number,
  nz: number
): Atom[] {
  const superCellAtoms: Atom[] = [];
  
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      for (let k = 0; k < nz; k++) {
        for (const atom of atoms) {
          superCellAtoms.push({
            ...atom,
            x: atom.x + i,
            y: atom.y + j,
            z: atom.z + k
          });
        }
      }
    }
  }
  
  return superCellAtoms;
}

/**
 * 计算两个分数坐标点之间的最小距离（考虑周期性边界条件）
 */
export function getMinimumDistance(
  pos1: THREE.Vector3,
  pos2: THREE.Vector3,
  params: CellParams
): number {
  const matrix = getTransformationMatrix(params);
  
  let minDistance = Infinity;
  
  // 检查所有周期性映像
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        const offset = new THREE.Vector3(dx, dy, dz);
        const pos2Image = pos2.clone().add(offset);
        
        // 转换为笛卡尔坐标
        const cart1 = pos1.clone().applyMatrix4(matrix);
        const cart2 = pos2Image.clone().applyMatrix4(matrix);
        
        const distance = cart1.distanceTo(cart2);
        minDistance = Math.min(minDistance, distance);
      }
    }
  }
  
  return minDistance;
}

/**
 * 计算原子对的键长
 */
export function calculateBondLength(
  atom1: Atom,
  atom2: Atom,
  params: CellParams
): number {
  const pos1 = new THREE.Vector3(atom1.x, atom1.y, atom1.z);
  const pos2 = new THREE.Vector3(atom2.x, atom2.y, atom2.z);
  
  return getMinimumDistance(pos1, pos2, params);
}
