<template>
  <div class="sub-vue" :class="{ dark: theme === 'dark' }">
    <div class="app-header">
      <span class="app-badge vue">Vue 3</span>
      <h2>Vue 子应用</h2>
    </div>

    <div class="info-grid">
      <div class="info-card" v-for="item in infoItems" :key="item.label">
        <span class="info-icon">{{ item.icon }}</span>
        <div>
          <span class="info-label">{{ item.label }}</span>
          <strong class="info-value">{{ item.value }}</strong>
        </div>
        <span class="info-tag">{{ item.tag }}</span>
      </div>
    </div>

    <div class="eventbus-card">
      <div class="card-header">
        <span class="card-icon">📡</span>
        <h3>EventBus 通信</h3>
        <span class="card-tag">子应用间通信</span>
      </div>
      <div class="send-area">
        <input v-model="inputMsg" placeholder="输入消息发送给 React 子应用..." @keyup.enter="sendMessage" />
        <button @click="sendMessage">发送</button>
      </div>
      <div class="receive-area">
        <p class="receive-label">来自 React 的消息</p>
        <div class="message-list" v-if="receivedMessages.length">
          <div class="message-bubble" v-for="(msg, i) in receivedMessages" :key="i">
            <span class="bubble-from">React</span>
            {{ msg }}
          </div>
        </div>
        <p v-else class="empty-hint">等待消息中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { formatDate, eventBus } from '@micro/shared'
import { capitalize } from 'lodash'

const theme = ref('light')
const time = ref(formatDate())
const reactFlagValue = ref(String((window as any).reactFlag))
const env = ref((window as any).__POWERED_BY_QIANKUN__ ? '微前端模式' : '独立运行')
const capitalizedWorld = capitalize('world')

const inputMsg = ref('')
const receivedMessages = ref<string[]>([])

const infoItems = computed(() => [
  { icon: '🎨', label: '当前主题', value: theme.value, tag: '全局状态通信' },
  { icon: '🕐', label: '当前时间', value: time.value, tag: 'shared/formatDate' },
  { icon: '🔒', label: 'window.reactFlag', value: reactFlagValue.value, tag: 'JS 沙箱隔离' },
  { icon: '🖥', label: '运行环境', value: env.value, tag: 'qiankun 检测' },
  { icon: '📦', label: 'lodash capitalize', value: capitalizedWorld, tag: '第三方库共享' },
])

function sendMessage() {
  if (!inputMsg.value.trim()) return
  eventBus.emit('msg:vue-to-react', inputMsg.value)
  inputMsg.value = ''
}

function onReactMessage(msg: string) {
  receivedMessages.value.push(msg)
}

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    time.value = formatDate()
    reactFlagValue.value = String((window as any).reactFlag)
  }, 1000)
  eventBus.on('msg:react-to-vue', onReactMessage)
})

onUnmounted(() => {
  clearInterval(timer)
  eventBus.off('msg:react-to-vue', onReactMessage)
})

defineExpose({ theme })
</script>

<style>
.sub-vue {
  padding: 28px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #fff;
  color: #334155;
  transition: all 0.3s;
}

.sub-vue.dark {
  background: #1e293b;
  color: #e2e8f0;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.app-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.app-badge.vue {
  background: linear-gradient(135deg, #42b883, #35495e);
  color: #fff;
}

.app-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.dark .app-header h2 {
  color: #f1f5f9;
}

/* ---- Info Grid ---- */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.info-card:hover {
  border-color: #42b883;
  box-shadow: 0 2px 8px rgba(66,184,131,0.1);
}

.dark .info-card {
  background: #0f172a;
  border-color: #334155;
}

.dark .info-card:hover {
  border-color: #42b883;
}

.info-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.info-card > div {
  flex: 1;
  min-width: 0;
}

.info-label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  word-break: break-all;
}

.dark .info-value {
  color: #e2e8f0;
}

.info-tag {
  flex-shrink: 0;
  font-size: 10px;
  padding: 3px 8px;
  background: rgba(66,184,131,0.1);
  color: #42b883;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;
}

/* ---- EventBus Card ---- */
.eventbus-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  transition: all 0.3s;
}

.dark .eventbus-card {
  background: #0f172a;
  border-color: #334155;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 20px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #42b883;
  flex: 1;
}

.card-tag {
  font-size: 11px;
  padding: 3px 10px;
  background: rgba(66,184,131,0.1);
  color: #42b883;
  border-radius: 6px;
  font-weight: 500;
}

.send-area {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.send-area input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #fff;
  color: #334155;
  outline: none;
  transition: border-color 0.2s;
}

.dark .send-area input {
  background: #1e293b;
  border-color: #475569;
  color: #e2e8f0;
}

.send-area input:focus {
  border-color: #42b883;
}

.send-area button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #42b883, #2d9a6a);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.send-area button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66,184,131,0.3);
}

.receive-label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 10px;
  font-weight: 500;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-bubble {
  padding: 10px 14px;
  background: rgba(66,184,131,0.08);
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark .message-bubble {
  background: rgba(66,184,131,0.12);
}

.bubble-from {
  font-size: 10px;
  padding: 2px 8px;
  background: #61dafb;
  color: #0f172a;
  border-radius: 4px;
  font-weight: 700;
  flex-shrink: 0;
}

.empty-hint {
  color: #94a3b8;
  font-size: 13px;
  font-style: italic;
}
</style>
