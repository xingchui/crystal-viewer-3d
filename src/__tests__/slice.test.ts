/**
 * Slice Filter Tests
 * 截面过滤测试 - 验证原子过滤后键索引被正确重映射
 */

import { describe, it, expect } from 'vitest';
import { diamondCell, dryIceCell } from '../data/cells';
import type { Atom } from '../data/types';
import { calculateCellBonds } from '../utils/bonds';
import { filterForSlicePlane } from '../utils/slice';

const coordKey = (atom: Atom) => `${atom.x},${atom.y},${atom.z}`;
const bondKey = (a: Atom, b: Atom) => {
  const ka = coordKey(a), kb = coordKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
};

describe('filterForSlicePlane', () => {
  it('should return the original arrays when plane is none', () => {
    const bonds = calculateCellBonds(diamondCell);
    const result = filterForSlicePlane(diamondCell.atoms, bonds, 'none');
    expect(result.atoms).toBe(diamondCell.atoms);
    expect(result.bonds).toBe(bonds);
  });

  it('should keep bonds pointing to the filtered atoms', () => {
    const bonds = calculateCellBonds(diamondCell);
    const result = filterForSlicePlane(diamondCell.atoms, bonds, 'yz');

    expect(result.atoms.length).toBeGreaterThan(0);
    expect(result.atoms.length).toBeLessThan(diamondCell.atoms.length);

    const kept = new Set(result.atoms);
    const expected = new Set(
      bonds
        .filter(bond => kept.has(diamondCell.atoms[bond.atom1]) && kept.has(diamondCell.atoms[bond.atom2]))
        .map(bond => bondKey(diamondCell.atoms[bond.atom1], diamondCell.atoms[bond.atom2]))
    );
    const actual = new Set(
      result.bonds.map(bond => bondKey(result.atoms[bond.atom1], result.atoms[bond.atom2]))
    );

    expect(actual).toEqual(expected);
    result.bonds.forEach(bond => {
      expect(bond.atom1).toBeGreaterThanOrEqual(0);
      expect(bond.atom1).toBeLessThan(result.atoms.length);
      expect(bond.atom2).toBeGreaterThanOrEqual(0);
      expect(bond.atom2).toBeLessThan(result.atoms.length);
    });
  });

  it('should keep complete CO2 molecules for molecular crystals', () => {
    const bonds = calculateCellBonds(dryIceCell);
    const result = filterForSlicePlane(
      dryIceCell.atoms,
      bonds,
      'yz',
      dryIceCell.properties?.category
    );

    // 平面上的 C 原子必须和它的两个 O 原子一起出现
    const cornerC = dryIceCell.atoms[0];
    expect(result.atoms).toContain(cornerC);
    expect(result.atoms).toContain(dryIceCell.atoms[1]);
    expect(result.atoms).toContain(dryIceCell.atoms[2]);

    const kept = new Set(result.atoms);
    const expected = new Set(
      bonds
        .filter(bond => kept.has(dryIceCell.atoms[bond.atom1]) && kept.has(dryIceCell.atoms[bond.atom2]))
        .map(bond => bondKey(dryIceCell.atoms[bond.atom1], dryIceCell.atoms[bond.atom2]))
    );
    const actual = new Set(
      result.bonds.map(bond => bondKey(result.atoms[bond.atom1], result.atoms[bond.atom2]))
    );
    expect(actual).toEqual(expected);
  });
});
