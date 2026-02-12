/**
 * Bond Calculation Tests
 * 化学键计算单元测试 - 验证最近邻键计算
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { diamondCell, dryIceCell, sicCell } from '../data/cells';
import { calculateCellBonds } from '../utils/bonds';
import { getMinimumDistance } from '../utils/coordinates';

describe('Distance Analysis', () => {
  it('should show detailed distances from atom 0', () => {
    const cellParams = {
      a: diamondCell.a, b: diamondCell.b, c: diamondCell.c,
      alpha: diamondCell.alpha, beta: diamondCell.beta, gamma: diamondCell.gamma
    };
    
    console.log('\nDetailed distances from atom 0 (0,0,0):');
    const atom0 = diamondCell.atoms[0];
    const pos0 = new THREE.Vector3(atom0.x, atom0.y, atom0.z);
    
    for (let i = 1; i < diamondCell.atoms.length; i++) {
      const atom = diamondCell.atoms[i];
      const pos = new THREE.Vector3(atom.x, atom.y, atom.z);
      const dist = getMinimumDistance(pos0, pos, cellParams);
      console.log(`  Atom ${i} (${atom.x},${atom.y},${atom.z}) ${atom.element}: ${dist.toFixed(4)} Å`);
    }
    
    expect(true).toBe(true);
  });

  it('should show diamond C-C distances', () => {
    const cellParams = {
      a: diamondCell.a, b: diamondCell.b, c: diamondCell.c,
      alpha: diamondCell.alpha, beta: diamondCell.beta, gamma: diamondCell.gamma
    };
    
    // 计算所有C-C对的距离
    const distances: number[] = [];
    for (let i = 0; i < diamondCell.atoms.length; i++) {
      for (let j = i + 1; j < diamondCell.atoms.length; j++) {
        const pos1 = new THREE.Vector3(diamondCell.atoms[i].x, diamondCell.atoms[i].y, diamondCell.atoms[i].z);
        const pos2 = new THREE.Vector3(diamondCell.atoms[j].x, diamondCell.atoms[j].y, diamondCell.atoms[j].z);
        const dist = getMinimumDistance(pos1, pos2, cellParams);
        distances.push(dist);
      }
    }
    
    distances.sort((a, b) => a - b);
    
    // 分组统计
    const groups: { [key: string]: number } = {};
    distances.forEach(d => {
      const key = d.toFixed(2);
      groups[key] = (groups[key] || 0) + 1;
    });
    
    console.log('\nDiamond C-C Distance Distribution:');
    console.log('Total pairs:', distances.length);
    Object.entries(groups).slice(0, 10).forEach(([dist, count]) => {
      console.log(`  ${dist} Å: ${count} pairs`);
    });
    console.log('Min distance:', Math.min(...distances).toFixed(3), 'Å');
    expect(distances.length).toBeGreaterThan(0);
  });

  it('should show SiC Si-C distances', () => {
    const cellParams = {
      a: sicCell.a, b: sicCell.b, c: sicCell.c,
      alpha: sicCell.alpha, beta: sicCell.beta, gamma: sicCell.gamma
    };
    
    const siIndices = sicCell.atoms.map((a, i) => a.element === 'Si' ? i : -1).filter(i => i >= 0);
    const cIndices = sicCell.atoms.map((a, i) => a.element === 'C' ? i : -1).filter(i => i >= 0);
    
    const distances: number[] = [];
    for (const siIdx of siIndices) {
      const siPos = new THREE.Vector3(sicCell.atoms[siIdx].x, sicCell.atoms[siIdx].y, sicCell.atoms[siIdx].z);
      for (const cIdx of cIndices) {
        const cPos = new THREE.Vector3(sicCell.atoms[cIdx].x, sicCell.atoms[cIdx].y, sicCell.atoms[cIdx].z);
        const dist = getMinimumDistance(siPos, cPos, cellParams);
        distances.push(dist);
      }
    }
    
    distances.sort((a, b) => a - b);
    
    const groups: { [key: string]: number } = {};
    distances.forEach(d => {
      const key = d.toFixed(2);
      groups[key] = (groups[key] || 0) + 1;
    });
    
    console.log('\nSiC Si-C Distance Distribution:');
    console.log('Total pairs:', distances.length);
    Object.entries(groups).slice(0, 10).forEach(([dist, count]) => {
      console.log(`  ${dist} Å: ${count} pairs`);
    });
    console.log('Min distance:', Math.min(...distances).toFixed(3), 'Å');
    expect(distances.length).toBeGreaterThan(0);
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
});
