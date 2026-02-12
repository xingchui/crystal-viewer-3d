#!/bin/bash
# Crystal Viewer 3D - Build Script
# 支持Tauri和Electron两种打包方案

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Crystal Viewer 3D - 打包脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 显示帮助
show_help() {
    echo "用法: ./build.sh [选项]"
    echo ""
    echo "选项:"
    echo "  tauri     使用Tauri打包 (~5MB)"
    echo "  electron  使用Electron打包 (~150MB)"
    echo "  both      两种方案都打包 (默认)"
    echo "  clean     清理构建文件"
    echo "  help      显示此帮助"
    echo ""
    echo "示例:"
    echo "  ./build.sh tauri     # 仅打包Tauri版本"
    echo "  ./build.sh electron  # 仅打包Electron版本"
    echo "  ./build.sh           # 打包两种版本"
}

# 清理构建文件
clean_build() {
    echo -e "${YELLOW}清理构建文件...${NC}"
    rm -rf dist
    rm -rf release
    rm -rf src-tauri/target
    rm -rf node_modules/.cache
    echo -e "${GREEN}清理完成${NC}"
}

# 检查Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未安装Node.js${NC}"
        exit 1
    fi
    echo -e "${BLUE}Node.js版本: $(node --version)${NC}"
}

# 安装依赖
install_deps() {
    echo -e "${YELLOW}检查依赖...${NC}"
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装依赖...${NC}"
        npm install
    fi
}

# 构建前端
build_frontend() {
    echo -e "${YELLOW}构建前端...${NC}"
    npm run build
    echo -e "${GREEN}前端构建完成${NC}"
}

# Tauri打包
build_tauri() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  方案A: Tauri 打包${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # 检查Rust
    if ! command -v cargo &> /dev/null; then
        echo -e "${RED}错误: 未安装Rust/Cargo${NC}"
        echo -e "${YELLOW}请访问 https://rustup.rs/ 安装Rust${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Rust版本: $(rustc --version)${NC}"
    echo -e "${YELLOW}开始构建Tauri版本...${NC}"
    
    npm run tauri-build
    
    echo -e "${GREEN}Tauri构建完成!${NC}"
    echo -e "${BLUE}输出位置: src-tauri/target/release/${NC}"
    
    # 显示文件大小
    if [ -f "src-tauri/target/release/Crystal Viewer 3D.exe" ]; then
        ls -lh "src-tauri/target/release/Crystal Viewer 3D.exe"
    fi
    
    if [ -d "src-tauri/target/release/bundle" ]; then
        echo -e "${BLUE}安装包:${NC}"
        find src-tauri/target/release/bundle -type f \( -name "*.msi" -o -name "*.exe" \) -exec ls -lh {} \;
    fi
}

# Electron打包
build_electron() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  方案B: Electron 打包${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    echo -e "${YELLOW}开始构建Electron版本...${NC}"
    
    npm run electron-build-win
    
    echo -e "${GREEN}Electron构建完成!${NC}"
    echo -e "${BLUE}输出位置: release/${NC}"
    
    # 显示文件大小
    if [ -d "release" ]; then
        find release -maxdepth 1 -type f \( -name "*.exe" -o -name "*.msi" \) -exec ls -lh {} \;
    fi
}

# 主函数
main() {
    TARGET=${1:-both}
    
    case $TARGET in
        help|--help|-h)
            show_help
            exit 0
            ;;
        clean)
            clean_build
            exit 0
            ;;
        tauri)
            check_node
            install_deps
            build_frontend
            build_tauri
            ;;
        electron)
            check_node
            install_deps
            build_frontend
            build_electron
            ;;
        both)
            check_node
            install_deps
            build_frontend
            build_tauri || echo -e "${YELLOW}Tauri构建失败，继续Electron构建...${NC}"
            build_electron
            ;;
        *)
            echo -e "${RED}未知选项: $TARGET${NC}"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  打包完成!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

main "$@"
