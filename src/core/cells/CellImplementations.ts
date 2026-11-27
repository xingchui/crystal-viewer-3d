/**
 * Crystal Viewer 3D - Cell Implementations
 * 晶胞具体实现 - 金刚石、干冰、碳化硅
 */

import { BaseCell } from './BaseCell';
import {
  diamondCell,
  siliconCell,
  sicCell,
  sio2Cell,
  dryIceCell,
  iodineCell,
  iceCell,
  copperCell,
  magnesiumCell,
  ironCell,
  naclCell,
  csclCell,
  znsCell,
  caf2Cell,
  perovskiteCell,
  graphiteCell,
} from '../../data/cells';

// 金刚石晶胞
export class DiamondCell extends BaseCell {
  readonly id = 'diamond';
  readonly name = 'Diamond';
  readonly nameZh = '金刚石';
  readonly data = diamondCell;
}

// 晶体硅晶胞
export class SiliconCell extends BaseCell {
  readonly id = 'silicon';
  readonly name = 'Silicon';
  readonly nameZh = '晶体硅';
  readonly data = siliconCell;
}

// 碳化硅晶胞
export class SiCCell extends BaseCell {
  readonly id = 'sic';
  readonly name = 'Silicon Carbide';
  readonly nameZh = '碳化硅';
  readonly data = sicCell;
}

// 二氧化硅晶胞
export class SiO2Cell extends BaseCell {
  readonly id = 'sio2';
  readonly name = 'Silicon Dioxide';
  readonly nameZh = '二氧化硅';
  readonly data = sio2Cell;
}

// 干冰晶胞
export class DryIceCell extends BaseCell {
  readonly id = 'dryice';
  readonly name = 'Dry Ice';
  readonly nameZh = '干冰';
  readonly data = dryIceCell;
}

// 碘晶胞
export class IodineCell extends BaseCell {
  readonly id = 'iodine';
  readonly name = 'Iodine';
  readonly nameZh = '碘';
  readonly data = iodineCell;
}

// 冰晶胞
export class IceCell extends BaseCell {
  readonly id = 'ice';
  readonly name = 'Ice';
  readonly nameZh = '冰';
  readonly data = iceCell;
}

// 铜晶胞
export class CopperCell extends BaseCell {
  readonly id = 'copper';
  readonly name = 'Copper';
  readonly nameZh = '铜';
  readonly data = copperCell;
}

// 镁晶胞
export class MagnesiumCell extends BaseCell {
  readonly id = 'magnesium';
  readonly name = 'Magnesium';
  readonly nameZh = '镁';
  readonly data = magnesiumCell;
}

// 铁晶胞
export class IronCell extends BaseCell {
  readonly id = 'iron';
  readonly name = 'Iron';
  readonly nameZh = '铁';
  readonly data = ironCell;
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

// 钙钛矿晶胞
export class PerovskiteCell extends BaseCell {
  readonly id = 'perovskite';
  readonly name = 'Perovskite';
  readonly nameZh = '钙钛矿';
  readonly data = perovskiteCell;
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
    // 顺序即 UI 顺序：共价 → 分子 → 金属 → 离子 → 混合
    this.register(new DiamondCell());
    this.register(new SiliconCell());
    this.register(new SiCCell());
    this.register(new SiO2Cell());
    this.register(new DryIceCell());
    this.register(new IodineCell());
    this.register(new IceCell());
    this.register(new CopperCell());
    this.register(new MagnesiumCell());
    this.register(new IronCell());
    this.register(new NaClCell());
    this.register(new CsClCell());
    this.register(new ZnSCell());
    this.register(new CaF2Cell());
    this.register(new PerovskiteCell());
    this.register(new GraphiteCell());
  }
}

// 初始化时注册默认晶胞
CellRegistry.initializeDefaults();