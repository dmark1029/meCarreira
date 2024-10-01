import { all, call, put, select, takeLatest } from 'redux-saga/effects'
import { v4 as uuidv4 } from 'uuid'

import {
  getRequest,
  makeGetRequest,
  makeGetRequestAdvance,
} from '../axiosClient'

import { API_CONSTANTS as constants } from '@root/constants'
import {
  getAllTournamentList,
  getAllTournamentListSuccess,
  getTournamentDetails,
  getTournamentDetailSuccess,
  getTournamentMyPlayerRankingList,
  getTournamentMyPlayerRankingListSuccess,
  getTournamentPlayerRankingList,
  getTournamentPlayerRankingListSuccess,
  updateAllTournamentList,
  updateAllTournamentListSuccess,
  updateTournamentMyPlayerRankingList,
  updateTournamentMyPlayerRankingListSuccess,
  updateTournamentPlayerRankingList,
  updateTournamentPlayerRankingListSuccess,
} from './tournamentSlice'

// Tabular
function* getAllTournamentAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(constants.HOST_URL + '/tournaments/all_tournaments/')
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      console.log(response.data)

      if (response?.data?.success === true) {
        yield put(getAllTournamentListSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(getAllTournamentListSuccess({}))
  }
}

function* updateAllTournamentAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(constants.HOST_URL + '/tournaments/all_tournaments/')
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      if (response?.data?.success === true) {
        yield put(updateAllTournamentListSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(updateAllTournamentListSuccess({}))
  }
}
// Tournament Detailed

function* getTournamentDetailsAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(
        constants.HOST_URL + '/tournaments/tournament_details/',
      )
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      console.log(response.data)

      if (
        response?.data?.success === true ||
        response?.data?.message === 'success'
      ) {
        yield put(getTournamentDetailSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(getTournamentDetailSuccess({}))
  }
}

// Player Ranking
function* getTournamentPlayerRankingAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(
        constants.HOST_URL + '/tournaments/tournament_players_ranking/',
      )
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      console.log(response.data)

      if (response?.data?.success === true || true) {
        yield put(getTournamentPlayerRankingListSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(getTournamentPlayerRankingListSuccess({}))
  }
}

function* updateTournamentPlayerRankingAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(
        constants.HOST_URL + '/tournaments/tournament_players_ranking/',
      )
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      if (response?.data?.success === true) {
        yield put(updateTournamentPlayerRankingListSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(updateTournamentPlayerRankingListSuccess({}))
  }
}

// My Player
function* getTournamentMyPlayerRankingAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(
        constants.HOST_URL + '/tournaments/tournament_players_ranking/',
      )
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      console.log(response.data)

      if (response?.data?.success === true || true) {
        yield put(getTournamentMyPlayerRankingListSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(getTournamentMyPlayerRankingListSuccess({}))
  }
}

function* updateTournamentMyPlayerRankingAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(
        constants.HOST_URL + '/tournaments/tournament_players_ranking/',
      )
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      if (response?.data?.success === true) {
        yield put(updateTournamentMyPlayerRankingListSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(updateTournamentMyPlayerRankingListSuccess({}))
  }
}

export default function* rootSaga() {
  yield all([
    takeLatest(getAllTournamentList, getAllTournamentAPI),
    takeLatest(updateAllTournamentList, updateAllTournamentAPI),
    // Tournament Detailed
    takeLatest(getTournamentDetails, getTournamentDetailsAPI),
    // Player Ranking
    takeLatest(getTournamentPlayerRankingList, getTournamentPlayerRankingAPI),
    takeLatest(
      updateTournamentPlayerRankingList,
      updateTournamentPlayerRankingAPI,
    ),
    // My Player
    takeLatest(
      getTournamentMyPlayerRankingList,
      getTournamentMyPlayerRankingAPI,
    ),
    takeLatest(
      updateTournamentMyPlayerRankingList,
      updateTournamentMyPlayerRankingAPI,
    ),
  ])
}
