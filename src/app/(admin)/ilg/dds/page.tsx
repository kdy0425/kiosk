'use client'
import { Box, Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange } from '@/utils/fsms/common/util'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { ilgDdsTrHeadCell } from '@/utils/fsms/headCells'

// components
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from './_components/TableDataGrid'
import { CtpvSelect, CtpvSelectAll, LocgovSelect, LocgovSelectAll } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import { Pageable2 } from 'table'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '화물의심거래상시점검',
  },
  {
    to: '/ilg/dds',
    title: '의심거래 통계',
  },
]

export interface Row {
  patternName: string
  dtlCnt: number
  investCnt: number
  adminCnt: number
  noSuspectCnt: number
  warnCnt: number
  stop6Cnt: number
  stop12Cnt: number
  gamchaCnt: number
  rdmTrgtNocs: number
  totlAprvAmt: number
  totlAsstAmt: number
  totlActnAmt: number
  localCntR: number
  localCntV: number
  localCntA: number
  localCntD: number
  seq: number
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  bgngAprvYmd: string
  bgngEndYmd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd: '',
    locgovCd: '',
    bgngAprvYmd: '', // 시작일
    bgngEndYmd: '', // 종료일
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(flag != null){
      setRows([])
      fetchData()  
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
    setFlag(prev => !prev)
  }, [])

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('date', 30)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      bgngAprvYmd: startDate,
      bgngEndYmd: endDate,
    }))
  }

  const excelDownload = async () => {

    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try {
      setLoadingBackdrop(true)
      let endpoint: string =
        `/fsm/ilg/dds/tr/doubtDelngStatsExcel?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.bgngEndYmd ? '&endAprvYmd=' + params.bgngEndYmd.replaceAll('-', '') : ''}`

  await  getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      alert(error)
    }finally{
      setLoadingBackdrop(false)
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/dds/tr/getAllDoubtDelngStats?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.bgngEndYmd ? '&endAprvYmd=' + params.bgngEndYmd.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: 1,
        })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(prev => !prev)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false) // 엑셀기능 동작여부
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <PageContainer title="의심거래 통계" description="의심거래 통계">
      {/* breadcrumb */}
      <Breadcrumb title="의심거래 통계" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv" required>
                시도명
              </CustomFormLabel>
              <CtpvSelectAll
                width="70%"
                pValue={params.ctpvCd}
                htmlFor={'sch-ctpv'}
                handleChange={handleSearchChange}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-locgov" required>
                관할관청
              </CustomFormLabel>
              <LocgovSelectAll
                width="70%"
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                기간
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">
                기간 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngAprvYmd"
                value={params.bgngAprvYmd}
                onChange={handleSearchChange}
                inputProps={{max: params.searchEdDate}}
                fullWidth
              />
              ~
              <CustomFormLabel className="input-label-none"htmlFor="ft-date-end">
                기간 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="bgngEndYmd"
                value={params.bgngEndYmd}
                onChange={handleSearchChange}
                inputProps={{min: params.searchStDate}}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button variant="contained" onClick={excelDownload} color="success">
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilgDdsTrHeadCell} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={() => {}} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          onSortModelChange={() => {}} // 정렬 모델 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
