/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  allTournamentList: [],
  allTournamentListLoading: false,
  updatingallTournamentList: false,
  allTournamentListNextUrl: '',
  allTournamentListPrevUrl: '',
  // Tournament Detailed
  tournamentDetailData: null,
  tournamentDetailLoading: false,
  // Player Ranking Api
  tournamentPlayerRankingList: [],
  tournamentListPlayerRankingLoading: false,
  updatingTournamentPlayerRankingList: false,
  tournamentPlayerRankingListNextUrl: '',
  tournamentPlayerRankingListPrevUrl: '',

  // My players
  tournamentMyPlayerRankingList: [],
  tournamentListMyPlayerRankingLoading: false,
  updatingTournamentMyPlayerRankingList: false,
  tournamentMyPlayerRankingListNextUrl: '',
  tournamentMyPlayerRankingListPrevUrl: '',
}

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    // Tabular
    getAllTournamentList(state, action) {
      state.allTournamentList = []
      state.allTournamentListLoading = true
    },
    updateAllTournamentList(state, action) {
      //update scouts leaderboard data
      state.updatingallTournamentList = true
    },
    getAllTournamentListSuccess(state, action) {
      console.log(action.payload)
      if (action.payload.success) {
        state.allTournamentList = action.payload.data
        state.allTournamentListNextUrl = action.payload.next
        state.allTournamentListPrevUrl = action.payload.previous
      }
      state.allTournamentListLoading = false
    },
    updateAllTournamentListSuccess(state, action) {
      state.updatingallTournamentList = false
      if (action.payload.success && action.payload.data.length > 0) {
        state.allTournamentList = state.allTournamentList.concat(
          action.payload.data,
        )
        if (action.payload.data.length < 10) {
          state.allTournamentListNextUrl = null
        } else {
          state.allTournamentListNextUrl = action.payload.next
          state.allTournamentListPrevUrl = action.payload.previous
        }
      } else {
        state.allTournamentList = state.allTournamentList
        state.allTournamentListNextUrl = null
        state.allTournamentListPrevUrl = null
      }
    },
    // Tournament Detailed
    getTournamentDetails(state, action) {
      state.tournamentDetailData = null
      state.tournamentDetailLoading = true
    },
    getTournamentDetailSuccess(state, action) {
      console.log(action.payload)
      if (action.payload.success || action.payload.message === 'success') {
        state.tournamentDetailData = action.payload.data
      }
      state.tournamentDetailLoading = false
    },

    // Player Ranking
    getTournamentPlayerRankingList(state, action) {
      state.tournamentPlayerRankingList = []
      state.tournamentListPlayerRankingLoading = true
    },
    updateTournamentPlayerRankingList(state, action) {
      //update scouts leaderboard data
      state.updatingTournamentPlayerRankingList = true
    },
    getTournamentPlayerRankingListSuccess(state, action) {
      console.log(action.payload)
      if (true) {
        state.tournamentPlayerRankingList = action.payload.results
        state.tournamentPlayerRankingListNextUrl = action.payload.next
        state.tournamentPlayerRankingListPrevUrl = action.payload.previous
      }
      state.tournamentListPlayerRankingLoading = false
    },
    updateTournamentPlayerRankingListSuccess(state, action) {
      state.updatingTournamentPlayerRankingList = false
      if (action.payload.results.length > 0) {
        state.tournamentPlayerRankingList =
          state.tournamentPlayerRankingList.concat(action.payload.results)
        if (action.payload.results.length < 10) {
          state.tournamentPlayerRankingListNextUrl = null
        } else {
          state.tournamentPlayerRankingListNextUrl = action.payload.next
          state.tournamentPlayerRankingListPrevUrl = action.payload.previous
        }
      } else {
        state.tournamentPlayerRankingList = state.tournamentPlayerRankingList
        state.tournamentPlayerRankingListNextUrl = null
        state.tournamentPlayerRankingListPrevUrl = null
      }
    },

    // My Player
    getTournamentMyPlayerRankingList(state, action) {
      state.tournamentMyPlayerRankingList = []
      state.tournamentListMyPlayerRankingLoading = true
    },
    updateTournamentMyPlayerRankingList(state, action) {
      //update scouts leaderboard data
      state.updatingTournamentMyPlayerRankingList = true
    },
    getTournamentMyPlayerRankingListSuccess(state, action) {
      console.log(action.payload)
      if (action.payload.success || true) {
        state.tournamentMyPlayerRankingList = action.payload.results
        state.tournamentMyPlayerRankingListNextUrl = action.payload.next
        state.tournamentMyPlayerRankingListPrevUrl = action.payload.previous
      }
      state.tournamentListMyPlayerRankingLoading = false
    },
    updateTournamentMyPlayerRankingListSuccess(state, action) {
      state.updatingTournamentMyPlayerRankingList = false
      if (action.payload.success && action.payload.data.length > 0) {
        state.tournamentMyPlayerRankingList =
          state.tournamentMyPlayerRankingList.concat(action.payload.data)
        if (action.payload.data.length < 10) {
          state.tournamentMyPlayerRankingListNextUrl = null
        } else {
          state.tournamentMyPlayerRankingListNextUrl = action.payload.next
          state.tournamentMyPlayerRankingListPrevUrl = action.payload.previous
        }
      } else {
        state.tournamentMyPlayerRankingList =
          state.tournamentMyPlayerRankingList
        state.tournamentMyPlayerRankingListNextUrl = null
        state.tournamentMyPlayerRankingListPrevUrl = null
      }
    },
  },
})

export const {
  getAllTournamentList,
  updateAllTournamentList,
  getAllTournamentListSuccess,
  updateAllTournamentListSuccess,
  // Tournament Detailed
  getTournamentDetails,
  getTournamentDetailSuccess,
  // Player Ranking
  getTournamentPlayerRankingList,
  updateTournamentPlayerRankingList,
  getTournamentPlayerRankingListSuccess,
  updateTournamentPlayerRankingListSuccess,
  // My Player
  getTournamentMyPlayerRankingList,
  updateTournamentMyPlayerRankingList,
  getTournamentMyPlayerRankingListSuccess,
  updateTournamentMyPlayerRankingListSuccess,
} = tournamentSlice.actions
export default tournamentSlice.reducer
