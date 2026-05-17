<template>
  <div class="sub-vue" :style="{ background: theme === 'dark' ? '#2d2d2d' : '#fff', color: theme === 'dark' ? '#eee' : '#333', padding: '24px' }">
    <h2 class="title" style="color: #42b883">Vue 子应用</h2>
    <ul class="info-list">
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
