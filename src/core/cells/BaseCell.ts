/**
 * Crystal Viewer 3D - Base Cell
 * 晶胞抽象基类 - 定义晶胞的通用接口
 */

import type { Atom, Bond, UnitCell } from '../../data/types';
import { calculateCellBonds } from '../../utils/bonds';
import { generateSuperCell, type CellParams } from '../../utils/coordinates';

export abstract class BaseCell {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly nameZh: string;
  abstract readonly data: UnitCell;

  private cachedBonds: Bond[] | null = null;

  /**
   * 获取晶胞参数
   */
  getCellParams(): CellParams {
    return {
      a: this.data.a,
      b: this.data.b,
      c: this.data.c,
      alpha: this.data.alpha,
      beta: this.data.beta,
      gamma: this.data.gamma
    };
  }

  /**
   * 获取原子列表（原胞）
   */
  getAtoms(): Atom[] {
    return this.data.atoms;
  }

  /**
   * 获取化学键列表
   * 优先使用预定义的键，否则自动计算
   */
  getBonds(): Bond[] {
    if (this.data.bonds) {
      return this.data.bonds;
    }
    
    if (!this.cachedBonds) {
      this.cachedBonds = calculateCellBonds(this.data);
    }
    
    return this.cachedBonds;
  }

  /**
   * 生成超胞原子列表
   * 
   * @param nx - x方向晶胞数
   * @param ny - y方向晶胞数
   * @param nz - z方向晶胞数
   */
  generateSuperCell(nx: number, ny: number, nz: number): Atom[] {
    return generateSuperCell(this.data.atoms, this.getCellParams(), nx, ny, nz);
  }

  /**
   * 生成超胞的键列表
   * 
   * @param nx - x方向晶胞数
   * @param ny - y方向晶胞数
   * @param nz - z方向晶胞数
   */
  generateSuperCellBonds(nx: number, ny: number, nz: number): Bond[] {
    const bonds: Bond[] = [];
    const baseBonds = this.getBonds();
    const atomCount = this.data.atoms.length;

    // 常规晶胞显式包含顶点、棱、面上的原子，相邻晶胞会在同一空间位置生成重复原子。
    // 因此把原胞键按晶胞整体平移即可覆盖跨边界的化学键：边界处多个重合的原子
    // 分别连接到各自晶胞内的邻居，视觉上形成完整的配位环境。
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          const cellOffset = (i * ny * nz + j * nz + k) * atomCount;
          for (const bond of baseBonds) {
            bonds.push({
              atom1: cellOffset + bond.atom1,
              atom2: cellOffset + bond.atom2,
              type: bond.type,
            });
          }
        }
      }
    }

    return bonds;
  }

  /**
   * 获取晶胞描述信息
   */
  getDescription(): string {
    return this.data.properties?.description || '';
  }

  /**
   * 获取晶胞类别
   */
  getCategory(): string {
    const category = this.data.properties?.category;
    switch (category) {
      case 'covalent': return '共价晶体';
      case 'molecular': return '分子晶体';
      case 'ionic': return '离子晶体';
      case 'metallic': return '金属晶体';
      case 'mixed': return '混合晶体';
      default: return '未知';
    }
  }

  /**
   * 获取配位信息
   */
  getCoordination(): string {
    return this.data.properties?.coordination || '';
  }

  /**
   * 获取晶格常数字符串
   */
  getLatticeConstants(): string {
    const { a, b, c, alpha, beta, gamma } = this.data;
    if (a === b && b === c && alpha === 90 && beta === 90 && gamma === 90) {
      return `a = ${a.toFixed(3)} Å`;
    }
    return `a=${a.toFixed(2)}, b=${b.toFixed(2)}, c=${c.toFixed(2)} Å`;
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cachedBonds = null;
  }
}
