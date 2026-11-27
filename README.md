# 🔬 Crystal Viewer 3D - 晶体结构可视化

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r182-black.svg)](https://threejs.org/)
[![Electron](https://img.shields.io/badge/Electron-40.x-9fe2bf.svg)](https://www.electronjs.org/)

> 🎯 一个基于 **Three.js + TypeScript + Electron** 的高性能3D晶体结构可视化应用，支持16种常见晶体结构的交互式展示与分析。

![Crystal Viewer Screenshot](https://via.placeholder.com/800x450/1a1a2e/4a90e2?text=Crystal+Viewer+3D+Screenshot)

## ✨ 主要特性

### 🎨 支持的晶体结构（16种）

| 晶体 | 化学式 | 结构类型 | 配位数 | 类别 |
|------|--------|----------|--------|------|
| 💎 **金刚石** | C | 金刚石结构 | 4 | 共价晶体 |
| 🔶 **晶体硅** | Si | 金刚石型 | 4 | 共价晶体 |
| 🔷 **碳化硅** | SiC | 闪锌矿 | 4 | 共价晶体 |
| 🔮 **二氧化硅** | SiO₂ | 理想 β-方石英 | 4/2 | 共价晶体 |
| ❄️ **干冰** | CO₂ | 面心立方 (Pa-3) | - | 分子晶体 |
| 🟣 **碘** | I₂ | 正交 (教材示意) | 12 | 分子晶体 |
| 🧊 **冰** | H₂O | 六方 Ih | 4 (氢键) | 分子晶体 |
| 🟠 **铜** | Cu | 面心立方 | 12 | 金属晶体 |
| ⚪ **镁** | Mg | 六方最密堆积 | 12 | 金属晶体 |
| ⚙️ **铁** | Fe | 体心立方 (α-Fe) | 8 | 金属晶体 |
| 🧂 **氯化钠** | NaCl | 岩盐结构 | 6 | 离子晶体 |
| ⬜ **氯化铯** | CsCl | 铯氯结构 | 8 | 离子晶体 |
| 🟡 **硫化锌** | ZnS | 闪锌矿 | 4 | 离子晶体 |
| 💠 **氟化钙** | CaF₂ | 萤石结构 | 8/4 | 离子晶体 |
| 🔲 **钙钛矿** | CaTiO₃ | 立方钙钛矿 | 6/12 | 离子晶体 |
| ✏️ **石墨** | C | 六方层状 | 3 | 混合晶体 |

晶胞通过下拉菜单直接选择，选项按“共价 → 分子 → 金属 → 离子 → 混合”分组排列。碘为教材示意模型，冰与二氧化硅采用便于观察的近似结构，描述面板中均有说明。

### 🎯 核心功能

- ✅ **超胞扩展**：支持 1×1×1 到 5×5×5 的超胞展示
- ✅ **投影模式**：透视 / 正交投影一键切换
- ✅ **晶面投影**：一键切换 YZ、XZ、XY 平面、体对角线和面对角线视角
- ✅ **截面显示**：YZ/XZ/XY平面截面分析
- ✅ **金属质感渲染**：基于 MeshPhysicalMaterial 的高真实感渲染
- ✅ **自动键计算**：基于最近邻算法的智能化学键识别

### 🎮 交互控制

- 🖱️ **旋转/缩放/平移**：鼠标拖拽、滚轮缩放、右键平移
- 📐 **显示选项**：原子、化学键、晶胞框架独立控制
- 📏 **尺寸调节**：原子大小 (0.5x - 2x)、键粗细 (0.5x - 2x)

### 📤 导出功能

- 📷 **截图**：一键保存当前视图为 PNG
- 🎬 **旋转动画**：导出 5 秒旋转视频 (WebM 格式)

## 🚀 快速开始

### 方式1：下载桌面应用（推荐） ⭐

前往 [Releases 页面](https://github.com/xingchui/crystal-viewer-3d/releases) 下载最新版本：

- **Windows**: `Crystal-Viewer-Portable-x.x.x.exe` (免安装)
- **离线网页**: `Crystal-Viewer-Offline-x.x.x.html` (单个 HTML，双击用浏览器打开，无需安装任何依赖)

### 方式2：本地开发

```bash
# 克隆仓库
git clone https://github.com/xingchui/crystal-viewer-3d.git
cd crystal-viewer-3d

# 安装依赖
yarn install

# 开发模式
yarn dev

# 生产构建
yarn build

# 构建桌面应用（release/ 下的 portable exe 与 zip）
yarn electron-build-win

# 构建离线单文件网页（release/Crystal-Viewer-Offline-x.x.x.html）
yarn build:offline

# 同时产出离线网页与桌面应用
yarn dist:all
```

## 📦 项目结构

```
crystal-viewer-3d/
├── 📁 src/
│   ├── 📁 core/              # 核心层
│   │   ├── CrystalViewer.ts  # 主控制器
│   │   ├── 📁 renderers/     # 3D渲染器
│   │   └── 📁 cells/         # 晶胞逻辑
│   ├── 📁 data/              # 数据层
│   ├── 📁 utils/             # 工具函数
│   └── 📁 ui/                # UI层
├── 📁 electron/              # Electron主进程
├── 📁 .github/               # GitHub配置
├── 📄 package.json
└── 📄 README.md
```

## 🛠️ 技术栈

- **语言**: TypeScript 5.0 (Strict Mode)
- **3D引擎**: Three.js r182
- **构建工具**: Vite 7.x
- **测试框架**: Vitest
- **桌面打包**: Electron 40.x

## 🧪 核心算法

### 策略模式 - 化学键计算

```typescript
interface BondCalculationStrategy {
  calculate(atoms: Atom[], params: CellParams): Bond[];
}

// 具体策略实现
class DiamondBondStrategy implements BondCalculationStrategy { ... }
class ZincBlendeBondStrategy implements BondCalculationStrategy { ... }
```

## 📝 性能指标

- ⚡ **渲染性能**: 1000+ 原子 @ 60FPS
- 📦 **包体积**: ~62KB (gzipped, 前端代码)
- 🖥️ **桌面应用**: ~89MB (Electron打包)

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证

Copyright (c) 2026 xingchui

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/xingchui">xingchui</a>
  <br>
  ⭐ Star this repo if you find it helpful!
</p>
