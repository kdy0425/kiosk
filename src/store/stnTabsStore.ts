'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TabItem {
  title: string
  url: string
}

interface TabState {
  tabs: TabItem[]
  add: (tab: TabItem) => void
  remove: (url: string) => void
  removeAll: () => void
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [],
      add: (tab) =>
        set((state) => {
          if (state.tabs.some((t) => t.url === tab.url)) return state
          return { tabs: [...state.tabs, tab] }
        }),
      remove: (url) =>
        set((state) => ({ tabs: state.tabs.filter((t) => t.url !== url) })),
      removeAll: () => set({ tabs: [] }),
    }),
    { name: 'stn-tabs' }
  )
)
