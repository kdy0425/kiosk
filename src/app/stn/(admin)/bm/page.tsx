'use client'
import React, { useEffect, useState } from 'react'

import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'

import HeaderTab from '@/components/tables/CommHeaderTab'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import { SelectItem } from 'select'
import TrPage from './_components/TrPage'
import TxPage from './_components/TxPage'
import BsPage from './_components/BsPage'
import { usePathname } from 'next/navigation'
import { useDispatch, useSelector } from '@/store/hooks'
import { setPageState } from '@/store/page/StnPageStateSlice'
import type { RootState } from '@/store/store'


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
  const pathname = usePathname()
  const dispatch = useDispatch()
  const saved = useSelector((state: RootState) => state.stnPageState[pathname])

  // const userInfo = getUserInfo()

  // 상위 컴포넌트에서 탭 상태 관리
  const [selectedTab, setSelectedTab] = useState(saved?.selectedTab || '')
  const [tabs, setTabs] = useState<SelectItem[]>([{ value: '', label: '' }])


  useEffect(() => {
    setTabs([
      { value: 'TR', label: '화물' },
      { value: 'TX', label: '택시' },
      { value: 'BS', label: '버스' },
    ])
    setSelectedTab((prev) => prev || 'TR')
  }, [])

  useEffect(() => {
    return () => {
      dispatch(setPageState({ path: pathname, state: { selectedTab } }))
    }
  }, [dispatch, pathname, selectedTab])

  return (
    <PageContainer title="사업자관리" description="사업자관리">
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
