import React, { useState, useEffect, useRef } from 'react'
import { RootState } from '@root/store/rootReducers'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { PLAYER_STATUS } from '@root/constants'
import { fetchPlayersStatsDisplayPlayers } from '@root/apis/playerStats/playerStatsSlice'
import { isMobile } from '@utils/helpers'
import {
  getDisplayPlayers,
  getRecentPlayers,
} from '@root/apis/playerCoins/playerCoinsSlice'
import classNames from 'classnames'
import NewDisplayPlayersCard from '@components/Card/NewDisplayPlayersCard'
import BaseCardSkeleton from '@components/Card/BaseCardSkeleton'
import CircleCarousel from '@components/Carousel/CircleCarousel'
import {
  fetchVotingPlayerList,
  fetchVotingStats,
} from '@root/apis/playerVoting/playerVotingSlice'

const displayPlayersInterval: any = null

interface Props {
  onBuy: any
  onSell: any
  playerId: any
  isVotingPlayer?: boolean
}

const PlayersDisplay: React.FC<Props> = ({
  onBuy,
  onSell,
  playerId,
  isVotingPlayer,
}) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const displayPlayerRef = useRef<any>([])
  const [itemIndex, setItemIndex] = useState(0)
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { isVisibleModal } = authenticationData
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const playerStatsData = useSelector((state: RootState) => state.playerstats)
  const { displayPlayerStatsData } = playerStatsData
  const {
    displayPlayersList,
    isDisplayPlayersError,
    isNoDisplayPlayers,
    isDisplayPlayersLoading,
    loadingMyRecentPlayers,
    myRecentPlayers,
  } = playerCoinData
  const [testStat, setTestStat] = useState<any>([])
  const [windowSize, setWindowSize] = useState(0)
  const displayPlayerItems: JSX.Element[] = []
  const votingPlayerItems: JSX.Element[] = []

  console.log(myRecentPlayers)

  const accessToken = localStorage.getItem('accessToken')

  useEffect(() => {
    if (accessToken) {
      //   dispatch(getMyWalletPlayers())
      dispatch(fetchVotingStats())
      dispatch(fetchVotingPlayerList())
    }
  }, [accessToken])

  const { votingPlayerList, isLoading, voteAvailableIn } = useSelector(
    (state: RootState) => state.playerVoting,
  )

  const [votingPlayerListLocal, setvotingPlayerListLocal] = useState([])
  const [visitedPlayerListLocal, setvisitedPlayerListLocal] = useState([])

  // timer logic

  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')
  const jwtToken = localStorage.getItem('accessToken')

  let countDown: any = null
  const [endable, setEndable] = useState(false)

  const [countDownLoading, setCountDownLoading] = useState(false)
  const [countDownInitiated, setCountDownInitiated] = useState(false)

  const [state, setState] = useState({
    day: '0',
    hours: '0',
    minutes: '0',
    seconds: '0',
  })

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
        setEndable(true)
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
        setCountDownLoading(false)
        setCountDownInitiated(true)
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

  useEffect(() => {
    if (votingPlayerList?.length) {
      const temp = votingPlayerList?.filter(el => el.id !== playerId)

      const tempArr = []

      temp.map((displayItem: any, displayIndex: any) => {
        tempArr.push(
          <NewDisplayPlayersCard
            card={displayItem}
            key={displayIndex + 2 + 'voting'}
            prevData={displayPlayerRef?.current}
            onBuy={() => onBuy(displayItem)}
            onSell={() => onSell(displayItem)}
            playercardjson={displayItem?.playercardjson}
            isVotingPlayer={true}
            votingTimer={
              <>
                {state.hours}h {state.minutes}m {state.seconds}s
              </>
            }
          />,
        )
      })

      setvotingPlayerListLocal(tempArr)
    }

    if (myRecentPlayers?.length) {
      const temp = myRecentPlayers?.filter(el => el.id !== playerId)

      const tempArr = []

      temp.map((displayItem: any, displayIndex: any) => {
        tempArr.push(
          <NewDisplayPlayersCard
            card={displayItem}
            key={displayIndex + 2 + 'visited'}
            prevData={displayPlayerRef?.current}
            onBuy={() => onBuy(displayItem)}
            onSell={() => onSell(displayItem)}
            playercardjson={displayItem?.playercardjson}
            // isVotingPlayer={true}
            votingTimer={
              <>
                {state.hours}h {state.minutes}m {state.seconds}s
              </>
            }
          />,
        )
      })

      setvisitedPlayerListLocal(tempArr)
    }
  }, [
    playerId,
    votingPlayerList,
    myRecentPlayers,
    state.day,
    state.hours,
    state.minutes,
    state.seconds,
  ])

  displayPlayersList.map((displayItem: any, displayIndex: any) => {
    displayPlayerItems.push(
      <NewDisplayPlayersCard
        card={displayItem}
        key={displayIndex + 2}
        prevData={displayPlayerRef?.current}
        onBuy={() => onBuy(displayItem)}
        onSell={() => onSell(displayItem)}
        playercardjson={displayItem?.playercardjson}
        isVotingPlayer={false}
      />,
    )
  })

  const getDisplayPlayersStats = () => {
    const testItems = displayPlayerItems.map(item => item.props.card)
    const pgmfi: any = testItems
    const newStat = pgmfi.filter((player: any) => {
      if (player?.playerstatusid >= PLAYER_STATUS.SUBSCRIBE) {
        return true
      } else {
        return false
      }
    })
    const playerContracts =
      newStat.length > 0 ? newStat.map((item: any) => item.playercontract) : []
    if (playerContracts.length > 0) {
      dispatch(
        fetchPlayersStatsDisplayPlayers({
          contracts: playerContracts,
          query: 'complex',
        }),
      )
    }
  }

  useEffect(() => {
    clearInterval(displayPlayersInterval)
    // if (displayPlayersList.length > 0 && !isVisibleModal && !document.hidden) {
    //   displayPlayersInterval = setInterval(() => {
    //     getDisplayPlayersStats()
    //   }, 20000)
    // }
  }, [displayPlayersList, document.hidden, isVisibleModal])

  useEffect(() => {
    return () => {
      clearInterval(displayPlayersInterval)
    }
  }, [])

  useEffect(() => {
    if (playerId) {
      dispatch(getDisplayPlayers(playerId))
    }
  }, [playerId])

  useEffect(() => {
    if (displayPlayerStatsData.length > 0) {
      setTestStat(displayPlayerStatsData)
    }
  }, [displayPlayerStatsData])

  useEffect(() => {
    displayPlayerRef.current = testStat
  }, [testStat])

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [window.innerWidth])

  useEffect(() => {
    dispatch(getRecentPlayers())
  }, [accessToken, loginInfo])

  return isVotingPlayer ? (
    <>
      {(loadingMyRecentPlayers || visitedPlayerListLocal.length > 0) && (
        <section id="abc1" key="abc1" className="profile-display-section">
          <div className="blog-title h-2">{t('your recent visits')}</div>
          <div className={classNames('carousel m-auto player-carousel')}>
            {loadingMyRecentPlayers ? (
              <>
                {new Array(
                  isMobile()
                    ? 1
                    : windowSize > 1600
                    ? 5
                    : windowSize > 1220
                    ? 4
                    : windowSize > 1024
                    ? 3
                    : 1,
                )
                  .fill(1)
                  .map((_: any, index: number) => (
                    <div key={index} style={{ margin: '0px 10px' }}>
                      <BaseCardSkeleton key={index} />
                    </div>
                  ))}
              </>
            ) : visitedPlayerListLocal?.length ? (
              <CircleCarousel
                items={visitedPlayerListLocal}
                // activeIndex={itemIndex}
                // setActiveIndex={setItemIndex}
                isFixedWidth={true}
              />
            ) : (
              <div className="heading-title unverified-alert">
                {t('currently no players to show')}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Save */}
      {(loadingMyRecentPlayers || visitedPlayerListLocal.length > 0) && (
        <section id="abc" key="abc" className="profile-display-section">
          <div className="blog-title h-2">{t('your recent visits')}</div>
          <div className={classNames('carousel m-auto player-carousel')}>
            {loadingMyRecentPlayers ? (
              <>
                {new Array(
                  isMobile()
                    ? 1
                    : windowSize > 1600
                    ? 5
                    : windowSize > 1220
                    ? 4
                    : windowSize > 1024
                    ? 3
                    : 1,
                )
                  .fill(1)
                  .map((_: any, index: number) => (
                    <div key={index} style={{ margin: '0px 10px' }}>
                      <BaseCardSkeleton key={index} />
                    </div>
                  ))}
              </>
            ) : visitedPlayerListLocal?.length ? (
              <CircleCarousel
                items={visitedPlayerListLocal}
                // activeIndex={itemIndex}
                // setActiveIndex={setItemIndex}
                isFixedWidth={true}
              />
            ) : (
              <div className="heading-title unverified-alert">
                {t('currently no players to show')}
              </div>
            )}
          </div>
        </section>
      )}

      <section id="def" key="def" className="profile-display-section">
        <div className="blog-title h-2">{t('more players')}</div>
        <div className={classNames('carousel m-auto player-carousel')}>
          {isDisplayPlayersLoading ? (
            <>
              {new Array(
                isMobile()
                  ? 1
                  : windowSize > 1600
                  ? 5
                  : windowSize > 1220
                  ? 4
                  : windowSize > 1024
                  ? 3
                  : 1,
              )
                .fill(1)
                .map((_: any, index: number) => (
                  <div key={index} style={{ margin: '0px 10px' }}>
                    <BaseCardSkeleton key={index} />
                  </div>
                ))}
            </>
          ) : displayPlayersList?.length > 0 &&
            displayPlayerItems?.length > 0 ? (
            <CircleCarousel
              items={displayPlayerItems}
              activeIndex={itemIndex}
              setActiveIndex={setItemIndex}
              isFixedWidth={true}
            />
          ) : (
            (isDisplayPlayersError ||
              isNoDisplayPlayers ||
              displayPlayerItems.length === 0) && (
              <div className="heading-title unverified-alert">
                {t('currently no players to show')}
              </div>
            )
          )}
        </div>
      </section>
    </>
  ) : (
    <>
      {(loadingMyRecentPlayers || visitedPlayerListLocal.length > 0) && (
        <section id="abc1" key="abc1" className="profile-display-section">
          <div className="blog-title h-2">{t('your recent visits')}</div>
          <div className={classNames('carousel m-auto player-carousel')}>
            {loadingMyRecentPlayers ? (
              <>
                {new Array(
                  isMobile()
                    ? 1
                    : windowSize > 1600
                    ? 5
                    : windowSize > 1220
                    ? 4
                    : windowSize > 1024
                    ? 3
                    : 1,
                )
                  .fill(1)
                  .map((_: any, index: number) => (
                    <div key={index} style={{ margin: '0px 10px' }}>
                      <BaseCardSkeleton key={index} />
                    </div>
                  ))}
              </>
            ) : visitedPlayerListLocal?.length ? (
              <CircleCarousel
                items={visitedPlayerListLocal}
                // activeIndex={itemIndex}
                // setActiveIndex={setItemIndex}
                isFixedWidth={true}
              />
            ) : (
              <div className="heading-title unverified-alert">
                {t('currently no players to show')}
              </div>
            )}
          </div>
        </section>
      )}

      <section id="asd" key="asd" className="profile-display-section">
        <div className="blog-title h-2">{t('more players')}</div>
        <div className={classNames('carousel m-auto player-carousel')}>
          {isDisplayPlayersLoading ? (
            <>
              {new Array(
                isMobile()
                  ? 1
                  : windowSize > 1600
                  ? 5
                  : windowSize > 1220
                  ? 4
                  : windowSize > 1024
                  ? 3
                  : 1,
              )
                .fill(1)
                .map((_: any, index: number) => (
                  <div key={index} style={{ margin: '0px 10px' }}>
                    <BaseCardSkeleton key={index} />
                  </div>
                ))}
            </>
          ) : displayPlayersList?.length > 0 &&
            displayPlayerItems?.length > 0 ? (
            <CircleCarousel
              items={displayPlayerItems}
              activeIndex={itemIndex}
              setActiveIndex={setItemIndex}
              isFixedWidth={true}
            />
          ) : (
            (isDisplayPlayersError ||
              isNoDisplayPlayers ||
              displayPlayerItems.length === 0) && (
              <div className="heading-title unverified-alert">
                {t('currently no players to show')}
              </div>
            )
          )}
        </div>
      </section>

      {(isLoading || votingPlayerListLocal.length > 2) && (
        <section id="asdasd" key="asdasd" className="profile-display-section">
          <div className="blog-title h-2">{t('vote players')}</div>
          <div className={classNames('carousel m-auto player-carousel')}>
            {isLoading ? (
              <>
                {new Array(
                  isMobile()
                    ? 1
                    : windowSize > 1600
                    ? 5
                    : windowSize > 1220
                    ? 4
                    : windowSize > 1024
                    ? 3
                    : 1,
                )
                  .fill(1)
                  .map((_: any, index: number) => (
                    <div key={index} style={{ margin: '0px 10px' }}>
                      <BaseCardSkeleton key={index} />
                    </div>
                  ))}
              </>
            ) : votingPlayerListLocal?.length ? (
              <CircleCarousel
                items={votingPlayerListLocal}
                // activeIndex={itemIndex}
                // setActiveIndex={setItemIndex}
                isFixedWidth={true}
              />
            ) : (
              <div className="heading-title unverified-alert">
                {t('currently no players to show')}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}

export default React.memo(PlayersDisplay)
