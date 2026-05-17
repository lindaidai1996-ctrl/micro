import { useState, useEffect, useCallback, useMemo } from 'react'
import { formatDate, eventBus } from '@micro/shared'
import { capitalize } from 'lodash'
import './style.css'

interface QiankunProps {
  container?: HTMLElement
  onGlobalStateChange?: (
    callback: (state: Record<string, any>, prev: Record<string, any>) => void
  ) => void
  setGlobalState?: (state: Record<string, any>) => void
}

interface AppProps {
  qiankunProps?: QiankunProps
}

export default function App({ qiankunProps }: AppProps) {
  const [theme, setTheme] = useState('light')
  const [time, setTime] = useState(formatDate())
  const [inputMsg, setInputMsg] = useState('')
  const [receivedMessages, setReceivedMessages] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => setTime(formatDate()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (qiankunProps?.onGlobalStateChange) {
      qiankunProps.onGlobalStateChange((state, _prev) => {
        setTheme(state.theme)
      })
    }
  }, [qiankunProps])

  useEffect(() => {
    window.reactFlag = true
  }, [])

  const onVueMessage = useCallback((msg: string) => {
    setReceivedMessages((prev) => [...prev, msg])
  }, [])

  useEffect(() => {
    eventBus.on('msg:vue-to-react', onVueMessage)
    return () => eventBus.off('msg:vue-to-react', onVueMessage)
  }, [onVueMessage])

  function sendMessage() {
    if (!inputMsg.trim()) return
    eventBus.emit('msg:react-to-vue', inputMsg)
    setInputMsg('')
  }

  const isDark = theme === 'dark'

  const infoItems = useMemo(() => [
    { icon: '🎨', label: '当前主题', value: theme, tag: '全局状态通信' },
    { icon: '🕐', label: '当前时间', value: time, tag: 'shared/formatDate' },
    { icon: '🔒', label: 'window.reactFlag', value: String(window.reactFlag), tag: 'JS 沙箱隔离' },
    { icon: '🖥', label: '运行环境', value: window.__POWERED_BY_QIANKUN__ ? '微前端模式' : '独立运行', tag: 'qiankun 检测' },
    { icon: '📦', label: 'lodash capitalize', value: capitalize('hello'), tag: '第三方库共享' },
  ], [theme, time])

  return (
    <div className={`sub-react ${isDark ? 'dark' : ''}`}>
      <div className="app-header">
        <span className="app-badge react">React 18</span>
        <h2>React 子应用</h2>
      </div>

      <div className="info-grid">
        {infoItems.map((item) => (
          <div className="info-card" key={item.label}>
            <span className="info-icon">{item.icon}</span>
            <div>
              <span className="info-label">{item.label}</span>
              <strong className="info-value">{item.value}</strong>
            </div>
            <span className="info-tag">{item.tag}</span>
          </div>
        ))}
      </div>

      <div className="eventbus-card">
        <div className="card-header">
          <span className="card-icon">📡</span>
          <h3>EventBus 通信</h3>
          <span className="card-tag">子应用间通信</span>
        </div>
        <div className="send-area">
          <input
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入消息发送给 Vue 子应用..."
          />
          <button onClick={sendMessage}>发送</button>
        </div>
        <div className="receive-area">
          <p className="receive-label">来自 Vue 的消息</p>
          {receivedMessages.length > 0 ? (
            <div className="message-list">
              {receivedMessages.map((msg, i) => (
                <div className="message-bubble" key={i}>
                  <span className="bubble-from">Vue</span>
                  {msg}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-hint">等待消息中...</p>
          )}
        </div>
      </div>
    </div>
  )
}
