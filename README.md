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
- **项目模块共享**: @micro/shared 包通过 workspace 被所有应用引用
- **独立调试**: 子应用可单独启动运行

## 核心概念与关键文件对照

| 概念 | 关键文件 | 学习要点 |
|------|---------|---------|
| 应用加载 | `packages/main-app/src/micro/apps.ts` | qiankun 通过 `registerMicroApps` 注册子应用，根据 `activeRule` 匹配路由后 fetch 子应用 HTML |
| 生命周期 | `packages/sub-react/src/index.tsx`、`packages/sub-vue/src/main.ts` | 子应用导出 `bootstrap/mount/unmount`，由 qiankun 在路由切换时调用 |
| 样式隔离 | `packages/sub-react/src/style.css`、`packages/sub-vue/src/App.vue <style>` | `strictStyleIsolation: true` 使用 Shadow DOM 包裹子应用，CSS 天然隔离 |
| JS 沙箱 | 子应用中 `window.reactFlag` 的设置与读取 | qiankun 默认用 Proxy 沙箱，子应用对 window 的修改不会泄漏到其他应用 |
| 应用通信 | `packages/main-app/src/micro/state.ts` | `initGlobalState` 创建发布-订阅通信，主应用切主题 → 子应用同步响应 |
| 第三方库共享 | `packages/main-app/index.html`（CDN）、webpack `externals` | CDN 加载一次 lodash，子应用通过 externals 排除避免重复打包 |
| 项目模块共享 | `packages/shared/src/` | pnpm workspace 引用 `@micro/shared`，多应用复用工具函数和类型 |
| 独立调试 | `window.__POWERED_BY_QIANKUN__` 判断逻辑 | 子应用可独立启动开发，也可被主应用加载，两种模式表现一致 |

## 项目结构

```
micro/
├── packages/
│   ├── main-app/          # Vue 3 基座应用 — 负责路由分发和子应用管理
│   │   ├── src/micro/     # qiankun 配置（注册表 + 全局状态）
│   │   └── ...
│   ├── sub-react/         # React 18 子应用 — Webpack UMD 输出
│   │   └── ...
│   ├── sub-vue/           # Vue 3 子应用 — Vite + vite-plugin-qiankun
│   │   └── ...
│   └── shared/            # 公共模块 — 工具函数、类型、常量
│       └── src/
├── pnpm-workspace.yaml    # Monorepo workspace 配置
└── package.json           # 全局 scripts
```
