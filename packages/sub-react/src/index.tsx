import './public-path'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

let root: ReactDOM.Root | null = null

interface MountProps {
  container?: HTMLElement
  onGlobalStateChange?: (
    callback: (state: Record<string, any>, prev: Record<string, any>) => void
  ) => void
  setGlobalState?: (state: Record<string, any>) => void
}

function render(props: MountProps = {}) {
  const container = props.container
    ? props.container.querySelector('#root')
    : document.getElementById('root')

  root = ReactDOM.createRoot(container as HTMLElement)
  root.render(<App qiankunProps={props} />)
}

if (!(window as any).__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  console.log('[sub-react] bootstrap')
}

export async function mount(props: MountProps) {
  console.log('[sub-react] mount', props)
  render(props)
}

export async function unmount() {
  console.log('[sub-react] unmount')
  root?.unmount()
  root = null
}
