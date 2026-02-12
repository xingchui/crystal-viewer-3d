/**
 * Crystal Viewer 3D - Lattice Renderer
 * 晶胞框架渲染器 - 渲染晶胞边界线框
 */

import * as THREE from 'three';
import type { RenderOptions } from '../../data/types';
import { getTransformationMatrix, type CellParams } from '../../utils/coordinates';

export class LatticeRenderer {
  private latticeGroup: THREE.Group | null = null;

  /**
   * 渲染晶胞框架
   * 
   * @param scene - Three.js场景
   * @param cellParams - 晶胞参数
   * @param options - 渲染选项
   */
  render(
    scene: THREE.Scene,
    cellParams: CellParams,
    options: RenderOptions
  ): void {
    this.clear(scene);
    
    if (!options.showLattice) return;

    this.latticeGroup = new THREE.Group();

    // 创建晶胞边框线
    const boxLines = this.createCellBox(cellParams);
    this.latticeGroup.add(boxLines);

    // 创建坐标轴
    const axes = this.createAxes(cellParams);
    this.latticeGroup.add(axes);

    // 添加晶格常数标注
    const labels = this.createLabels(cellParams);
    if (labels) {
      this.latticeGroup.add(labels);
    }

    scene.add(this.latticeGroup);
  }

  /**
   * 创建晶胞边框
   */
  private createCellBox(cellParams: CellParams): THREE.LineSegments {
    const matrix = getTransformationMatrix(cellParams);
    
    // 定义原胞的8个顶点（分数坐标）
    const corners = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(0, 1, 1),
    ];

    // 转换为笛卡尔坐标
    const cartesianCorners = corners.map(corner => 
      corner.applyMatrix4(matrix)
    );

    // 定义12条边的顶点索引
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],  // 底面
      [4, 5], [5, 6], [6, 7], [7, 4],  // 顶面
      [0, 4], [1, 5], [2, 6], [3, 7],  // 侧边
    ];

    // 创建几何体
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    edges.forEach(([i, j]) => {
      positions.push(
        cartesianCorners[i].x, cartesianCorners[i].y, cartesianCorners[i].z,
        cartesianCorners[j].x, cartesianCorners[j].y, cartesianCorners[j].z
      );
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    // 创建材质
    const material = new THREE.LineDashedMaterial({
      color: 0x888888,
      linewidth: 1,
      scale: 1,
      dashSize: 0.3,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.6,
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.computeLineDistances(); // 计算虚线距离

    return lines;
  }

  /**
   * 创建坐标轴
   */
  private createAxes(cellParams: CellParams): THREE.Group {
    const group = new THREE.Group();
    const origin = new THREE.Vector3(0, 0, 0);
    
    // 使用变换矩阵计算各轴方向
    const matrix = getTransformationMatrix(cellParams);
    const aVec = new THREE.Vector3(1, 0, 0).applyMatrix4(matrix);
    const bVec = new THREE.Vector3(0, 1, 0).applyMatrix4(matrix);
    const cVec = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix);

    // X轴 (a方向) - 红色
    group.add(this.createAxisLine(origin, aVec, 0xff0000, 'a'));
    
    // Y轴 (b方向) - 绿色
    group.add(this.createAxisLine(origin, bVec, 0x00ff00, 'b'));
    
    // Z轴 (c方向) - 蓝色
    group.add(this.createAxisLine(origin, cVec, 0x0088ff, 'c'));

    return group;
  }

  /**
   * 创建单根坐标轴
   */
  private createAxisLine(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    color: number,
    _label: string
  ): THREE.Line {
    // 坐标轴只延伸到晶胞边界，不超出
    const axisEnd = direction.clone();
    const geometry = new THREE.BufferGeometry().setFromPoints([origin, axisEnd]);
    const material = new THREE.LineBasicMaterial({ 
      color: color,
      linewidth: 3,
      transparent: false,
      opacity: 1.0,
    });

    const line = new THREE.Line(geometry, material);
    // 确保坐标轴在最上层渲染
    line.renderOrder = 1000;
    return line;
  }

  /**
   * 创建晶格常数标注
   */
  private createLabels(cellParams: CellParams): THREE.Group | null {
    // 使用简单的几何体表示标签位置
    const group = new THREE.Group();
    
    // 在原点位置添加一个小球表示原点
    const originMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    originMarker.position.set(0, 0, 0);
    group.add(originMarker);

    return group;
  }

  /**
   * 清理渲染的框架
   */
  clear(scene: THREE.Scene): void {
    if (this.latticeGroup) {
      scene.remove(this.latticeGroup);
      
      this.latticeGroup.traverse((child) => {
        if (child instanceof THREE.Line || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        } else if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      
      this.latticeGroup = null;
    }
  }

  /**
   * 更新渲染
   */
  update(
    scene: THREE.Scene,
    cellParams: CellParams,
    options: RenderOptions
  ): void {
    this.render(scene, cellParams, options);
  }

  /**
   * 创建超胞框架
   */
  renderSuperCell(
    scene: THREE.Scene,
    cellParams: CellParams,
    nx: number,
    ny: number,
    nz: number,
    options: RenderOptions
  ): void {
    this.clear(scene);
    
    if (!options.showLattice) return;

    this.latticeGroup = new THREE.Group();

    // 创建多个晶胞的框架
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          const offset = new THREE.Vector3(i, j, k);
          const box = this.createTranslatedCellBox(cellParams, offset);
          this.latticeGroup.add(box);
        }
      }
    }

    scene.add(this.latticeGroup);
  }

  /**
   * 创建平移后的晶胞
   */
  private createTranslatedCellBox(
    _cellParams: CellParams,
    offset: THREE.Vector3
  ): THREE.LineSegments {
    const matrix = getTransformationMatrix(_cellParams);
    
    const corners = [
      new THREE.Vector3(offset.x, offset.y, offset.z),
      new THREE.Vector3(offset.x + 1, offset.y, offset.z),
      new THREE.Vector3(offset.x + 1, offset.y + 1, offset.z),
      new THREE.Vector3(offset.x, offset.y + 1, offset.z),
      new THREE.Vector3(offset.x, offset.y, offset.z + 1),
      new THREE.Vector3(offset.x + 1, offset.y, offset.z + 1),
      new THREE.Vector3(offset.x + 1, offset.y + 1, offset.z + 1),
      new THREE.Vector3(offset.x, offset.y + 1, offset.z + 1),
    ];

    const cartesianCorners = corners.map(corner => 
      corner.applyMatrix4(matrix)
    );

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    edges.forEach(([i, j]) => {
      positions.push(
        cartesianCorners[i].x, cartesianCorners[i].y, cartesianCorners[i].z,
        cartesianCorners[j].x, cartesianCorners[j].y, cartesianCorners[j].z
      );
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.LineDashedMaterial({
      color: 0x666666,
      linewidth: 1,
      scale: 1,
      dashSize: 0.2,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.4,
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.computeLineDistances();

    return lines;
  }
}
