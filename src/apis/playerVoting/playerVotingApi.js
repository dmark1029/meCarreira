import { all, call, put, select, takeLatest } from 'redux-saga/effects'
import { v4 as uuidv4 } from 'uuid'

import {
  getRequest,
  makeGetRequest,
  makeGetRequestAdvance,
} from '../axiosClient'
import {
  fetchComingPlayerList,
  fetchMyVotingPlayerList,
  fetchVotingPlayerList,
  fetchVotingStats,
  getVotingPlayerListTabular,
  getVotingPlayerListTabularSuccess,
  resetComingPlayerList,
  resetMyVotingPlayerList,
  resetVotingPlayerList,
  setComingPlayerList,
  setLoading,
  setMyVotingPlayerList,
  setVotingPlayerList,
  setVotingStats,
  updateVotingPlayerListTabular,
  updateVotingPlayerListTabularSuccess,
} from './playerVotingSlice'
import { API_CONSTANTS as constants } from '@root/constants'

function* fetchVotingStatsAPI(action) {
  try {
    // yield put(setLoading(true))

    const response = yield call(() =>
      makeGetRequest(`players/vote_player_request_availablity/`),
    )
    yield put(setVotingStats(response.data))
  } catch (error) {
    // yield put(fetchSinglePlayer24hStatsError(error))
  } finally {
    // yield put(setLoading(false))
  }
}
function* fetchVotingPlayerListAPI(action) {
  try {
    const state = yield select()

    let remainingUrl
    // if (state?.playerVoting?.votingPlayerListNext) {
    //   const parsedUrl = new URL(state?.playerVoting?.votingPlayerListNext)
    //   remainingUrl = url.replace(parsedUrl.origin, '')
    // } else {
    //   yield put(setLoading(true))
    // }

    const response = yield call(() =>
      makeGetRequest(
        remainingUrl
          ? remainingUrl
          : `players/approved_requested_player/?offset=0&limit=12`,
      ),
    )
    yield put(setVotingPlayerList(response.data))
  } catch (error) {
    yield resetVotingPlayerList(error)
    // yield put(fetchSinglePlayer24hStatsError(error))
  } finally {
    yield put(setLoading(false))
  }
}

function* fetchComingPlayerListAPI(action) {
  try {
    yield put(setLoading(true))
    const response = yield call(() =>
      makeGetRequest(`players/requested_coming_soon_players`),
    )
    yield put(setComingPlayerList(response.data))
  } catch (error) {
    yield resetComingPlayerList(error)
    // yield put(fetchSinglePlayer24hStatsError(error))
  } finally {
    yield put(setLoading(false))
  }
}

function* fetchMyVotingPlayerListAPI(action) {
  try {
    yield put(setLoading(true))
    const response = yield call(() =>
      makeGetRequest(`players/my_requested_player/`),
    )
    yield put(setMyVotingPlayerList(response.data))
  } catch (error) {
    yield put(resetMyVotingPlayerList(error))

    // yield put(fetchSinglePlayer24hStatsError(error))
  } finally {
    yield put(setLoading(false))
  }
}
// Tabular
function* getVotingPlayerListTabularAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(
        constants.HOST_URL + '/players/approved_requested_player/',
      )
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      console.log(response.data)

      if (response?.data?.success === true || true) {
        yield put(getVotingPlayerListTabularSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(getVotingPlayerListTabularSuccess({}))
  }
}

function* updateVotingPlayerListTabularAPI(action) {
  let response
  try {
    if (action.payload) {
      const url = new URL(
        constants.HOST_URL + '/players/approved_requested_player/',
      )
      const searchParams = url.searchParams
      const paramSet = Object.keys(action.payload)
      for (let i = 0; i < paramSet.length; i++) {
        searchParams.set(paramSet[i], action.payload[paramSet[i]])
      }
      response = yield call(() => makeGetRequest(url.toString()))

      if (response?.data?.success === true || true) {
        yield put(updateVotingPlayerListTabularSuccess(response.data))
      }
    }
  } catch (error) {
    yield put(updateVotingPlayerListTabularSuccess({}))
  }
}

export default function* rootSaga() {
  // xxx
  yield all([
    takeLatest(fetchVotingStats, fetchVotingStatsAPI),
    takeLatest(fetchVotingPlayerList, fetchVotingPlayerListAPI),
    takeLatest(fetchMyVotingPlayerList, fetchMyVotingPlayerListAPI),
    takeLatest(fetchComingPlayerList, fetchComingPlayerListAPI),
    takeLatest(getVotingPlayerListTabular, getVotingPlayerListTabularAPI),
    takeLatest(updateVotingPlayerListTabular, updateVotingPlayerListTabularAPI),
  ])
}
