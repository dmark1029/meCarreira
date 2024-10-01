import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import {
  fetchListPlayersLanding,
  getPlayer1Contract,
  getTrendingScoutsPlayers,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { useNavigate } from 'react-router-dom'
import {
  getCircleColor,
  getFlooredFixed,
  getFlooredNumber,
  getMarketValue,
  getPercentageEst,
  getPlayerLevelClassName,
  getUsdFromMatic,
  isMobile,
} from '@utils/helpers'
import PlayerImage from '@components/PlayerImage'
import classnames from 'classnames'
import { setPurchasePlayerId } from '@root/apis/purchase/purchaseSlice'
import toast from 'react-hot-toast'
import {
  getUserRankingList,
  showPurchaseForm,
  showSignupForm,
} from '@root/apis/onboarding/authenticationSlice'
import { fetchPlayersStatsTrending } from '@root/apis/playerStats/playerStatsSlice'
import { PLAYER_STATUS } from '@root/constants'
import { useInView } from 'react-intersection-observer'
import { useIdleTimer } from 'react-idle-timer'
import classNames from 'classnames'
import UserCard from '@components/Card/UserCard'
import UserCardSkeleton from '@components/Card/UserCardSkeleton'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import {
  fetchComingPlayerList,
  fetchMyVotingPlayerList,
  fetchVotingPlayerList,
  fetchVotingStats,
} from '@root/apis/playerVoting/playerVotingSlice'
import { postRequestAuth } from '@root/apis/axiosClientAuth'
import TooltipLabel from '@components/TooltipLabel'

interface Props {
  item: any
  index: number
  prevData?: any
  isVotingPlayer?: boolean
  votingTimer?: any
}
let trendingStatsInterval: any = null
export const PlayerItem: React.FC<Props> = ({
  item,
  index,
  prevData = null,
  isVotingPlayer = false,
  votingTimer,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const usdRef = useRef<any>(null)
  const percentageRef = useRef<any>(null)
  const getClassName = name => name
  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')

  const playerStatsData = useSelector((state: RootState) => state.playerstats)
  const { fetchPlayerStatsDataTrending = [] } = playerStatsData

  useEffect(() => {
    handleUsdAnimation()
    // handlePercentageAnimation()
  }, [item])

  useEffect(() => {
    handlePercentageAnimation()
  }, [fetchPlayerStatsDataTrending])

  const handleBuy = (e: any) => {
    if (
      (item?.playerstatusid?.id === 5 ||
        item?.playerstatusid === 5 ||
        item?.playerlevelid === 5) &&
      item?.exlistingon === false
    ) {
      e.stopPropagation()
      toast.error(t('player is not listed yet'))
    } else {
      e.stopPropagation()
      const profileLink = `player/${item.id}`
      dispatch(setPurchasePlayerId(profileLink))
      handlePurchaseOpen('buy', item)
    }
  }

  const handleSell = (e: any) => {
    if (
      (item?.playerstatusid?.id === 5 ||
        item?.playerstatusid === 5 ||
        item?.playerlevelid === 5) &&
      item?.exlistingon === false
    ) {
      e.stopPropagation()
      toast.error(t('player is not listed yet'))
    } else {
      e.stopPropagation()
      const profileLink = `player/${item.id}`
      dispatch(setPurchasePlayerId(profileLink))
      dispatch(getPlayer1Contract({ url: item?.detailpageurl }))
      handlePurchaseOpen('sell', item)
    }
  }

  const handlePurchaseOpen = (value: string, data: any) => {
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
  }

  const handleUsdAnimation = () => {
    if (usdRef?.current?.classList[3] === 'profit-style') {
      usdRef?.current?.classList.remove('profit')
    } else if (usdRef?.current?.classList[3] === 'loss-style') {
      usdRef?.current?.classList.remove('loss-style')
    }
    setTimeout(() => {
      if (getUsdFromMatic(item).usdNow > getUsdFromMatic(item).usdOld) {
        usdRef?.current?.classList.add('profit-style')
      } else {
        usdRef?.current?.classList.add('loss-style')
      }
    }, 500)
  }

  const handlePercentageAnimation = () => {
    const trendingItem = getLivePlayerStat(item)
    if (percentageRef?.current?.classList[1] === 'profit') {
      percentageRef?.current?.classList.remove('profit')
    } else if (percentageRef?.current?.classList[1] === 'loss') {
      percentageRef?.current?.classList.remove('loss')
    }
    setTimeout(() => {
      if (
        getPercentageEst(trendingItem).oldNumber <
        getPercentageEst(trendingItem).newNumber
      ) {
        percentageRef?.current?.classList.add('profit')
        if (percentageRef?.current) {
          percentageRef.current.style.color = 'var(--profit-color)'
        }
      } else {
        percentageRef?.current?.classList.add('loss')
        if (percentageRef?.current) {
          percentageRef.current.style.color = 'var(--loss-color)'
        }
      }
    }, 500)
  }

  const getLivePlayerStat = item => {
    const currentPlayerIndex = fetchPlayerStatsDataTrending.findIndex(
      stat => stat.player.toLowerCase() === item?.playercontract?.toLowerCase(),
    )
    if (currentPlayerIndex > -1) {
      return fetchPlayerStatsDataTrending[currentPlayerIndex]
    }
    return item
  }

  //   Voting

  const [isVoted, setIsVoted] = useState(false)

  // APIS
  const votePlayer = (e: any) => {
    e.stopPropagation()
    if (!loginInfo && !loginId) {
      return dispatch(showSignupForm())
    }

    // setIsLoading(true)
    postRequestAuth('players/vote_listed_player/', { id: item.id })
      .then(() => {
        setIsVoted(true)
        // dispatch(fetchVotingPlayerList())
        // dispatch(fetchMyVotingPlayerList())
      })
      .catch(() => {})
      .finally(() => {
        dispatch(fetchVotingStats())
        // setIsLoading(false)
      })
  }

  const { voteAvailableIn } = useSelector(
    (state: RootState) => state.playerVoting,
  )

  const isOutOfTournament = item?.disqualified || false
  const containsMedals = item?.qualifying_medals?.length || false
  // console.log(item)

  return (
    <div
      className="players-landing-item relative overflow-hidden"
      onClick={() => {
        window.scrollTo(0, 0)
        navigate(`/app/player/${item.detailpageurl}`)
      }}
    >
      {isOutOfTournament && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#f3b2270e',
            zIndex: 101,
          }}
          className="flex items-center justify-center"
        >
          <div className="capitalize text-gold text-lg">out of tournament</div>
        </div>
      )}

      {window.innerWidth < 700 ? (
        <>
          <div
            style={
              isOutOfTournament
                ? {
                    opacity: 0.5,
                  }
                : {}
            }
            className="player-image"
          >
            <div
              className="image-border"
              style={{
                background: getCircleColor(item?.playerlevelid),
              }}
            >
              <PlayerImage
                src={item.playerpicturethumb}
                className="nft-image"
                hasDefault={true}
              />
            </div>
          </div>
          <div
            style={
              isOutOfTournament
                ? {
                    opacity: 0.5,
                  }
                : containsMedals
                ? {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                : {}
            }
            className="player-info-wrapper"
          >
            <div className="player-name text-left">
              <span className={getPlayerLevelClassName(item?.playerlevelid)}>
                {item.name} {item?.ticker ? `$${item?.ticker}` : ''}
              </span>
            </div>

            {containsMedals ? (
              <div>
                <TooltipLabel title={item?.qualifying_medals?.[0]?.medal?.name}>
                  <img
                    className="trophy-icon "
                    src={item?.qualifying_medals?.[0]?.medal?.imagethumbnail}
                    alt={item?.qualifying_medals?.[0]?.medal?.name}
                  />
                </TooltipLabel>
              </div>
            ) : null}
            {containsMedals ? null : (
              <div className="market-value">
                {item?.playerstatusid < 4 ? (
                  <div className="button-wrapper">
                    <div className="button-wrapper">
                      <div
                        className={classnames(
                          'player-info-stats',
                          'number-color',
                          'matic-value',
                          'matic-figure',
                        )}
                        style={{
                          fontSize: '18px',
                          color: 'var(--primary-text-color)',
                        }}
                      >
                        $0
                      </div>
                      <div className="changed-price">
                        <div
                          className={classnames(
                            'number-color',
                            getClassName('profit'),
                          )}
                          style={{ fontSize: '18px' }}
                        >
                          0.00%
                        </div>
                      </div>
                    </div>
                    <div className="coming-soon-wrapper">
                      {t('coming soon')}
                    </div>
                  </div>
                ) : (
                  <div className="button-wrapper">
                    <div className="button-wrapper">
                      {isVotingPlayer ? (
                        <div
                          className={classnames(
                            'player-info-stats',
                            'number-color',
                            'matic-value',
                            'matic-figure',
                          )}
                          style={{
                            fontSize: '18px',
                            color: 'var(--primary-text-color)',
                          }}
                        >
                          {item?.vote + (isVoted ? 1 : 0) || 0}
                        </div>
                      ) : (
                        <div
                          className={classnames(
                            'player-info-stats',
                            'number-color',
                            'matic-value',
                            'matic-figure',
                            getPlayerLevelClassName(item?.playerlevelid),
                            !item?.coin_issued
                              ? ''
                              : getMarketValue(
                                  item?.matic,
                                  item?.exchangeRateUSD?.rate,
                                  item?.coin_issued,
                                ) >=
                                getMarketValue(
                                  prevData?.matic,
                                  prevData?.exchangeRateUSD?.rate,
                                  prevData?.coin_issued,
                                )
                              ? getClassName('profit')
                              : getClassName('loss'),
                          )}
                          style={{
                            fontSize: '18px',
                            color: 'var(--primary-text-color)',
                          }}
                        >
                          $
                          {getFlooredNumber(
                            getMarketValue(
                              item?.matic,
                              item?.exchangeRateUSD?.rate,
                              item?.coin_issued,
                            ),
                          )}
                        </div>
                      )}
                      {isVotingPlayer ? (
                        <div className="changed-price">
                          <div
                            ref={percentageRef}
                            className={classnames('number-color text-gold')}
                            style={{ fontSize: '18px' }}
                          >
                            {item?.vote + (isVoted ? 1 : 0) > 1
                              ? t('Votes')
                              : t('vote')}
                          </div>
                        </div>
                      ) : (
                        <div className="changed-price">
                          <div
                            ref={percentageRef}
                            className={classnames(
                              'number-color',
                              getPercentageEst(getLivePlayerStat(item))
                                .oldNumber <
                                getPercentageEst(getLivePlayerStat(item))
                                  .newNumber
                                ? getClassName('profit')
                                : getClassName('loss'),
                            )}
                            style={{ fontSize: '18px' }}
                          >
                            {getFlooredFixed(
                              getPercentageEst(getLivePlayerStat(item))
                                .percentage,
                              2,
                            )}
                            %
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="button-box-wrapper">
                      {isVotingPlayer ? (
                        voteAvailableIn ? (
                          <div className="changed-price">
                            <div
                              ref={percentageRef}
                              className={classnames('number-color text-gold')}
                              style={{ fontSize: '20px', color: '#fff' }}
                            >
                              {votingTimer}
                            </div>
                          </div>
                        ) : (
                          <div className="text-green" onClick={votePlayer}>
                            {t('vote')}
                          </div>
                        )
                      ) : (
                        <>
                          {' '}
                          <div onClick={handleBuy}>{t('buy')}</div>
                          <div onClick={handleSell}>{t('sell')}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            style={
              isOutOfTournament
                ? {
                    opacity: 0.5,
                  }
                : {}
            }
            className="player-image-wrapper"
          >
            <div className="player-number">{index}</div>
            <div className="player-image">
              <div
                className="image-border"
                style={{
                  background: getCircleColor(item?.playerlevelid),
                }}
              >
                <PlayerImage
                  src={item.playerpicturethumb}
                  className="nft-image"
                  hasDefault={true}
                />
              </div>
            </div>
          </div>
          <div
            style={
              isOutOfTournament
                ? {
                    opacity: 0.5,
                  }
                : {}
            }
            className="player-info-wrapper"
          >
            <div className="player-name-wrapper">
              <div className="player-name">
                <span className={getPlayerLevelClassName(item?.playerlevelid)}>
                  {item.name} {item?.ticker ? `$${item?.ticker}` : ''}
                </span>
              </div>
              {containsMedals ? (
                <div>
                  <TooltipLabel
                    title={item?.qualifying_medals?.[0]?.medal?.name}
                  >
                    <img
                      className="trophy-icon "
                      src={item?.qualifying_medals?.[0]?.medal?.imagethumbnail}
                      alt={item?.qualifying_medals?.[0]?.medal?.name}
                    />
                  </TooltipLabel>
                </div>
              ) : null}

              {containsMedals ? null : (
                <div className="market-value">
                  {item?.playerstatusid >= 4 ? (
                    <div
                      className={classnames(
                        'player-info-stats',
                        'number-color',
                        'matic-value',
                        'matic-figure',
                        getPlayerLevelClassName(item?.playerlevelid),
                        !item?.coin_issued
                          ? ''
                          : getMarketValue(
                              item?.matic,
                              item?.exchangeRateUSD?.rate,
                              item?.coin_issued,
                            ) >=
                            getMarketValue(
                              prevData?.matic,
                              prevData?.exchangeRateUSD?.rate,
                              prevData?.coin_issued,
                            )
                          ? getClassName('profit')
                          : getClassName('loss'),
                      )}
                      style={{
                        color: 'var(--primary-text-color)',
                      }}
                    >
                      $
                      {getFlooredNumber(
                        getMarketValue(
                          item?.matic,
                          item?.exchangeRateUSD?.rate,
                          item?.coin_issued,
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            {containsMedals ? null : item?.playerstatusid < 4 ? (
              <div className="button-wrapper">
                <div className="price-value">
                  <div
                    style={{ color: 'var(--primary-text-color)' }}
                    className={classnames(
                      'number-color',
                      'pt-5',
                      'usd-price',
                      'textSize',
                      getClassName('profit-style'),
                    )}
                  >
                    $0.000
                  </div>

                  <div className="changed-price">
                    <div
                      className={classnames(
                        'number-color',
                        getClassName('profit'),
                      )}
                      style={{ fontSize: '20px' }}
                    >
                      0.00%
                    </div>
                  </div>
                </div>
                <div className="coming-soon-wrapper">{t('coming soon')}</div>
              </div>
            ) : (
              <div className="button-wrapper">
                <div className="price-value">
                  {isVotingPlayer ? (
                    <div
                      ref={usdRef}
                      style={{ color: 'var(--primary-text-color)' }}
                      className={classnames(
                        '',
                        'pt-5',
                        'usd-price',
                        'textSize  text-gold',
                      )}
                    >
                      <span className="text-xl">
                        {item?.vote + (isVoted ? 1 : 0) || 0}
                      </span>
                    </div>
                  ) : (
                    <div
                      ref={usdRef}
                      style={{ color: 'var(--primary-text-color)' }}
                      className={classnames(
                        'number-color',
                        'pt-5',
                        'usd-price',
                        'textSize',
                        getPlayerLevelClassName(item?.playerlevelid),
                        getUsdFromMatic(item).usdNow >
                          getUsdFromMatic(item).usdOld
                          ? getClassName('profit-style')
                          : getClassName('loss-style'),
                      )}
                    >
                      ${getFlooredFixed(getUsdFromMatic(item)?.usdNow, 3)}
                    </div>
                  )}

                  {isVotingPlayer ? (
                    <div className="changed-price">
                      <div
                        ref={percentageRef}
                        className={classnames(' text-gold text-xl')}
                      >
                        <span className="text-xl">
                          {item?.vote + (isVoted ? 1 : 0) > 1
                            ? t('Votes')
                            : t('vote')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="changed-price">
                      <div
                        ref={percentageRef}
                        className={classnames(
                          'number-color',
                          getPercentageEst(getLivePlayerStat(item)).oldNumber <
                            getPercentageEst(getLivePlayerStat(item)).newNumber
                            ? getClassName('profit')
                            : getClassName('loss'),
                        )}
                        style={{ fontSize: '20px' }}
                      >
                        {getFlooredFixed(
                          getPercentageEst(getLivePlayerStat(item)).percentage,
                          2,
                        )}
                        %
                      </div>
                    </div>
                  )}
                </div>
                <div className="button-box-wrapper">
                  {isVotingPlayer ? (
                    voteAvailableIn ? (
                      <div className="changed-price">
                        <div
                          ref={percentageRef}
                          className={classnames(' text-gold')}
                          style={{ fontSize: '20px', color: '#fff' }}
                        >
                          {votingTimer}
                        </div>
                      </div>
                    ) : (
                      <div className="text-green text-xl" onClick={votePlayer}>
                        {t('vote')}
                      </div>
                    )
                  ) : (
                    <>
                      <div onClick={handleBuy}>{t('buy')}</div>
                      <div onClick={handleSell}>{t('sell')}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const PlayerSkeletonItem: React.FC = () => {
  return (
    <div className="players-landing-skeleton-item players-landing-item">
      {window.innerWidth < 700 ? (
        <>
          <div className="player-image-wrapper">
            <div className="player-image">
              <div className="image-border"></div>
            </div>
          </div>
          <div className="player-info-wrapper">
            <div className="player-name-skeleton"></div>
            <div className="button-wrapper">
              <div className="market-value-skeleton"></div>
              <div className="button-box-skeleton"></div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="player-image-wrapper">
            <div className="player-number">&nbsp;</div>
            <div className="player-image">
              <div className="image-border"></div>
            </div>
          </div>
          <div className="player-info-wrapper">
            <div className="player-name-wrapper">
              <div className="player-name-skeleton"></div>
              <div className="market-value-skeleton"></div>
            </div>
            <div className="button-wrapper">
              <div className="price-value-skeleton"></div>
              <div className="button-box-skeleton"></div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const TabularVotePlayers: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const authenticationData: any = useSelector(
    (state: RootState) => state.authentication,
  )
  const { isWalletFormVisible, isVisibleModal } = authenticationData
  const { playersListLandingData } = playerCoinData

  const [trendingTab, setTrendingTab] = useState('players')

  useEffect(() => {
    dispatch(fetchListPlayersLanding())
    return () => {
      clearInterval(trendingStatsInterval)
    }
  }, [])

  useEffect(() => {
    if (trendingTab === 'scouts') {
      dispatch(getTrendingScoutsPlayers())
      // dispatch(getUserRankingList({ type: 'season' }))
    }
  }, [trendingTab])

  const { ref, inView } = useInView({ delay: 5000 })

  const onIdle = () => {
    clearInterval(trendingStatsInterval)
  }

  const onActive = () => {
    clearInterval(trendingStatsInterval)
    if (
      !isVisibleModal &&
      playersListLandingData.length > 0 &&
      !document.hidden &&
      inView
    ) {
      trendingStatsInterval = setInterval(() => {
        handleGetPriceStats()
      }, 20000)
    }
  }

  const onAction = () => {
    /**/
  }

  useIdleTimer({
    onIdle,
    onActive,
    onAction,
    timeout: 6000,
    throttle: 500,
  })

  useEffect(() => {
    clearInterval(trendingStatsInterval)
    if (
      !isVisibleModal &&
      playersListLandingData.length > 0 &&
      !document.hidden &&
      inView
    ) {
      trendingStatsInterval = setInterval(() => {
        handleGetPriceStats()
      }, 20000)
    }
  }, [playersListLandingData.length, isVisibleModal, document.hidden, inView])

  const handleGetPriceStats = () => {
    if (isMobile()) {
      // const testItems = playersListLandingData.map(item => item.props.card)
      const newStat = playersListLandingData.filter((player: any) => {
        if (player?.name && player?.name?.toLowerCase() === 'coming soon') {
          return false
        } else {
          if (player?.playerstatusid >= PLAYER_STATUS.SUBSCRIBE) {
            return true
          } else {
            return false
          }
        }
      })
      const playerContracts =
        newStat.length > 0
          ? newStat.map((item: any) => item.playercontract)
          : []
      if (playerContracts.length > 0 && !isWalletFormVisible) {
        dispatch(
          fetchPlayersStatsTrending({
            contracts: playerContracts,
            query: 'complex',
          }),
        )
      }
    } else {
      // const testItems = playersListLandingData.map(item => item.props.card)
      const newStat = playersListLandingData.filter((player: any) => {
        if (player?.name && player?.name?.toLowerCase() === 'coming soon') {
          return false
        } else {
          if (player?.playerstatusid >= PLAYER_STATUS.SUBSCRIBE) {
            return true
          } else {
            return false
          }
        }
      })

      const playerContracts =
        newStat.length > 0
          ? newStat.map((item: any) => item.playercontract)
          : []
      if (playerContracts.length > 0 && !isWalletFormVisible) {
        dispatch(
          fetchPlayersStatsTrending({
            contracts: playerContracts,
            query: 'complex',
          }),
        )
      }
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
    <div
      className={classNames(
        'section-wrapper',
        isMobile() ? 'landing-trending-section' : '',
      )}
    >
      <div className="section-title-container">
        <div className="section-title">
          {t('vote players')}
          {/* <WhatshotIcon /> */}
        </div>
        <div className="trending-switch">
          <b
            className={'trending-switch-selected capitalize'}
            onClick={() => {
              navigate('/app/player-launches')
            }}
          >
            {t('show more')}
          </b>
        </div>
      </div>
      <div className="user-list-wrapper" ref={ref}>
        {votingPlayerList.length === 0 ? (
          <>
            <div className="user-list-column">
              {new Array(5).fill(1).map((_: any, index: number) => (
                <PlayerSkeletonItem key={index} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div
              className={classNames(
                'user-list-column players-landing-one-column',
              )}
            >
              {votingPlayerList.slice(0, 8).map((item: any, index: number) => (
                <PlayerItem
                  key={index}
                  item={item}
                  index={window.innerWidth <= 700 ? 0 : index + 1}
                  isVotingPlayer={true}
                  votingTimer={
                    <>
                      {state.hours}h {state.minutes}m {state.seconds}s
                    </>
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TabularVotePlayers
