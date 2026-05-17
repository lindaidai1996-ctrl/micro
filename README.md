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
