import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface StnPageState {
  [path: string]: any
}

const initialState: StnPageState = {}

const StnPageStateSlice = createSlice({
  name: 'stnPageState',
  initialState,
  reducers: {
    setPageState: (
      state,
      action: PayloadAction<{ path: string; state: any }>,
    ) => {
      state[action.payload.path] = action.payload.state
    },
    clearPageState: (state, action: PayloadAction<string>) => {
      delete state[action.payload]
    },
  },
})

export const { setPageState, clearPageState } = StnPageStateSlice.actions
export default StnPageStateSlice.reducer
