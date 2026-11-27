/**
 * Crystal Viewer 3D - Slice Utilities
 * 截面过滤工具 - 过滤原子并同步重映射化学键索引
 */

import type { Atom, Bond } from '../data/types';
import { SLICE_PLANE_CONFIG } from '../data/constants';

export type SlicePlane = 'none' | 'yz' | 'xz' | 'xy';

/**
 * 按截面平面过滤原子。
 *
 * 过滤后原子数组的下标发生变化，因此化学键端点必须同步重映射；
 * 否则 BondRenderer 会用键索引取到错误的原子。
 */
export function filterForSlicePlane(
  atoms: Atom[],
  bonds: Bond[],
  plane: SlicePlane,
  category?: string
): { atoms: Atom[]; bonds: Bond[] } {
  if (plane === 'none') return { atoms, bonds };

  const tolerance = SLICE_PLANE_CONFIG.tolerance;
  const atomsOnPlane = new Set<number>();

  atoms.forEach((atom, index) => {
    let isOnPlane = false;
    if (plane === 'yz') isOnPlane = Math.abs(atom.x) <= tolerance || Math.abs(atom.x - 1) <= tolerance;
    if (plane === 'xz') isOnPlane = Math.abs(atom.y) <= tolerance || Math.abs(atom.y - 1) <= tolerance;
    if (plane === 'xy') isOnPlane = Math.abs(atom.z) <= tolerance || Math.abs(atom.z - 1) <= tolerance;
    if (isOnPlane) atomsOnPlane.add(index);
  });

  // 分子晶体：把平面上原子所属的完整分子一并显示
  const displayAtomIndices = new Set(atomsOnPlane);
  if (category === 'molecular') {
    bonds.forEach(bond => {
      if (atomsOnPlane.has(bond.atom1)) displayAtomIndices.add(bond.atom2);
      if (atomsOnPlane.has(bond.atom2)) displayAtomIndices.add(bond.atom1);
    });
  }

  const displayIndexMap = new Map<number, number>();
  const displayAtoms = atoms.filter((_, index) => {
    if (!displayAtomIndices.has(index)) return false;
    displayIndexMap.set(index, displayIndexMap.size);
    return true;
  });

  const displayBonds = bonds
    .filter(bond => displayAtomIndices.has(bond.atom1) && displayAtomIndices.has(bond.atom2))
    .map(bond => ({
      ...bond,
      atom1: displayIndexMap.get(bond.atom1)!,
      atom2: displayIndexMap.get(bond.atom2)!,
    }));

  return { atoms: displayAtoms, bonds: displayBonds };
}
