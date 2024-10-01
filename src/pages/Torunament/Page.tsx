/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, useEffect, useState } from 'react'
import { AppLayout } from '@components/index'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import {
  getCountryId,
  initTagManager,
  isMobile,
  toKPIIntegerFormat,
} from '@utils/helpers'
import '@assets/css/pages/NftList.css'
import raiseHandImg from '@assets/images/raise-hand.png'
import classNames from 'classnames'
import {
  fetchListPlayers,
  fetchListPlayersAll,
  fetchListPlayersCountry,
  fetchListPlayersLatestTrades,
  fetchListPlayersMarket,
  getPlayersComingSoon,
  getPlayersCount,
  getScoutsLeaderboard,
  getScoutsTop,
  resetAllPlayers,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { useTranslation } from 'react-i18next'
import PlayerListTabGroup from '@pages/PlayerList/components/PlayerListTabGroup'
import debounce from 'lodash.debounce'
import { getFeedPlayers } from '@root/apis/playerCoins/playerCoinsSlice'
import '@assets/css/pages/NewPlayerList.css'
import '@assets/css/pages/Tournament.css'
import UserCardSkeleton from '@components/Card/UserCardSkeleton'
import ScoutsCard from '@components/Card/ScoutsCard'
import SearchInput from '@components/Form/LandingSearchInput'
import { useNavigate, useParams } from 'react-router-dom'
import PlayerImage from '@components/PlayerImage'
import {
  displayDateTime,
  getCircleColor,
  getCountryCode,
  getCountryNameNew,
  getFlooredFixed,
  getPlayerLevelClassName,
} from '@utils/helpers'
import {
  getWalletDetails,
  showPurchaseForm,
  showSignupForm,
  showTransfermarktForm,
  showWalletForm,
} from '@root/apis/onboarding/authenticationSlice'
import TooltipLabel from '@components/TooltipLabel'
import ScoutsCardSupporter from '@components/Card/ScoutsCardSupporter'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import PublicIcon from '@mui/icons-material/Public'
import RecordIcon from '@assets/icons/icon/record.png'
import InfiniteScroll from 'react-infinite-scroll-component'
import NewPlayerCard from '@components/Card/NewPlayerCard'
import BaseCardSkeleton from '@components/Card/BaseCardSkeleton'
import CircleCarousel from '@components/Carousel/PlayersComingSoonCarousel'
import { ethers } from 'ethers'
import { fetchPlayersStatsPL } from '@root/apis/playerStats/playerStatsSlice'
import PlayersCardSupporter from '@components/Card/PlayersCardSupporter'
import Spinner from '@components/Spinner'
import SubmitButton from '@components/Button/SubmitButton'
import Voting from '@pages/Voting/Voting'
import { BackHand, Check, EmojiEvents } from '@mui/icons-material'
import { getRequestAuth } from '@root/apis/axiosClientAuth'
import {
  fetchComingPlayerList,
  fetchMyVotingPlayerList,
  fetchVotingPlayerList,
  fetchVotingStats,
} from '@root/apis/playerVoting/playerVotingSlice'
import Discord from '@components/Svg/Discord'
import { Link } from 'react-router-dom'
import PlayerVotingTabularInfiniteScroll from './PlayerVotingTabularInfiniteScroll'
import RankingTabularInfiniteScroll from './RankingTabularInfiniteScroll'
import {
  getTournamentDetails,
  getTournamentMyPlayerRankingList,
  getTournamentPlayerRankingList,
} from '@root/apis/tournament/tournamentSlice'
import Marquee from 'react-fast-marquee'

interface FiltersData {
  limit?: any
  offset?: any
  search?: string
  type?: string
  status_id?: number
}

let playerListInterval: any = null

const Page: React.FC = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('tournament')
  const [searchedTerm, setSearchedTerm] = useState<string | undefined>('')
  const [isSearching, setIsSearching] = useState(false)

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const {
    isGetPlayerSuccess,
    nextPlayerListUrl,
    isLoading,
    playersCount,
    playersComingSoon,
    playersMarketListData,
    playersCountryListData,
    loadingPlayersComingSoon,
    isLoadingPlayersMarketListData,
    isLoadingCountry,
    playersListData,
    isFetchListPlayerSuccess,
  } = playerCoinData

  // Tournament states

  const {
    tournamentDetailData,
    tournamentDetailLoading,
    tournamentMyPlayerRankingList,
    tournamentListMyPlayerRankingLoading,
  } = useSelector((state: RootState) => state.tournament)

  // console.log(tournamentDetailData)

  const [scrollIndex, setScrollIndex] = useState(0)
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { ipLocaleCountryCode, ipLocaleCountryName, isVisibleModal } =
    authenticationData

  const playerStatsData = useSelector((state: RootState) => state.playerstats)
  const { fetchPlayerStatsDataPL } = playerStatsData

  const [appliedFilters, setAppliedFilters] = useState<FiltersData>({
    search: '',
    type: 'overview',
    status_id: 4,
  })

  const [previousFilters, setPreviousFilters] = useState(null)
  const [isDeadEnd, setIsDeadEnd] = useState(false)

  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')
  const jwtToken = localStorage.getItem('accessToken')

  const [comingSoonItemIndex, setComingSoonItemIndex] = useState(0)

  const [voteNowItemIndex, setVoteNowItemIndex] = useState(0)

  const [itemMarketIndex, setItemMarketIndex] = useState(0)
  const [itemCountryIndex, setItemCountryIndex] = useState(0)

  const [windowSize, setWindowSize] = useState(0)
  const [allPlayers, setAllPlayers] = useState<any>([])

  useEffect(() => {
    let playersTableDataTemp = [...allPlayers]
    if (fetchPlayerStatsDataPL && fetchPlayerStatsDataPL.length > 0) {
      playersTableDataTemp = playersTableDataTemp.map(item => {
        const item2 = fetchPlayerStatsDataPL.find(
          (i2: any) =>
            item?.playercontract &&
            i2?.player &&
            ethers.utils.getAddress(i2?.player) ===
              ethers.utils.getAddress(item?.playercontract),
        )
        return item2 ? { ...item, ...item2 } : item
      })
    }
    setPrevData(allPlayers)
    setAllPlayers(playersTableDataTemp)
    setIsSearching(false)
  }, [fetchPlayerStatsDataPL])

  useEffect(() => {
    console.log('llpprr--', { isVisibleModal, appliedFilters, previousFilters })
    clearInterval(playerListInterval)
    if (!isVisibleModal && !document.hidden && playersListData.length > 0) {
      if (
        !previousFilters ||
        previousFilters?.offset !== appliedFilters?.offset
      ) {
        let updatedAllPlayers: any = []
        // console.log({ isVisibleModal, appliedFilters, previousFilters })
        if (appliedFilters?.limit || appliedFilters?.offset) {
          if (playersListData.length > 0 && isFetchListPlayerSuccess) {
            updatedAllPlayers = [...allPlayers, ...playersListData]
            setAllPlayers(updatedAllPlayers)
            setIsSearching(false)
          } else if (playersListData.length === 0 && isFetchListPlayerSuccess) {
            updatedAllPlayers = allPlayers
            setIsDeadEnd(true)
          }
        } else {
          updatedAllPlayers = playersListData
          setAllPlayers(updatedAllPlayers)
          setIsSearching(false)
        }

        handleGetPriceStats(updatedAllPlayers)
        playerListInterval = setInterval(() => {
          handleGetPriceStats(updatedAllPlayers)
        }, 20000)
      }
    }
  }, [playersListData, isVisibleModal, document.hidden])

  useEffect(() => {
    console.log({ isVisibleModal, appliedFilters, previousFilters })
  }, [previousFilters, appliedFilters, isVisibleModal])

  const handleGetTab = (tab: string) => {
    setActiveTab(tab)
    let newParams: any = { type: tab }
    if (searchedTerm) {
      newParams = { ...newParams, search: searchedTerm }
    }
    setAppliedFilters(newParams)
  }

  const handleSearch = (value: string | undefined) => {
    setAllPlayers([])
    setIsSearching(true)
    let request = {}
    setSearchedTerm(value)
    if (value) {
      request = {
        limit: '10',
        offset: '0',
        search: value,
      }
    } else {
      request = {
        limit: '10',
        offset: '0',
      }
    }
    setAppliedFilters({ ...request })
  }
  const optimizedHandleSearch = useCallback(debounce(handleSearch, 500), [])

  const handleCloseSearch = () => {
    setSearchedTerm('')
    setAllPlayers([])
    setAppliedFilters({
      type: activeTab,
      status_id: 4,
      search: '',
      limit: '10',
    })
  }

  const handleScroll = (direction: string) => {
    if (direction === 'forth') {
      if (scrollIndex <= 300) {
        setScrollIndex(scrollIndex + 30)
      }
    } else {
      if (scrollIndex > 0) {
        setScrollIndex(scrollIndex - 30)
      }
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    return () => {
      clearInterval(playerListInterval)
      dispatch(resetAllPlayers())
    }
  }, [])

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [window.innerWidth])

  useEffect(() => {
    dispatch(getPlayersCount())
    dispatch(getPlayersComingSoon())
    dispatch(fetchListPlayersMarket())
    dispatch(fetchListPlayersAll(appliedFilters))
  }, [])

  useEffect(() => {
    if (
      appliedFilters?.limit ||
      appliedFilters?.offset ||
      appliedFilters?.search
    ) {
      dispatch(fetchListPlayersAll(appliedFilters))
    }
  }, [appliedFilters])

  useEffect(() => {
    if (ipLocaleCountryCode) {
      dispatch(fetchListPlayersCountry(getCountryId(ipLocaleCountryCode)))
    }
  }, [ipLocaleCountryCode])

  const [prevData, setPrevData] = useState<any>([])

  const handleGetPriceStats = (playersData: any) => {
    const playersSet: number[] = playersData
      .filter((player: any) => {
        return player.playerstatusid > 3
      })
      .map((item: any) => item.playercontract)
    if (playersSet.length > 0) {
      dispatch(fetchPlayersStatsPL({ contracts: playersSet, query: 'complex' }))
    }
  }

  const getUrlParams = (url: string, param1: string, param2: string) => {
    if (!url) {
      return url
    }
    const url_string = url
    const newUrl = new URL(url_string)
    const obj: any = new Object()
    obj[param1] = newUrl.searchParams.get(param1)
    obj[param2] = newUrl.searchParams.get(param2)
    return obj
  }

  const handleJumpToPage = (head: string) => {
    if (head !== 'back') {
      const paginationParams = getUrlParams(
        nextPlayerListUrl,
        'limit',
        'offset',
      )
      if (
        nextPlayerListUrl &&
        paginationParams.offset !== appliedFilters?.offset
      ) {
        setIsDeadEnd(false)
        setAppliedFilters(prevFilters => {
          setPreviousFilters(prevFilters)
          return { ...appliedFilters, ...paginationParams }
        })
      } else {
        setIsDeadEnd(true)
      }
    }
  }

  useEffect(() => {
    if (nextPlayerListUrl) {
      setIsDeadEnd(false)
    } else {
      setIsDeadEnd(true)
    }
  }, [nextPlayerListUrl])

  const handlePurchaseOpen = useCallback((value: string, data: any) => {
    if (!loginInfo && !loginId) {
      dispatch(showSignupForm())
      return
    }
    dispatch(
      showPurchaseForm({
        mode: value.toUpperCase(),
        playerData: data,
      }),
    )
  }, [])

  // NEW

  const [state, setState] = useState({
    day: '0',
    hours: '0',
    minutes: '0',
    seconds: '0',
  })
  let countDown: any = null
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
  // alert(voteAvailableIn)
  // const [countDownTime, setCountDownTime] = useState<number>(voteAvailableIn)
  const [endable, setEndable] = useState(false)
  const [countDownLoading, setCountDownLoading] = useState(false)
  const [countDownInitiated, setCountDownInitiated] = useState(false)
  const navigate = useNavigate()

  const updateState = (data: any) => {
    setState(state => ({ ...state, ...data }))
  }

  const initCountDown = () => {
    console.log('countDownStarted_message')
    clearInterval(countDown)
    const date = new Date()
    console.log(tournamentDetailData?.end)

    date.setSeconds(date.getSeconds() + tournamentDetailData?.end)
    const countDownDate = date.getTime()
    countDown = setInterval(function () {
      // const now = new Date().getTime()
      // const distance = countDownDate < now ? 0 : countDownDate - now
      // if (distance < 0) {
      //   setEndable(true)
      // }
      // const day = Math.floor(distance / (1000 * 60 * 60 * 24))
      // const hours = Math.floor(
      //   (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      // )
      // const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      // const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      const now = new Date().getTime() // Current time in milliseconds
      const distance = tournamentDetailData?.end * 1000 - now

      const day = Math.floor(distance / (1000 * 60 * 60 * 24))
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
        setCountDownLoading(false)
        setCountDownInitiated(true)
      }
    }, 1000)
  }

  useEffect(() => {
    console.log('msg1-5', tournamentDetailData?.end)
    if (tournamentDetailData?.end) {
      if (countDown) {
        clearInterval(countDown)
      }
      initCountDown()
    }

    return () => {
      clearInterval(countDown)
    }
  }, [tournamentDetailData?.end, loginInfo, loginId, jwtToken])

  useEffect(() => {
    if (!state.day && !state.hours && !state.minutes && !state.seconds) {
      setTimeout(() => {
        dispatch(fetchVotingStats())
      }, 1500)
    }
  }, [state.day, state.hours, state.minutes, state.seconds])

  const getPlayersData = () => {
    dispatch(fetchComingPlayerList())
    dispatch(fetchVotingPlayerList())
    dispatch(fetchMyVotingPlayerList())
    dispatch(fetchVotingStats())
  }

  useEffect(() => {
    getPlayersData()
  }, [
    loginInfo,
    loginId,
    jwtToken,
    // authenticationData?.authenticationData?.CheckPlayerCoinBal,
  ])

  // vote now players pagination
  // useEffect(() => {
  //   if (
  //     comingSoonItemIndex * votingPlayerListCount >
  //       10 * votingPlayerListCount &&
  //     votingPlayerListNext
  //   ) {
  //     dispatch(fetchVotingPlayerList())
  //   }
  // }, [comingSoonItemIndex])

  // console.log('authData', authenticationData?.CheckPlayerCoinBal)

  const { id } = useParams()

  useEffect(() => {
    const request = {
      limit: 10,
      offset: 0,
      search: '',
      id,
    }

    dispatch(
      getTournamentDetails({
        id,
      }),
    )

    dispatch(getTournamentMyPlayerRankingList(request))
  }, [loginId])

  // console.log(tournamentDetailData?.current_stage?.qualifying_medals)

  return (
    <section
      className="nft-list-container"
      style={{ paddingBottom: activeTab === 'new' ? '50px' : '30px' }}
    >
      {/* Tab List */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className={classNames(
          'tab-bar-container',
          isMobile() ? 'players-list-tabgroup' : '',
        )}
      >
        {tournamentDetailData?.name ? (
          <Marquee
            gradient={false}
            className="bg-darkv-color"
            style={{
              height: isMobile() ? '70px' : '56px',
            }}
            speed={isMobile() ? 12 : 20}
            loop={100}
            play={true}
            key={'asdsad'}
          >
            {/* {allPlayers.map((player: any, index: number) => (
            <HeaderTickerPlayer player={player} key={index} />
          ))} */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20vw',
                marginRight: '20vw',
              }}
              className="text-lg"
            >
              <div>{tournamentDetailData?.name}</div>
              <div>{tournamentDetailData?.name}</div>
              <div>{tournamentDetailData?.name}</div>
              <div>{tournamentDetailData?.name}</div>
              <div>{tournamentDetailData?.name}</div>
            </div>
          </Marquee>
        ) : (
          <Marquee
            gradient={false}
            className="bg-darkv-color"
            style={{
              height: isMobile() ? '70px' : '56px',
            }}
            speed={isMobile() ? 12 : 20}
            loop={100}
            play={true}
            key={'ndaksc'}
          >
            {/* {allPlayers.map((player: any, index: number) => (
          <HeaderTickerPlayer player={player} key={index} />
        ))} */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20vw',
              }}
            >
              <div
                style={{
                  height: '2rem',
                  width: '8rem',
                }}
                className="my_card_skeleton"
              ></div>
              <div
                style={{
                  height: '2rem',
                  width: '8rem',
                }}
                className="my_card_skeleton"
              ></div>
              <div
                style={{
                  height: '2rem',
                  width: '8rem',
                }}
                className="my_card_skeleton"
              ></div>
              <div
                style={{
                  height: '2rem',
                  width: '8rem',
                }}
                className="my_card_skeleton"
              ></div>
              <div
                style={{
                  height: '2rem',
                  width: '8rem',
                }}
                className="my_card_skeleton"
              ></div>
            </div>
          </Marquee>
        )}
        <PlayerListTabGroup
          isHot
          defaultTab={activeTab}
          getScrollIndex={(index: number) => setScrollIndex(index)}
          tabSet={['tournament']}
          getSwitchedTab={handleGetTab}
          scrollTo={scrollIndex}
          hasSearchBar={false}
          onEdit={optimizedHandleSearch}
          onClose={handleCloseSearch}
        />
      </div>

      <div className="players-container players-live-section">
        <>
          <div
            style={{
              marginTop: '0rem',
            }}
            className="players-coming-soon-wrapper"
          >
            <div className="players-section-title">
              <span
                className={classNames(
                  isMobile() ? 'w-full flex justify-center align-center' : '',
                )}
              >
                {/* {tournamentDetailData?.current_stage?.name} */}
                {tournamentDetailData?.name ? (
                  tournamentDetailData?.name
                ) : (
                  <div
                    style={{
                      height: '3rem',
                      width: '12rem',
                    }}
                    className="my_card_skeleton"
                  ></div>
                )}
              </span>
              {/* <RocketLaunchIcon className="players-coming-soon-icon" /> */}
              {/* <BackHand className="players-coming-soon-icon" /> */}
              {/* <img
                src={raiseHandImg}
                alt="raise hand"
                className="players-coming-soon-icon vy-logo-sizing"
              /> */}
            </div>
            <div
              style={{
                paddingTop: isMobile() ? '1rem' : '',
              }}
              className="players-coming-soon-content players-coming-soon-content-bottom-padded"
            >
              {/* Count Down text */}

              <div className="pv-voting-desc-cont">
                <div className="pv-voting-timer-cont">
                  <div className="pv-timer-inner-cont">
                    <>
                      <div className="pv-voting-label text-left">
                        {tournamentDetailData?.current_stage?.name ? (
                          tournamentDetailData?.current_stage?.name
                        ) : (
                          <div
                            style={{
                              height: '2rem',
                              width: '12rem',
                            }}
                            className="my_card_skeleton"
                          ></div>
                        )}
                      </div>
                      <div className="pv-timer">
                        {tournamentDetailData?.current_stage?.name ? (
                          state.day !== '0' ||
                          state.hours !== '0' ||
                          state.minutes !== '0' ||
                          state.seconds !== '0' ? (
                            <>
                              {state.day}d {state.hours}h {state.minutes}m{' '}
                              {state.seconds}s
                            </>
                          ) : (
                            <>
                              <>{t('over')}</>
                            </>
                          )
                        ) : (
                          <div
                            style={{
                              height: '2rem',
                              width: '12rem',
                            }}
                            className="my_card_skeleton"
                          ></div>
                        )}
                      </div>
                    </>
                  </div>
                  <div>
                    <div className="">
                      <SubmitButton
                        title={t('more info')}
                        className="new_next_btn createnft-createbtn vote-submit-button"
                        onPress={() => {
                          navigate('/app/tournament/info/' + id)
                        }}
                        // isDisabled={!isPlayerRequestAvailable}
                        isLoading={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* <>
                               
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {countDownLoading ? (
                              <div className="spinner mt-15 size-small"></div>
                            ) : (
                              <>{t('now')}</>
                            )}
                          </> */}
            </div>
          </div>

          {!tournamentListMyPlayerRankingLoading &&
          !tournamentMyPlayerRankingList?.length ? (
            <span
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '4rem 0rem',
              }}
              className="blog-title"
            >
              <span
                style={{
                  scale: '1.5',
                }}
                className={`fi fis fi-${ipLocaleCountryCode?.toLowerCase()}`}
              />

              {ipLocaleCountryName}
              {/* ipLocaleCountryCode */}
            </span>
          ) : tournamentMyPlayerRankingList.length ||
            tournamentListMyPlayerRankingLoading ? (
            <div
              style={{
                background: 'transparent',
              }}
              className="players-coming-soon-wrapper"
            >
              <div
                style={{
                  background: 'transparent',
                }}
                className="players-section-title"
              >
                <span>{t('My Players')}</span>
                {/* <RocketLaunchIcon className="players-coming-soon-icon" /> */}
              </div>
              <div className="players-coming-soon-content">
                {tournamentListMyPlayerRankingLoading && (
                  <div className="nft-item no-data">
                    {new Array(
                      windowSize >= 1600
                        ? 5
                        : windowSize >= 1220
                        ? 4
                        : windowSize >= 912
                        ? 3
                        : windowSize >= 620
                        ? 2
                        : 1,
                    )
                      .fill(1)
                      .map((_: any, index: number) => (
                        <div key={index} style={{ margin: '0px 10px' }}>
                          <BaseCardSkeleton />
                        </div>
                      ))}
                  </div>
                )}
                {tournamentMyPlayerRankingList.length === 0 &&
                  !tournamentListMyPlayerRankingLoading && (
                    <div className="no-data-msg">{t('no data found')}</div>
                  )}

                <CircleCarousel
                  items={tournamentMyPlayerRankingList?.map(
                    (item: any, index: number) => (
                      <div
                        style={{
                          lineHeight: '16px',
                        }}
                        key={index}
                      >
                        <NewPlayerCard
                          card={item}
                          prevData={
                            prevData.length > index ? prevData[index] : null
                          }
                          key={index + 2}
                          onBuy={() => handlePurchaseOpen('buy', item)}
                          onSell={() => handlePurchaseOpen('sell', item)}
                          playercardjson={item?.playercardjson}
                          // isVotingCard={true}
                          // votingTimer={
                          //   <>
                          //     {state.hours}h {state.minutes}m {state.seconds}s
                          //   </>
                          // }
                        />
                      </div>
                    ),
                  )}
                  // isFinite={true}
                  activeIndex={comingSoonItemIndex}
                  setActiveIndex={setComingSoonItemIndex}
                />
              </div>
            </div>
          ) : null}
          {tournamentDetailData?.current_stage?.qualifying_medals?.length ||
          tournamentDetailLoading ? (
            <div
              style={{
                background: 'transparent',
              }}
              className="players-coming-soon-wrapper"
            >
              <div
                style={{
                  background: 'transparent',
                }}
                className="players-section-title"
              >
                <span>{t('medals earned')}</span>
                {/* <RocketLaunchIcon className="players-coming-soon-icon" /> */}
              </div>
              <div className="players-coming-soon-content">
                {tournamentDetailLoading ? (
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2rem',
                    }}
                  >
                    <div
                      style={{
                        height: '6rem',
                        width: '4rem',
                      }}
                      className="my_card_skeleton"
                    ></div>
                    <div
                      style={{
                        height: '6rem',
                        width: '4rem',
                      }}
                      className="my_card_skeleton"
                    ></div>
                    <div
                      style={{
                        height: '6rem',
                        width: '4rem',
                      }}
                      className="my_card_skeleton"
                    ></div>
                  </div>
                ) : (
                  tournamentDetailData?.current_stage?.qualifying_medals?.map(
                    (el, ind) => {
                      return (
                        <TooltipLabel key={ind} title={el?.medal?.name}>
                          <img
                            className="trophy-icon "
                            src={el?.medal?.imagethumbnail}
                            alt={el?.medal?.name}
                          />
                        </TooltipLabel>
                      )
                    },
                  )
                )}

                {/* <EmojiEvents className="trophy-icon text-gold" /> */}
              </div>
            </div>
          ) : null}
          <RankingTabularInfiniteScroll />
        </>
      </div>
    </section>
  )
}

export default Page
