"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useDispatch, useSelector } from '@/store/hooks'
import { setPageState } from '@/store/page/StnPageStateSlice'
import type { RootState } from '@/store/store'

/**
 * Persist page specific state in Redux so values survive navigation
 */
export default function useStnPageState<T>(initialState: T) {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const saved = useSelector((state: RootState) => state.stnPageState[pathname]) as T | undefined

  const [state, setState] = useState<T>(saved ?? initialState)

  useEffect(() => {
    return () => {
      dispatch(setPageState({ path: pathname, state }))
    }
  }, [dispatch, pathname, state])

  return [state, setState] as const
}

