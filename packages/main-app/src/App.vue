<template>
  <div class="main-app" :class="theme">
    <header class="nav-bar">
      <div class="nav-brand">
        <span class="nav-logo">M</span>
        <h1>Micro Frontend</h1>
      </div>
      <nav class="nav-links">
        <a
          v-for="link in navLinks"
          :key="link.path"
          :href="link.path"
          :class="{ active: currentPath === link.path }"
          @click.prevent="navigateTo(link.path)"
        >
          <span class="nav-icon">{{ link.icon }}</span>
          {{ link.label }}
        </a>
      </nav>
      <button class="theme-btn" @click="toggleTheme">
        {{ theme === 'light' ? '🌙' : '☀️' }}
      </button>
    </header>

    <main>
      <div v-if="currentPath === '/'" class="home">
        <section class="hero">
          <h2>Qiankun 微前端架构 Demo</h2>
          <p>基于 qiankun 构建的多框架协同方案，探索 Vue + React 子应用的集成与通信</p>
        </section>
        <div class="features">
          <div class="feature-card" v-for="f in features" :key="f.title">
            <span class="feature-icon">{{ f.icon }}</span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
      <div id="sub-container"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GlobalState } from '@micro/shared'
import actions from './micro/state'

const theme = ref<GlobalState['theme']>('light')
const currentPath = ref(window.location.pathname)

const navLinks = [
  { path: '/', label: '首页', icon: '⌂' },
  { path: '/sub-react', label: 'React 子应用', icon: '⚛' },
  { path: '/sub-vue', label: 'Vue 子应用', icon: '◆' },
]

const features = [
  { icon: '🧩', title: '多框架共存', desc: 'Vue 3 与 React 18 子应用在同一主应用中无缝切换' },
  { icon: '📡', title: '状态通信', desc: 'GlobalState + EventBus 实现主子应用和子应用间通信' },
  { icon: '🔒', title: 'JS 沙箱隔离', desc: '各子应用运行在独立沙箱中，全局变量互不污染' },
  { icon: '📦', title: '依赖共享', desc: '通过 CDN externals 共享 lodash 等公共库，避免重复打包' },
]

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

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

.main-app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f0f2f5;
  transition: background 0.3s, color 0.3s;
}

.main-app.dark {
  background: #0f172a;
  color: #e2e8f0;
}

/* ---- Nav Bar ---- */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 0 32px;
  height: 60px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 40px;
}

.nav-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 8px;
  font-weight: 800;
  font-size: 16px;
  color: #fff;
}

.nav-bar h1 {
  font-size: 17px;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.3px;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-links a {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-links a:hover {
  color: #e2e8f0;
  background: rgba(255,255,255,0.08);
}

.nav-links a.active {
  color: #fff;
  background: rgba(99,102,241,0.3);
}

.nav-icon {
  font-size: 15px;
}

.theme-btn {
  margin-left: auto;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.25);
}

/* ---- Home Page ---- */
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

.hero {
  text-align: center;
  margin-bottom: 48px;
}

.hero h2 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}

.hero p {
  font-size: 16px;
  color: #64748b;
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.6;
}

.dark .hero p {
  color: #94a3b8;
}

.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.feature-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 28px;
  transition: all 0.25s;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(99,102,241,0.1);
  border-color: #c7d2fe;
}

.dark .feature-card {
  background: #1e293b;
  border-color: #334155;
}

.dark .feature-card:hover {
  border-color: #6366f1;
  box-shadow: 0 8px 24px rgba(99,102,241,0.15);
}

.feature-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 12px;
}

.feature-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}

.dark .feature-card h3 {
  color: #f1f5f9;
}

.feature-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.dark .feature-card p {
  color: #94a3b8;
}

/* ---- Sub Container ---- */
#sub-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}
</style>
