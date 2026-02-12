/**
 * Debug: Calculate actual distances in diamond cell
 */
import * as THREE from 'three';
import { diamondCell, sicCell } from '../src/data/cells';
import { getMinimumDistance, getTransformationMatrix } from '../src/utils/coordinates';

const cellParams = {
  a: diamondCell.a,
  b: diamondCell.b,
  c: diamondCell.c,
  alpha: diamondCell.alpha,
  beta: diamondCell.beta,
  gamma: diamondCell.gamma
};

console.log('Diamond Cell Analysis:');
console.log('======================');
console.log('Atoms:', diamondCell.atoms.length);

// 计算从原子0 (0,0,0) 到所有其他原子的距离
const atom0 = diamondCell.atoms[0];
const pos0 = new THREE.Vector3(atom0.x, atom0.y, atom0.z);

console.log('\nDistances from atom 0 (0,0,0) corner:');
for (let i = 1; i < diamondCell.atoms.length; i++) {
  const atom = diamondCell.atoms[i];
  const pos = new THREE.Vector3(atom.x, atom.y, atom.z);
  const dist = getMinimumDistance(pos0, pos, cellParams);
  console.log(`  Atom ${i} (${atom.x},${atom.y},${atom.z}) ${atom.element}: ${dist.toFixed(3)} Å`);
}

// 计算所有C-C对的距离分布
console.log('\nAll C-C pair distances (first 20):');
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
const uniqueDistances = [...new Set(distances.map(d => Math.round(d * 100) / 100))];
console.log('Unique distances:', uniqueDistances.slice(0, 10));
console.log('Minimum distance:', Math.min(...distances).toFixed(3), 'Å');
console.log('Expected C-C bond length:', '1.54 Å');

// SiC analysis
console.log('\n\nSiC Cell Analysis:');
console.log('==================');
const sicParams = {
  a: sicCell.a,
  b: sicCell.b,
  c: sicCell.c,
  alpha: sicCell.alpha,
  beta: sicCell.beta,
  gamma: sicCell.gamma
};

// 计算所有Si-C对的距离
const siIndices: number[] = [];
const cIndices: number[] = [];
for (let i = 0; i < sicCell.atoms.length; i++) {
  if (sicCell.atoms[i].element === 'Si') siIndices.push(i);
  else if (sicCell.atoms[i].element === 'C') cIndices.push(i);
}

const sicDistances: number[] = [];
for (const siIdx of siIndices) {
  const siPos = new THREE.Vector3(sicCell.atoms[siIdx].x, sicCell.atoms[siIdx].y, sicCell.atoms[siIdx].z);
  for (const cIdx of cIndices) {
    const cPos = new THREE.Vector3(sicCell.atoms[cIdx].x, sicCell.atoms[cIdx].y, sicCell.atoms[cIdx].z);
    const dist = getMinimumDistance(siPos, cPos, sicParams);
    sicDistances.push(dist);
  }
}
sicDistances.sort((a, b) => a - b);
const uniqueSicDistances = [...new Set(sicDistances.map(d => Math.round(d * 100) / 100))];
console.log('Si-C unique distances:', uniqueSicDistances.slice(0, 10));
console.log('Si-C minimum distance:', Math.min(...sicDistances).toFixed(3), 'Å');
console.log('Expected Si-C bond length:', '1.88 Å');
