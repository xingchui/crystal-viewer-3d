import * as THREE from 'three';
import { SceneManager } from './renderers/SceneManager';
import { AtomRenderer } from './renderers/AtomRenderer';
import { BondRenderer } from './renderers/BondRenderer';
import { LatticeRenderer } from './renderers/LatticeRenderer';
import { BaseCell } from './cells/BaseCell';
import { CellRegistry } from './cells/CellImplementations';
import type { RenderOptions, ExportSettings, Atom, Bond, CellInfoDTO, AvailableCellDTO, ViewDirection } from '../data/types';
import { RENDER_CONFIG, EXPORT_CONFIG, ERROR_MESSAGES, SLICE_PLANE_CONFIG, PERFORMANCE_CONFIG } from '../data/constants';
import { getTransformationMatrix } from '../utils/coordinates';
import { filterForSlicePlane, type SlicePlane } from '../utils/slice';

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
  private displayAtoms: Atom[] = [];
  private displayBonds: Bond[] = [];
  private hasRendered = false;
  private needsCameraFit = false;
  private renderCompleteCallback: (() => void) | null = null;
  private renderDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private slicePlane: SlicePlane = 'none';
  private slicePlaneMesh: THREE.Mesh | null = null;
  private currentView: ViewDirection = '3d';
  private pendingView: ViewDirection | null = null;

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
    // 切换晶胞后回到立体视图，避免沿用上一个晶胞的投影方向；
    // 但调用方显式指定投影类型时尊重其设置（此时表示沿 [111] 的正交立体视图）
    const hasExplicitProjection = options?.isOrthographic !== undefined;
    this.currentOptions = { ...this.currentOptions, ...options };
    this.currentView = '3d';
    if (!hasExplicitProjection) {
      this.currentOptions.isOrthographic = false;
    }
    this.needsCameraFit = true;
    this.pendingView = '3d';
    this.scheduleRender();
  }

  /** 注册渲染完成回调，供 UI 同步信息面板 */
  setRenderCompleteCallback(callback: (() => void) | null): void {
    this.renderCompleteCallback = callback;
  }

  private scheduleRender(): void {
    this.hasRendered = false;
    if (this.renderDebounceTimer) clearTimeout(this.renderDebounceTimer);
    this.renderDebounceTimer = setTimeout(() => this.executeRender(), PERFORMANCE_CONFIG.renderDebounceMs);
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
    
    // 应用截面过滤；过滤时会同步重映射键索引
    const { atoms: displayAtoms, bonds: displayBonds } = filterForSlicePlane(
      this.currentAtoms,
      this.currentBonds,
      this.slicePlane,
      cell.data.properties?.category
    );


    this.displayAtoms = displayAtoms;
    this.displayBonds = displayBonds;
    this.hasRendered = true;

    if (this.needsCameraFit) {
      if (this.currentOptions.isOrthographic) {
        this.sceneManager.setCameraType(true, this.calculateAtomBounds(displayAtoms));
      }
      this.needsCameraFit = false;
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

    // 几何更新后重新套用投影方向，保证超胞/截面变化后仍然居中
    if (this.pendingView) {
      const view = this.pendingView;
      this.pendingView = null;
      this.applyViewDirection(view, displayAtoms);
    }

    this.renderCompleteCallback?.();
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
    this.needsCameraFit = true;
    // 超胞改变后重新取景，投影模式下继续保持当前方向
    this.pendingView = this.currentView;
    this.scheduleRender();
  }

  setCameraType(isOrthographic: boolean): void {
    this.currentOptions.isOrthographic = isOrthographic;

    if (isOrthographic) {
      // 等下一次渲染拿到实际显示的原子后，再按包围球设置正交视锥体
      this.needsCameraFit = true;
    } else {
      this.needsCameraFit = false;
      this.sceneManager.setCameraType(false);
    }

    // 切换投影类型后保留当前视角方向
    this.pendingView = this.currentView;
    this.scheduleRender();
  }

  /**
   * 设置观察方向（投影模式）。
   * 投影方向会自动切换到正交投影，立体视图则恢复透视投影。
   */
  setViewDirection(view: ViewDirection): void {
    if (view !== '3d' && !this.currentCell) return;

    this.currentView = view;
    const isProjection = view !== '3d';
    this.currentOptions.isOrthographic = isProjection;

    if (!this.currentCell) return;

    if (isProjection) {
      const atoms = this.hasRendered ? this.displayAtoms : this.currentCell.getAtoms();
      this.sceneManager.setCameraType(true, this.calculateAtomBounds(atoms));
    } else {
      this.sceneManager.setCameraType(false);
    }

    this.needsCameraFit = isProjection;
    this.pendingView = view;
    this.scheduleRender();
  }

  /**
   * 根据视角方向把相机放到结构外侧。
   * 投影方向使用晶格向量计算，正交晶胞与六方晶胞都能得到正确的晶面方向。
   */
  private applyViewDirection(view: ViewDirection, atoms: Atom[]): void {
    if (!this.currentCell || atoms.length === 0) return;

    const bounds = this.calculateAtomBounds(atoms);
    if (!bounds) return;

    const center = new THREE.Vector3(
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minY + bounds.maxY) / 2,
      (bounds.minZ + bounds.maxZ) / 2
    );
    const radius = Math.sqrt(
      Math.pow((bounds.maxX - bounds.minX) / 2, 2) +
      Math.pow((bounds.maxY - bounds.minY) / 2, 2) +
      Math.pow((bounds.maxZ - bounds.minZ) / 2, 2)
    );

    const matrix = getTransformationMatrix(this.currentCell.getCellParams());
    const aVec = new THREE.Vector3().setFromMatrixColumn(matrix, 0);
    const bVec = new THREE.Vector3().setFromMatrixColumn(matrix, 1);
    const cVec = new THREE.Vector3().setFromMatrixColumn(matrix, 2);

    // 确保相机类型与当前选项一致（切换晶胞/超胞后可能出现不同步）
    const wantOrthographic = this.currentOptions.isOrthographic;
    const isOrthographic = this.sceneManager.camera instanceof THREE.OrthographicCamera;
    if (wantOrthographic !== isOrthographic) {
      this.sceneManager.setCameraType(wantOrthographic, bounds);
    }

    let direction: THREE.Vector3;
    let up: THREE.Vector3;

    switch (view) {
      case 'yz':
        // 沿 a 轴观察，显示由 b、c 轴张成的 YZ 平面
        direction = aVec;
        up = cVec;
        break;
      case 'xz':
        // 从 -b 侧观察，使 X 轴在屏幕上朝右、Z 轴朝上
        direction = bVec.clone().negate();
        up = cVec;
        break;
      case 'xy':
        // 沿 c 轴观察
        direction = cVec;
        up = bVec;
        break;
      case 'body':
        // 沿体对角线 [111] 观察
        direction = aVec.clone().add(bVec).add(cVec);
        up = cVec;
        break;
      case 'face':
        // 沿面对角线 [110] 观察
        direction = aVec.clone().add(bVec);
        up = cVec;
        break;
      default:
        // 默认立体视图
        direction = new THREE.Vector3(1, 1, 1);
        up = new THREE.Vector3(0, 1, 0);
        break;
    }

    this.sceneManager.setView(direction, up, center, radius);
  }

  /**
   * 计算当前原子的边界框
   */
  private calculateAtomBounds(
    atoms: Atom[] = this.currentAtoms
  ): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } | undefined {
    if (!this.currentCell || atoms.length === 0) return undefined;
    
    const matrix = getTransformationMatrix(this.currentCell.getCellParams());

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    atoms.forEach(atom => {
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
  setSlicePlane(plane: SlicePlane): void {
    this.slicePlane = plane;
    this.scheduleRender();
  }

  /**
   * 获取当前截面模式
   */
  getSlicePlane(): SlicePlane {
    return this.slicePlane;
  }

  resetView(): void {
    this.currentView = '3d';
    this.pendingView = '3d';
    this.currentOptions.isOrthographic = false;
    this.needsCameraFit = false;

    if (!this.currentCell) {
      this.sceneManager.setCameraType(false);
      this.sceneManager.resetCamera();
      return;
    }

    // 重置为可自由旋转的透视立体视图
    this.sceneManager.setCameraType(false);
    this.scheduleRender();
  }

  getCurrentCellInfo(): CellInfoDTO | null {
    if (!this.currentCell) return null;
    // 优先显示实际渲染的原子/键；首次渲染尚未完成时回退到晶胞基础数据
    const atoms = this.hasRendered ? this.displayAtoms : this.currentCell.getAtoms();
    const bonds = this.hasRendered ? this.displayBonds : this.currentCell.getBonds();
    return {
      id: this.currentCell.id,
      name: this.currentCell.name,
      nameZh: this.currentCell.nameZh,
      description: this.currentCell.getDescription(),
      category: this.currentCell.getCategory(),
      coordination: this.currentCell.getCoordination(),
      latticeConstants: this.currentCell.getLatticeConstants(),
      atomCount: atoms.length,
      bondCount: bonds.length,
    };
  }

  getAvailableCells(): AvailableCellDTO[] {
    return CellRegistry.getAll().map(cell => ({
      id: cell.id, name: cell.name, nameZh: cell.nameZh, category: cell.getCategory(),
    }));
  }

  takeScreenshot(): string { return this.sceneManager.takeScreenshot(); }

  async exportRotationVideo(settings?: Partial<ExportSettings>, onProgress?: ExportProgressCallback): Promise<Blob> {
    const config = { ...EXPORT_CONFIG.defaultSettings, ...settings };
    const canvas = this.sceneManager.getCanvas();
    const stream = canvas.captureStream(config.fps);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: EXPORT_CONFIG.mimeType });
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    const totalFrames = config.fps * config.duration;
    const angleStep = (Math.PI * 2 * config.rotationSpeed) / totalFrames;
    const stopStream = () => stream.getTracks().forEach(track => track.stop());
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        stopStream();
        this.sceneManager.scene.rotation.y = 0;
        this.sceneManager.render();
        resolve(new Blob(chunks, { type: EXPORT_CONFIG.mimeType.split(';')[0] }));
      };
      mediaRecorder.onerror = (e) => {
        stopStream();
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
    this.atomRenderer.clear(this.sceneManager.scene);
    this.atomRenderer.dispose();
    this.bondRenderer.clear(this.sceneManager.scene);
    this.bondRenderer.dispose();
    this.latticeRenderer.clear(this.sceneManager.scene);
    this.sceneManager.dispose();
  }
}