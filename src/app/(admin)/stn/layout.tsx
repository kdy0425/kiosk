'use client'
import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NavListing from '@/app/(admin)/layout/vertical/navbar-top/NavListing/NavListing'
import HistorySlider from '@/components/history/HistorySlider'
import { useDispatch, useSelector } from '@/store/hooks'
import { addTab, removeTab, removeAllTabs } from '@/store/page/StnTabsSlice'
import type { RootState } from '@/store/store'

export default function StnLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const tabs = useSelector((state: RootState) => state.stnTabs.tabs)

  useEffect(() => {
    const title = document.title || '페이지'
    dispatch(addTab({ title, url: pathname }))
  }, [pathname, dispatch])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 240 }}>
        <NavListing />
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <HistorySlider
          items={tabs}
          onRemove={(url) => dispatch(removeTab(url))}
          onRemoveAll={() => dispatch(removeAllTabs())}
        />
        <div style={{ flex: 1, position: 'relative' }}>{children}</div>
      </main>
    </div>
  )
}
