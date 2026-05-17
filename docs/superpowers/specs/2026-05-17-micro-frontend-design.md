# 微前端学习项目 — 设计文档

## 目标

用 qiankun 搭建一个最小可运行的微前端 Demo，通过动手实践理解微前端核心概念：应用加载、样式隔离、JS 沙箱、应用通信、公共依赖共享、独立调试。最终可部署上线。

## 技术选型

| 角色 | 技术栈 | 端口 |
|------|--------|------|
| 主应用（基座） | Vue 3 + Vite + TypeScript | 8080 |
| 子应用 A | React 18 + Webpack + TypeScript | 8081 |
| 子应用 B | Vue 3 + Vite + TypeScript | 8082 |
| 共享模块 | TypeScript（纯逻辑） | - |
| 包管理 | pnpm workspace (Monorepo) | - |
| 部署 | Vercel 独立部署（每个应用一个 Vercel 项目） | - |

**为什么 React 子应用用 Webpack 而不是 Vite：** qiankun 要求子应用输出 UMD 格式的 bundle，Webpack 对 UMD 的支持最成熟。Vite 在开发态使用 ESM，与 qiankun 的加载机制有兼容问题（需要额外插件）。Vue 子应用通过 `vite-plugin-qiankun` 解决此问题。

## 项目结构

```
micro/
├── packages/
│   ├── main-app/              # Vue 3 基座应用
│   │   ├── src/
│   │   │   ├── App.vue              # 导航栏 + 子应用挂载容器 + 主题切换
│   │   │   ├── main.ts              # 启动 qiankun
│   │   │   └── micro/
│   │   │       ├── apps.ts          # 子应用注册表
│   │   │       └── state.ts         # initGlobalState 通信实例
│   │   ├── .env                     # 本地子应用地址
│   │   ├── .env.production          # 线上子应用地址（Vercel 注入）
│   │   └── vite.config.ts
│   │
│   ├── sub-react/             # React 18 子应用
│   │   ├── src/
│   │   │   ├── App.tsx              # 演示页面（显示主题 + 调用 shared 工具）
│   │   │   ├── main.tsx             # 生命周期导出 + 独立运行判断
│   │   │   └── public-path.ts       # 运行时 publicPath
│   │   ├── webpack.config.js        # UMD 输出 + CORS headers + externals
│   │   └── package.json
│   │
│   ├── sub-vue/               # Vue 3 子应用
│   │   ├── src/
│   │   │   ├── App.vue              # 演示页面（显示主题 + 调用 shared 工具）
│   │   │   ├── main.ts              # 生命周期导出 + 独立运行判断
│   │   │   └── public-path.ts       # 运行时 publicPath
│   │   ├── vite.config.ts           # vite-plugin-qiankun
│   │   └── package.json
│   │
│   └── shared/                # 项目内共享模块
│       ├── src/
│       │   ├── utils.ts             # formatDate 等公共工具
│       │   ├── constants.ts         # 事件名、API 地址等
│       │   └── types.ts             # 公共类型
│       ├── package.json             # name: "@micro/shared"
│       └── tsconfig.json
│
├── pnpm-workspace.yaml
├── package.json                     # 全局 scripts
└── docs/
```

## 核心概念与实现映射

### 1. 应用加载

**概念：** 主应用作为"基座"，根据 URL 路由动态加载对应子应用的 HTML/JS/CSS。

**实现：** `main-app/src/micro/apps.ts` — 注册子应用列表。

```ts
const apps = [
  {
    name: 'sub-react',
    entry: import.meta.env.VITE_SUB_REACT_URL || '//localhost:8081',
    container: '#sub-container',
    activeRule: '/sub-react',
  },
  {
    name: 'sub-vue',
    entry: import.meta.env.VITE_SUB_VUE_URL || '//localhost:8082',
    container: '#sub-container',
    activeRule: '/sub-vue',
  },
]
```

qiankun 在匹配到 activeRule 时，通过 fetch 拉取子应用 entry HTML，解析出 JS/CSS 资源并执行。

### 2. 生命周期

**概念：** 子应用必须导出 `bootstrap`、`mount`、`unmount` 三个生命周期函数，由 qiankun 在适当时机调用。

**实现：** 每个子应用的 `main.ts/tsx`。

- `bootstrap`：应用首次加载时调用，只执行一次（初始化逻辑）
- `mount`：每次进入子应用路由时调用（渲染 UI）
- `unmount`：离开子应用路由时调用（清理 DOM、取消监听）

### 3. 样式隔离

**概念：** 防止子应用的 CSS 影响主应用或其他子应用。

**实现：** qiankun 注册时配置 `sandbox: { strictStyleIsolation: true }`，底层使用 Shadow DOM 将子应用包裹，CSS 天然隔离。

**演示方式：** 两个子应用分别定义同名 class（如 `.title`）但不同样式，切换时互不影响。

### 4. JS 沙箱

**概念：** 防止子应用修改 `window` 全局变量，污染其他应用。

**实现：** qiankun 默认开启 Proxy 沙箱。每个子应用拿到的 `window` 是一个 Proxy 代理对象，写入操作被拦截，不会影响真实 window。

**演示方式：** React 子应用设置 `window.reactFlag = true`，Vue 子应用读取 `window.reactFlag` 为 `undefined`，证明沙箱生效。

### 5. 应用通信

**概念：** 应用间通过 qiankun 提供的全局状态管理器（发布-订阅模式）通信。

**实现：**

- 主应用：`micro/state.ts` 中 `initGlobalState({ theme: 'light' })`
- 主应用：`App.vue` 中按钮触发 `actions.setGlobalState({ theme })`
- 子应用：`props.onGlobalStateChange` 监听变化，更新本地状态

**数据流向：** 主应用 → GlobalState → 子应用（单向广播）

### 6. 公共依赖共享

#### 第三方库共享

**概念：** 避免主应用和子应用重复打包同一个库。

**实现：**

- 主应用通过 CDN `<script>` 引入 `lodash-es`
- React 子应用 webpack `externals` 排除 lodash
- Vue 子应用 vite `rollupOptions.external` 排除 lodash

**验证：** Network 面板中 lodash 只加载一次。

#### 项目模块共享

**概念：** 项目内的公共工具、类型、常量抽成独立包。

**实现：**

- `packages/shared` 作为 workspace 包，`name: "@micro/shared"`
- 子应用 `package.json` 中 `"@micro/shared": "workspace:*"`
- 子应用直接 `import { formatDate } from '@micro/shared'`

**演示：** 两个子应用调用 `formatDate` 显示当前时间，格式一致。

### 7. 独立运行调试

**概念：** 子应用既能被主应用加载，也能独立运行开发调试。

**实现：**

```ts
if (!window.__POWERED_BY_QIANKUN__) {
  // 独立运行：自己创建根节点，正常渲染
  render()
}

export async function mount(props) {
  // 微前端模式：在 qiankun 提供的容器中渲染
  render(props.container)
}
```

**开发命令：**

| 命令 | 效果 |
|------|------|
| `pnpm dev` | 并行启动所有应用 |
| `pnpm --filter sub-react dev` | 只启动 React 子应用 |
| `pnpm --filter sub-vue dev` | 只启动 Vue 子应用 |

## 部署方案

### Vercel 独立部署

每个应用作为独立 Vercel 项目，一个 GitHub 仓库多次 import：

| 应用 | Vercel Root Directory | 线上地址（示例） |
|------|----------------------|-----------------|
| main-app | `packages/main-app` | `micro-main.vercel.app` |
| sub-react | `packages/sub-react` | `micro-react.vercel.app` |
| sub-vue | `packages/sub-vue` | `micro-vue.vercel.app` |

### 跨域处理

子应用需要在部署配置中添加 CORS 响应头：

```json
// vercel.json (子应用)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### 环境变量

主应用通过 Vercel 环境变量注入子应用线上地址：

- `VITE_SUB_REACT_URL` → `https://micro-react.vercel.app`
- `VITE_SUB_VUE_URL` → `https://micro-vue.vercel.app`

## 页面设计

### 主应用

- 顶部导航栏：首页 / React 子应用 / Vue 子应用
- 主题切换按钮（light/dark）
- 中间区域：`#sub-container` 子应用挂载容器

### React 子应用

- 标题："React 子应用"
- 显示当前主题（来自全局状态）
- 显示 `formatDate()` 结果（来自 @micro/shared）
- 显示 `window.reactFlag` 值（演示 JS 沙箱）

### Vue 子应用

- 标题："Vue 子应用"
- 显示当前主题（来自全局状态）
- 显示 `formatDate()` 结果（来自 @micro/shared）
- 显示 `window.reactFlag` 值（演示 JS 沙箱隔离）

## 不包含的内容

- 路由嵌套（子应用内部多页面）
- 权限控制
- 子应用预加载策略
- 错误边界处理
- CI/CD 自动化
- 监控 / 日志
