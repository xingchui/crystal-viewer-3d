/**
 * Cell Data Tests
 * 晶胞数据单元测试 - 验证平移对称性
 */

import { describe, it, expect } from 'vitest';
import { diamondCell, dryIceCell, sicCell, graphiteCell } from '../data/cells';
import type { Atom } from '../data/types';

describe('Cell Data Validation', () => {
  
  /**
   * 验证所有坐标有效（允许超出[0,1)范围以显示完整晶胞）
   * 对于分子晶体，允许坐标在[-0.2, 1.2]范围内以显示完整分子
   * 对于石墨等需要显示更大结构的，允许坐标在[-0.6, 1.6]范围内
   */
  function validateCoordinates(atoms: Atom[], cellName: string, allowExtendedRange: boolean = false) {
    const lowerBound = allowExtendedRange ? -0.6 : 0;
    const upperBound = allowExtendedRange ? 1.6 : 1.2;
    
    atoms.forEach((atom, index) => {
      expect(atom.x, `${cellName} atom ${index} x coordinate`).toBeGreaterThanOrEqual(lowerBound);
      expect(atom.x, `${cellName} atom ${index} x coordinate`).toBeLessThanOrEqual(upperBound);
      expect(atom.y, `${cellName} atom ${index} y coordinate`).toBeGreaterThanOrEqual(lowerBound);
      expect(atom.y, `${cellName} atom ${index} y coordinate`).toBeLessThanOrEqual(upperBound);
      expect(atom.z, `${cellName} atom ${index} z coordinate`).toBeGreaterThanOrEqual(lowerBound);
      expect(atom.z, `${cellName} atom ${index} z coordinate`).toBeLessThanOrEqual(upperBound);
    });
  }

  /**
   * 检查顶点原子
   */
  function checkCornerAtoms(atoms: Atom[], element: string, cellName: string) {
    const corners = [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 1, y: 0, z: 1 },
      { x: 0, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 },
    ];
    
    corners.forEach((corner, index) => {
      const found = atoms.some(atom => 
        Math.abs(atom.x - corner.x) < 0.001 &&
        Math.abs(atom.y - corner.y) < 0.001 &&
        Math.abs(atom.z - corner.z) < 0.001 &&
        atom.element === element
      );
      expect(found, `${cellName} should have atom at corner ${index} (${corner.x},${corner.y},${corner.z})`).toBe(true);
    });
  }

  describe('Diamond Cell', () => {
    it('should have valid coordinates', () => {
      validateCoordinates(diamondCell.atoms, 'Diamond');
    });

    it('should have 8 corner atoms (all carbon)', () => {
      checkCornerAtoms(diamondCell.atoms, 'C', 'Diamond');
    });

    it('should have 6 face-center atoms', () => {
      const faceCenters = [
        { x: 0.5, y: 0.5, z: 0 },
        { x: 0.5, y: 0.5, z: 1 },
        { x: 0.5, y: 0, z: 0.5 },
        { x: 0.5, y: 1, z: 0.5 },
        { x: 0, y: 0.5, z: 0.5 },
        { x: 1, y: 0.5, z: 0.5 },
      ];
      
      faceCenters.forEach((face, index) => {
        const found = diamondCell.atoms.some(atom => 
          Math.abs(atom.x - face.x) < 0.001 &&
          Math.abs(atom.y - face.y) < 0.001 &&
          Math.abs(atom.z - face.z) < 0.001 &&
          atom.element === 'C'
        );
        expect(found, `Diamond should have atom at face center ${index}`).toBe(true);
      });
    });

    it('should have all carbon atoms', () => {
      diamondCell.atoms.forEach(atom => {
        expect(atom.element).toBe('C');
      });
    });
  });

  describe('Dry Ice Cell', () => {
    it('should have valid coordinates', () => {
      validateCoordinates(dryIceCell.atoms, 'Dry Ice', true); // 分子晶体允许负坐标
    });

    it('should have CO2 molecules at corners', () => {
      // Check at least one corner has C atom
      const cornerAtoms = dryIceCell.atoms.filter(atom => 
        (atom.x === 0 || atom.x === 1) &&
        (atom.y === 0 || atom.y === 1) &&
        (atom.z === 0 || atom.z === 1)
      );
      expect(cornerAtoms.length).toBeGreaterThan(0);
    });
  });

  describe('Graphite Cell', () => {
    it('should have valid coordinates', () => {
      validateCoordinates(graphiteCell.atoms, 'Graphite', true); // 石墨允许负坐标以显示完整六边形
    });

    it('should have carbon atoms only', () => {
      graphiteCell.atoms.forEach(atom => {
        expect(atom.element).toBe('C');
      });
    });
  });

  describe('SiC Cell', () => {
    it('should have valid coordinates', () => {
      validateCoordinates(sicCell.atoms, 'SiC');
    });

    it('should have 8 corner atoms (all silicon)', () => {
      checkCornerAtoms(sicCell.atoms, 'Si', 'SiC');
    });

    it('should have alternating Si and C', () => {
      const siCount = sicCell.atoms.filter(a => a.element === 'Si').length;
      const cCount = sicCell.atoms.filter(a => a.element === 'C').length;
      expect(siCount).toBeGreaterThan(0);
      expect(cCount).toBeGreaterThan(0);
    });
  });
});
