/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  voteAvailableIn: 0,
  isPlayerRequestAvailable: null,
  votingPlayerList: [],
  votingPlayerListTabular: [],
  votingPlayerListTabularLoading: false,
  upadtingvotingPlayerListTabular: false,
  votingPlayerListTabularNextUrl: '',
  votingPlayerListTabularPrevUrl: '',
  myPlayersList: [],
  myPlayersListLoading: false,
  comingSoonPlayerList: [],
  comingSoonPlayerListLoading: false,
  votestolaunchplayer: 0,
  minuserlevelrequired: 0,
  minlevelrequiredlisting: 0,
  userlevel: 0,
  isLoading: false,

  votingPlayerListNext: null,
  votingPlayerListCount: 0,
}

const playerVotingSlice = createSlice({
  name: 'playerVoting',
  initialState,
  reducers: {
    fetchVotingStats(state) {
      return state
    },
    setVotingStats(state, action) {
      state.voteAvailableIn = action.payload.voteavailablein
      state.isPlayerRequestAvailable = action.payload.playerrequestavailable
      state.userlevel = action.payload.userlevel
      state.minuserlevelrequired = action.payload.minuserlevelrequired
      state.minlevelrequiredlisting = action.payload.minlevelrequiredlisting
    },

    fetchVotingPlayerList(state) {
      return state
    },
    setVotingPlayerList(state, action) {
      // console.log('player', action.payload.results)

      state.votingPlayerList = action?.payload?.results
      state.votestolaunchplayer = action?.payload?.votestolaunchplayer
      state.votingPlayerListCount = action?.payload?.count
      state.votingPlayerListNext = action?.payload?.next
    },
    resetVotingPlayerList(state, action) {
      // console.log('player', action.payload.results)

      state.votingPlayerList = []
    },
    fetchMyVotingPlayerList(state) {
      state.myPlayersListLoading = true
      return state
    },
    setMyVotingPlayerList(state, action) {
      state.myPlayersList = action?.payload?.data
      state.myPlayersListLoading = false

      // console.log('myplayer', action.payload.data)
    },
    resetMyVotingPlayerList(state, action) {
      state.myPlayersList = []
      state.myPlayersListLoading = false
      // console.log('myplayer', action.payload.data)
    },

    fetchComingPlayerList(state) {
      state.comingSoonPlayerListLoading = true
      return state
    },
    setComingPlayerList(state, action) {
      state.comingSoonPlayerList = action?.payload?.results
      state.comingSoonPlayerListLoading = false
      // console.log('myplayer', action.payload.data)
    },
    resetComingPlayerList(state, action) {
      state.comingSoonPlayerList = []
      state.comingSoonPlayerListLoading = false
      // console.log('myplayer', action.payload.data)
    },

    // Tabular
    getVotingPlayerListTabular(state, action) {
      state.votingPlayerListTabular = []
      state.votingPlayerListTabularLoading = true
    },
    updateVotingPlayerListTabular(state, action) {
      //update scouts leaderboard data
      state.upadtingvotingPlayerListTabular = true
    },
    getVotingPlayerListTabularSuccess(state, action) {
      console.log(action.payload)
      if (action.payload.success || true) {
        state.votingPlayerListTabular = action.payload.results
        state.votingPlayerListTabularNextUrl = action.payload.next
        state.votingPlayerListTabularPrevUrl = action.payload.previous
      }
      state.votingPlayerListTabularLoading = false
    },
    updateVotingPlayerListTabularSuccess(state, action) {
      state.upadtingvotingPlayerListTabular = false
      if (
        (action.payload.success || true) &&
        action.payload.results.length > 0
      ) {
        state.votingPlayerListTabular = state.votingPlayerListTabular.concat(
          action.payload.results,
        )
        if (action.payload.results.length < 10) {
          state.votingPlayerListTabularNextUrl = null
        } else {
          state.votingPlayerListTabularNextUrl = action.payload.next
          state.votingPlayerListTabularPrevUrl = action.payload.previous
        }
      } else {
        state.votingPlayerListTabular = state.votingPlayerListTabular
        state.votingPlayerListTabularNextUrl = null
        state.votingPlayerListTabularPrevUrl = null
      }
    },

    setLoading(state, action) {
      state.isLoading = action.payload
      // console.log('myplayer', action.payload.data)
    },
  },
})

export const {
  fetchVotingStats,
  fetchVotingPlayerList,
  fetchMyVotingPlayerList,
  setVotingStats,
  setMyVotingPlayerList,
  setVotingPlayerList,
  resetVotingPlayerList,
  resetMyVotingPlayerList,
  setLoading,
  fetchComingPlayerList,
  setComingPlayerList,
  resetComingPlayerList,
  getVotingPlayerListTabular,
  updateVotingPlayerListTabular,
  getVotingPlayerListTabularSuccess,
  updateVotingPlayerListTabularSuccess,
} = playerVotingSlice.actions
export default playerVotingSlice.reducer
