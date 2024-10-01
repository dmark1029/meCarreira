/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppLayout } from '@components/index'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import {
  initTagManager,
  isMobile,
  toKPIIntegerFormat,
  toKPINumberFormat,
  toUsd,
} from '@utils/helpers'
import '@assets/css/pages/NftList.css'
import classNames from 'classnames'
import {
  fetchListPlayersLatestTrades,
  getScoutsCount,
  getScoutsLeaderboard,
  getScoutsTop,
  getTourScoutsCount,
  getTourScoutsLeaderboard,
  getTourScoutsTop,
  updateScoutsLeaderboard,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { useTranslation } from 'react-i18next'
import PlayerListTabGroup from '@pages/PlayerList/components/PlayerListTabGroup'
import debounce from 'lodash.debounce'
import { getFeedPlayers } from '@root/apis/playerCoins/playerCoinsSlice'
import '@assets/css/pages/Scouts.css'
import UserCardSkeleton from '@components/Card/UserCardSkeleton'
import ScoutsCard from '@components/Card/ScoutsCard'
import LandingSearchInput from '@components/Form/LandingSearchInput'
import SearchInput from '@components/Form/SearchInput'
import { useNavigate } from 'react-router-dom'
import ScoutsCardSupporter from '@components/Card/ScoutsCardSupporter'
import InfiniteScroll from 'react-infinite-scroll-component'
import SearchIcon from '@mui/icons-material/Search'
import Spinner from '@components/Spinner'
import Typed from 'typed.js'
import classnames from 'classnames'
import { postRequestAuth } from '@root/apis/axiosClientAuth'
import {
  setTourCategories,
  setTourCategoryId,
} from '@root/apis/onboarding/authenticationSlice'
import {
  fetchComingPlayerList,
  fetchMyVotingPlayerList,
  fetchVotingPlayerList,
  fetchVotingStats,
  getVotingPlayerListTabular,
  updateVotingPlayerListTabular,
} from '@root/apis/playerVoting/playerVotingSlice'
import { PlayerItem } from '@pages/Landing/TabularVotePlayers'

const getUrlParams = (
  url: string,
  param1: string,
  param2: string,
  param3: string,
) => {
  if (!url) {
    return url
  }
  const url_string = url
  const newUrl = new URL(url_string)
  const obj: any = new Object()
  obj[param1] = newUrl.searchParams.get(param1)
  obj[param2] = newUrl.searchParams.get(param2)
  obj[param3] = newUrl.searchParams.get(param3)
  return obj
}
interface FiltersData {
  limit?: any
  offset?: any
  search?: string
  type?: string
}
const PlayerVotingTabularInfiniteScroll: React.FC = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchedTerm, setSearchedTerm] = useState<string | undefined>('')
  const [searchAll, setSearchAll] = useState(false)

  const {
    votingPlayerListTabular,
    votingPlayerListTabularLoading,
    upadtingvotingPlayerListTabular,
    votingPlayerListTabularNextUrl,
  } = useSelector((state: RootState) => state.playerVoting)

  const [scrollIndex, setScrollIndex] = useState(0)
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const accessToken = localStorage.getItem('accessToken')
  const {
    currencyRate,
    ipLocaleCurrency,
    getUserSettingsData,
    tourStep,
    tourCategories,
  } = authenticationData
  const navigate = useNavigate()
  const currencySymbol =
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD'
  const [itemList, setItemList] = useState<any>([])
  const [appliedFilters, setAppliedFilters] = useState<FiltersData>({
    search: '',
    type: 'new',
  })
  const leaderboardFilters = {
    search: '',
    offset: 0,
    // offset: 5,
    limit: 10,
  }
  const [isDeadEnd, setIsDeadEnd] = useState(false)

  const handleGetTab = (tab: string) => {
    setActiveTab(tab)
    setItemList([])
    let newParams: any = { type: tab }
    if (searchedTerm) {
      newParams = { ...newParams, search: searchedTerm }
    }
    setAppliedFilters(newParams)
  }

  const handleSearch = (value: string | undefined) => {
    if (value === '') {
      setSearchAll(false)
    } else {
      setSearchAll(true)
    }
    setItemList([])
    setIsDeadEnd(false)
    let request: any = {}
    setSearchedTerm(value)
    request = {
      limit: 10,
      offset: 0,
      search: value || '',
    }
    dispatch(getVotingPlayerListTabular(request))
  }

  const handleJumpToPage = (head: string) => {
    if (head !== 'back') {
      const paginationParams = getUrlParams(
        votingPlayerListTabularNextUrl,
        'limit',
        'offset',
        'search',
      )
      if (votingPlayerListTabularNextUrl) {
        setIsDeadEnd(false)
        // setLeaderboardFilters({ ...leaderboardFilters, ...paginationParams })
        dispatch(updateVotingPlayerListTabular(paginationParams))
      } else {
        setIsDeadEnd(true)
      }
    }
  }

  useEffect(() => {
    if (votingPlayerListTabularNextUrl) {
      setIsDeadEnd(false)
    } else {
      setIsDeadEnd(true)
    }
  }, [votingPlayerListTabularNextUrl])

  const optimizedHandleSearch = useCallback(debounce(handleSearch, 500), [])

  const handleCloseSearch = () => {
    setSearchAll(false)
    if (searchedTerm !== '') {
      setSearchedTerm('')
      let newParams: any = { type: activeTab }
      if (searchedTerm) {
        newParams = { ...newParams, search: searchedTerm }
      }
      setAppliedFilters(newParams)
      const request = {
        limit: 10,
        offset: 0,
        // offset: 5,
        search: '',
      }
      dispatch(getVotingPlayerListTabular(request))
    }
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    if (tourStep === 'scout') {
      dispatch(getTourScoutsCount())
      dispatch(getTourScoutsLeaderboard())
      dispatch(getTourScoutsTop())
      setHasTour(true)
    } else {
      dispatch(getScoutsCount())
      dispatch(getVotingPlayerListTabular(leaderboardFilters))
      dispatch(getScoutsTop())
    }
  }, [])

  const leaderboardSearchHandle = (str: string) => {
    const request = {
      limit: 10,
      offset: 0,
      search: str || '',
    }
    dispatch(getVotingPlayerListTabular(request))
  }

  const [isSearchEnabled, setSearchEnabled] = useState(false)

  const handleClose = () => {
    setSearchEnabled(false)
    handleCloseSearch()
  }

  const handleSearchInput = () => {
    setSearchEnabled(true)
  }

  const [step, setStep] = useState(1)
  const [hasTour, setHasTour] = useState(false)
  const [showButton, setShowButton] = useState(false)

  const typedRef = useRef(null)

  useEffect(() => {
    if (step === 1) {
      const scout1 = document.querySelector(
        '.tab-bar-container',
      ) as HTMLDivElement | null
      scout1?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }
  }, [step]) // put in useEffect because on clicking on show more in leaderboard it's scroll to top
  useEffect(() => {
    if (hasTour && !isMobile()) {
      document.body.style.overflow = 'hidden'
    }
  }, [hasTour])
  useEffect(() => {
    const scouts2 = document.querySelector(
      '.scouts-top5-container',
    ) as HTMLDivElement | null
    const scouts3 = document.querySelector(
      '.scouts-leaderboard-container',
    ) as HTMLDivElement | null
    const brightAreaDiv = document.querySelector(
      '.bright-area',
    ) as HTMLDivElement | null
    if (scouts2 && step === 2) {
      scouts2?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      return
    }
    if (scouts3 && step === 3) {
      scouts3?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      return
    }
    if (brightAreaDiv) {
      brightAreaDiv?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    }
  }, [step])
  useEffect(() => {
    let typed = null
    if (hasTour) {
      setShowButton(false)

      let string = ''
      if (step === 1) {
        string = t('view_three_core_values')
      } else if (step === 2) {
        string = t('the_top_five_scouts')
      } else if (step === 3) {
        string = t('the_rest_of_the_traders')
      }
      const options = {
        strings: [string],
        typeSpeed: 25,
        backSpeed: 30,
        loop: false,
        showCursor: false,
        onStringTyped: () => {
          setShowButton(true)
        },
      }
      typed = new Typed(typedRef.current, options)
      // Cleanup: Destroy Typed instance on component unmount
    }
    return () => {
      if (typed) {
        typed.destroy()
      }
    }
  }, [step, hasTour])

  const handleNextStep = async () => {
    if (step === 3) {
      // FYI need to integrate api
      try {
        await postRequestAuth('accounts/wallet_app_tour_categories/', {
          categoryId: 3,
        })
      } catch (error) {
        console.log(error)
      }
      dispatch(setTourCategories({ ...tourCategories, 3: true }))
      dispatch(setTourCategoryId(0))
      navigate('/')
    } else {
      setStep(step + 1)
    }
  }

  //   new

  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')
  const jwtToken = localStorage.getItem('accessToken')

  const getPlayersData = () => {
    dispatch(fetchComingPlayerList())
    dispatch(fetchVotingPlayerList())
    dispatch(fetchMyVotingPlayerList())
    dispatch(fetchVotingStats())
  }

  useEffect(() => {
    getPlayersData()
  }, [loginInfo, loginId, jwtToken])

  const {
    voteAvailableIn,
    isPlayerRequestAvailable,
    myPlayersList,
    votingPlayerList,
    userlevel,
    minuserlevelrequired,
    minlevelrequiredlisting,
    comingSoonPlayerList,
    myPlayersListLoading,
    comingSoonPlayerListLoading,
    isLoading: playerVotingLoading,

    votingPlayerListNext,
    votingPlayerListCount,
  } = useSelector((state: RootState) => state.playerVoting)

  const [state, setState] = useState({
    day: '0',
    hours: '0',
    minutes: '0',
    seconds: '0',
  })

  let countDown: any = null
  const updateState = (data: any) => {
    setState(state => ({ ...state, ...data }))
  }

  const initCountDown = () => {
    console.log('countDownStarted_message')
    clearInterval(countDown)
    const date = new Date()
    date.setSeconds(date.getSeconds() + voteAvailableIn)
    const countDownDate = date.getTime()
    countDown = setInterval(function () {
      const now = new Date().getTime()
      const distance = countDownDate < now ? 0 : countDownDate - now
      if (distance < 0) {
        // setEndable(true)
      }
      const day = ~~(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      if (distance < 0) {
        clearInterval(countDown)
        updateState({
          day: '0',
          hours: '0',
          minutes: '0',
          seconds: '0',
        })
      } else {
        updateState({
          day,
          hours,
          minutes,
          seconds,
        })
      }
    }, 1000)
  }

  useEffect(() => {
    console.log('msg1-5', { voteAvailableIn })
    if (voteAvailableIn > 0) {
      if (countDown) {
        clearInterval(countDown)
      }
      initCountDown()
    }

    return () => {
      clearInterval(countDown)
    }
  }, [voteAvailableIn, loginInfo, loginId, jwtToken])

  useEffect(() => {
    if (!state.day && !state.hours && !state.minutes && !state.seconds) {
      setTimeout(() => {
        dispatch(fetchVotingStats())
      }, 1500)
    }
  }, [state.day, state.hours, state.minutes, state.seconds])

  return (
    <section
      className="nft-list-container app-landing-container"
      style={{ paddingBottom: activeTab === 'new' ? '50px' : '30px' }}
    >
      <div
        style={{
          padding: '0rem',
        }}
        className="scouts-container players-trending-section"
      >
        <div className={classnames('scouts-section-wrapper')}>
          <div className="scouts-leaderboard-container">
            {!searchAll &&
              (isMobile() ? (
                isSearchEnabled ? (
                  <div className="scouts-section-title">
                    <SearchInput
                      type="text"
                      placeholder={t('please enter the search words.')}
                      className="in-menu-search"
                      onChange={leaderboardSearchHandle}
                      onClose={handleClose}
                    />
                  </div>
                ) : (
                  <div className="scouts-section-title">
                    {t('Vote Now')}
                    <SearchIcon
                      className="icon-color"
                      onClick={handleSearchInput}
                      style={{
                        margin: '22px 10px 22px 0',
                      }}
                    />
                  </div>
                )
              ) : (
                <div className="scouts-section-title">
                  {t('Vote Now')}
                  <LandingSearchInput
                    type="text"
                    placeholder={t('Search Player')}
                    className="in-menu-search-header dash-search"
                    onChange={leaderboardSearchHandle}
                  />
                </div>
              ))}
            <div
              className={classnames(
                'scouts-leaderboard-wrapper',
                hasTour && step === 3 ? 'bright-area no-pointer-area' : '',
              )}
            >
              <div
                className={classNames(
                  'players-table-container',
                  searchAll ? 'search-mode-wrapper' : '',
                )}
              >
                {votingPlayerListTabularLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                ) : votingPlayerListTabular.length === 0 ? (
                  <div className="no-data-msg">{t('no data found')}</div>
                ) : (
                  <InfiniteScroll
                    style={{ overflow: 'hidden' }}
                    dataLength={votingPlayerListTabular.length}
                    next={() => handleJumpToPage('forth')}
                    hasMore={true}
                    scrollThreshold={0.5}
                    loader={<></>}
                    endMessage={
                      <p style={{ textAlign: 'center' }}>
                        <b>. . .</b>
                      </p>
                    }
                  >
                    <div className="">
                      <div
                        style={{
                          padding: isMobile() ? '0rem' : '20px 30px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                        }}
                        className={classNames(
                          'user-list-column players-landing-one-column ',
                        )}
                      >
                        {votingPlayerListTabular.map(
                          (item: any, index: number) => (
                            <PlayerItem
                              key={index}
                              item={item}
                              index={window.innerWidth <= 700 ? 0 : index + 1}
                              isVotingPlayer={true}
                              votingTimer={
                                <>
                                  {state.hours}h {state.minutes}m{' '}
                                  {state.seconds}s
                                </>
                              }
                            />
                          ),
                        )}
                        {isDeadEnd ||
                        votingPlayerListTabular.length <
                          10 ? null : upadtingvotingPlayerListTabular ? (
                          <div className="showmore-btn-wrapper">
                            <Spinner spinnerStatus={true} />
                          </div>
                        ) : (
                          <div className="showmore-btn-wrapper">
                            <div
                              className="showmore-btn"
                              onClick={() => handleJumpToPage('forth')}
                            >
                              {t('show more')}
                            </div>
                          </div>
                        )}
                        {/* </InfiniteScroll> */}
                      </div>
                    </div>
                  </InfiniteScroll>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlayerVotingTabularInfiniteScroll
