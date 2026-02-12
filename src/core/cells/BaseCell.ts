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
    const superCellAtoms = this.generateSuperCell(nx, ny, nz);
    const bonds: Bond[] = [];
    const baseBonds = this.getBonds();
    const atomCount = this.data.atoms.length;

    // 为每个晶胞复制键
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          const cellIndex = (i * ny * nz + j * nz + k) * atomCount;
          
          baseBonds.forEach(bond => {
            bonds.push({
              atom1: cellIndex + bond.atom1,
              atom2: cellIndex + bond.atom2,
              type: bond.type
            });
          });
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
