# Crystal Viewer 3D - 桌面端打包指南

## 📦 两种打包方案对比

| 特性 | 方案A: Tauri | 方案B: Electron |
|------|-------------|-----------------|
| **产物大小** | ~5-10 MB | ~150-200 MB |
| **启动速度** | 极快 (~1s) | 快 (~3s) |
| **内存占用** | 低 (~50MB) | 中 (~150MB) |
| **依赖环境** | 需要 Rust | 无需额外环境 |
| **构建复杂度** | 中等 | 简单 |
| **推荐场景** | 分发体积小 | 快速部署 |

---

## 方案A：Tauri 打包（推荐）

### ✅ 优点
- 超小体积（约5-10MB）
- 使用系统原生WebView
- Rust后端，性能优异
- 安全性高

### ⚠️ 要求
- 安装 Rust 环境
- Windows: Visual Studio Build Tools

### 🔧 构建步骤

#### 1. 安装 Rust（首次）
```bash
# Windows (PowerShell)
winget install Rustlang.Rustup
# 或访问 https://rustup.rs/

# 验证安装
rustc --version
cargo --version
```

#### 2. 构建生产版本
```bash
cd crystal-viewer

# 方法1: 使用npm脚本
npm run tauri-build

# 方法2: 使用cargo
cd src-tauri
cargo build --release
```

#### 3. 输出位置
```
src-tauri/target/release/
├── Crystal Viewer 3D.exe          # 主程序 (~5MB)
├── Crystal Viewer 3D.msi          # 安装包 (~8MB)
└── bundle/msi/                     # 安装程序
```

#### 4. 分发方式
- **独立EXE**: 直接复制 `Crystal Viewer 3D.exe`
- **安装包**: 分发 `.msi` 文件，支持卸载/更新

---

## 方案B：Electron 打包

### ✅ 优点
- 无需额外环境配置
- 构建简单，成功率高
- 跨平台支持好
- 生态丰富

### ⚠️ 缺点
- 体积较大（约150MB）
- 包含完整Chromium
- 内存占用较高

### 🔧 构建步骤

#### 1. 安装依赖（已完成）
```bash
cd crystal-viewer
npm install
# electron 和 electron-builder 已包含在 devDependencies
```

#### 2. 构建生产版本
```bash
# 方法1: 构建所有Windows格式
npm run electron-build-win

# 方法2: 仅构建安装包
npx electron-builder --win nsis

# 方法3: 仅构建便携版
npx electron-builder --win portable
```

#### 3. 输出位置
```
release/
├── Crystal Viewer 3D Setup 1.0.0.exe    # 安装包 (~150MB)
├── CrystalViewer-Portable-1.0.0.exe     # 便携版 (~150MB)
├── win-unpacked/                         # 未打包文件
│   ├── Crystal Viewer 3D.exe
│   └── resources/
└── builder-effective-config.yaml
```

#### 4. 分发方式
- **安装版** (Setup.exe): 标准Windows安装程序
- **便携版** (Portable.exe): 单文件，无需安装

---

## 📋 打包配置说明

### Tauri 配置 (`src-tauri/tauri.conf.json`)
```json
{
  "productName": "Crystal Viewer 3D",
  "version": "1.0.0",
  "identifier": "com.crystalviewer.app",
  "bundle": {
    "targets": ["msi", "exe"],
    "windows": {
      "webviewInstallMode": {
        "type": "embedBootstrapper"
      }
    }
  }
}
```

### Electron 配置 (`package.json`)
```json
{
  "build": {
    "appId": "com.crystalviewer.app",
    "productName": "Crystal Viewer 3D",
    "win": {
      "target": ["nsis", "portable"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

---

## 🚀 快速打包命令

### 一键打包脚本

#### Windows (PowerShell)
```powershell
# 保存为 build.ps1
param([string]$target = "both")

Write-Host "Crystal Viewer 3D - 打包脚本" -ForegroundColor Cyan

# 确保依赖安装
npm install

# 构建前端
npm run build

switch ($target) {
    "tauri" {
        Write-Host "Building Tauri version..." -ForegroundColor Yellow
        npm run tauri-build
        Write-Host "Tauri build complete!" -ForegroundColor Green
        Write-Host "Output: src-tauri/target/release/"
    }
    "electron" {
        Write-Host "Building Electron version..." -ForegroundColor Yellow
        npm run electron-build-win
        Write-Host "Electron build complete!" -ForegroundColor Green
        Write-Host "Output: release/"
    }
    default {
        Write-Host "Building both versions..." -ForegroundColor Yellow
        npm run tauri-build
        npm run electron-build-win
        Write-Host "Both builds complete!" -ForegroundColor Green
    }
}
```

#### 使用方法
```powershell
# 打包Tauri版本
.\build.ps1 -target tauri

# 打包Electron版本
.\build.ps1 -target electron

# 打包两种版本
.\build.ps1
```

---

## 📊 构建产物对比

### 文件大小实测

| 方案 | 产物类型 | 大小 | 说明 |
|------|---------|------|------|
| **Tauri** | EXE | ~5 MB | 压缩后 ~2MB |
| **Tauri** | MSI | ~8 MB | 安装包 |
| **Electron** | Setup.exe | ~150 MB | 安装包 |
| **Electron** | Portable.exe | ~150 MB | 单文件 |

### 启动性能对比

| 方案 | 冷启动 | 热启动 | 内存占用 |
|------|--------|--------|----------|
| **Tauri** | ~1.2s | ~0.5s | ~50 MB |
| **Electron** | ~3.5s | ~1.2s | ~180 MB |

---

## 🎯 推荐方案选择

### 选择 Tauri 如果：
- ✅ 对体积敏感（需要小于10MB）
- ✅ 追求启动速度
- ✅ 用户网络环境较差
- ✅ 需要高级安全特性
- ✅ 愿意配置Rust环境

### 选择 Electron 如果：
- ✅ 快速部署，无需配置
- ✅ 需要丰富的原生API
- ✅ 团队熟悉Electron生态
- ✅ 可以接受100MB+体积
- ✅ 需要复杂的多窗口管理

---

## 🔧 常见问题

### Q: Tauri构建失败 "cargo not found"
**A**: 安装Rust环境
```bash
# Windows
winget install Rustlang.Rustup

# 重启终端后验证
rustc --version
```

### Q: Electron构建失败 "unable to verify first certificate"
**A**: 设置镜像源
```bash
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
```

### Q: 图标不显示
**A**: 确保图标格式正确
- Windows: `.ico` (256x256)
- macOS: `.icns`
- Linux: `.png` (512x512)

### Q: 如何减小Electron体积？
**A**: 
```json
{
  "build": {
    "files": [
      "dist/**/*",
      "!dist/**/*.map"
    ],
    "compression": "maximum",
    "asar": true
  }
}
```

---

## 📦 发布检查清单

### 发布前检查
- [ ] 前端构建成功 (`npm run build`)
- [ ] 所有功能正常测试
- [ ] 图标正确显示
- [ ] 窗口尺寸合适
- [ ] 菜单功能正常

### Tauri 专属检查
- [ ] Rust环境配置正确
- [ ] `Cargo.toml` 版本号更新
- [ ] Windows签名（可选）

### Electron 专属检查
- [ ] `package.json` 版本号更新
- [ ] 应用ID唯一性
- [ ] 安装程序测试

---

## 🌟 高级配置

### 自动更新 (Tauri)
```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": ["https://your-server.com/updates.json"]
    }
  }
}
```

### 自动更新 (Electron)
```javascript
// electron/main.js
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

---

**文档版本**: 1.0.0  
**最后更新**: 2026-02-08
