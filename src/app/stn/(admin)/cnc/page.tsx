'use client'

// page.tsx
import React, { useEffect, useState } from 'react'

import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'

import HeaderTab from '@/components/tables/CommHeaderTab'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import { SelectItem } from 'select'

import TaxiPage from './_components/Taxi/TaxiPage'
import BusPage from './_components/Bus/BusPage'
import FreightPage from './_components/Freight/FreightPage'

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
    to: '/stn/cnc',
    title: '자동차망비교',
  },
]

const Page = () => {
  const userInfo = getUserInfo()


  // 상위 컴포넌트에서 탭 상태 관리
  const [selectedTab, setSelectedTab] = useState('')
  const [tabs, setTabs] = useState<SelectItem[]>([{ value: '', label: '' }])

  useEffect(() => {
    if (isArray(userInfo.taskSeCd) && userInfo.taskSeCd.length !== 0) {
      const result: SelectItem[] = []
      userInfo.taskSeCd.map((item) => {
        console.log(item)
        if (item === 'TR') {
          result.push({ value: 'TR', label: '화물' })
        } else if (item === 'TX') {
          result.push({ value: 'TX', label: '택시' })
        } else if (item === 'BS') {
          result.push({ value: 'BS', label: '버스' })
        } else {
        }
      })

      setTabs(result)

      if (result.length > 0) {
        setSelectedTab(result[0].value)
      }
    }
  }, [userInfo.taskSeCd])

  return (
    <PageContainer title="자동차망비교조회" description="자동차망비교조회">

      <Breadcrumb title="자동차망비교조회" items={BCrumb} />
      <HeaderTab tabs={tabs} onChange={setSelectedTab} />
      {selectedTab === 'TR' ? (
        <FreightPage />
      ) : selectedTab === 'TX' ? (
        <TaxiPage />
      ) : selectedTab === 'BS' ? (
        <BusPage />
      ) : (
        <></>
      )}
    </PageContainer>
  )
}

export default Page
