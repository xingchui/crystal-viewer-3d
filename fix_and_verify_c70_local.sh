#!/bin/bash
# fix_and_verify_c70_local.sh
# C70富勒烯集成自动化脚本 - 完整版

set -e

echo "========================================"
echo "C70 Fullerene 集成自动化脚本"
echo "========================================"

# 切换到项目目录
cd "$(dirname "$0")"

echo ""
echo "[1/6] 检查并创建C70数据文件..."
if [ ! -f "src/data/c70.ts" ]; then
    echo "创建 src/data/c70.ts..."
    cat > src/data/c70.ts << 'EOF'
// src/data/c70.ts
import type { UnitCell, Bond, Atom } from './types';

/**
 * 生成C70富勒烯的原子坐标（球壳近似，教学演示用）
 * 基于黄金角分布算法生成70个碳原子在球面上的近似位置
 */
function generateC70Atoms(): Atom[] {
  const N = 70; // C70的原子数量
  const R = 3.55; // 富勒烯球壳半径（Å）
  const atoms: Atom[] = [];
  const phi = (3 - Math.sqrt(5)); // 黄金角系数（≈0.38197）
  for (let i = 0; i < N; i++) {
    const z = 1 - (2 * i) / (N - 1); // z坐标归一化到 [-1, 1]
    const r = Math.sqrt(Math.max(0, 1 - z * z)); // 横截面半径
    const theta = i * phi * Math.PI * 2; // 方位角
    // 球坐标转笛卡尔坐标
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    // 缩放至实际半径，并映射到8x8x8的晶胞范围内
    const X = x * R;
    const Y = y * R;
    const Z = z * R;
    atoms.push({
      element: 'C', // 元素类型：碳
      x: (X + 4) / 8, // 归一化到 [0, 1] 范围（适配8Å晶胞）
      y: (Y + 4) / 8,
      z: (Z + 4) / 8
    });
  }
  return atoms;
}

/**
 * 生成C70原子间的键信息
 * 基于原子间距离判断成键（阈值：2.5Å，接近C-C单键长度）
 * @param atomCount 原子总数
 * @param atoms 原子坐标数组
 */
function generateC70Bonds(atomCount: number, atoms: Atom[]): Bond[] {
  const bonds: Bond[] = [];
  const threshold = 2.5; // 成键距离阈值（Å）
  // 还原原子的实际坐标（从归一化值转回Å）
  const realCoords = atoms.map(a => ({
    x: a.x * 8 - 4,
    y: a.y * 8 - 4,
    z: a.z * 8 - 4
  }));
  
  // 遍历所有原子对，判断是否成键（避免重复，j从i+1开始）
  for (let i = 0; i < atomCount; i++) {
    for (let j = i + 1; j < atomCount; j++) {
      const dx = realCoords[i].x - realCoords[j].x;
      const dy = realCoords[i].y - realCoords[j].y;
      const dz = realCoords[i].z - realCoords[j].z;
      const dsq = dx * dx + dy * dy + dz * dz; // 距离平方（避免开方，提升性能）
      if (dsq <= threshold * threshold) {
        bonds.push({ 
          atom1: i,    // 第一个原子索引
          atom2: j,    // 第二个原子索引
          type: 'single' // 键类型：单键
        });
      }
    }
  }
  return bonds;
}

// 生成C70的原子和键数据
const c70Atoms = generateC70Atoms();
const c70Bonds = generateC70Bonds(c70Atoms.length, c70Atoms);

// 导出完整的C70晶胞数据（符合UnitCell类型）
export const c70Cell: UnitCell = {
  id: 'c70',
  name: 'C70 Fullerene',
  nameZh: '碳70富勒烯',
  latticeType: 'hexagonal', // 晶格类型：六方（近似）
  // 晶胞参数（Å）：8x8x8的立方体晶胞
  a: 8.0, 
  b: 8.0, 
  c: 8.0,
  alpha: 90, // 晶胞角（°）
  beta: 90,
  gamma: 90,
  atoms: c70Atoms, // 原子坐标数组
  bonds: c70Bonds, // 键信息数组
  properties: {
    description: 'C70 富勒烯的近似外壳结构，教学演示用途。',
    category: 'molecular',
    coordination: '3 (近似，每个碳原子与3个邻近碳原子成键)'
  }
};
EOF
    echo "✓ c70.ts 已创建"
else
    echo "✓ c70.ts 已存在，跳过"
fi

echo ""
echo "[2/6] 修改 CellImplementations.ts..."
# 检查是否已有c70Cell导入
if ! grep -q "c70Cell" src/core/cells/CellImplementations.ts; then
    # 添加导入
    sed -i "s/import { diamondCell, dryIceCell, sicCell, naclCell, csclCell, znsCell, caf2Cell, graphiteCell, c60Cell }/import { diamondCell, dryIceCell, sicCell, naclCell, csclCell, znsCell, caf2Cell, graphiteCell, c60Cell, c70Cell }/" src/core/cells/CellImplementations.ts
fi

# 检查是否已有C70Cell类
if ! grep -q "class C70Cell" src/core/cells/CellImplementations.ts; then
    # 在C60Cell后添加C70Cell类
    sed -i '/export class C60Cell/,/^}/a\
\
// 碳70富勒烯\
export class C70Cell extends BaseCell {\
  readonly id = '\''c70'\'';\
  readonly name = '\''C70 Fullerene'\'';\
  readonly nameZh = '\''碳70富勒烯'\'';\
  readonly data = c70Cell;\
}' src/core/cells/CellImplementations.ts
fi

# 检查是否注册C70Cell
if ! grep -q "this.register(new C70Cell())" src/core/cells/CellImplementations.ts; then
    # 在initializeDefaults中添加注册
    sed -i "s/this.register(new C60Cell());/this.register(new C60Cell());\n    this.register(new C70Cell()); \/\/ 注册C70晶胞/" src/core/cells/CellImplementations.ts
fi
echo "✓ CellImplementations.ts 已更新"

echo ""
echo "[3/6] 修改 cells.ts..."
# 检查是否导入c70Cell
if ! grep -q "c70Cell" src/data/cells.ts; then
    sed -i "s/import type { UnitCell, Bond, Atom } from '.\/types';/import type { UnitCell, Bond, Atom } from '.\/types';\nimport { c70Cell } from '.\/c70'; \/\/ 新增导入c70Cell/" src/data/cells.ts
fi

# 检查是否导出c70Cell
if ! grep -q "export.*c70Cell" src/data/cells.ts; then
    sed -i "/^export const UNIT_CELLS/a\\  c70: c70Cell \/\/ 新增c70Cell暴露" src/data/cells.ts
fi
echo "✓ cells.ts 已更新"

echo ""
echo "[4/6] 修改 constants.ts..."
# 检查是否添加c70化学式
if ! grep -q "c70: 'C₇₀'" src/data/constants.ts; then
    sed -i "/c60: 'C₆₀',/a\\  c70: 'C₇₀', \/\/ 新增C70化学式（下标格式保持和C60一致）" src/data/constants.ts
fi

# 检查是否添加c70图标
if ! grep -q "c70: '⚫'" src/data/constants.ts; then
    sed -i "/c60: '⚽',/a\\  c70: '⚫', \/\/ 新增C70图标" src/data/constants.ts
fi
echo "✓ constants.ts 已更新"

echo ""
echo "[5/6] 运行编译验证..."
yarn build
echo "✓ 编译成功"

echo ""
echo "[6/6] 提交并推送到远程..."
# 添加所有变更
git add -A

# 检查是否有变更需要提交
if git diff --cached --quiet; then
    echo "没有新变更需要提交"
else
    git commit -m "feat: add C70 Fullerene 3D demo
    
- Add C70 molecule data with 70 carbon atoms
- Add C70Cell class in CellImplementations
- Register C70 in UNIT_CELLS
- Add C70 formula and icon in constants"
    echo "✓ 已提交"

    # 推送到远程
    git push -u origin feat/c70-fullerene
    echo "✓ 已推送到远程"
    
    # 检查是否需要创建PR
    if gh pr view feat/c70-fullerene &>/dev/null; then
        echo "PR 已存在，跳过创建"
    else
        gh pr create --title "feat: add C70 Fullerene (approx) 3D demo" --body "## Summary
- Add C70 Fullerene 3D structure demonstration
- C70 now visible in sidebar crystal list alongside C60
- Uses golden angle distribution algorithm for atom placement"
        echo "✓ PR 已创建"
    fi
fi

echo ""
echo "========================================"
echo "✓ C70集成完成！"
echo "========================================"
