'use client'
import React, { useEffect, useState } from 'react'

import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'

import HeaderTab from '@/components/tables/CommHeaderTab'
import HistorySlider from '@/components/history/HistorySlider'
import { useTabHistory } from '@/utils/fsms/common/useTabHistory'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import { SelectItem } from 'select'
import TrPage from './_components/TrPage'
import TxPage from './_components/TxPage'
import BsPage from './_components/BsPage'

interface TabItem {
  title: string
  url: string
}


const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '자격관리',
  },
  {
    to: '/stn/bm',
    title: '사업자관리',
  },
]

const DataList = () => {

  // const userInfo = getUserInfo()

  // 상위 컴포넌트에서 탭 상태 관리
  const [selectedTab, setSelectedTab] = useState('')
  const [tabs, setTabs] = useState<SelectItem[]>([{ value: '', label: '' }])

  const { tabs: historyTabs, remove: removeHistory, removeAll: clearHistory } = useTabHistory()

  useEffect(() => {
    setTabs([
      { value: 'TR', label: '화물' },
      { value: 'TX', label: '택시' },
      { value: 'BS', label: '버스' },
    ])
    setSelectedTab('TR')
  }, [])

  return (
    <PageContainer title="사업자관리" description="사업자관리">
      <HistorySlider
        items={historyTabs}
        onRemove={removeHistory}
        onRemoveAll={clearHistory}
      />
      {/* breadcrumb */}
      <Breadcrumb title="사업자관리" items={BCrumb} />
      <HeaderTab tabs={tabs} onChange={setSelectedTab} />
      {selectedTab === 'TR' ? (
        <TrPage />
      ) : selectedTab === 'TX' ? (
        <TxPage />
      ) : selectedTab === 'BS' ? (
        <BsPage />
      ) : (
        <></>
      )}
    </PageContainer>
  )
}

export default DataList
