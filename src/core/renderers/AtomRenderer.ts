/**
 * Crystal Viewer 3D - Atom Renderer
 * 原子渲染器 - 使用InstancedMesh + PhysicalMaterial实现高性能金属质感渲染
 */

import * as THREE from 'three';
import type { Atom, RenderOptions } from '../../data/types';
import { getElementColor, getAtomRadius } from '../../data/elements';
import { fractionalToCartesian, type CellParams } from '../../utils/coordinates';

export class AtomRenderer {
  private instancedMesh: THREE.InstancedMesh | null = null;
  private geometry: THREE.IcosahedronGeometry;
  private material: THREE.MeshPhysicalMaterial;
  private dummy: THREE.Object3D;
  private color: THREE.Color = new THREE.Color();

  constructor() {
    // 创建球体几何体 (128面体，足够圆润且性能良好)
    this.geometry = new THREE.IcosahedronGeometry(1, 3);
    
    // 创建物理材质，实现金属质感
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.7,       // 金属度
      roughness: 0.3,       // 粗糙度
      clearcoat: 0.5,       // 清漆层
      clearcoatRoughness: 0.2,
      reflectivity: 0.8,
      envMapIntensity: 1.0,
    });
    
    // 用于计算变换的辅助对象
    this.dummy = new THREE.Object3D();
  }

  /**
   * 渲染原子集合
   * 
   * @param scene - Three.js场景
   * @param atoms - 原子列表
   * @param cellParams - 晶胞参数
   * @param options - 渲染选项
   */
  render(
    scene: THREE.Scene,
    atoms: Atom[],
    cellParams: CellParams,
    options: RenderOptions
  ): void {
    // 清理之前的渲染
    this.clear(scene);
    
    if (!options.showAtoms || atoms.length === 0) return;

    // 创建InstancedMesh
    this.instancedMesh = new THREE.InstancedMesh(
      this.geometry,
      this.material.clone(), // 克隆材质以避免影响其他实例
      atoms.length
    );
    
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    
    atoms.forEach((atom, index) => {
      // 转换为笛卡尔坐标
      const position = fractionalToCartesian(atom, cellParams);
      
      // 获取原子半径并应用缩放
      const baseRadius = getAtomRadius(atom.element, atom.radius);
      const radius = baseRadius * options.atomScale;
      
      // 设置位置和缩放
      this.dummy.position.copy(position);
      this.dummy.scale.set(radius, radius, radius);
      this.dummy.updateMatrix();
      
      this.instancedMesh!.setMatrixAt(index, this.dummy.matrix);
      
      // 设置颜色
      this.color.set(getElementColor(atom.element, atom.color, true));
      this.instancedMesh!.setColorAt(index, this.color);
    });

    // 标记需要更新
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    scene.add(this.instancedMesh);
  }

  /**
   * 清理渲染的原子
   */
  clear(scene: THREE.Scene): void {
    if (this.instancedMesh) {
      scene.remove(this.instancedMesh);
      // 共享的 geometry/material 由 dispose() 负责，这里只释放实例缓冲和克隆出的材质
      this.instancedMesh.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
      this.instancedMesh = null;
    }
  }

  /**
   * 更新渲染选项
   */
  update(
    scene: THREE.Scene,
    atoms: Atom[],
    cellParams: CellParams,
    options: RenderOptions
  ): void {
    this.render(scene, atoms, cellParams, options);
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    if (this.instancedMesh) {
      this.instancedMesh.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
      this.instancedMesh = null;
    }
    this.geometry.dispose();
    this.material.dispose();
  }
}
