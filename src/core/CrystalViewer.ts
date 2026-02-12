import * as THREE from 'three';
import { SceneManager } from './renderers/SceneManager';
import { AtomRenderer } from './renderers/AtomRenderer';
import { BondRenderer } from './renderers/BondRenderer';
import { LatticeRenderer } from './renderers/LatticeRenderer';
import { BaseCell } from './cells/BaseCell';
import { CellRegistry } from './cells/CellImplementations';
import type { RenderOptions, ExportSettings, Atom, Bond, CellInfoDTO, AvailableCellDTO } from '../data/types';
import { RENDER_CONFIG, EXPORT_CONFIG, ERROR_MESSAGES, SLICE_PLANE_CONFIG } from '../data/constants';
import type { CellParams } from '../utils/coordinates';

export type ExportProgressCallback = (progress: number) => void;

export class CrystalViewer {
  private readonly sceneManager: SceneManager;
  private readonly atomRenderer: AtomRenderer;
  private readonly bondRenderer: BondRenderer;
  private readonly latticeRenderer: LatticeRenderer;
  private currentCell: BaseCell | null = null;
  private currentOptions: RenderOptions = { ...RENDER_CONFIG.defaultOptions };
  private currentAtoms: Atom[] = [];
  private currentBonds: Bond[] = [];
  private renderDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private slicePlane: 'none' | 'yz' | 'xz' | 'xy' = 'none';
  private slicePlaneMesh: THREE.Mesh | null = null;

  constructor(container: HTMLElement) {
    if (!container) throw new Error('Container required');
    this.sceneManager = new SceneManager(container);
    this.atomRenderer = new AtomRenderer();
    this.bondRenderer = new BondRenderer();
    this.latticeRenderer = new LatticeRenderer();
    this.sceneManager.startAnimationLoop();
  }

  loadCell(cellId: string, options?: Partial<RenderOptions>): void {
    const cell = CellRegistry.get(cellId);
    if (!cell) throw new Error(ERROR_MESSAGES.cellNotFound(cellId));
    this.currentCell = cell;
    this.currentOptions = { ...this.currentOptions, ...options };
    this.scheduleRender();
    this.resetView();
  }

  private scheduleRender(): void {
    if (this.renderDebounceTimer) clearTimeout(this.renderDebounceTimer);
    this.renderDebounceTimer = setTimeout(() => this.executeRender(), 50);
  }

  private executeRender(): void {
    if (!this.currentCell) return;
    const cell = this.currentCell;
    const cellParams = cell.getCellParams();
    const [nx, ny, nz] = this.currentOptions.superCell;
    if (nx === 1 && ny === 1 && nz === 1) {
      this.currentAtoms = cell.getAtoms();
      this.currentBonds = cell.getBonds();
    } else {
      this.currentAtoms = cell.generateSuperCell(nx, ny, nz);
      this.currentBonds = cell.generateSuperCellBonds(nx, ny, nz);
    }
    
    // 应用截面过滤
    let displayAtoms = this.currentAtoms;
    let displayBonds = this.currentBonds;
    if (this.slicePlane !== 'none') {
      const tolerance = SLICE_PLANE_CONFIG.tolerance; // 使用配置的截面容差
      
      // 第一步：找出在截面上的原子
      const atomsOnPlane = new Set<number>();
      this.currentAtoms.forEach((atom, index) => {
        let isOnPlane = false;
        if (this.slicePlane === 'yz') isOnPlane = Math.abs(atom.x) <= tolerance || Math.abs(atom.x - 1) <= tolerance;
        if (this.slicePlane === 'xz') isOnPlane = Math.abs(atom.y) <= tolerance || Math.abs(atom.y - 1) <= tolerance;
        if (this.slicePlane === 'xy') isOnPlane = Math.abs(atom.z) <= tolerance || Math.abs(atom.z - 1) <= tolerance;
        if (isOnPlane) atomsOnPlane.add(index);
      });
      
      // 第二步：对于分子晶体，还要包含与平面上原子成键的所有原子（完整分子）
      const displayAtomIndices = new Set(atomsOnPlane);
      if (cell.data.properties?.category === 'molecular') {
        // 找出所有与平面上原子成键的原子
        this.currentBonds.forEach(bond => {
          if (atomsOnPlane.has(bond.atom1)) displayAtomIndices.add(bond.atom2);
          if (atomsOnPlane.has(bond.atom2)) displayAtomIndices.add(bond.atom1);
        });
      }
      
      // 第三步：获取要显示的原子
      displayAtoms = this.currentAtoms.filter((_, i) => displayAtomIndices.has(i));
      
      // 第四步：只保留与显示原子相关的键
      displayBonds = this.currentBonds.filter(bond => 
        displayAtomIndices.has(bond.atom1) && displayAtomIndices.has(bond.atom2)
      );
    }
    
    const { scene } = this.sceneManager;
    this.atomRenderer.render(scene, displayAtoms, cellParams, this.currentOptions);
    this.bondRenderer.render(scene, displayAtoms, displayBonds, cellParams, this.currentOptions);
    if (nx === 1 && ny === 1 && nz === 1) {
      this.latticeRenderer.render(scene, cellParams, this.currentOptions);
    } else {
      this.latticeRenderer.renderSuperCell(scene, cellParams, nx, ny, nz, this.currentOptions);
    }
    
    // 更新截面平面显示
    this.updateSlicePlaneDisplay();
  }

  /**
   * 更新截面平面显示
   */
  private updateSlicePlaneDisplay(): void {
    const { scene } = this.sceneManager;
    
    // 移除旧的截面平面
    if (this.slicePlaneMesh) {
      scene.remove(this.slicePlaneMesh);
      this.slicePlaneMesh.geometry.dispose();
      (this.slicePlaneMesh.material as THREE.Material).dispose();
      this.slicePlaneMesh = null;
    }
    
    if (this.slicePlane === 'none' || !this.currentCell) return;
    
    const { a, b, c } = this.currentCell.getCellParams();
    let geometry: THREE.PlaneGeometry;
    let position: THREE.Vector3;
    let rotation: THREE.Euler;
    
    if (this.slicePlane === 'yz') {
      // yz平面（x=0）
      geometry = new THREE.PlaneGeometry(b, c);
      position = new THREE.Vector3(0, b / 2, c / 2);
      rotation = new THREE.Euler(0, Math.PI / 2, 0);
    } else if (this.slicePlane === 'xz') {
      // xz平面（y=0）
      geometry = new THREE.PlaneGeometry(a, c);
      position = new THREE.Vector3(a / 2, 0, c / 2);
      rotation = new THREE.Euler(Math.PI / 2, 0, 0);
    } else {
      // xy平面（z=0）
      geometry = new THREE.PlaneGeometry(a, b);
      position = new THREE.Vector3(a / 2, b / 2, 0);
      rotation = new THREE.Euler(0, 0, 0);
    }
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    
    this.slicePlaneMesh = new THREE.Mesh(geometry, material);
    this.slicePlaneMesh.position.copy(position);
    this.slicePlaneMesh.rotation.copy(rotation);
    scene.add(this.slicePlaneMesh);
  }

  setSuperCell(nx: number, ny: number, nz: number): void {
    const { min, max } = RENDER_CONFIG.superCellLimits;
    if (nx < min || nx > max || ny < min || ny > max || nz < min || nz > max) {
      throw new Error(ERROR_MESSAGES.invalidSuperCell(max));
    }
    this.currentOptions.superCell = [nx, ny, nz];
    this.scheduleRender();
  }

  setCameraType(isOrthographic: boolean): void {
    this.currentOptions.isOrthographic = isOrthographic;
    // 计算原子边界并设置相机
    if (this.currentCell && isOrthographic) {
      const bounds = this.calculateAtomBounds();
      this.sceneManager.setCameraType(isOrthographic, bounds);
    } else {
      this.sceneManager.setCameraType(isOrthographic);
    }
  }

  /**
   * 计算当前原子的边界框
   */
  private calculateAtomBounds(): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } | undefined {
    if (!this.currentCell || this.currentAtoms.length === 0) return undefined;
    
    const cellParams = this.currentCell.getCellParams();
    const matrix = new THREE.Matrix4();
    const { a, b, c, alpha, beta, gamma } = cellParams;
    const alphaRad = (alpha * Math.PI) / 180;
    const betaRad = (beta * Math.PI) / 180;
    const gammaRad = (gamma * Math.PI) / 180;
    
    const ax = a;
    const bx = b * Math.cos(gammaRad);
    const by = b * Math.sin(gammaRad);
    const cx = c * Math.cos(betaRad);
    const cy = c * (Math.cos(alphaRad) - Math.cos(betaRad) * Math.cos(gammaRad)) / Math.sin(gammaRad);
    const cz = Math.sqrt(c * c - cx * cx - cy * cy);
    
    matrix.set(
      ax, bx, cx, 0,
      0, by, cy, 0,
      0, 0, cz, 0,
      0, 0, 0, 1
    );

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    this.currentAtoms.forEach(atom => {
      const frac = new THREE.Vector3(atom.x, atom.y, atom.z);
      const cart = frac.clone().applyMatrix4(matrix);
      minX = Math.min(minX, cart.x);
      maxX = Math.max(maxX, cart.x);
      minY = Math.min(minY, cart.y);
      maxY = Math.max(maxY, cart.y);
      minZ = Math.min(minZ, cart.z);
      maxZ = Math.max(maxZ, cart.z);
    });

    // 添加小边距确保原子完整显示
    const padding = SLICE_PLANE_CONFIG.padding;
    return {
      minX: minX - padding, maxX: maxX + padding,
      minY: minY - padding, maxY: maxY + padding,
      minZ: minZ - padding, maxZ: maxZ + padding
    };
  }

  setAtomScale(scale: number): void {
    const { min, max } = RENDER_CONFIG.scaleLimits.atom;
    this.currentOptions.atomScale = Math.max(min, Math.min(max, scale));
    this.scheduleRender();
  }

  setBondScale(scale: number): void {
    const { min, max } = RENDER_CONFIG.scaleLimits.bond;
    this.currentOptions.bondScale = Math.max(min, Math.min(max, scale));
    this.scheduleRender();
  }

  toggleShowAtoms(show: boolean): void { this.currentOptions.showAtoms = show; this.scheduleRender(); }
  toggleShowBonds(show: boolean): void { this.currentOptions.showBonds = show; this.scheduleRender(); }
  toggleShowLattice(show: boolean): void { this.currentOptions.showLattice = show; this.scheduleRender(); }

  /**
   * 设置截面显示模式
   * @param plane - 'none' | 'yz' (x=0) | 'xz' (y=0) | 'xy' (z=0)
   */
  setSlicePlane(plane: 'none' | 'yz' | 'xz' | 'xy'): void {
    this.slicePlane = plane;
    this.scheduleRender();
  }

  /**
   * 获取当前截面模式
   */
  getSlicePlane(): 'none' | 'yz' | 'xz' | 'xy' {
    return this.slicePlane;
  }

  resetView(): void {
    if (!this.currentCell) { this.sceneManager.resetCamera(); return; }
    const { a, b, c } = this.currentCell.getCellParams();
    const maxDim = Math.max(a, b, c);
    const distance = maxDim * RENDER_CONFIG.camera.defaultDistanceMultiplier;
    this.sceneManager.camera.position.set(distance, distance, distance);
    this.sceneManager.camera.lookAt(0, 0, 0);
    this.sceneManager.controls.target.set(0, 0, 0);
    this.sceneManager.controls.update();
  }

  getCurrentCellInfo(): CellInfoDTO | null {
    if (!this.currentCell) return null;
    return {
      id: this.currentCell.id,
      name: this.currentCell.name,
      nameZh: this.currentCell.nameZh,
      description: this.currentCell.getDescription(),
      category: this.currentCell.getCategory(),
      coordination: this.currentCell.getCoordination(),
      latticeConstants: this.currentCell.getLatticeConstants(),
      atomCount: this.currentAtoms.length,
      bondCount: this.currentBonds.length,
    };
  }

  getAvailableCells(): AvailableCellDTO[] {
    return CellRegistry.getAll().map(cell => ({
      id: cell.id, name: cell.name, nameZh: cell.nameZh, category: cell.getCategory(),
    }));
  }

  takeScreenshot(): string { return this.sceneManager.takeScreenshot(); }

  async exportRotationGIF(settings?: Partial<ExportSettings>, onProgress?: ExportProgressCallback): Promise<Blob> {
    const config = { ...EXPORT_CONFIG.defaultSettings, ...settings };
    const canvas = this.sceneManager.getCanvas();
    const stream = canvas.captureStream(config.fps);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: EXPORT_CONFIG.mimeType });
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    const totalFrames = config.fps * config.duration;
    const angleStep = (Math.PI * 2 * config.rotationSpeed) / totalFrames;
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        this.sceneManager.scene.rotation.y = 0;
        this.sceneManager.render();
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };
      mediaRecorder.onerror = (e) => {
        this.sceneManager.scene.rotation.y = 0;
        this.sceneManager.render();
        reject(e);
      };
      mediaRecorder.start();
      let frameCount = 0;
      const animate = () => {
        if (frameCount >= totalFrames) { mediaRecorder.stop(); return; }
        this.sceneManager.scene.rotation.y += angleStep;
        this.sceneManager.render();
        frameCount++;
        if (onProgress) onProgress(frameCount / totalFrames);
        requestAnimationFrame(animate);
      };
      animate();
    });
  }

  dispose(): void {
    if (this.renderDebounceTimer) clearTimeout(this.renderDebounceTimer);
    if (this.slicePlaneMesh) {
      this.sceneManager.scene.remove(this.slicePlaneMesh);
      this.slicePlaneMesh.geometry.dispose();
      (this.slicePlaneMesh.material as THREE.Material).dispose();
    }
    this.atomRenderer.dispose();
    this.bondRenderer.dispose();
    this.latticeRenderer.clear(this.sceneManager.scene);
    this.sceneManager.dispose();
  }
}