# 微前端学习项目 实现计划（Part 1：基础搭建 + 子应用接入）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 qiankun 微前端 Monorepo，实现主应用加载 React 18 和 Vue 3 两个子应用的基础流程。

**Architecture:** pnpm workspace Monorepo，主应用（Vue 3 + Vite）作为基座注册并加载子应用，React 子应用（Webpack UMD 输出），Vue 子应用（Vite + vite-plugin-qiankun）。每个子应用导出 qiankun 生命周期并支持独立运行。

**Tech Stack:** pnpm, Vue 3, React 18, TypeScript, Vite, Webpack 5, qiankun 2.x, vite-plugin-qiankun

**Related:** [Part 2: 核心特性 + 部署](./2026-05-17-micro-frontend-part2.md)

---

## File Structure

```
micro/
├── package.json                        # workspace root scripts
├── pnpm-workspace.yaml                 # workspace 配置
├── packages/
│   ├── main-app/
│   │   ├── package.json
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env                        # 本地子应用地址
│   │   └── src/
│   │       ├── main.ts                 # 启动 qiankun
│   │       ├── App.vue                 # 导航 + 容器
│   │       ├── micro/
│   │       │   ├── apps.ts             # 子应用注册表
│   │       │   └── state.ts            # 全局状态通信
│   │       └── env.d.ts                # Vite 环境变量类型
│   ├── sub-react/
│   │   ├── package.json
│   │   ├── webpack.config.js
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   └── index.html              # 独立运行时的 HTML
│   │   └── src/
│   │       ├── index.tsx               # 入口：生命周期 + 独立运行
│   │       ├── App.tsx                 # UI 页面
│   │       ├── public-path.ts          # 运行时 publicPath
│   │       └── declarations.d.ts       # 全局类型声明
│   ├── sub-vue/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html                  # 独立运行时的 HTML
│   │   └── src/
│   │       ├── main.ts                 # 入口：生命周期 + 独立运行
│   │       ├── App.vue                 # UI 页面
│   │       └── public-path.ts          # 运行时 publicPath
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts                # 统一导出
│           ├── utils.ts                # formatDate 等
│           ├── constants.ts            # 公共常量
│           └── types.ts                # 公共类型
```

---

## Task 1: Monorepo 初始化

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: 初始化 root package.json**

```json
{
  "name": "micro-frontend-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "dev:main": "pnpm --filter main-app dev",
    "dev:react": "pnpm --filter sub-react dev",
    "dev:vue": "pnpm --filter sub-vue dev"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
```

- [ ] **Step 3: 验证 workspace 初始化**

Run: `pnpm install`
Expected: 成功完成，生成 pnpm-lock.yaml

- [ ] **Step 4: Commit**

```bash
git init
git add package.json pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "chore: init pnpm workspace monorepo"
```

---

## Task 2: shared 包

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/utils.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "@micro/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "dev": "echo 'shared: no dev server needed'",
    "build": "echo 'shared: consumed directly via workspace'"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建 types.ts**

```ts
export interface GlobalState {
  theme: 'light' | 'dark'
}

export interface QiankunProps {
  container?: HTMLElement
  onGlobalStateChange?: (state: GlobalState, prev: GlobalState) => void
  setGlobalState?: (state: Partial<GlobalState>) => void
}
```

- [ ] **Step 4: 创建 constants.ts**

```ts
export const THEME_LIGHT = 'light' as const
export const THEME_DARK = 'dark' as const
```

- [ ] **Step 5: 创建 utils.ts**

```ts
export function formatDate(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}
```

- [ ] **Step 6: 创建 index.ts 统一导出**

```ts
export { formatDate } from './utils'
export { THEME_LIGHT, THEME_DARK } from './constants'
export type { GlobalState, QiankunProps } from './types'
```

- [ ] **Step 7: 安装依赖并验证**

Run: `pnpm install`
Expected: 成功，无报错

- [ ] **Step 8: Commit**

```bash
git add packages/shared
git commit -m "feat: add @micro/shared package with utils, types and constants"
```

---

## Task 3: 主应用基础搭建（Vue 3 + Vite）

**Files:**
- Create: `packages/main-app/package.json`
- Create: `packages/main-app/tsconfig.json`
- Create: `packages/main-app/vite.config.ts`
- Create: `packages/main-app/index.html`
- Create: `packages/main-app/.env`
- Create: `packages/main-app/src/env.d.ts`
- Create: `packages/main-app/src/main.ts`
- Create: `packages/main-app/src/App.vue`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "main-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite --port 8080",
    "build": "vite build",
    "preview": "vite preview --port 8080"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "qiankun": "^2.10.0",
    "@micro/shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.4.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "src/**/*.vue"]
}
```

- [ ] **Step 3: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 8080,
    cors: true,
  },
})
```

- [ ] **Step 4: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>微前端主应用</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 5: 创建 .env**

```env
VITE_SUB_REACT_URL=//localhost:8081
VITE_SUB_VUE_URL=//localhost:8082
```

- [ ] **Step 6: 创建 src/env.d.ts**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUB_REACT_URL: string
  readonly VITE_SUB_VUE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

- [ ] **Step 7: 创建 src/App.vue**

```vue
<template>
  <div class="main-app" :class="theme">
    <header class="nav-bar">
      <h1>微前端 Demo</h1>
      <nav>
        <a href="/" @click.prevent="navigateTo('/')">首页</a>
        <a href="/sub-react" @click.prevent="navigateTo('/sub-react')">React 子应用</a>
        <a href="/sub-vue" @click.prevent="navigateTo('/sub-vue')">Vue 子应用</a>
      </nav>
      <button @click="toggleTheme">
        主题: {{ theme }}
      </button>
    </header>

    <main>
      <div v-if="currentPath === '/'" class="home">
        <h2>欢迎使用微前端 Demo</h2>
        <p>点击导航加载子应用</p>
      </div>
      <div id="sub-container"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GlobalState } from '@micro/shared'

const theme = ref<GlobalState['theme']>('light')
const currentPath = ref(window.location.pathname)

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

function navigateTo(path: string) {
  history.pushState(null, '', path)
  currentPath.value = path
}

window.addEventListener('popstate', () => {
  currentPath.value = window.location.pathname
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

.main-app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.main-app.dark {
  background: #1a1a2e;
  color: #eee;
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 24px;
  background: #2d3748;
  color: white;
}

.nav-bar h1 { font-size: 18px; }

.nav-bar nav { display: flex; gap: 16px; }

.nav-bar a {
  color: #90cdf4;
  text-decoration: none;
}

.nav-bar a:hover { text-decoration: underline; }

.nav-bar button {
  margin-left: auto;
  padding: 6px 12px;
  border: 1px solid #90cdf4;
  background: transparent;
  color: #90cdf4;
  border-radius: 4px;
  cursor: pointer;
}

.home {
  padding: 48px;
  text-align: center;
}

#sub-container {
  padding: 24px;
}
</style>
```

- [ ] **Step 8: 创建 src/main.ts（暂不注册子应用）**

```ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 9: 安装依赖并验证主应用启动**

Run: `pnpm install && pnpm dev:main`
Expected: 浏览器访问 http://localhost:8080 看到导航栏和首页内容

- [ ] **Step 10: Commit**

```bash
git add packages/main-app
git commit -m "feat: scaffold main-app with Vue 3 + Vite"
```

---

## Task 4: React 子应用搭建

**Files:**
- Create: `packages/sub-react/package.json`
- Create: `packages/sub-react/tsconfig.json`
- Create: `packages/sub-react/webpack.config.js`
- Create: `packages/sub-react/public/index.html`
- Create: `packages/sub-react/src/public-path.ts`
- Create: `packages/sub-react/src/declarations.d.ts`
- Create: `packages/sub-react/src/App.tsx`
- Create: `packages/sub-react/src/index.tsx`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "sub-react",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@micro/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "css-loader": "^7.1.0",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^4.0.0",
    "ts-loader": "^9.5.0",
    "typescript": "^5.4.0",
    "webpack": "^5.90.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^5.0.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建 webpack.config.js**

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { name } = require('./package.json')

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/[name].[contenthash:8].js',
    publicPath: '/',
    library: `${name}-[name]`,
    libraryTarget: 'umd',
    chunkLoadingGlobal: `webpackJsonp_${name}`,
    globalObject: 'window',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    port: 8081,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  },
}
```

- [ ] **Step 4: 创建 public/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React 子应用</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

- [ ] **Step 5: 创建 src/public-path.ts**

```ts
if ((window as any).__POWERED_BY_QIANKUN__) {
  // qiankun 会在子应用 window 上注入 __INJECTED_PUBLIC_PATH_BY_QIANKUN__
  // 确保子应用的静态资源（图片、字体）能正确加载
  __webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}
```

- [ ] **Step 6: 创建 src/declarations.d.ts**

```ts
declare let __webpack_public_path__: string

interface Window {
  __POWERED_BY_QIANKUN__?: boolean
  __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string
  reactFlag?: boolean
}
```

- [ ] **Step 7: 创建 src/App.tsx**

```tsx
import { useState, useEffect } from 'react'
import { formatDate } from '@micro/shared'
import type { QiankunProps } from '@micro/shared'

interface AppProps {
  qiankunProps?: QiankunProps
}

export default function App({ qiankunProps }: AppProps) {
  const [theme, setTheme] = useState('light')
  const [time, setTime] = useState(formatDate())

  useEffect(() => {
    const timer = setInterval(() => setTime(formatDate()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (qiankunProps?.onGlobalStateChange) {
      qiankunProps.onGlobalStateChange((state) => {
        setTheme(state.theme)
      })
    }
  }, [qiankunProps])

  // 演示 JS 沙箱：设置一个全局变量
  useEffect(() => {
    window.reactFlag = true
  }, [])

  return (
    <div className="sub-react" style={{ background: theme === 'dark' ? '#2d2d2d' : '#fff', color: theme === 'dark' ? '#eee' : '#333', padding: '24px' }}>
      <h2 style={{ color: '#61dafb' }}>React 子应用</h2>
      <ul>
        <li>当前主题: <strong>{theme}</strong> (来自全局状态通信)</li>
        <li>当前时间: <strong>{time}</strong> (来自 @micro/shared formatDate)</li>
        <li>window.reactFlag: <strong>{String(window.reactFlag)}</strong></li>
        <li>运行环境: <strong>{window.__POWERED_BY_QIANKUN__ ? '微前端模式' : '独立运行'}</strong></li>
      </ul>
    </div>
  )
}
```

- [ ] **Step 8: 创建 src/index.tsx**

```tsx
import './public-path'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import type { QiankunProps } from '@micro/shared'

let root: ReactDOM.Root | null = null

function render(props: QiankunProps = {}) {
  const container = props.container
    ? props.container.querySelector('#root')
    : document.getElementById('root')

  root = ReactDOM.createRoot(container as HTMLElement)
  root.render(<App qiankunProps={props} />)
}

// 独立运行
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun 生命周期
export async function bootstrap() {
  console.log('[sub-react] bootstrap')
}

export async function mount(props: QiankunProps) {
  console.log('[sub-react] mount', props)
  render(props)
}

export async function unmount() {
  console.log('[sub-react] unmount')
  root?.unmount()
  root = null
}
```

- [ ] **Step 9: 安装依赖并验证独立运行**

Run: `pnpm install && pnpm dev:react`
Expected: 浏览器访问 http://localhost:8081 看到 React 子应用页面，显示"独立运行"

- [ ] **Step 10: Commit**

```bash
git add packages/sub-react
git commit -m "feat: scaffold sub-react with Webpack UMD output and qiankun lifecycle"
```

---

## Task 5: Vue 子应用搭建

**Files:**
- Create: `packages/sub-vue/package.json`
- Create: `packages/sub-vue/tsconfig.json`
- Create: `packages/sub-vue/vite.config.ts`
- Create: `packages/sub-vue/index.html`
- Create: `packages/sub-vue/src/public-path.ts`
- Create: `packages/sub-vue/src/App.vue`
- Create: `packages/sub-vue/src/main.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "sub-vue",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite --port 8082",
    "build": "vite build",
    "preview": "vite preview --port 8082"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "@micro/shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.4.0",
    "vite-plugin-qiankun": "^1.0.15",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "src/**/*.vue"]
}
```

- [ ] **Step 3: 创建 vite.config.ts**

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
})
```

- [ ] **Step 4: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue 子应用</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 5: 创建 src/public-path.ts**

```ts
// Vite + vite-plugin-qiankun 自动处理 publicPath
// 此文件预留给需要手动处理的场景
export {}
```

- [ ] **Step 6: 创建 src/App.vue**

```vue
<template>
  <div class="sub-vue" :style="{ background: theme === 'dark' ? '#2d2d2d' : '#fff', color: theme === 'dark' ? '#eee' : '#333', padding: '24px' }">
    <h2 style="color: #42b883">Vue 子应用</h2>
    <ul>
      <li>当前主题: <strong>{{ theme }}</strong> (来自全局状态通信)</li>
      <li>当前时间: <strong>{{ time }}</strong> (来自 @micro/shared formatDate)</li>
      <li>window.reactFlag: <strong>{{ reactFlagValue }}</strong> (验证 JS 沙箱隔离)</li>
      <li>运行环境: <strong>{{ env }}</strong></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { formatDate } from '@micro/shared'

const theme = ref('light')
const time = ref(formatDate())
const reactFlagValue = ref(String((window as any).reactFlag))
const env = ref((window as any).__POWERED_BY_QIANKUN__ ? '微前端模式' : '独立运行')

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    time.value = formatDate()
    reactFlagValue.value = String((window as any).reactFlag)
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

defineExpose({ theme })
</script>
```

- [ ] **Step 7: 创建 src/main.ts**

```ts
import './public-path'
import { createApp, type App as VueApp } from 'vue'
import {
  renderWithQiankun,
  qiankunWindow,
} from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'
import type { QiankunProps } from '@micro/shared'

let app: VueApp | null = null

function render(props: QiankunProps = {}) {
  const container = props.container
    ? props.container.querySelector('#app')
    : document.getElementById('app')

  app = createApp(App)
  app.mount(container as HTMLElement)

  if (props.onGlobalStateChange) {
    props.onGlobalStateChange((state) => {
      const appInstance = app?._instance
      if (appInstance?.exposed) {
        appInstance.exposed.theme.value = state.theme
      }
    })
  }
}

renderWithQiankun({
  bootstrap() {
    console.log('[sub-vue] bootstrap')
  },
  mount(props) {
    console.log('[sub-vue] mount', props)
    render(props)
  },
  unmount() {
    console.log('[sub-vue] unmount')
    app?.unmount()
    app = null
  },
  update() {},
})

// 独立运行
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
```

- [ ] **Step 8: 安装依赖并验证独立运行**

Run: `pnpm install && pnpm dev:vue`
Expected: 浏览器访问 http://localhost:8082 看到 Vue 子应用页面，显示"独立运行"

- [ ] **Step 9: Commit**

```bash
git add packages/sub-vue
git commit -m "feat: scaffold sub-vue with vite-plugin-qiankun and lifecycle"
```

---

## Task 6: 主应用注册子应用 + qiankun 启动

**Files:**
- Create: `packages/main-app/src/micro/apps.ts`
- Create: `packages/main-app/src/micro/state.ts`
- Modify: `packages/main-app/src/main.ts`
- Modify: `packages/main-app/src/App.vue`

- [ ] **Step 1: 创建 micro/apps.ts**

```ts
import type { RegistrableApp } from 'qiankun'

const apps: RegistrableApp<Record<string, unknown>>[] = [
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

export default apps
```

- [ ] **Step 2: 创建 micro/state.ts**

```ts
import { initGlobalState, type MicroAppStateActions } from 'qiankun'
import type { GlobalState } from '@micro/shared'
import { THEME_LIGHT } from '@micro/shared'

const initialState: GlobalState = {
  theme: THEME_LIGHT,
}

const actions: MicroAppStateActions = initGlobalState(initialState)

export default actions
```

- [ ] **Step 3: 修改 main.ts 注册并启动 qiankun**

```ts
import { createApp } from 'vue'
import { registerMicroApps, start } from 'qiankun'
import App from './App.vue'
import apps from './micro/apps'

createApp(App).mount('#app')

registerMicroApps(apps, {
  beforeLoad: [async (app) => console.log('[主应用] beforeLoad', app.name)],
  beforeMount: [async (app) => console.log('[主应用] beforeMount', app.name)],
  afterUnmount: [async (app) => console.log('[主应用] afterUnmount', app.name)],
})

start({
  sandbox: {
    strictStyleIsolation: true,
  },
})
```

- [ ] **Step 4: 修改 App.vue 接入全局状态**

将 `<script setup>` 部分替换为：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { GlobalState } from '@micro/shared'
import actions from './micro/state'

const theme = ref<GlobalState['theme']>('light')
const currentPath = ref(window.location.pathname)

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  actions.setGlobalState({ theme: theme.value })
}

function navigateTo(path: string) {
  history.pushState(null, '', path)
  currentPath.value = path
}

window.addEventListener('popstate', () => {
  currentPath.value = window.location.pathname
})
</script>
```

- [ ] **Step 5: 全量启动验证**

Run: `pnpm dev`
Expected:
- 主应用 http://localhost:8080 显示导航
- 点击 "React 子应用" → URL 变为 /sub-react，React 子应用加载显示
- 点击 "Vue 子应用" → URL 变为 /sub-vue，Vue 子应用加载显示
- 点击主题按钮 → 子应用主题跟随切换
- Console 显示生命周期日志

- [ ] **Step 6: Commit**

```bash
git add packages/main-app/src/micro packages/main-app/src/main.ts packages/main-app/src/App.vue
git commit -m "feat: register sub-apps with qiankun, enable global state communication"
```
