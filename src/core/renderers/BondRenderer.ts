/**
 * Crystal Viewer 3D - Bond Renderer
 * 化学键渲染器 - 渲染原子间的化学键连接
 */

import * as THREE from 'three';
import type { Atom, Bond, RenderOptions } from '../../data/types';
import { getBondRadius } from '../../utils/bonds';
import { getElementColor } from '../../data/elements';
import { fractionalToCartesian, type CellParams } from '../../utils/coordinates';

export class BondRenderer {
  private bondGroup: THREE.Group | null = null;
  private cylinderGeometry: THREE.CylinderGeometry;

  constructor() {
    // 创建圆柱几何体作为键的基本形状
    this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1);
    this.cylinderGeometry.rotateX(Math.PI / 2); // 旋转使圆柱沿Z轴
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

    this.bondGroup = new THREE.Group();

    bonds.forEach(bond => {
      const atom1 = atoms[bond.atom1];
      const atom2 = atoms[bond.atom2];
      
      if (!atom1 || !atom2) return;

      // 获取原子位置
      const pos1 = fractionalToCartesian(atom1, cellParams);
      const pos2 = fractionalToCartesian(atom2, cellParams);

      // 创建键的圆柱体
      const bondMesh = this.createBond(
        pos1,
        pos2,
        atom1,
        atom2,
        bond.type || 'single',
        options.bondScale
      );

      this.bondGroup!.add(bondMesh);
    });

    scene.add(this.bondGroup);
  }

  /**
   * 创建单个化学键
   */
  private createBond(
    pos1: THREE.Vector3,
    pos2: THREE.Vector3,
    atom1: Atom,
    atom2: Atom,
    bondType: Bond['type'],
    scale: number
  ): THREE.Object3D {
    // 计算键的方向和长度
    const _direction = new THREE.Vector3().subVectors(pos2, pos1);
    const length = _direction.length();
    const midPoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);

    // 获取键的半径
    const radius = getBondRadius(bondType) * scale;

    // 创建材质 - 使用透明材质
    const atom1Color = getElementColor(atom1.element, atom1.color, true);
    const atom2Color = getElementColor(atom2.element, atom2.color, true);
    
    // 创建双色键（如果两个原子颜色不同）
    if (atom1Color !== atom2Color) {
      return this.createTwoColorBond(
        pos1, pos2, midPoint, _direction, length,
        radius, atom1Color, atom2Color
      );
    }

    // 单色键
    const material = new THREE.MeshPhysicalMaterial({
      color: atom1Color,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.3,
    });

    const cylinder = new THREE.Mesh(this.cylinderGeometry.clone(), material);
    
    // 设置位置和缩放
    cylinder.position.copy(midPoint);
    cylinder.scale.set(radius, radius, length);
    
    // 设置方向
    cylinder.lookAt(pos2);
    
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    return cylinder;
  }

  /**
   * 创建双色化学键（中间分开，各显示原子颜色）
   */
  private createTwoColorBond(
    pos1: THREE.Vector3,
    pos2: THREE.Vector3,
    midPoint: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    radius: number,
    color1: string,
    color2: string
  ): THREE.Group {
    const group = new THREE.Group();
    const halfLength = length / 2;

    // 计算两个中点位置
    const quarter1 = new THREE.Vector3().lerpVectors(pos1, pos2, 0.25);
    const quarter2 = new THREE.Vector3().lerpVectors(pos1, pos2, 0.75);

    // 创建第一半键
    const material1 = new THREE.MeshPhysicalMaterial({
      color: color1,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.3,
    });

    const cylinder1 = new THREE.Mesh(this.cylinderGeometry.clone(), material1);
    cylinder1.position.copy(quarter1);
    cylinder1.scale.set(radius, radius, halfLength);
    cylinder1.lookAt(midPoint);
    cylinder1.castShadow = true;
    cylinder1.receiveShadow = true;
    group.add(cylinder1);

    // 创建第二半键
    const material2 = new THREE.MeshPhysicalMaterial({
      color: color2,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.3,
    });

    const cylinder2 = new THREE.Mesh(this.cylinderGeometry.clone(), material2);
    cylinder2.position.copy(quarter2);
    cylinder2.scale.set(radius, radius, halfLength);
    cylinder2.lookAt(pos2);
    cylinder2.castShadow = true;
    cylinder2.receiveShadow = true;
    group.add(cylinder2);

    return group;
  }

  /**
   * 清理渲染的键
   */
  clear(scene: THREE.Scene): void {
    if (this.bondGroup) {
      scene.remove(this.bondGroup);
      
      // 递归清理所有子对象
      this.bondGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      
      this.bondGroup = null;
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
    this.cylinderGeometry.dispose();
  }
}
