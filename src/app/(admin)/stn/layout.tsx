// app/stn/layout.tsx
'use client'

import { ReactNode, useState } from 'react'
import HistorySlider from '@/components/history/HistorySlider'
import { TabItem, useTabHistory } from '@/hooks/useTabHistory'

export default function StnLayout({ children }: { children: ReactNode }) {
  const { tabs, add, remove, removeAll } = useTabHistory()
  const [activeUrl, setActiveUrl] = useState<string>('')

  // 자식 페이지가 바뀔 때마다 탭 추가 & 활성화
  // (NavListing → setActiveUrl 호출)

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 네비게이션 */}
      <aside style={{ width: 240 }}>
        {/* NavListing 에 onSelect → add(tab); setActiveUrl(url) */}
      </aside>

      {/* 탭 + 콘텐츠 */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <HistorySlider
          items={tabs}
          onRemove={remove}
          onRemoveAll={removeAll}
          onSelect={(url: string) => setActiveUrl(url)}
        />

        {/* children 자리에 Next.js가 렌더링해 주는 page.tsx가 들어옴 */}
        <div style={{ flex: 1, position: 'relative' }}>
          {children /* 페이지 컴포넌트 */}
        </div>
      </main>
    </div>
  )
}
