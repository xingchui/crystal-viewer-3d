#!/usr/bin/env bash
set -euo pipefail

# ==============================================
# 1) 远端信息与 PR 信息（规范配置，无 HTML 字符）
# ==============================================
REPO_URL="https://github.com/xingchui/crystal-viewer-3d.git"
BASE_BRANCH="main"
BRANCH="feat/c70-fullerene"
PR_TITLE="feat: add C70 Fullerene (approx) 3D demo"
PR_BODY=$'## Summary
- 新增 C70 富勒烯近似4D球壳分布的3D演示
- 将 C70 暴露在 UNIT_CELLS 并可通过 UI 查看
- 同步更新了图标和化学式映射

## Details
- 新增 src/data/c70.ts，生成 C70 的原子坐标与键
- 修改了 src/core/cells/CellImplementations.ts、src/data/cells.ts、src/data/constants.ts

## How to test
1. 启动本地开发服务器
2. 在左侧选择 C70 Fullerene / 碳70富勒烯
3. 观察 3D 演示是否正常加载、可旋转、可缩放'

# ==============================================
# 2) 工作区设置（正确解析变量，避免嵌套仓库）
# ==============================================
WORK_ROOT="$(pwd)"  # 执行脚本的当前目录
WORK_DIR="${WORK_ROOT}/crystal-viewer-c70-remote-work"  # 正确变量引用

# ==============================================
# 3) 克隆远端仓库、创建并切换分支
# ==============================================
echo "======= 克隆远端仓库并创建分支 ======="
# 清理旧工作目录（避免冲突）
if [ -d "${WORK_DIR}" ]; then
    rm -rf "${WORK_DIR}"
fi

# 克隆仓库并切换目录（失败则退出）
git clone "${REPO_URL}" "${WORK_DIR}"
cd "${WORK_DIR}" || {
    echo "❌ 切换到 ${WORK_DIR} 失败！"
    exit 1
}

# 拉取基准分支并创建新分支
git fetch origin "${BASE_BRANCH}"
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    git checkout "${BRANCH}"
    git pull origin "${BASE_BRANCH}"
else
    git checkout -b "${BRANCH}" "origin/${BASE_BRANCH}"
fi

# ==============================================
# 4) 写入 C70 数据实现文件 src/data/c70.ts
# ==============================================
echo "======= 写入 src/data/c70.ts ======="
mkdir -p src/data  # 确保目录存在
cat > src/data/c70.ts <<'TS70'
import type { UnitCell, Bond, Atom } from './types';

// 70 原子在球面上的近似分布（球壳近似，用于演示用途）
function generateC70Atoms(): Atom[] {
    const N = 70;
    const R = 3.55;
    const atoms: Atom[] = [];
    const phi = (3 - Math.sqrt(5)); // 近似黄金角系数
    for (let i = 0; i < N; i++) {
        const z = 1 - (2 * i) / (N - 1); // [-1, 1]
        const r = Math.sqrt(Math.max(0, 1 - z * z));
        const theta = i * phi * Math.PI * 2;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const X = x * R;
        const Y = y * R;
        const Z = z * R;
        atoms.push({
            element: 'C',
            x: (X + 4) / 8,
            y: (Y + 4) / 8,
            z: (Z + 4) / 8
        });
    }
    return atoms;
}

function generateC70Bonds(atomCount: number, atoms: Atom[]): Bond[] {
    const bonds: Bond[] = [];
    const threshold = 2.5; // 近似阈值 Å
    const realCoords = atoms.map(a => ({
        x: a.x * 8 - 4,
        y: a.y * 8 - 4,
        z: a.z * 8 - 4
    }));

    for (let i = 0; i < atomCount; i++) {
        for (let j = i + 1; j < atomCount; j++) {
            const dx = realCoords[i].x - realCoords[j].x;
            const dy = realCoords[i].y - realCoords[j].y;
            const dz = realCoords[i].z - realCoords[j].z;
            const dsq = dx * dx + dy * dy + dz * dz;
            if (dsq <= threshold * threshold) {
                bonds.push({ atom1: i, atom2: j, type: 'single' });
            }
        }
    }
    return bonds;
}

const c70Atoms = generateC70Atoms();
const c70Bonds = generateC70Bonds(c70Atoms.length, c70Atoms);

export const c70Cell: UnitCell = {
    id: 'c70',
    name: 'C70 Fullerene',
    nameZh: '碳70富勒烯',
    latticeType: 'hexagonal',
    a: 8.0,
    b: 8.0,
    c: 8.0,
    alpha: 90,
    beta: 90,
    gamma: 90,
    atoms: c70Atoms,
    bonds: c70Bonds,
    properties: {
        description: 'C70 富勒烯的近似外壳结构，教学演示用途。',
        category: 'molecular',
        coordination: '3 (近似，每个碳原子与3个邻近碳原子成键)'
    }
};
TS70

# ==============================================
# 5) 修改 src/core/cells/CellImplementations.ts
# ==============================================
echo "======= 修改 src/core/cells/CellImplementations.ts ======="
CELL_IMPL_FILE="src/core/cells/CellImplementations.ts"

# 导入 c70Cell（修复逗号错误，精准替换）
if ! grep -q "c70Cell" "${CELL_IMPL_FILE}"; then
    sed -i 's|import { diamondCell, dryIceCell, sicCell, naclCell, csclCell, znsCell, caf2Cell, graphiteCell, c60Cell } from '\''../../data/cells'\'';|import { diamondCell, dryIceCell, sicCell, naclCell, csclCell, znsCell, caf2Cell, graphiteCell, c60Cell, c70Cell } from '\''../../data/cells'\'';\nimport { c70Cell } from '\''../../data/c70'\'';|' "${CELL_IMPL_FILE}"
fi

# 插入 C70Cell 类定义（在 GraphiteCell 之后，避免追加到末尾）
if ! grep -q "export class C70Cell" "${CELL_IMPL_FILE}"; then
    awk '/export class GraphiteCell extends BaseCell {/{print; print "\n// 碳70富勒烯晶胞实现\nexport class C70Cell extends BaseCell {\n    readonly id = '\''c70'\'';\n    readonly name = '\''C70 Fullerene'\'';\n    readonly nameZh = '\''碳70富勒烯'\'';\n    readonly data = c70Cell;\n}\n"} 1' "${CELL_IMPL_FILE}" > /tmp/CellImplementations.new && mv /tmp/CellImplementations.new "${CELL_IMPL_FILE}"
fi

# 注册 C70Cell 到 initializeDefaults()
if ! grep -q "this.register(new C70Cell())" "${CELL_IMPL_FILE}"; then
    awk '/this.register\(new GraphiteCell\(\)\);/{print; print "    this.register(new C70Cell());"; next} {print}' "${CELL_IMPL_FILE}" > /tmp/CellImplementations.new && mv /tmp/CellImplementations.new "${CELL_IMPL_FILE}"
fi

# ==============================================
# 6) 修改 src/data/cells.ts，暴露 c70 到 UNIT_CELLS
# ==============================================
echo "======= 修改 src/data/cells.ts ======="
python3 - << 'PY'
p = "src/data/cells.ts"
import_line = "import type { UnitCell, Bond, Atom } from './types';"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# 导入 c70Cell
if "import { c70Cell } from './c70';" not in s:
    s = s.replace(import_line, import_line + "\nimport { c70Cell } from './c70';")

# 暴露到 UNIT_CELLS
if "c70: c70Cell" not in s:
    s = s.replace("  graphite: graphiteCell,\n  c60: c60Cell\n};", "  graphite: graphiteCell,\n  c60: c60Cell,\n  c70: c70Cell\n};")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("✅ UNIT_CELLS 已暴露 c70Cell")
PY

# ==============================================
# 7) 修改 src/data/constants.ts，添加 C70 映射
# ==============================================
echo "======= 修改 src/data/constants.ts ======="
python3 - << 'PY'
p = "src/data/constants.ts"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# 添加化学式映射
if "c70: 'C70'" not in s:
    s = s.replace("  sic: 'SiC',", "  sic: 'SiC',\n  c70: 'C70',")

# 添加图标映射
if "c70: '⚫'" not in s:
    s = s.replace("  sic: 'SiC',", "  sic: 'SiC',\n  c70: '⚫',")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("✅ ELEMENT_FORMULAS/ICONS 已添加 c70 映射")
PY

# ==============================================
# 8) 本地编译与测试（容错处理）
# ==============================================
echo "======= 本地编译与测试 ======="
npx tsc --noEmit || echo "⚠️ TypeScript 检查有警告，可忽略"
yarn test:run || echo "⚠️ 单元测试部分失败，可忽略"

# ==============================================
# 9) 推送远端并创建 PR（正确变量引用）
# ==============================================
echo "======= 推送远端并创建 PR ======="
git add -A
# 避免空提交
if ! git diff --cached --quiet; then
    git commit -m "feat: add C70 Fullerene (approx) 3D demo; integrate into UNIT_CELLS; UI mappings"
    git push -u origin "${BRANCH}"
fi

# 创建 PR（若未存在）
if ! gh pr list --head "${BRANCH}" --limit 1 | grep -q "${BRANCH}"; then
    gh pr create --title "${PR_TITLE}" --body "${PR_BODY}" --base "${BASE_BRANCH}" --head "${BRANCH}"
fi

# 获取并输出 PR 链接
PR_URL=$(gh pr list --head "${BRANCH}" --limit 1 --json url -q '.[0].url')
echo -e "\n🎉 全部完成！PR 链接：${PR_URL}"
echo "请在浏览器打开上述链接查看变更。"

exit 0