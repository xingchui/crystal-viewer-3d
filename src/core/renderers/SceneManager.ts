/**
 * Crystal Viewer 3D - Scene Manager
 * 场景管理器 - 管理Three.js场景、相机、渲染器、控制器
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  container: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  lights: THREE.Light[] = [];
  
  private currentBackgroundColor: string = '#1a1a2e';

  constructor(container: HTMLElement) {
    this.container = container;
    
    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.currentBackgroundColor);
    
    // 初始化相机
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(10, 10, 10);
    
    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true, // 用于截图/GIF导出
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
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.onResize.bind(this));
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

    if (isOrthographic) {
      // 切换到正交投影
      if (bounds) {
        // 使用原子边界精确设置视锥体
        // 计算中心点和范围
        const centerX = (bounds.maxX + bounds.minX) / 2;
        const centerY = (bounds.maxY + bounds.minY) / 2;
        const xRange = (bounds.maxX - bounds.minX) / 2;
        const yRange = (bounds.maxY - bounds.minY) / 2;
        
        // 使用较大的范围作为基准，确保x和y方向的单位长度相同（防止球体变椭圆）
        const maxRange = Math.max(xRange, yRange);
        
        // 根据屏幕宽高比调整，保持1:1的宽高比
        let left, right, top, bottom;
        if (aspect > 1) {
          // 宽屏：x方向范围更大
          left = centerX - maxRange * aspect;
          right = centerX + maxRange * aspect;
          top = centerY + maxRange;
          bottom = centerY - maxRange;
        } else {
          // 窄屏：y方向范围更大
          left = centerX - maxRange;
          right = centerX + maxRange;
          top = centerY + maxRange / aspect;
          bottom = centerY - maxRange / aspect;
        }
        
        this.camera = new THREE.OrthographicCamera(
          left, right,
          top, bottom,
          -1000, 1000
        );
      } else {
        // 默认视锥体 - 保持1:1的宽高比
        const frustumSize = 10;
        this.camera = new THREE.OrthographicCamera(
          frustumSize * aspect / -2,
          frustumSize * aspect / 2,
          frustumSize / 2,
          frustumSize / -2,
          0.1,
          1000
        );
      }
    } else {
      // 切换到透视投影
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    }

    this.camera.position.copy(currentPosition);
    this.camera.lookAt(currentTarget);

    // 更新控制器
    this.controls.object = this.camera;
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
    const animate = () => {
      requestAnimationFrame(animate);
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
      const frustumSize = 10;
      this.camera.left = frustumSize * aspect / -2;
      this.camera.right = frustumSize * aspect / 2;
      this.camera.top = frustumSize / 2;
      this.camera.bottom = frustumSize / -2;
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
    window.removeEventListener('resize', this.onResize.bind(this));
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
