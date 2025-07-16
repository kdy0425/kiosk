'use client'
import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import HistorySlider from '@/components/history/HistorySlider'
import NavListing from '@/app/(admin)/layout/vertical/navbar-top/NavListing/NavListing'
import { useDispatch, useSelector } from '@/store/hooks'
import { addTab, removeTab, removeAllTabs } from '@/store/page/StnTabsSlice'
import type { RootState } from '@/store/store'
import AdminLayout from '@/app/(admin)/layout'

export default function StnLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const tabs = useSelector((state: RootState) => state.stnTabs.tabs)

  useEffect(() => {
    const title = document.title || '페이지'
    dispatch(addTab({ title, url: pathname }))
  }, [pathname, dispatch])

  return (
    <AdminLayout>
      <div style={{ display: 'flex', minHeight: '100%' }}>
        <aside style={{ width: 240 }}>
          <NavListing />
        </aside>
        <div style={{ flex: 1 }}>
          <HistorySlider
            items={tabs}
            onRemove={(url) => dispatch(removeTab(url))}
            onRemoveAll={() => dispatch(removeAllTabs())}
          />
          {children}
        </div>
      </div>
    </AdminLayout>
  )
}
