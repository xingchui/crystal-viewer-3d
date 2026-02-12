# Crystal Viewer 3D - 打包产物说明

## 📦 打包方案配置完成

### ✅ 已完成的配置

#### 方案A: Tauri
- [x] `src-tauri/tauri.conf.json` - 完整配置
- [x] 应用图标已复制到 `src-tauri/icons/`
- [x] npm脚本: `npm run tauri-build`

**构建命令**:
```bash
# 需要Rust环境
cd crystal-viewer
npm run tauri-build
```

**预期产物**:
```
src-tauri/target/release/
├── Crystal Viewer 3D.exe          (约 5-8 MB)
├── Crystal Viewer 3D.msi          (约 8-12 MB)
└── bundle/
    └── msi/
        └── Crystal Viewer 3D_1.0.0_x64.msi
```

#### 方案B: Electron
- [x] `electron/main.js` - 主进程代码
- [x] `electron/preload.js` - 预加载脚本
- [x] `package.json` - electron-builder配置
- [x] 应用图标已复制到 `electron/assets/`
- [x] npm脚本: `npm run electron-build-win`

**构建命令**:
```bash
# 无需额外环境（但建议使用npm 8+或yarn）
cd crystal-viewer

# 方案1: 使用yarn（推荐）
yarn install
yarn electron-build-win

# 方案2: 降级npm后使用npm
npm install -g npm@8
npm install
npm run electron-build-win
```

**预期产物**:
```
release/
├── Crystal Viewer 3D Setup 1.0.0.exe    (约 150-200 MB)
├── CrystalViewer-Portable-1.0.0.exe     (约 150-200 MB)
├── win-unpacked/                        (未打包文件)
└── builder-effective-config.yaml
```

---

## 🚀 推荐的构建环境

### 环境A: Tauri构建（产物最小）

**系统要求**:
- Windows 10/11
- Node.js 18+
- Rust 1.70+ (`rustup install stable`)
- Visual Studio Build Tools 或 Visual Studio 2022

**构建步骤**:
```powershell
# 1. 安装Rust
winget install Rustlang.Rustup
# 重启终端

# 2. 克隆项目
git clone <repo-url>
cd crystal-viewer

# 3. 安装依赖
npm install

# 4. 构建
npm run tauri-build

# 5. 产物位置
dir "src-tauri\target\release\bundle\msi\"
```

**构建时间**: 5-10分钟（首次）
**产物大小**: 5-10 MB

---

### 环境B: Electron构建（最简单）

**系统要求**:
- Windows 10/11
- Node.js 18+ 或 20+
- npm 8+ 或 yarn 1.22+

**构建步骤**:
```powershell
# 1. 安装yarn（推荐）
npm install -g yarn

# 2. 克隆项目
git clone <repo-url>
cd crystal-viewer

# 3. 使用yarn安装（避免npm兼容性问题）
yarn install

# 4. 构建
yarn electron-build-win

# 5. 产物位置
dir "release\"
```

**构建时间**: 3-5分钟（取决于下载速度）
**产物大小**: 150-200 MB

---

## 📊 产物对比表

| 对比项 | Tauri (方案A) | Electron (方案B) |
|--------|--------------|------------------|
| **安装包大小** | 8-12 MB | 150-200 MB |
| **安装后大小** | 10-15 MB | 180-220 MB |
| **冷启动时间** | 1-2秒 | 3-5秒 |
| **内存占用** | 50-80 MB | 150-200 MB |
| **构建时间** | 5-10分钟 | 3-5分钟 |
| **依赖环境** | 需要Rust | 仅需Node.js |
| **推荐场景** | 网络差/追求体积 | 快速部署 |

---

## 🎯 打包脚本使用

### Windows 批处理脚本
```batch
# 打包两种版本
build.bat both

# 仅Tauri
build.bat tauri

# 仅Electron
build.bat electron

# 清理
build.bat clean
```

### Bash脚本 (macOS/Linux/WSL)
```bash
# 打包两种版本
./build.sh both

# 仅Tauri
./build.sh tauri

# 仅Electron
./build.sh electron

# 清理
./build.sh clean
```

---

## ⚠️ 已知问题与解决

### 问题1: npm 7.x + electron-builder 26.x 不兼容
**错误**: `No JSON content found in output`

**解决**:
```bash
# 方案A: 使用yarn
npm install -g yarn
yarn install
yarn electron-build-win

# 方案B: 升级npm
npm install -g npm@10
npm install
npm run electron-build-win
```

### 问题2: Tauri构建失败 "cargo not found"
**错误**: `failed to run 'cargo metadata' command`

**解决**:
```powershell
# 安装Rust
winget install Rustlang.Rustup
# 或访问 https://rustup.rs/

# 验证
rustc --version
cargo --version
```

### 问题3: 图标不显示
**解决**:
确保图标文件存在:
- Tauri: `src-tauri/icons/icon.ico`
- Electron: `electron/assets/icon.ico`

---

## 📦 分发建议

### 场景1: 内部团队使用
- **推荐**: Electron便携版
- **原因**: 单文件，无需安装，快速分发

### 场景2: 公开发布
- **推荐**: Tauri MSI安装包
- **原因**: 体积小，专业形象，支持自动更新

### 场景3: 网络受限环境
- **推荐**: Tauri EXE独立版
- **原因**: 仅5MB，下载快

### 场景4: 快速原型验证
- **推荐**: Electron安装版
- **原因**: 构建简单，无需配置Rust

---

## 🔧 高级配置

### Tauri自动更新配置
编辑 `src-tauri/tauri.conf.json`:
```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://your-server.com/updates/{{target}}/{{arch}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "your-public-key"
    }
  }
}
```

### Electron自动更新配置
```javascript
// electron/main.js
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  // 生产环境检查更新
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdatesAndNotify();
  }
});
```

---

## 📝 总结

### 打包配置状态
- ✅ **Tauri**: 完全配置，需要Rust环境
- ✅ **Electron**: 完全配置，需要yarn/npm8+
- ✅ **脚本**: Windows批处理和Bash脚本已创建
- ✅ **文档**: 完整打包指南

### 推荐构建流程
1. **开发测试**: `npm run dev`
2. **生产构建**: `npm run build`
3. **桌面打包**:
   - 追求小体积 → `npm run tauri-build` (需要Rust)
   - 追求简单 → `yarn electron-build-win` (推荐yarn)

### 产物位置
- **Tauri**: `src-tauri/target/release/bundle/`
- **Electron**: `release/`

---

**文档版本**: 1.0.0  
**配置完成时间**: 2026-02-08
