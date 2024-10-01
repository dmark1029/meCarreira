import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isNftWinBid: false,
  isUnderMaintenance: false,
}

const nftNavigationSlice = createSlice({
  name: 'nftnavigation',
  initialState,
  reducers: {
    setBeforeNavigate(state) {
      state.isNftWinBid = true
    },
    setAfterNavigate(state) {
      state.isNftWinBid = false
    },
    showMaintenance(state, action) {
      state.isUnderMaintenance = action.payload
    },
  },
})

export const { setBeforeNavigate, setAfterNavigate, showMaintenance } =
  nftNavigationSlice.actions
export default nftNavigationSlice.reducer
