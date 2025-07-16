'use client'
import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NavListing from '@/app/(admin)/layout/vertical/navbar-top/NavListing/NavListing'
import HistorySlider from '@/components/history/HistorySlider'
import { useTabStore } from '@/store/stnTabsStore'

export default function StnLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { tabs, add, remove, removeAll } = useTabStore()

  useEffect(() => {
    const title = document.title || '페이지'
    add({ title, url: pathname })
  }, [pathname, add])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 240 }}>
        <NavListing />
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <HistorySlider items={tabs} onRemove={remove} onRemoveAll={removeAll} />
        <div style={{ flex: 1, position: 'relative' }}>{children}</div>
      </main>
    </div>
  )
}
