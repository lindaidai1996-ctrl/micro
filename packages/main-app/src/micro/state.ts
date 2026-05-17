import { initGlobalState, type MicroAppStateActions } from 'qiankun'
import type { GlobalState } from '@micro/shared'
import { THEME_LIGHT } from '@micro/shared'

const initialState: GlobalState = {
  theme: THEME_LIGHT,
}

const actions: MicroAppStateActions = initGlobalState(initialState)

export default actions
