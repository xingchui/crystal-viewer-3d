/**
 * Bond Calculation Tests
 * 化学键计算单元测试 - 验证最近邻键计算
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  diamondCell, dryIceCell, sicCell,
  copperCell, magnesiumCell, ironCell, perovskiteCell,
} from '../data/cells';
import type { UnitCell } from '../data/types';
import { calculateCellBonds } from '../utils/bonds';
import { getMinimumDistance, fractionalToCartesian } from '../utils/coordinates';

describe('Distance Analysis', () => {
  const paramsOf = (cell: UnitCell) => ({
    a: cell.a, b: cell.b, c: cell.c,
    alpha: cell.alpha, beta: cell.beta, gamma: cell.gamma,
  });

  const frac = (atom: { x: number; y: number; z: number }) => new THREE.Vector3(atom.x, atom.y, atom.z);

  it('should treat periodic corner duplicates of diamond atom 0 as zero distance', () => {
    const params = paramsOf(diamondCell);
    const origin = frac(diamondCell.atoms[0]);
    const distances = diamondCell.atoms.slice(1).map(atom =>
      getMinimumDistance(origin, frac(atom), params)
    );

    // 7 个顶点是同一个周期位置的映像
    expect(distances.filter(d => d < 0.01)).toHaveLength(7);
    // 4 个内部原子是最近邻，C-C 键长约 1.544 Å
    expect(distances.filter(d => Math.abs(d - 1.544) < 0.01)).toHaveLength(4);
  });

  it('should find the diamond nearest-neighbor distance around 1.54 Å', () => {
    const params = paramsOf(diamondCell);
    const distances: number[] = [];
    for (let i = 0; i < diamondCell.atoms.length; i++) {
      for (let j = i + 1; j < diamondCell.atoms.length; j++) {
        distances.push(getMinimumDistance(frac(diamondCell.atoms[i]), frac(diamondCell.atoms[j]), params));
      }
    }

    const nearest = distances.filter(d => d > 0.01).sort((a, b) => a - b)[0];
    expect(nearest).toBeGreaterThan(1.5);
    expect(nearest).toBeLessThan(1.6);
    expect(distances.filter(d => Math.abs(d - nearest) < 0.01).length).toBeGreaterThan(0);
  });

  it('should find the SiC nearest-neighbor distance around 1.89 Å', () => {
    const params = paramsOf(sicCell);
    const siAtoms = sicCell.atoms.filter(a => a.element === 'Si');
    const cAtoms = sicCell.atoms.filter(a => a.element === 'C');
    const distances: number[] = [];
    for (const si of siAtoms) {
      for (const c of cAtoms) {
        distances.push(getMinimumDistance(frac(si), frac(c), params));
      }
    }

    expect(distances.length).toBeGreaterThan(0);
    expect(Math.min(...distances)).toBeGreaterThan(1.85);
    expect(Math.min(...distances)).toBeLessThan(1.95);
    expect(distances.every(d => Math.abs(d - Math.min(...distances)) < 0.01)).toBe(true);
  });
});

describe('Bond Calculation', () => {
  
  describe('Diamond Bonds', () => {
    it('should calculate bonds for diamond', () => {
      // 手动计算最小距离
      const cellParams = {
        a: diamondCell.a, b: diamondCell.b, c: diamondCell.c,
        alpha: diamondCell.alpha, beta: diamondCell.beta, gamma: diamondCell.gamma
      };
      
      let minDist = Infinity;
      for (let i = 0; i < diamondCell.atoms.length; i++) {
        for (let j = i + 1; j < diamondCell.atoms.length; j++) {
          const pos1 = new THREE.Vector3(diamondCell.atoms[i].x, diamondCell.atoms[i].y, diamondCell.atoms[i].z);
          const pos2 = new THREE.Vector3(diamondCell.atoms[j].x, diamondCell.atoms[j].y, diamondCell.atoms[j].z);
          const dist = getMinimumDistance(pos1, pos2, cellParams);
          if (dist > 0.01 && dist < minDist) {
            minDist = dist;
          }
        }
      }
      console.log('Actual min distance (excluding 0):', minDist);
      
      const bonds = calculateCellBonds(diamondCell);
      console.log('Diamond bonds count:', bonds.length);
      console.log('Diamond bonds:', bonds);
      
      // 金刚石应该有最近邻C-C键
      // 每个内部C原子应该有4个键，但面心和角上的原子键会少一些
      expect(bonds.length).toBeGreaterThan(0);
      
      // 所有键应该是单键
      bonds.forEach(bond => {
        expect(bond.type).toBe('single');
      });
    });

    it('should only have C-C bonds', () => {
      const bonds = calculateCellBonds(diamondCell);
      
      bonds.forEach(bond => {
        const atom1 = diamondCell.atoms[bond.atom1];
        const atom2 = diamondCell.atoms[bond.atom2];
        expect(atom1.element).toBe('C');
        expect(atom2.element).toBe('C');
      });
    });
  });

  describe('SiC Bonds', () => {
    it('should calculate bonds for SiC', () => {
      const bonds = calculateCellBonds(sicCell);
      console.log('SiC bonds count:', bonds.length);
      console.log('SiC bonds:', bonds);
      
      // SiC应该有Si-C键
      expect(bonds.length).toBeGreaterThan(0);
    });

    it('should only have Si-C bonds (no Si-Si or C-C)', () => {
      const bonds = calculateCellBonds(sicCell);
      
      bonds.forEach(bond => {
        const atom1 = sicCell.atoms[bond.atom1];
        const atom2 = sicCell.atoms[bond.atom2];
        const elements = [atom1.element, atom2.element].sort();
        expect(elements).toEqual(['C', 'Si']);
      });
    });
  });

  describe('Dry Ice Bonds', () => {
    it('should calculate bonds for dry ice', () => {
      const bonds = calculateCellBonds(dryIceCell);
      console.log('Dry Ice bonds count:', bonds.length);
      console.log('Dry Ice bonds:', bonds);
      
      // 干冰应该有C=O双键
      expect(bonds.length).toBeGreaterThan(0);
    });

    it('should only have C-O bonds within molecules', () => {
      const bonds = calculateCellBonds(dryIceCell);
      
      bonds.forEach(bond => {
        const atom1 = dryIceCell.atoms[bond.atom1];
        const atom2 = dryIceCell.atoms[bond.atom2];
        const elements = [atom1.element, atom2.element].sort();
        expect(elements).toEqual(['C', 'O']);
      });
    });

    it('should have double bonds for C=O', () => {
      const bonds = calculateCellBonds(dryIceCell);
      
      bonds.forEach(bond => {
        expect(bond.type).toBe('double');
      });
    });
  });

  describe('Metal Bonds', () => {
    const cellParams = (cell: UnitCell) => ({
      a: cell.a, b: cell.b, c: cell.c,
      alpha: cell.alpha, beta: cell.beta, gamma: cell.gamma,
    });

    const bondLengths = (cell: UnitCell) => {
      const params = cellParams(cell);
      return calculateCellBonds(cell).map(bond =>
        fractionalToCartesian(cell.atoms[bond.atom1], params)
          .distanceTo(fractionalToCartesian(cell.atoms[bond.atom2], params))
      );
    };

    it('should use fcc nearest neighbours for copper (a/√2 = 2.556 Å)', () => {
      const bonds = calculateCellBonds(copperCell);
      expect(bonds.length).toBe(36);
      bondLengths(copperCell).forEach(length => expect(length).toBeCloseTo(2.556, 3));
    });

    it('should use bcc body-diagonal bonds for iron (√3a/2 = 2.482 Å)', () => {
      const bonds = calculateCellBonds(ironCell);
      expect(bonds.length).toBe(8);
      bondLengths(ironCell).forEach(length => expect(length).toBeCloseTo(2.482, 3));
    });

    it('should use hcp in-plane and half-height neighbours for magnesium', () => {
      const bonds = calculateCellBonds(magnesiumCell);
      expect(bonds.length).toBe(16);
      bondLengths(magnesiumCell).forEach(length => {
        expect(length).toBeGreaterThan(3.15);
        expect(length).toBeLessThan(3.25);
      });
    });
  });

  describe('Perovskite Bonds', () => {
    it('should connect Ti to all six face-centre O atoms', () => {
      const bonds = calculateCellBonds(perovskiteCell);
      expect(bonds).toHaveLength(6);

      const params = {
        a: perovskiteCell.a, b: perovskiteCell.b, c: perovskiteCell.c,
        alpha: perovskiteCell.alpha, beta: perovskiteCell.beta, gamma: perovskiteCell.gamma,
      };
      bonds.forEach(bond => {
        const a1 = perovskiteCell.atoms[bond.atom1];
        const a2 = perovskiteCell.atoms[bond.atom2];
        const elements = [a1.element, a2.element].sort();
        expect(elements).toEqual(['O', 'Ti']);
        const length = fractionalToCartesian(a1, params).distanceTo(fractionalToCartesian(a2, params));
        expect(length).toBeCloseTo(1.91, 2);
      });
    });
  });
});
