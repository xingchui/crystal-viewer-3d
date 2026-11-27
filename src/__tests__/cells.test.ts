/**
 * Cell Data Tests
 * 晶胞数据单元测试 - 验证平移对称性
 */

import { describe, it, expect } from 'vitest';
import {
  diamondCell, dryIceCell, sicCell, graphiteCell,
  siliconCell, sio2Cell, iodineCell, iceCell,
  copperCell, magnesiumCell, ironCell, perovskiteCell,
} from '../data/cells';
import { CellRegistry } from '../core/cells/CellImplementations';
import { calculateCellBonds } from '../utils/bonds';
import { fractionalToCartesian } from '../utils/coordinates';
import type { Atom, Bond, UnitCell } from '../data/types';

const bondLength = (cell: UnitCell, bond: Bond): number => {
  const params = {
    a: cell.a, b: cell.b, c: cell.c,
    alpha: cell.alpha, beta: cell.beta, gamma: cell.gamma,
  };
  const p1 = fractionalToCartesian(cell.atoms[bond.atom1], params);
  const p2 = fractionalToCartesian(cell.atoms[bond.atom2], params);
  return Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
};

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

    it('should show the four Pa-3 CO2 orientations along body diagonals', () => {
      const carbons = dryIceCell.atoms.filter(atom => atom.element === 'C');
      const oxygens = dryIceCell.atoms.filter(atom => atom.element === 'O');
      expect(carbons).toHaveLength(14); // 8 corners + 6 face centers
      expect(oxygens).toHaveLength(28);

      const axes = new Set<string>();
      for (const carbon of carbons) {
        const nearest = oxygens
          .map(oxygen => ({
            oxygen,
            distance: Math.hypot(
              oxygen.x - carbon.x,
              oxygen.y - carbon.y,
              oxygen.z - carbon.z,
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);

        // Each C has two equal C=O bonds, length sqrt(3) * 0.115 in fractional units
        expect(nearest[0].distance).toBeCloseTo(nearest[1].distance, 6);
        expect(nearest[0].distance).toBeCloseTo(Math.sqrt(3) * 0.115, 6);

        const direction = [
          nearest[0].oxygen.x - carbon.x,
          nearest[0].oxygen.y - carbon.y,
          nearest[0].oxygen.z - carbon.z,
        ];
        // Collapse the two opposite bond directions into one molecular axis
        const firstNonZero = direction.find(value => Math.abs(value) > 1e-9)!;
        const axis = direction
          .map(value => (firstNonZero < 0 ? -value : value).toFixed(3))
          .join(',');

        axes.add(axis);
      }

      expect(axes.size).toBe(4);
      expect(axes).toEqual(new Set([
        '0.115,0.115,0.115',
        '0.115,-0.115,-0.115',
        '0.115,0.115,-0.115',
        '0.115,-0.115,0.115',
      ]));
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

  describe('Silicon Cell', () => {
    it('should have valid coordinates', () => {
      validateCoordinates(siliconCell.atoms, 'Silicon');
    });

    it('should have the diamond-type 18-site framework', () => {
      expect(siliconCell.atoms).toHaveLength(18);
      siliconCell.atoms.forEach(atom => expect(atom.element).toBe('Si'));
      checkCornerAtoms(siliconCell.atoms, 'Si', 'Silicon');
    });

    it('should bond each Si to four nearest neighbours', () => {
      const bonds = calculateCellBonds(siliconCell);
      expect(bonds).toHaveLength(16);
      bonds.forEach(bond => {
        expect(siliconCell.atoms[bond.atom1].element).toBe('Si');
        expect(siliconCell.atoms[bond.atom2].element).toBe('Si');
        expect(bondLength(siliconCell, bond)).toBeCloseTo(2.352, 2);
      });
    });
  });

  describe('SiO2 Cell', () => {
    it('should have valid coordinates', () => {
      validateCoordinates(sio2Cell.atoms, 'SiO2');
    });

    it('should contain 18 Si and 16 bridging O atoms', () => {
      expect(sio2Cell.atoms.filter(atom => atom.element === 'Si')).toHaveLength(18);
      expect(sio2Cell.atoms.filter(atom => atom.element === 'O')).toHaveLength(16);
    });

    it('should only have Si-O bonds with cristobalite bond length', () => {
      const bonds = calculateCellBonds(sio2Cell);
      expect(bonds).toHaveLength(32);
      bonds.forEach(bond => {
        const elements = [sio2Cell.atoms[bond.atom1].element, sio2Cell.atoms[bond.atom2].element].sort();
        expect(elements).toEqual(['O', 'Si']);
        expect(bondLength(sio2Cell, bond)).toBeCloseTo(1.55, 2);
      });
    });
  });

  describe('Iodine Cell', () => {
    it('should show complete molecules with slightly extended coordinates', () => {
      validateCoordinates(iodineCell.atoms, 'Iodine', true);
      expect(iodineCell.atoms).toHaveLength(28);
      iodineCell.atoms.forEach(atom => expect(atom.element).toBe('I'));
    });

    it('should place 8 corner molecules and 6 face molecules', () => {
      const bonds = calculateCellBonds(iodineCell);
      expect(bonds).toHaveLength(14);

      const centres = bonds.map(bond => {
        const a = iodineCell.atoms[bond.atom1];
        const b = iodineCell.atoms[bond.atom2];
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
      });

      const corners = centres.filter(c =>
        [c.x, c.y, c.z].every(value => Math.abs(value) < 1e-6 || Math.abs(value - 1) < 1e-6)
      );
      expect(corners).toHaveLength(8);
      expect(centres).toHaveLength(14);
    });

    it('should have two molecular orientations and I-I bond length 2.68 Å', () => {
      const bonds = calculateCellBonds(iodineCell);
      const axes = new Set<string>();
      bonds.forEach(bond => {
        expect(bondLength(iodineCell, bond)).toBeCloseTo(2.676, 2);
        const a = iodineCell.atoms[bond.atom1];
        const b = iodineCell.atoms[bond.atom2];
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const sign = dy < 0 ? -1 : 1;
        axes.add(`${(dy * sign).toFixed(3)},${(dz * sign).toFixed(3)}`);
      });
      expect(axes.size).toBe(2);
    });
  });

  describe('Ice Cell', () => {
    it('should keep atoms within the extended molecular range', () => {
      validateCoordinates(iceCell.atoms, 'Ice', true);
    });

    it('should contain complete H2O molecules', () => {
      const oxygens = iceCell.atoms.filter(atom => atom.element === 'O');
      const hydrogens = iceCell.atoms.filter(atom => atom.element === 'H');
      expect(hydrogens.length).toBe(oxygens.length * 2);
      expect(oxygens.length).toBeGreaterThanOrEqual(12);
    });

    it('should draw two covalent O-H bonds per molecule and 24 hydrogen bonds', () => {
      const bonds = calculateCellBonds(iceCell);
      const single = bonds.filter(bond => bond.type === 'single');
      const hydrogen = bonds.filter(bond => bond.type === 'hydrogen');
      const oxygenCount = iceCell.atoms.filter(atom => atom.element === 'O').length;

      expect(single).toHaveLength(oxygenCount * 2);
      single.forEach(bond => {
        const elements = [iceCell.atoms[bond.atom1].element, iceCell.atoms[bond.atom2].element].sort();
        expect(elements).toEqual(['H', 'O']);
        const length = bondLength(iceCell, bond);
        expect(length).toBeGreaterThan(0.8);
        expect(length).toBeLessThan(0.9);
      });

      expect(hydrogen).toHaveLength(24);
      hydrogen.forEach(bond => {
        const elements = [iceCell.atoms[bond.atom1].element, iceCell.atoms[bond.atom2].element].sort();
        expect(elements).toEqual(['H', 'O']);
        const length = bondLength(iceCell, bond);
        expect(length).toBeGreaterThan(1.85);
        expect(length).toBeLessThan(1.95);
      });
    });
  });

  describe('Metal Cells', () => {
    it('copper should be fcc with 14 displayed atoms', () => {
      validateCoordinates(copperCell.atoms, 'Copper');
      expect(copperCell.atoms).toHaveLength(14);
      copperCell.atoms.forEach(atom => expect(atom.element).toBe('Cu'));
      checkCornerAtoms(copperCell.atoms, 'Cu', 'Copper');
    });

    it('magnesium should be hcp with an internal atom at (1/3, 2/3, 1/2)', () => {
      validateCoordinates(magnesiumCell.atoms, 'Magnesium');
      expect(magnesiumCell.atoms).toHaveLength(9);
      const internal = magnesiumCell.atoms.find(atom =>
        Math.abs(atom.x - 1 / 3) < 1e-6 &&
        Math.abs(atom.y - 2 / 3) < 1e-6 &&
        Math.abs(atom.z - 0.5) < 1e-6
      );
      expect(internal).toBeDefined();
    });

    it('iron should be bcc with a body-centre atom', () => {
      validateCoordinates(ironCell.atoms, 'Iron');
      expect(ironCell.atoms).toHaveLength(9);
      const bodyCentre = ironCell.atoms.find(atom =>
        atom.x === 0.5 && atom.y === 0.5 && atom.z === 0.5
      );
      expect(bodyCentre).toBeDefined();
    });
  });

  describe('Perovskite Cell', () => {
    it('should have Ca at corners, Ti at the body centre and O at face centres', () => {
      validateCoordinates(perovskiteCell.atoms, 'Perovskite');
      expect(perovskiteCell.atoms.filter(atom => atom.element === 'Ca')).toHaveLength(8);
      expect(perovskiteCell.atoms.filter(atom => atom.element === 'Ti')).toHaveLength(1);
      expect(perovskiteCell.atoms.filter(atom => atom.element === 'O')).toHaveLength(6);
      checkCornerAtoms(perovskiteCell.atoms, 'Ca', 'Perovskite');
    });

    it('should draw the six Ti-O bonds of the octahedron', () => {
      const bonds = calculateCellBonds(perovskiteCell);
      expect(bonds).toHaveLength(6);
      bonds.forEach(bond => {
        const elements = [perovskiteCell.atoms[bond.atom1].element, perovskiteCell.atoms[bond.atom2].element].sort();
        expect(elements).toEqual(['O', 'Ti']);
        expect(bondLength(perovskiteCell, bond)).toBeCloseTo(1.91, 2);
      });
    });
  });

  describe('Cell Registry order', () => {
    it('should group cells as covalent → molecular → metallic → ionic → mixed', () => {
      const ids = CellRegistry.getAll().map(cell => cell.id);
      expect(ids).toEqual([
        'diamond', 'silicon', 'sic', 'sio2',
        'dryice', 'iodine', 'ice',
        'copper', 'magnesium', 'iron',
        'nacl', 'cscl', 'zns', 'caf2', 'perovskite',
        'graphite',
      ]);
    });
  });
});
