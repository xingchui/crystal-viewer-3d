/**
 * Crystal Viewer 3D - Bond Renderer
 * 化学键渲染器 - 渲染原子间的化学键连接
 */

import * as THREE from 'three';
import type { Atom, Bond, RenderOptions } from '../../data/types';
import { getBondRadius } from '../../utils/bonds';
import { getElementColor } from '../../data/elements';
import { fractionalToCartesian, type CellParams } from '../../utils/coordinates';

interface BondInstance {
  position: THREE.Vector3;
  target: THREE.Vector3;
  radius: number;
  length: number;
  color: string;
}

export class BondRenderer {
  private instancedMesh: THREE.InstancedMesh | null = null;
  private cylinderGeometry: THREE.CylinderGeometry;
  private material: THREE.MeshPhysicalMaterial;
  private dummy: THREE.Object3D = new THREE.Object3D();
  private color: THREE.Color = new THREE.Color();

  constructor() {
    // 创建圆柱几何体作为键的基本形状
    this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1);
    this.cylinderGeometry.rotateX(Math.PI / 2); // 旋转使圆柱沿Z轴

    // 所有键共用一个材质，颜色通过 instanceColor 设置
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.3,
    });
  }

  /**
   * 渲染化学键
   *
   * @param scene - Three.js场景
   * @param atoms - 原子列表
   * @param bonds - 化学键列表
   * @param cellParams - 晶胞参数
   * @param options - 渲染选项
   */
  render(
    scene: THREE.Scene,
    atoms: Atom[],
    bonds: Bond[],
    cellParams: CellParams,
    options: RenderOptions
  ): void {
    // 清理之前的渲染
    this.clear(scene);

    if (!options.showBonds || bonds.length === 0) return;

    const instances: BondInstance[] = [];
    for (const bond of bonds) {
      const atom1 = atoms[bond.atom1];
      const atom2 = atoms[bond.atom2];
      if (!atom1 || !atom2) continue;

      const pos1 = fractionalToCartesian(atom1, cellParams);
      const pos2 = fractionalToCartesian(atom2, cellParams);
      const length = pos1.distanceTo(pos2);
      if (length === 0) continue;

      const radius = getBondRadius(bond.type || 'single') * options.bondScale;
      const color1 = getElementColor(atom1.element, atom1.color, true);
      const color2 = getElementColor(atom2.element, atom2.color, true);

      if (color1 === color2) {
        instances.push({
          position: new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5),
          target: pos2,
          radius,
          length,
          color: color1,
        });
      } else {
        // 双色键拆成两段，各自显示对应原子的颜色
        const halfLength = length / 2;
        const midPoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
        instances.push({
          position: new THREE.Vector3().lerpVectors(pos1, pos2, 0.25),
          target: midPoint,
          radius,
          length: halfLength,
          color: color1,
        });
        instances.push({
          position: new THREE.Vector3().lerpVectors(pos1, pos2, 0.75),
          target: pos2,
          radius,
          length: halfLength,
          color: color2,
        });
      }
    }

    if (instances.length === 0) return;

    // 所有键只用一个 InstancedMesh，避免超胞场景下每条键一个 draw call
    this.instancedMesh = new THREE.InstancedMesh(
      this.cylinderGeometry,
      this.material,
      instances.length
    );

    instances.forEach((instance, index) => {
      this.dummy.position.copy(instance.position);
      this.dummy.lookAt(instance.target);
      this.dummy.scale.set(instance.radius, instance.radius, instance.length);
      this.dummy.updateMatrix();
      this.instancedMesh!.setMatrixAt(index, this.dummy.matrix);
      this.color.set(instance.color);
      this.instancedMesh!.setColorAt(index, this.color);
    });

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;

    scene.add(this.instancedMesh);
  }

  /**
   * 清理渲染的键
   */
  clear(scene: THREE.Scene): void {
    if (this.instancedMesh) {
      scene.remove(this.instancedMesh);
      // 共享的 geometry/material 由 dispose() 负责，这里只释放实例缓冲
      this.instancedMesh.dispose();
      this.instancedMesh = null;
    }
  }

  /**
   * 更新渲染
   */
  update(
    scene: THREE.Scene,
    atoms: Atom[],
    bonds: Bond[],
    cellParams: CellParams,
    options: RenderOptions
  ): void {
    this.render(scene, atoms, bonds, cellParams, options);
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    if (this.instancedMesh) {
      this.instancedMesh.dispose();
      this.instancedMesh = null;
    }
    this.cylinderGeometry.dispose();
    this.material.dispose();
  }
}
