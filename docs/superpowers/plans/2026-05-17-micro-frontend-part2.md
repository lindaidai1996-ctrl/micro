# 微前端学习项目 实现计划（Part 2：核心特性验证 + 部署）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 验证微前端核心特性（样式隔离、JS 沙箱、第三方依赖共享），并完成 Vercel 独立部署配置。

**Architecture:** 在 Part 1 基础上，通过具体演示代码验证隔离机制，配置 externals 实现第三方库共享，最后为每个包添加 Vercel 部署配置。

**Tech Stack:** lodash-es (CDN共享演示), Vercel

**Related:** [Part 1: 基础搭建 + 子应用接入](./2026-05-17-micro-frontend-part1.md)

---

## Task 7: 样式隔离验证

**Files:**
- Modify: `packages/sub-react/src/App.tsx`
- Modify: `packages/sub-vue/src/App.vue`

- [ ] **Step 1: 在 React 子应用添加同名样式**

在 `sub-react/src/App.tsx` 顶部添加内联样式或创建 CSS：

在 `src/` 下创建 `style.css`：

```css
.title {
  font-size: 24px;
  color: #61dafb;
  border-bottom: 3px solid #61dafb;
  padding-bottom: 8px;
}

.info-list {
  list-style: none;
  padding: 16px 0;
}

.info-list li {
  padding: 8px 0;
  border-bottom: 1px dashed #ccc;
}
```

在 `App.tsx` 中引入并使用：

```tsx
import './style.css'
// ...
<h2 className="title">React 子应用</h2>
<ul className="info-list">
```

- [ ] **Step 2: 在 Vue 子应用添加同名但不同样式的 class**

在 `sub-vue/src/App.vue` 中添加 `<style>` 块：

```vue
<style>
.title {
  font-size: 24px;
  color: #42b883;
  border-bottom: 3px solid #42b883;
  padding-bottom: 8px;
}

.info-list {
  list-style: none;
  padding: 16px 0;
}

.info-list li {
  padding: 8px 0;
  border-bottom: 1px dashed #666;
}
</style>
```

同时在 template 中使用：

```vue
<h2 class="title">Vue 子应用</h2>
<ul class="info-list">
```

- [ ] **Step 3: 验证样式隔离**

Run: `pnpm dev`

验证步骤：
1. 访问 /sub-react → 标题为蓝色（#61dafb），边框蓝色
2. 切换到 /sub-vue → 标题为绿色（#42b883），边框绿色
3. 来回切换多次，样式不会互相污染

如果使用 strictStyleIsolation（Shadow DOM），在 DevTools Elements 面板中能看到子应用被包裹在 `#shadow-root` 中。

- [ ] **Step 4: Commit**

```bash
git add packages/sub-react/src packages/sub-vue/src
git commit -m "feat: add conflicting class names to verify style isolation"
```

---

## Task 8: JS 沙箱验证

**Files:**
- Modify: `packages/sub-react/src/App.tsx`
- Modify: `packages/sub-vue/src/App.vue`

- [ ] **Step 1: React 子应用中设置全局变量（已在 Task 4 中完成）**

确认 `sub-react/src/App.tsx` 中已有：

```tsx
useEffect(() => {
  window.reactFlag = true
}, [])
```

并展示其值：

```tsx
<li>window.reactFlag: <strong>{String(window.reactFlag)}</strong></li>
```

- [ ] **Step 2: Vue 子应用中读取该全局变量（已在 Task 5 中完成）**

确认 `sub-vue/src/App.vue` 中已有：

```ts
const reactFlagValue = ref(String((window as any).reactFlag))
```

显示为：

```vue
<li>window.reactFlag: <strong>{{ reactFlagValue }}</strong> (验证 JS 沙箱隔离)</li>
```

- [ ] **Step 3: 验证沙箱隔离**

Run: `pnpm dev`

验证步骤：
1. 先访问 /sub-react → 显示 `window.reactFlag: true`
2. 切换到 /sub-vue → 显示 `window.reactFlag: undefined`
3. 这证明 React 子应用对 window 的修改被沙箱隔离，不会泄漏到其他子应用

在 Console 中直接输入 `window.reactFlag`：
- 如果在主应用上下文中，结果为 `undefined`（沙箱隔离成功）

- [ ] **Step 4: Commit（如果有代码变更）**

如果 Task 4/5 中已经包含了这些代码则跳过此步骤，否则：

```bash
git add packages/sub-react/src packages/sub-vue/src
git commit -m "feat: verify JS sandbox isolation with window.reactFlag"
```

---

## Task 9: 第三方库共享（lodash-es via CDN）

**Files:**
- Modify: `packages/main-app/index.html`
- Modify: `packages/sub-react/webpack.config.js`
- Modify: `packages/sub-react/src/App.tsx`
- Modify: `packages/sub-vue/vite.config.ts`
- Modify: `packages/sub-vue/src/App.vue`
- Modify: `packages/sub-react/src/declarations.d.ts`

- [ ] **Step 1: 主应用 HTML 引入 lodash CDN**

在 `packages/main-app/index.html` 的 `<head>` 中添加：

```html
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
```

注意：CDN 版本的 lodash 会挂载到 `window._`。

- [ ] **Step 2: React 子应用 webpack externals 排除 lodash**

在 `packages/sub-react/webpack.config.js` 中添加 externals：

```js
module.exports = {
  // ... existing config
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_',
    },
  },
  // ...
}
```

- [ ] **Step 3: React 子应用添加 lodash 类型声明**

在 `packages/sub-react/src/declarations.d.ts` 中追加：

```ts
declare module 'lodash' {
  export function capitalize(str: string): string
  export function upperFirst(str: string): string
}
```

- [ ] **Step 4: React 子应用使用 lodash**

在 `packages/sub-react/src/App.tsx` 中：

```tsx
import { capitalize } from 'lodash'

// 在 JSX 中添加：
<li>lodash capitalize('hello'): <strong>{capitalize('hello')}</strong> (第三方库共享)</li>
```

- [ ] **Step 5: Vue 子应用 vite externals 排除 lodash**

修改 `packages/sub-vue/vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('sub-vue', { useDevMode: true }),
  ],
  server: {
    port: 8082,
    cors: true,
    origin: 'http://localhost:8082',
  },
  build: {
    rollupOptions: {
      external: ['lodash'],
      output: {
        globals: {
          lodash: '_',
        },
      },
    },
  },
})
```

- [ ] **Step 6: Vue 子应用使用 lodash**

在 `packages/sub-vue/src/App.vue` 中：

```vue
<script setup lang="ts">
import { capitalize } from 'lodash'
// ...existing imports

// 在 template 中添加:
</script>

<template>
  <!-- ...existing items -->
  <li>lodash capitalize('world'): <strong>{{ capitalize('world') }}</strong> (第三方库共享)</li>
</template>
```

- [ ] **Step 7: 安装 lodash 类型定义（仅开发用）**

Run: `pnpm --filter sub-vue add -D @types/lodash`

- [ ] **Step 8: 验证第三方库共享**

Run: `pnpm dev`

验证步骤：
1. 打开 DevTools → Network 面板
2. 访问主应用 → 看到 lodash.min.js 从 CDN 加载（一次）
3. 切换到 /sub-react → 显示 `capitalize('hello'): Hello`
4. 切换到 /sub-vue → 显示 `capitalize('world'): World`
5. Network 中 lodash 没有被再次加载，说明共享生效

- [ ] **Step 9: Commit**

```bash
git add packages/main-app/index.html packages/sub-react/webpack.config.js packages/sub-react/src packages/sub-vue/vite.config.ts packages/sub-vue/src
git commit -m "feat: share lodash via CDN + externals to avoid duplicate bundling"
```

---

## Task 10: Vercel 部署配置

**Files:**
- Create: `packages/main-app/vercel.json`
- Create: `packages/main-app/.env.production`
- Create: `packages/sub-react/vercel.json`
- Create: `packages/sub-vue/vercel.json`
- Create: `.gitignore`

- [ ] **Step 1: 创建 .gitignore**

```gitignore
node_modules
dist
.DS_Store
*.local
pnpm-lock.yaml
```

注意：pnpm-lock.yaml 通常应该提交，但如果仓库已有则保留。这里根据实际情况决定是否排除。

修正：pnpm-lock.yaml 应该提交，改为：

```gitignore
node_modules
dist
.DS_Store
*.local
```

- [ ] **Step 2: 创建主应用 vercel.json**

```json
{
  "framework": "vite",
  "buildCommand": "cd ../.. && pnpm install && pnpm --filter main-app build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

`rewrites` 确保所有路由都由主应用的 index.html 处理（SPA history 模式）。

- [ ] **Step 3: 创建主应用 .env.production**

```env
VITE_SUB_REACT_URL=https://your-sub-react.vercel.app
VITE_SUB_VUE_URL=https://your-sub-vue.vercel.app
```

部署后需要替换为实际 Vercel 域名（也可以在 Vercel Dashboard 中设置环境变量）。

- [ ] **Step 4: 创建 React 子应用 vercel.json**

```json
{
  "buildCommand": "cd ../.. && pnpm install && pnpm --filter sub-react build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "*" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 5: 创建 Vue 子应用 vercel.json**

```json
{
  "framework": "vite",
  "buildCommand": "cd ../.. && pnpm install && pnpm --filter sub-vue build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "*" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 6: 验证 build 流程**

Run: `pnpm build`

Expected:
- `packages/main-app/dist/` 生成 HTML + JS + CSS
- `packages/sub-react/dist/` 生成 UMD bundle
- `packages/sub-vue/dist/` 生成 JS + CSS

- [ ] **Step 7: Commit**

```bash
git add .gitignore packages/main-app/vercel.json packages/main-app/.env.production packages/sub-react/vercel.json packages/sub-vue/vercel.json
git commit -m "feat: add Vercel deployment config with CORS headers"
```

---

## Task 11: 部署验证与文档

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建 README.md**

```markdown
# 微前端 Demo (qiankun)

基于 qiankun 的微前端学习项目，演示核心概念。

## 技术栈

| 应用 | 技术 | 端口 |
|------|------|------|
| 主应用 | Vue 3 + Vite | 8080 |
| React 子应用 | React 18 + Webpack | 8081 |
| Vue 子应用 | Vue 3 + Vite | 8082 |
| 共享模块 | TypeScript | - |

## 快速启动

```bash
pnpm install
pnpm dev
```

访问 http://localhost:8080

## 单独启动子应用

```bash
pnpm dev:react   # http://localhost:8081
pnpm dev:vue     # http://localhost:8082
```

## 构建

```bash
pnpm build
```

## 部署

每个应用独立部署到 Vercel：

1. 在 Vercel 中 Import 同一个 GitHub 仓库三次
2. 每次 Import 设置不同的 Root Directory：
   - 主应用: `packages/main-app`
   - React 子应用: `packages/sub-react`
   - Vue 子应用: `packages/sub-vue`
3. 在主应用的 Vercel 环境变量中设置：
   - `VITE_SUB_REACT_URL` = React 子应用的 Vercel 域名
   - `VITE_SUB_VUE_URL` = Vue 子应用的 Vercel 域名

## 核心概念演示

- **应用加载**: 点击导航，观察子应用动态加载
- **样式隔离**: 两个子应用有同名 class 但样式不冲突
- **JS 沙箱**: React 设置 window.reactFlag，Vue 中读取为 undefined
- **应用通信**: 主应用切换主题，子应用同步响应
- **依赖共享**: lodash 通过 CDN 加载一次，子应用通过 externals 复用
- **独立调试**: 子应用可单独启动运行
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup and deployment instructions"
```

- [ ] **Step 3: 部署流程（手动执行）**

1. 将代码推送到 GitHub
2. 在 Vercel Dashboard 中 Import 仓库三次（见 README 说明）
3. 部署完成后，更新主应用环境变量中的子应用地址
4. 重新部署主应用
5. 访问主应用线上地址验证全部功能

---

## 核心概念学习路径总结

完成以上所有 Task 后，你将理解：

| 阶段 | 你学到了什么 |
|------|-------------|
| Task 1-2 | Monorepo 管理 + 项目模块共享（workspace） |
| Task 3 | 主应用作为基座的角色 |
| Task 4-5 | 子应用生命周期（bootstrap/mount/unmount）+ 独立运行 |
| Task 6 | qiankun 注册与启动 + 全局状态通信 |
| Task 7 | 样式隔离（Shadow DOM） |
| Task 8 | JS 沙箱（Proxy） |
| Task 9 | 第三方依赖共享（externals + CDN） |
| Task 10-11 | 独立部署 + 跨域处理 |
