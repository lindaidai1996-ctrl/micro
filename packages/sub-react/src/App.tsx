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

  useEffect(() => {
    window.reactFlag = true
  }, [])

  return (
    <div className="sub-react" style={{ background: theme === 'dark' ? '#2d2d2d' : '#fff', color: theme === 'dark' ? '#eee' : '#333', padding: '24px' }}>
      <h2 className="title" style={{ color: '#61dafb' }}>React 子应用</h2>
      <ul className="info-list">
        <li>当前主题: <strong>{theme}</strong> (来自全局状态通信)</li>
        <li>当前时间: <strong>{time}</strong> (来自 @micro/shared formatDate)</li>
        <li>window.reactFlag: <strong>{String(window.reactFlag)}</strong></li>
        <li>运行环境: <strong>{window.__POWERED_BY_QIANKUN__ ? '微前端模式' : '独立运行'}</strong></li>
      </ul>
    </div>
  )
}
