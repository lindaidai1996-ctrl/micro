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
