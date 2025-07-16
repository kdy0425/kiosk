import React from 'react'

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Button,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
// MUI 그리드 한글화 import
import * as locales from '@mui/material/locale'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import { HeadCell, Pageable2 } from 'table'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { useState, useEffect } from 'react'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import {
  dateTimeFormatter,
  getDateTimeString,
  brNoFormatter,
  getCommaNumber,
} from '@/utils/fsms/common/util'
import Loading from '@/app/loading'
import CircularProgress from '@mui/material/CircularProgress'
import { telnoFormatter } from '@/utils/fsms/common/comm'
type SupportedLocales = keyof typeof locales

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: any[] // 목록 데이터
  totalRows?: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange?: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick?: (row: any, rowIndex?: number, colIndex?: number) => void // 행 클릭 핸들러 추가
  onRowDoubleClick?: (row: any, index?: number) => void // 행 클릭 핸들러 추가
  pageable?: Pageable2 // 페이지 정보
  paging?: boolean // 페이징여부
  selectedRowIndex?: number
  onCheckChange?: (selected: string[]) => void
  cursor?: boolean
  oneCheck? : boolean     // 한개의 데이터만
  customHeader?: (handleSelectAll?: (event: React.ChangeEvent<HTMLInputElement>) => void) => React.ReactNode
  split?: boolean
  caption?: string
}

type order = 'asc' | 'desc'

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
  headCells,
  rows,
  totalRows,
  loading,
  onPaginationModelChange,
  onRowClick,
  onRowDoubleClick,
  pageable,
  paging,
  selectedRowIndex,
  onCheckChange,
  cursor,
  oneCheck,
  customHeader,
  split,
  caption,
}) => {
  const [selected, setSelected] = React.useState<readonly string[]>([])

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row, index) => 'tr' + index)
      setSelected(newSelected)
      onCheckChange?.(newSelected)
      return
    }
    setSelected([])
    onCheckChange?.([])
  }

  const handleCheckboxChange = (index: number) => {
    const id = 'tr' + index
    setSelected(
      (prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id) // 선택 해제
          : [...prev, id], // 선택 추가
    )
  }

  const handleSelect = (id: string) => {
    const selectedIndex = selected.indexOf(id);
  
    const newSelected =
      selectedIndex === -1
        ? oneCheck
          ? [id] // `oneCheck`이 true면 새로운 ID만 저장
          : [...selected, id] // 선택 추가
        : selected.filter((item) => item !== id); // 선택 해제
  
    setSelected(newSelected);
    onCheckChange?.(newSelected);
  };




  // 테이블 th 정의 기능
  function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
    const { headCells } = props

    return (
      <TableHead>
        <TableRow key={'thRow'}>
          {headCells.map((headCell, i) => (
            <React.Fragment key={'th' + i}>
              {headCell.format === 'checkbox' ? (
                <TableCell padding="checkbox">
                  
                  {oneCheck ?
                      null
                      : 
                    <CustomCheckbox
                      indeterminate={
                        selected.length > 0 && selected.length < rows.length
                      }
                      checked={selected.length === rows.length}
                      onChange={handleSelectAll}
                      tabIndex={-1}
                      inputProps={{
                        'aria-labelledby': 'select all desserts',
                      }}
                      />
                  }
                </TableCell>
              ) : (
                <TableCell
                  align={'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <div className="table-head-text">{headCell.label}</div>
                </TableCell>
              )}
            </React.Fragment>
          ))}
        </TableRow>
      </TableHead>
    )
  }

  function TableBottomToolbar() {
    const pageSizes = [
      {
        value: '10',
        label: '10',
      },
      {
        value: '20',
        label: '20',
      },
      {
        value: '50',
        label: '50',
      },
    ]

    // Select
    const [pageSize, setPageSize] = React.useState(pageable?.pageSize)
    const handleChangeSelect = (event: any) => {
      onPaginationModelChange?.(0, event.target.value)
    }

    return (
      <div className="data-grid-bottom-toolbar">
        <div className="data-grid-select-count">
          총 {getCommaNumber(totalRows ?? 0)}개
        </div>
        <CustomFormLabel
          className="input-label-none"
          htmlFor="data-grid-row-count-select"
        >
          테이블 데이터 갯수
        </CustomFormLabel>
        {pageable ? (
          <>
            <select
              id="data-grid-row-count-select"
              className="custom-default-select"
              value={pageSize}
              onChange={handleChangeSelect}
            >
              {pageSizes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="data-grid-row-count-select">줄씩보기</div>
          </>
        ) : (
          <></>
        )}
      </div>
    )
  }

  // 페이지 변경시 사이즈를 유지하고 페이지 이동
  const handleChangePage = (event: unknown, newPage: number) => {
    if(pageable?.totalPages === 0) return
    onPaginationModelChange?.(newPage, pageable?.pageSize ?? 0)
  }

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  function getRowspan(index: number, colNm: string) {
    let count = 1
    const colValue = rows[index][colNm]

    if (!colValue) return count

    for (let i = index + 1; i < rows.length; i++) {
      if (rows[i][colNm] === colValue) {
        count++
      } else {
        break
      }
    }
    return count
  }

  function isRowspan(index: number, colNm: string) {
    if (
      index > 0 &&
      rows[index][colNm] &&
      rows[index - 1][colNm] === rows[index][colNm]
    ) {
      return true
    } else {
      return false
    }
  }

  function getColspan(row: any, headCells: HeadCell[], index: number) {
    const colValue = row[headCells[index].id]
    let count = 1
    if (colValue === '소계' || colValue === '합계' 
       || colValue === '부정수급액'  || colValue === '환수대상금액'  
     ) {
      for (let i = index + 1; i < headCells.length; i++) {
        if (!row[headCells[i].id]) {
          console.log(row['_SUB']) // 0
          console.log(headCells[i].id) // ID값 ex _SUB 51120
          count++
        } else {
          break
        }
      }
    }
    return count
  }

  function isColspan(row: any, headCells: HeadCell[], index: number) {
    if (!row[headCells[index].id]) {
      for (let i = index - 1; i > -1; i--) {
        if (row[headCells[i].id]) {
          if (
            row[headCells[i].id] === '소계' ||
            row[headCells[i].id] === '합계' 
            || row[headCells[i].id] === '부정수급액' ||   row[headCells[i].id] === '환수대상금액' 

          )
            return true
          else return false
        }
      }
    }
    return false
  }

  function getCellValue(row: any, headCell: any) {
    try {
      if (headCell.format === 'brno') {
        return brNoFormatter(row[headCell.id])
      } else if (headCell.format === 'lit') {
        return Number(row[headCell.id]).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      } else if (headCell.format === 'number') {
        return getCommaNumber(row[headCell.id])
      } else if (headCell.format === 'yyyymm') {
        return getDateTimeString(row[headCell.id], 'mon')?.dateString
      } else if (headCell.format === 'yyyymmdd') {
        return getDateTimeString(row[headCell.id], 'date')?.dateString
      } else if (headCell.format === 'yyyymmddhh24miss') {
        return dateTimeFormatter(row[headCell.id])
      } else if (headCell.format === 'hh24miss') {
        return getDateTimeString(row[headCell.id], 'time')?.timeString
      } else if (headCell.format === 'yyyy년mm월') {
        if (isNaN(row[headCell.id])) return row[headCell.id]
        let dateString = getDateTimeString(row[headCell.id], 'mon')?.dateString

        let year = dateString?.substring(0, 4)
        let month = dateString?.substring(5, 7)

        return year + '년 ' + month + '월'
      } else if (headCell.format === 'yyyy년') {
        if (isNaN(row[headCell.id])) return row[headCell.id]
        return row[headCell.id] + '년'
      } else if (headCell.format === 'telno') {
        return telnoFormatter(row[headCell.id]);
      } else {
        return row[headCell.id]
      }
    } catch (error) {
      console.error('Error get City Code data:', error)
    }
    return ''
  }

  useEffect(() => {
    const initialSelected = rows
      .map((row, index) => (row.chk === '1' ? 'tr' + index : null))
      .filter((id) => id !== null)
    setSelected(initialSelected)
  }, [rows])

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
        <TableContainer>
          <Table
            sx={(split || split == null) ? { minWidth: '750' } : { }}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            {caption ? (
            <>
              <caption>{caption}</caption>
            </>
            ) : (
            <><caption>테이블 내용</caption></>
            )}

            {customHeader ? (
              customHeader(handleSelectAll)
            ) : (
              <EnhancedTableHead headCells={headCells} />
            )}
            <TableBody>
               {!loading ? 
                 rows.length > 0 ? rows.map((row: any, index) => {
                   return (
                     //<TableRow hover key={'tr'+index} onClick={() => onRowClick?.(row, index)}>
                      <TableRow
                                              hover
                                              selected={selectedRowIndex == index}
                                              key={'tr' + index}
                                              sx={cursor ? { cursor: 'pointer' } : {}}
                                              onClick={() => onRowClick?.(row, index)}
                                            >
                       <TableCell>
                         {row.lgnId}
                       </TableCell>
                       <TableCell>
                         {row.userNm}
                       </TableCell>
                       <TableCell>
                         {row.locgovNm}
                       </TableCell>
                       <TableCell>
                         {row.roleNm}
                       </TableCell>
                       <TableCell>
                         {row.changeNm}
                       </TableCell>
                        {row.nowInstNm == row.beInstNm ? <TableCell style={{color: 'black'}}>{row.beInstNm}</TableCell> 
                        : <TableCell style={{color: 'red'}}>{row.beInstNm}</TableCell>}
                        {row.nowInstCd == row.beInstCd ? <TableCell style={{color: 'black'}}>{row.beInstCd}</TableCell> 
                        : <TableCell style={{color: 'red'}}>{row.beInstCd}</TableCell>}
                        {row.nowDeptNm == row.beDeptNm ? <TableCell style={{color: 'black'}}>{row.beDeptNm}</TableCell> 
                        : <TableCell style={{color: 'red'}}>{row.beDeptNm}</TableCell>}
                        {row.nowDeptCd == row.beDeptCd ? <TableCell style={{color: 'black'}}>{row.beDeptCd}</TableCell> 
                        : <TableCell style={{color: 'red'}}>{row.beDeptCd}</TableCell>}
                        {row.beInstNm == row.nowInstNm ? <TableCell style={{color: 'black'}}>{row.nowInstNm}</TableCell> 
                        : <TableCell style={{color: 'red'}}>{row.nowInstNm}</TableCell>}
                        {row.beInstCd == row.nowInstCd ? <TableCell style={{color: 'black'}}>{row.nowInstCd}</TableCell> 
                        : <TableCell style={{color: 'red'}}>{row.nowInstCd}</TableCell>}
                        {row.beDeptNm == row.nowDeptNm ? <TableCell style={{color: 'black'}}>{row.nowDeptNm}</TableCell> 
                        : <TableCell style={{color: 'red'}}>{row.nowDeptNm}</TableCell>}
                        {row.beDeptCd == row.nowDeptCd ? <TableCell style={{color: 'black'}}>{row.nowDeptCd}</TableCell> 
                        : <TableCell style={{color: 'red'}}>{row.nowDeptCd}</TableCell>}
                     </TableRow>
                   )
                 }) : 
                 <TableRow key={'tr0'}>
                   <TableCell colSpan={headCells.length} className='td-center'><p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p></TableCell>
                 </TableRow>
               : 
                <TableRow key={'tr0'}>
                    <TableCell colSpan={headCells.length} className="td-center">
                      <p>
                        <CircularProgress />
                      </p>
                    </TableCell>
                </TableRow>
             }
            </TableBody>
          </Table>
        </TableContainer>

        {/* <CustomFormLabel className="input-label-none" htmlFor="tablePagination" >페이지</CustomFormLabel> */}
        {!loading ? (
          <>
            {pageable ? (
              <div className="pagination-wrapper">
                <Pagination
                  count={pageable?.totalPages === 0 ? 1 : pageable?.totalPages}
                  variant="outlined"
                  showFirstButton
                  showLastButton
                  page={pageable?.pageNumber}
                  onChange={handleChangePage}
                />
              </div>
            ) : null}
            {totalRows ? <TableBottomToolbar /> : null}
          </>
        ) : null}
      </div>
    </ThemeProvider>
  )
}

export default React.memo(TableDataGrid)
