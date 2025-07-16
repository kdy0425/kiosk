import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'

import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { VhclSearchModal, VhclRow } from '@/components/bs/popup/VhclSearchModal'

import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

interface RegisterModalProps {
  vhclNo?: string
  handleDataToParent?: (childData: any) => void
}

const RegisterModalForm = (props: RegisterModalProps) => {
  const { vhclNo, handleDataToParent } = props

  const [vhclOpen, setVhclOpen] = useState(false)
  const [params, setParams] = useState({
    vhclNo: vhclNo ?? '',
    locgovCd: '',
    crno: '',
    crnoEncpt: '',
    koiCd: '',
    vhclTonCd: '',
    lcnsTpbizCd: '',
    vonrNm: '',
    vonrRrno: '',
    telno: '',
    vonrBrno: '',
    bzmnSeCd: '',
    bzentyNm: '',
    rprsvNm: '',
    rfidTagId: '',
    locgovNm: '',
    rcptSeqNo: '',
    prcsSttsCd: '',
  })

  useEffect(() => {
    console.log('!!!!!!!!!!!!!' + vhclNo)
    if (vhclNo != undefined) {
      fetchData(vhclNo)
    }
  }, [])

  const fetchData = async (vhclNo: string) => {
    try {
      let endpoint: string =
        `/fsm/cad/rtrm/tr/getOneRfidTagRequstMng?` +
        `${vhclNo ? '&vhclNo=' + vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setParams((prev) => ({
          ...prev,
          vhclNo: response.data.vhclNo,
          locgovCd: response.data.locgovCd,
          locgovNm: response.data.locgovNm,
          rcptSeqNo: response.data.rcptSeqNo,
          crno: response.data.crno,
          crnoEncpt: response.data.crnoEncpt,
          koiCd: response.data.koiCd,
          vhclTonCd: response.data.vhclTonCd,
          lcnsTpbizCd: response.data.lcnsTpbizCd,
          vonrNm: response.data.vonrNm,
          vonrRrno: response.data.vonrRrno,
          vonrBrno: response.data.vonrBrno,
          bzmnSeCd: response.data.bzmnSeCd,
          bzentyNm: response.data.bzentyNm,
          rprsvNm: response.data.rprsvNm,
          rfidTagId: response.data.rfidTagId,
          prcsSttsCd: response.data.prcsSttsCd,
          telno: response.data.telno,
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const setVhcl = (vhclRow: VhclRow) => {
    setParams((prev) => ({
      ...prev,
      vonrNm: vhclRow.vonrNm, // 소유자명
      vhclNo: vhclRow.vhclNo, // 차량번호
      vhclTonCd: vhclRow.vhclTonCd, // 톤수코드
      locgovCd: vhclRow.locgovCd, // 지자체코드
      locgovNm: vhclRow.locgovNm, // 지자체코드명
      vonrBrno: vhclRow.vonrBrno, // 사업자번호
      koiCd: vhclRow.koiCd, // 유종
      crno: vhclRow.crnoS, // 주민사업자번호
      bzentyNm: vhclRow.bzentyNm, // 업체명
      rprsvNm: vhclRow.rprsvNm, // 대표자명
      vonrRrno: vhclRow.vonrRrnoS, // 주민등록번호
    }))

    setVhclOpen(false)
  }

  useEffect(() => {
    handleDataToParent?.(params)
  }, [params])

  return (
    <Box>
      <TableContainer style={{ margin: '16px 0 4em 0' }}>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size={'small'}
        >
          <TableBody>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left', width: '10%' }}
              >
                <span className="required-text">*</span> 차량번호
              </TableCell>
              <TableCell>
                {/* <span>{vhclNo ? vhclNo : ''}</span> */}

                {!vhclNo ? (
                  <>
                    <CustomFormLabel className="input-label-none" htmlFor=""></CustomFormLabel>
                    <CustomTextField
                      type="text"
                      name="vhclNo"
                      value={params.vhclNo ? params.vhclNo : ''}
                      //onInput={handleSearchChange}
                      visuallyHidden
                      readOnly
                      style={{ width: '70%' }}
                    />
                    &nbsp;
                    <Button
                      onClick={() => setVhclOpen(true)}
                      variant="contained"
                      color="primary"
                    >
                      선택
                    </Button>
                    <VhclSearchModal
                      onCloseClick={() => setVhclOpen(false)}
                      onRowClick={setVhcl}
                      title="차량번호 조회"
                      url="/fsm/stn/dm/tr/getUserVhcle"
                      open={vhclOpen}
                    />
                  </>
                ) : (
                  <>
                    <CustomFormLabel className="input-label-none" htmlFor=""></CustomFormLabel>
                    <CustomTextField
                      type="text"
                      name="vhclNo"
                      value={params.vhclNo ? params.vhclNo : ''}
                      //onInput={handleSearchChange}
                      visuallyHidden
                      readOnly
                      style={{ width: '100%' }}
                    />
                  </>
                )}
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left', width: '10%' }}
              >
                <span className="required-text">*</span> 소유자명
              </TableCell>
              <TableCell>
              <CustomFormLabel className="input-label-none" htmlFor=""></CustomFormLabel>
                <CustomTextField
                  type="text"
                  name="vonrNm"
                  value={params.vonrNm ? params.vonrNm : ''}
                  //onChange={handleSearchChange}
                  readOnly
                  fullWidth
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left', width: '10%' }}
              >
                <span className="required-text">*</span> 주민사업자번호
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor=""></CustomFormLabel>
                <CustomTextField
                  type="text"
                  name="crno"
                  value={params.crno ? params.crno : ''}
                  //onChange={handleSearchChange}
                  readOnly
                  fullWidth
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left', width: '10%' }}
              >
                <span className="required-text">*</span> 주민등록번호
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor=""></CustomFormLabel>
                <CustomTextField
                  type="text"
                  name="vonrRrno"
                  value={params.vonrRrno ? params.vonrRrno : ''}
                  //onChange={handleSearchChange}
                  readOnly
                  fullWidth
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 관할관청
              </TableCell>
              <TableCell>
                {/* <span>{params.locgovNm ? params.locgovNm : ''}</span> */}
                <CustomFormLabel className="input-label-none" htmlFor="ft-locgovCd">관할관청코드</CustomFormLabel>
                <input
                  type="hidden"
                  id="ft-locgovCd"
                  name="locgovCd"
                  value={params.locgovCd ? params.locgovCd : ''}
                />
                <CustomFormLabel className="input-label-none" htmlFor="ft-locgovNm">관할관청명</CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-locgovNm"
                  name="locgovNm"
                  value={params.locgovNm ? params.locgovNm : ''}
                  //onChange={handleSearchChange}
                  visuallyHidden
                  readOnly
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 유종
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="sch-koiCd">유종</CustomFormLabel>
                <CommSelect
                  cdGroupNm="977"
                  pValue={params.koiCd ? params.koiCd : ''}
                  handleChange={handleSearchChange}
                  pName="koiCd"
                  htmlFor={'sch-koiCd'}
                  addText="전체"
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 톤수
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="sch-vhclTonsCd">톤수</CustomFormLabel>
                <CommSelect
                  cdGroupNm="971"
                  pValue={params.vhclTonCd ? params.vhclTonCd : ''}
                  handleChange={handleSearchChange}
                  pName="vhclTonCd"
                  htmlFor={'sch-vhclTonsCd'}
                  addText="전체"
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              ></TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 사업자등록번호
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="ft-vonrBrno">사업자등록번호</CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-vonrBrno"
                  name="vonrBrno"
                  value={params.vonrBrno ? params.vonrBrno : ''}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 업체명
              </TableCell>
              <TableCell colSpan={3}>
                <CustomFormLabel className="input-label-none" htmlFor="ft-bzentyNm">업체명</CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-bzentyNm"
                  name="bzentyNm"
                  value={params.bzentyNm ? params.bzentyNm : ''}
                  onInput={handleSearchChange}
                  fullWidth
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 대표자명
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="ft-rprsvNm">대표자명</CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-rprsvNm"
                  name="rprsvNm"
                  value={params.rprsvNm ? params.rprsvNm : ''}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 면허업종구분
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="sch-lcnsTpbizCd">면허업종구분</CustomFormLabel>
                <CommSelect
                  cdGroupNm="005"
                  pValue={params.lcnsTpbizCd ? params.lcnsTpbizCd : ''}
                  handleChange={handleSearchChange}
                  pName="lcnsTpbizCd"
                  htmlFor={'sch-lcnsTpbizCd'}
                  addText="전체"
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 사업자구분
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="sch-bzmnSeCd">사업자구분</CustomFormLabel>
                <CommSelect
                  cdGroupNm="036"
                  pValue={params.bzmnSeCd ? params.bzmnSeCd : ''}
                  handleChange={handleSearchChange}
                  pName="bzmnSeCd"
                  htmlFor={'sch-bzmnSeCd'}
                  addText="전체"
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 법인등록번호
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="ft-crnoEncpt">법인등록번호</CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-crnoEncpt"
                  name="crnoEncpt"
                  value={params.crnoEncpt ? params.crnoEncpt : ''}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                전화번호
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="ft-telno">전화번호</CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-telno"
                  name="telno"
                  value={params.telno ? params.telno : ''}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> 처리상태
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="sch-prcsSttsCd">처리상태</CustomFormLabel>
                <CommSelect
                  cdGroupNm="087"
                  pValue={params.prcsSttsCd ? params.prcsSttsCd : ''}
                  handleChange={handleSearchChange}
                  pName="prcsSttsCd"
                  htmlFor={'sch-prcsSttsCd'}
                  addText="전체"
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ textAlign: 'left' }}
              >
                <span className="required-text">*</span> RFID태그ID
              </TableCell>
              <TableCell colSpan={5}>
                <CustomFormLabel className="input-label-none" htmlFor="ft-rfidTagId">RFID태그ID</CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-rfidTagId"
                  name="rfidTagId"
                  value={params.rfidTagId ? params.rfidTagId : ''}
                  onInput={handleSearchChange}
                  fullWidth
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default RegisterModalForm
