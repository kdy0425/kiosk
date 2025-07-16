import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface TabItem {
  title: string
  url: string
}

export interface StnTabsState {
  tabs: TabItem[]
}

const initialState: StnTabsState = {
  tabs: [],
}

const StnTabsSlice = createSlice({
  name: 'stnTabs',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<TabItem>) => {
      if (!state.tabs.some((t) => t.url === action.payload.url)) {
        state.tabs.push(action.payload)
      }
    },
    removeTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((t) => t.url !== action.payload)
    },
    removeAllTabs: (state) => {
      state.tabs = []
    },
  },
})

export const { addTab, removeTab, removeAllTabs } = StnTabsSlice.actions
export default StnTabsSlice.reducer
