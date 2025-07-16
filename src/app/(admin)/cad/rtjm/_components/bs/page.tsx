import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getDateRange,
  getExcelFile,
  getFormatToday,
  getToday,
} from '@/utils/fsms/common/comm'
import {
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Grid } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Pageable2 } from 'table'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { rfidTagJudgBsHeadCells } from '@/utils/fsms/headCells'
import BsDetail from './BsDetail'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import BsFlModal from './BsFlModal'
import BsRtroactModal from './BsRtroactModal'
import BsVhclStopSearchModal from './BsVhclStopSearchModal'
import BsDetailModal from './BsDetailModal'

export interface Row {
  rcptYmd: string
  rcptSeqNo: string
  rcptSn: string
  locgovCd: string
  locgovNm: string
  vhclNo: string
  koiCd: string
  koiNm: string
  vhclTonCd: string
  vhclTonNm: string
  vhclSeCd: string
  vhclSeNm: string
  lcnsTpbizCd: string
  lcnsTpbizNm: string
  lbrctStleCd: string
  lbrctStleNm: string
  telno: string
  vonrRrno: string
  vonrRrnoSc: string
  vonrBrno: string
  vonrNm: string
  bzmnSeCd: string
  bzmnSeNm: string
  bzentyNm: string
  rprsvNm: string
  rprsvRrno: string
  crnoEncpt: string
  idntyYmd: string
  flRsnCn: string
  flRsnCd: string
  flRsnNm: string
  brno: string
  crno: string
  rrno: string
  flnm: string
  prcsSttsCd: string
  prcsSttsNm: string
  aprvYn: string
  aprvNm: string
  aprvYmd: string
  errCd: string
  etcCn: string
  delYn: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  preVhclNo: string
  preVhclSeCd: string
  preVhclSeNm: string
  preVhclSttsCd: string
  preVhclSttsNm: string
  preLocgovCd: string
  preLocgovNm: string
  preBrno: string
  preCrno: string
  preBzentyNm: string
  preBzmnSeCd: string
  preBzmnSeNm: string
  preRprsvNm: string
  preRprsvRrno: string
  prePrsvRrno: string
  preDscntYn: string
  preKoiCd: string
  preKoiNm: string
  netVhclNo: string
  netNoLbl: string
  netReowUserNo: string
  netReowNm: string
  netLocgovCd: string
  netLocgovNm: string
  netKoiCd: string
  netKoiNm: string
  netUsgDtlSeNm: string
  netScrapNm: string
  netLastUpdate: string
  crdcoCd: string
  crdcoNm: string
  cardNo: string
  cardVldYm: string
  cardSttsCd: string
  crdtCeckSeCd: string
  crdtCeckSeNm: string
  dscntYn: string
  confTyp: string
  stopYn: string
  rtroactBgngYmd: string
}

// 목록 조회시 필요한 조건
export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  aprvYn: string
  koiCd: string
  bzentyNm: string
  vhclSeCd: string
  vhclNo: string
  bgngDt: string
  endDt: string
}

const BusPage = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [procGb, setProcGb] = useState<string>('')

  const [vhclStopOpen, setVhclStopOpen] = useState<boolean>(false)

  const [flOpen, setFlOpen] = useState<boolean>(false)
  const [flBackdrop, setFlBackdrop] = useState(false)

  const [aprvOpen, setAprvOpen] = useState<boolean>(false)
  const [aprvBackdrop, setAprvBackdrop] = useState(false)

  const [detailOpen, setDetailOpen] = useState<boolean>(false)
  const [detailBackdrop, setDetailBackdrop] = useState(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    aprvYn: '',
    bgngDt: '',
    endDt: '',
    vhclSeCd: '',
    koiCd: '',
    vhclNo: '',
    bzentyNm: '',
  })

  // 페이징 처리를 위한 객체
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  // 화면 최초로드시
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      bgngDt: getDateRange('d', 30).startDate,
      endDt: getDateRange('d', 30).endDate,
    }))
  }, [])

  useEffect(() => {
    if (rows.length > 0) handleRowClick(rows[0], 0)
  }, [rows])

  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  const schValidation = () => {
    if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
      return false
    } else if (!params.bgngDt || !params.endDt) {
      alert('접수일자를 입력해주세요.')
      return false
    } else {
      return true
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRows([]) // 체크박스 초기화
    setSelectedIndex(-1)
    setLoading(true)
    try {
      if (schValidation()) {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/fsm/cad/rtjm/bs/getAllRfidTagJdgmnMng?page=${params.page}&size=${params.size}` +
          `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
          `${params.aprvYn ? '&aprvYn=' + params.aprvYn : ''}` +
          `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
          `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
          `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
          `${params.bgngDt ? '&startRcvYmd=' + params.bgngDt.replaceAll('-', '') : ''}` +
          `${params.endDt ? '&endRcvYmd=' + params.endDt.replaceAll('-', '') : ''}`

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
            totalPages: response.data.totalPages, // totalCount는 pageable 객체 밖에
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
      setFlag(false)
      setExcelFlag(true)
    }
  }

  // 엑셀 다운로드
  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    let endpoint: string =
      `/fsm/cad/rtjm/bs/getExcelRfidTagJdgmnMng?` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.aprvYn ? '&aprvYn=' + params.aprvYn : ''}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
      `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
      `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
      `${params.bgngDt ? '&startRcvYmd=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endRcvYmd=' + params.endDt.replaceAll('-', '') : ''}`

    await getExcelFile(endpoint, 'RFID태그심사관리_버스' + getToday() + '.xlsx')
  }

  const flModalOpen = (gb: string) => {
    setProcGb(gb)
    if (gb === '1') {
      if (selectedIndex === -1) {
        alert('선택된 내역이 없습니다.')
        return
      }
      if (rows[selectedIndex].aprvYn !== 'X') {
        alert('심사요청 상태가 아닙니다.')
        return
      }
    } else if (gb === '2') {
      if (selectedRows.length === 0) {
        alert('선택된 내역이 없습니다.')
        return
      }
      let aprvFlag = true
      selectedRows.map((id) => {
        if (rows[selectedIndex].aprvYn !== 'X') aprvFlag = false
      })
      if (!aprvFlag) {
        alert('심사요청 상태가 아닙니다.')
        return
      }
    }
    setFlOpen(true)
  }

  const flClick = (flRsnCd: string, flRsnCn: string) => {
    if (!flRsnCd) {
      alert('탈락유형을 선택해주세요.')
      return
    }

    if (procGb === '1') {
      flRfid(flRsnCd, flRsnCn)
    } else if (procGb === '2') {
      flRfids(flRsnCd, flRsnCn)
    }
  }

  const flRfid = async (flRsnCd: string, flRsnCn: string) => {
    if (!confirm('탈락처리 하시겠습니까?')) return

    let endpoint: string = `/fsm/cad/rtjm/bs/approveRfidTagJdgmnMng`

    let body = {
      rcptYmd: rows[selectedIndex].rcptYmd,
      rcptSn: rows[selectedIndex].rcptSn,
      vhclNo: rows[selectedIndex].vhclNo,
      aprvYn: 'N',
      flRsnCd: flRsnCd,
      flRsnCn: flRsnCn,
    }
    try {
      setFlBackdrop(true)
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('탈락처리 되었습니다.')
        setFlOpen(false)
        fetchData()
      } else {
        alert('탈락처리 오류입니다.')
      }
    } catch (error) {
      alert(error)
    } finally {
      setFlBackdrop(false)
    }
  }

  const flRfids = async (flRsnCd: string, flRsnCn: string) => {
    if (!confirm('탈락처리 하시겠습니까?')) return

    let selectedList: any[] = []
    if (selectedRows) {
      selectedRows.map((id) => {
        let reqData = {
          rcptYmd: rows[Number(id.replace('tr', ''))].rcptYmd,
          rcptSn: rows[Number(id.replace('tr', ''))].rcptSn,
          vhclNo: rows[Number(id.replace('tr', ''))].vhclNo,
          aprvYn: 'N',
          flRsnCd: flRsnCd,
          flRsnCn: flRsnCn,
        }

        selectedList.push(reqData)
      })
    }
    let body = {
      list: selectedList,
    }

    let endpoint: string = '/fsm/cad/rtjm/bs/approveAllRfidTagJdgmnMng'
    try {
      setFlBackdrop(true)
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('탈락처리 되었습니다.')
        setFlOpen(false)
        fetchData()
      } else {
        alert('탈락처리 오류입니다.')
      }
    } catch (error) {
      alert(error)
    } finally {
      setFlBackdrop(false)
    }
  }

  const stopCheck = (gb: string) => {
    setProcGb(gb)
    if (gb === '1') {
      if (selectedIndex === -1) {
        alert('선택된 내역이 없습니다.')
        return
      }
      if (rows[selectedIndex].aprvYn !== 'X') {
        alert('심사요청 상태가 아닙니다.')
        return
      }
    }
    if (rows[selectedIndex].stopYn === 'Y') {
      setVhclStopOpen(true)
      return
    }

    if (gb === '1') {
      if (rows[selectedIndex].confTyp !== '00') {
        setDetailOpen(true)
      } else {
        aprvModalOpen(gb)
      }
    }
  }

  useEffect(() => {
    if (!vhclStopOpen && selectedIndex > -1) {
      if (rows[selectedIndex].confTyp !== '00') {
        setDetailOpen(true)
      } else {
        aprvModalOpen(procGb)
      }
    }
  }, [vhclStopOpen])

  useEffect(() => {
    if (aprvOpen) setDetailOpen(false)
  }, [aprvOpen])

  const aprvModalOpen = (gb: string) => {
    setProcGb(gb)
    if (gb === '2') {
      if (selectedRows.length === 0) {
        alert('선택된 내역이 없습니다.')
        return
      }
      let aprvFlag = true
      selectedRows.map((id) => {
        if (rows[selectedIndex].aprvYn !== 'X') aprvFlag = false
      })
      if (!aprvFlag) {
        alert('심사요청 상태가 아닙니다.')
        return
      }
    }
    setAprvOpen(true)
  }

  const aprvClick = (rtroactYmd: string, etcCn: string) => {
    if (procGb === '1') {
      aprvRfid(rtroactYmd, etcCn)
    } else if (procGb === '2') {
      aprvRfids(rtroactYmd, etcCn)
    }
  }

  const aprvRfid = async (rtroactYmd: string, etcCn: string) => {
    if (!confirm('승인처리 하시겠습니까?')) return

    let endpoint: string = `/fsm/cad/rtjm/bs/approveRfidTagJdgmnMng`

    let body = {
      rcptYmd: rows[selectedIndex].rcptYmd,
      rcptSn: rows[selectedIndex].rcptSn,
      vhclNo: rows[selectedIndex].vhclNo,
      aprvYn: 'Y',
      rtroactBgngYmd: rtroactYmd.replaceAll('-', ''),
      etcCn: etcCn,
    }
    try {
      setAprvBackdrop(true)
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('승인처리 되었습니다.')
        setAprvOpen(false)
        fetchData()
      } else {
        alert('승인처리 오류입니다.')
      }
    } catch (error) {
      alert(error)
    } finally {
      setAprvBackdrop(false)
    }
  }

  const aprvRfids = async (rtroactYmd: string, etcCn: string) => {
    if (!confirm('승인처리 하시겠습니까?')) return

    let selectedList: any[] = []
    if (selectedRows) {
      selectedRows.map((id) => {
        let reqData = {
          rcptYmd: rows[Number(id.replace('tr', ''))].rcptYmd,
          rcptSn: rows[Number(id.replace('tr', ''))].rcptSn,
          vhclNo: rows[Number(id.replace('tr', ''))].vhclNo,
          aprvYn: 'Y',
          rtroactBgngYmd: rtroactYmd.replaceAll('-', ''),
          etcCn: etcCn,
        }

        selectedList.push(reqData)
      })
    }
    let body = {
      list: selectedList,
    }

    let endpoint: string = '/fsm/cad/rtjm/bs/approveAllRfidTagJdgmnMng'
    try {
      setAprvBackdrop(true)
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('승인처리 되었습니다.')
        setAprvOpen(false)
        fetchData()
      } else {
        alert('승인처리 오류입니다.')
      }
    } catch (error) {
      alert(error)
    } finally {
      setAprvBackdrop(false)
    }
  }

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }
  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag(true)
    },
    [],
  )
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  const handleCheckChange = (selected: string[]) => {
    setSelectedRows(selected)
  }
  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
  }, [])

  return (
    <>
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>
                시도명&nbsp;&nbsp;&nbsp;&nbsp;
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor={'sch-aprvYn'}
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'564'}
                pValue={params.aprvYn}
                handleChange={handleSearchChange}
                pName={'aprvYn'}
                /* width */
                htmlFor={'sch-aprvYn'}
                addText="전체"
                defaultValue={'X'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                차량유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="977"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                /* width */
                htmlFor={'sch-koiCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                접수일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                시작일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngDt"
                value={params.bgngDt}
                onChange={handleSearchChange}
                inputProps={{ max: getFormatToday() }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                종료일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endDt"
                value={params.endDt}
                onChange={handleSearchChange}
                inputProps={{ min: params.bgngDt, max: getFormatToday() }}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-bzentyNm"
              >
                업체명&nbsp;&nbsp;&nbsp;&nbsp;
              </CustomFormLabel>
              <CustomTextField
                id="ft-bzentyNm"
                name="bzentyNm"
                value={params.bzentyNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclSeCd"
              >
                면허업종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="505"
                pValue={params.vhclSeCd}
                handleChange={handleSearchChange}
                pName="vhclSeCd"
                /* width */
                htmlFor={'sch-vhclSeCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => aprvModalOpen('2')}
            >
              일괄승인
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => flModalOpen('2')}
            >
              일괄탈락
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => stopCheck('1')}
            >
              승인
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => flModalOpen('1')}
            >
              탈락
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={rfidTagJudgBsHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex}
          paging={true}
          cursor={true}
          onCheckChange={handleCheckChange}
          caption={'버스 RFID카드발급심사 목록 조회'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {selectedIndex > -1 ? (
        <Grid item xs={4} sm={4} md={4}>
          {/* 발급심사 상세정보 */}
          <BsDetail data={rows[selectedIndex]} reload={fetchData} />
        </Grid>
      ) : null}

      <BsFlModal
        open={flOpen}
        handleClickClose={() => setFlOpen(false)}
        saveData={flClick}
        isBackdrop={flBackdrop}
      />

      <BsRtroactModal
        open={aprvOpen}
        handleClickClose={() => setAprvOpen(false)}
        saveData={aprvClick}
        isBackdrop={aprvBackdrop}
        defaultRtroactYmd={
          procGb === '1' && selectedIndex > -1
            ? rows[selectedIndex].netLastUpdate
            : ''
        }
      />
      {selectedIndex > -1 ? (
        <BsVhclStopSearchModal
          open={vhclStopOpen}
          data={rows[selectedIndex]}
          handleClickClose={() => setVhclStopOpen(false)}
        />
      ) : null}
      {selectedIndex > -1 ? (
        <BsDetailModal
          open={detailOpen}
          data={rows[selectedIndex]}
          handleClickClose={() => setDetailOpen(false)}
          saveData={() => {
            setAprvOpen(true)
          }}
        />
      ) : null}

      <LoadingBackdrop open={loadingBackdrop} />
    </>
  )
}

export default BusPage
