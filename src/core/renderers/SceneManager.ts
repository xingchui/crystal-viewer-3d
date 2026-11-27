/**
 * Crystal Viewer 3D - Scene Manager
 * 场景管理器 - 管理Three.js场景、相机、渲染器、控制器
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RENDER_CONFIG } from '../../data/constants';

export class SceneManager {
  container: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  lights: THREE.Light[] = [];
  
  private currentBackgroundColor: string = '#1a1a2e';
  private animationFrameId: number | null = null;
  private readonly resizeHandler = () => this.onResize();
  private orthoHalfHeight = 5;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.currentBackgroundColor);
    
    // 初始化相机
    const aspect = container.clientWidth / container.clientHeight;
    const { fov, near, far } = RENDER_CONFIG.camera;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(10, 10, 10);
    
    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true, // 用于截图/视频导出
      alpha: true
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(this.renderer.domElement);
    
    // 初始化控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;
    
    // 设置灯光
    this.setupLights();
    
    // 监听窗口大小变化（保存同一个函数引用，dispose 时才能正确移除）
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * 设置场景灯光
   */
  private setupLights(): void {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
    
    // 主光源 (平行光)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);
    this.lights.push(mainLight);
    
    // 补光1
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight1.position.set(-10, 0, 10);
    this.scene.add(fillLight1);
    this.lights.push(fillLight1);
    
    // 补光2
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight2.position.set(0, -10, -10);
    this.scene.add(fillLight2);
    this.lights.push(fillLight2);
    
    // 点光源 (增强金属质感)
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);
    this.lights.push(pointLight);
  }

  /**
   * 切换相机类型
   * @param isOrthographic - 是否使用正交投影
   * @param bounds - 原子边界框（可选），用于精确设置正交投影视锥体
   */
  setCameraType(
    isOrthographic: boolean,
    bounds?: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }
  ): void {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const currentPosition = this.camera.position.clone();
    const currentTarget = this.controls.target.clone();
    const currentUp = this.camera.up.clone();
    const viewDirection = currentPosition.clone().sub(currentTarget);
    if (viewDirection.lengthSq() === 0) viewDirection.set(1, 1, 1);
    viewDirection.normalize();

    if (isOrthographic) {
      // 切换到正交投影
      let center = currentTarget.clone();
      let halfHeight = 5;
      let distance = 30;

      if (bounds) {
        // 用包围球半径计算视锥体，保证旋转到任意视角都不会裁掉原子
        center = new THREE.Vector3(
          (bounds.minX + bounds.maxX) / 2,
          (bounds.minY + bounds.maxY) / 2,
          (bounds.minZ + bounds.maxZ) / 2
        );
        const radius = Math.sqrt(
          Math.pow((bounds.maxX - bounds.minX) / 2, 2) +
          Math.pow((bounds.maxY - bounds.minY) / 2, 2) +
          Math.pow((bounds.maxZ - bounds.minZ) / 2, 2)
        );
        halfHeight = Math.max(radius * 1.1, 1);
        distance = Math.max(radius * 3, 10);
      }

      this.orthoHalfHeight = halfHeight;
      const halfWidth = halfHeight * aspect;
      this.camera = new THREE.OrthographicCamera(
        -halfWidth, halfWidth,
        halfHeight, -halfHeight,
        0.1,
        distance * 4 + 100
      );

      this.camera.position.copy(center).addScaledVector(viewDirection, distance);
      this.camera.up.copy(currentUp);
      this.camera.lookAt(center);
      this.controls.target.copy(center);
    } else {
      // 切换到透视投影
      const { fov, near, far } = RENDER_CONFIG.camera;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.copy(currentPosition);
      this.camera.up.copy(currentUp);
      this.camera.lookAt(currentTarget);
      this.controls.target.copy(currentTarget);
    }

    // 更新控制器
    this.controls.object = this.camera;
    this.controls.update();
  }

  /**
   * 将相机放到指定方向上，并让目标包围球完整落入视野。
   *
   * @param direction - 从目标指向相机的方向（会自动归一化）
   * @param up - 屏幕向上对应的参考向量
   * @param center - 观察目标（通常为结构包围盒中心）
   * @param radius - 结构包围球半径
   */
  setView(
    direction: THREE.Vector3,
    up: THREE.Vector3,
    center: THREE.Vector3,
    radius: number
  ): void {
    const viewDirection = direction.clone();
    if (viewDirection.lengthSq() === 0) viewDirection.set(1, 1, 1);
    viewDirection.normalize();

    // 去掉与视线平行的分量；若仍退化，则换一个参考轴
    const upVector = up.clone();
    upVector.addScaledVector(viewDirection, -upVector.dot(viewDirection));
    if (upVector.lengthSq() < 1e-8) {
      upVector.set(0, 1, 0).addScaledVector(viewDirection, -viewDirection.y);
      if (upVector.lengthSq() < 1e-8) upVector.set(1, 0, 0);
    }
    upVector.normalize();

    const safeRadius = Math.max(radius, 1);
    const aspect = Math.max(this.container.clientWidth / Math.max(this.container.clientHeight, 1), 0.1);
    let distance: number;

    if (this.camera instanceof THREE.OrthographicCamera) {
      // 正交投影：用包围球半径设置视锥体，屏幕较窄时也要保证横向能放下
      const halfHeight = (safeRadius * 1.12) / Math.min(1, aspect);
      this.orthoHalfHeight = halfHeight;
      const halfWidth = halfHeight * aspect;

      this.camera.left = -halfWidth;
      this.camera.right = halfWidth;
      this.camera.top = halfHeight;
      this.camera.bottom = -halfHeight;
      distance = Math.max(safeRadius * 3, 5);
      this.camera.near = 0.1;
      this.camera.far = distance + safeRadius * 4 + 100;
      this.camera.updateProjectionMatrix();
    } else {
      // 透视投影：按垂直视野角让包围球刚好落入视野
      const fovRad = (this.camera.fov * Math.PI) / 180;
      distance = Math.max((safeRadius / Math.sin(fovRad / 2)) * 1.08, 4);
      this.camera.near = 0.1;
      this.camera.far = distance + safeRadius * 4 + 100;
      this.camera.updateProjectionMatrix();
    }

    this.camera.up.copy(upVector);
    this.camera.position.copy(center).addScaledVector(viewDirection, distance);
    this.camera.lookAt(center);
    this.controls.target.copy(center);
    this.controls.maxDistance = Math.max(50, distance * 3);
    this.controls.update();
  }

  /**
   * 设置背景颜色
   */
  setBackgroundColor(color: string): void {
    this.currentBackgroundColor = color;
    this.scene.background = new THREE.Color(color);
  }

  /**
   * 获取当前背景颜色
   */
  getBackgroundColor(): string {
    return this.currentBackgroundColor;
  }

  /**
   * 渲染场景
   */
  render(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 开始动画循环
   */
  startAnimationLoop(callback?: () => void): void {
    if (this.animationFrameId !== null) return; // 避免重复启动循环

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.render();
      if (callback) callback();
    };
    animate();
  }

  /**
   * 截图功能
   */
  takeScreenshot(): string {
    this.render();
    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * 处理窗口大小变化
   */
  private onResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
    } else {
      const halfWidth = this.orthoHalfHeight * aspect;
      this.camera.left = -halfWidth;
      this.camera.right = halfWidth;
      this.camera.top = this.orthoHalfHeight;
      this.camera.bottom = -this.orthoHalfHeight;
      this.camera.updateProjectionMatrix();
    }
    
    this.renderer.setSize(width, height);
  }

  /**
   * 重置相机位置
   */
  resetCamera(): void {
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.resizeHandler);
    this.controls.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }

  /**
   * 获取渲染器dom元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
