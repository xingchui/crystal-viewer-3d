/**
 * Crystal Viewer 3D - Cell Implementations
 * 晶胞具体实现 - 金刚石、干冰、碳化硅
 */

import { BaseCell } from './BaseCell';
import { diamondCell, dryIceCell, sicCell, naclCell, csclCell, znsCell, caf2Cell, graphiteCell } from '../../data/cells';

// 金刚石晶胞
export class DiamondCell extends BaseCell {
  readonly id = 'diamond';
  readonly name = 'Diamond';
  readonly nameZh = '金刚石';
  readonly data = diamondCell;
}

// 干冰晶胞
export class DryIceCell extends BaseCell {
  readonly id = 'dryice';
  readonly name = 'Dry Ice';
  readonly nameZh = '干冰';
  readonly data = dryIceCell;
}

// 碳化硅晶胞
export class SiCCell extends BaseCell {
  readonly id = 'sic';
  readonly name = 'Silicon Carbide';
  readonly nameZh = '碳化硅';
  readonly data = sicCell;
}

// 氯化钠晶胞
export class NaClCell extends BaseCell {
  readonly id = 'nacl';
  readonly name = 'Sodium Chloride';
  readonly nameZh = '氯化钠';
  readonly data = naclCell;
}

// 氯化铯晶胞
export class CsClCell extends BaseCell {
  readonly id = 'cscl';
  readonly name = 'Cesium Chloride';
  readonly nameZh = '氯化铯';
  readonly data = csclCell;
}

// 硫化锌晶胞
export class ZnSCell extends BaseCell {
  readonly id = 'zns';
  readonly name = 'Zinc Sulfide';
  readonly nameZh = '硫化锌';
  readonly data = znsCell;
}

// 氟化钙晶胞
export class CaF2Cell extends BaseCell {
  readonly id = 'caf2';
  readonly name = 'Calcium Fluoride';
  readonly nameZh = '氟化钙';
  readonly data = caf2Cell;
}

// 石墨晶胞
export class GraphiteCell extends BaseCell {
  readonly id = 'graphite';
  readonly name = 'Graphite';
  readonly nameZh = '石墨';
  readonly data = graphiteCell;
}

// 晶胞注册表
export class CellRegistry {
  private static cells: Map<string, BaseCell> = new Map();

  /**
   * 注册晶胞
   */
  static register(cell: BaseCell): void {
    this.cells.set(cell.id, cell);
  }

  /**
   * 获取晶胞
   */
  static get(id: string): BaseCell | undefined {
    return this.cells.get(id);
  }

  /**
   * 获取所有晶胞
   */
  static getAll(): BaseCell[] {
    return Array.from(this.cells.values());
  }

  /**
   * 获取晶胞ID列表
   */
  static getIds(): string[] {
    return Array.from(this.cells.keys());
  }

  /**
   * 检查晶胞是否存在
   */
  static has(id: string): boolean {
    return this.cells.has(id);
  }

  /**
   * 取消注册晶胞
   */
  static unregister(id: string): boolean {
    return this.cells.delete(id);
  }

  /**
   * 清空注册表
   */
  static clear(): void {
    this.cells.clear();
  }

  /**
   * 初始化默认晶胞
   */
  static initializeDefaults(): void {
    this.register(new DiamondCell());
    this.register(new DryIceCell());
    this.register(new SiCCell());
    this.register(new NaClCell());
    this.register(new CsClCell());
    this.register(new ZnSCell());
    this.register(new CaF2Cell());
    this.register(new GraphiteCell());
  }
}

// 初始化时注册默认晶胞
CellRegistry.initializeDefaults();
