/**
 * Supercell Bond Tests
 * 超胞键测试 - 验证键索引有效且跨晶胞边界的键存在
 */

import { describe, it, expect } from 'vitest';
import { DiamondCell, DryIceCell, IodineCell, IceCell } from '../core/cells/CellImplementations';
import type { Atom } from '../data/types';

const key = (a: Atom, b: Atom) => {
  const ka = `${a.x.toFixed(3)},${a.y.toFixed(3)},${a.z.toFixed(3)}`;
  const kb = `${b.x.toFixed(3)},${b.y.toFixed(3)},${b.z.toFixed(3)}`;
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
};

describe('BaseCell.generateSuperCellBonds', () => {
  it('should generate valid indices for diamond supercells', () => {
    const cell = new DiamondCell();
    const nx = 2, ny = 2, nz = 2;
    const atoms = cell.generateSuperCell(nx, ny, nz);
    const bonds = cell.generateSuperCellBonds(nx, ny, nz);

    expect(atoms).toHaveLength(cell.data.atoms.length * nx * ny * nz);
    expect(bonds).toHaveLength(cell.getBonds().length * nx * ny * nz);
    bonds.forEach(bond => {
      expect(bond.atom1).toBeGreaterThanOrEqual(0);
      expect(bond.atom1).toBeLessThan(atoms.length);
      expect(bond.atom2).toBeGreaterThanOrEqual(0);
      expect(bond.atom2).toBeLessThan(atoms.length);
    });

    // 边界顶点 (1,0,0) 与相邻晶胞内部原子 (1.25,0.25,0.25) 的键必须由复制的键覆盖
    const spatialBonds = new Set(bonds.map(bond => key(atoms[bond.atom1], atoms[bond.atom2])));
    expect(spatialBonds.has('1.000,0.000,0.000|1.250,0.250,0.250')).toBe(true);
    expect(spatialBonds.has('1.000,1.000,0.000|1.250,1.250,0.250')).toBe(true);
  });

  it('should keep CO2 molecules complete at supercell boundaries', () => {
    const cell = new DryIceCell();
    const nx = 2, ny = 2, nz = 1;
    const atoms = cell.generateSuperCell(nx, ny, nz);
    const bonds = cell.generateSuperCellBonds(nx, ny, nz);

    expect(atoms).toHaveLength(cell.data.atoms.length * nx * ny * nz);
    expect(bonds).toHaveLength(cell.getBonds().length * nx * ny * nz);

    const spatialBonds = new Set(bonds.map(bond => key(atoms[bond.atom1], atoms[bond.atom2])));
    const corner = { x: 1, y: 0, z: 0 } as Atom;
    expect(spatialBonds.has(key(corner, { x: 1.115, y: 0.115, z: 0.115 } as Atom))).toBe(true);
    expect(spatialBonds.has(key(corner, { x: 0.885, y: -0.115, z: -0.115 } as Atom))).toBe(true);
  });

  it('should copy explicit molecular bonds for an iodine supercell', () => {
    const cell = new IodineCell();
    const nx = 2, ny = 1, nz = 1;
    const atoms = cell.generateSuperCell(nx, ny, nz);
    const bonds = cell.generateSuperCellBonds(nx, ny, nz);

    expect(atoms).toHaveLength(cell.data.atoms.length * nx * ny * nz);
    expect(bonds).toHaveLength(cell.getBonds().length * nx * ny * nz);

    // 每条键都是同一分子的两个 I 原子（原始下标相差 1，且偶数起始）
    bonds.forEach(bond => {
      expect(bond.atom1).toBeGreaterThanOrEqual(0);
      expect(bond.atom2).toBeLessThan(atoms.length);
      const local = bond.atom1 % cell.data.atoms.length;
      expect(bond.atom2 - bond.atom1).toBe(1);
      expect(local % 2).toBe(0);
      expect(atoms[bond.atom1].element).toBe('I');
      expect(atoms[bond.atom2].element).toBe('I');
    });
  });

  it('should copy both covalent and hydrogen bonds for an ice supercell', () => {
    const cell = new IceCell();
    const nx = 2, ny = 2, nz = 1;
    const atoms = cell.generateSuperCell(nx, ny, nz);
    const bonds = cell.generateSuperCellBonds(nx, ny, nz);
    const baseBonds = cell.getBonds();

    expect(bonds).toHaveLength(baseBonds.length * nx * ny * nz);
    bonds.forEach(bond => {
      expect(bond.atom1).toBeGreaterThanOrEqual(0);
      expect(bond.atom2).toBeLessThan(atoms.length);
      expect(bond.atom1).not.toBe(bond.atom2);
    });
    expect(bonds.some(bond => bond.type === 'hydrogen')).toBe(true);
  });
});
