export interface GlobalState {
  theme: 'light' | 'dark'
}

export interface QiankunProps {
  container?: HTMLElement
  onGlobalStateChange?: (state: GlobalState, prev: GlobalState) => void
  setGlobalState?: (state: Partial<GlobalState>) => void
}
