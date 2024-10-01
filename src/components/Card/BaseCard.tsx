/* eslint-disable @typescript-eslint/no-empty-function */

import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { IPlayerCard as CardProps } from '@root/types'
import { useNavigate } from 'react-router-dom'
import {
  setPurchasePlayerContract,
  setPurchasePlayerId,
} from '@root/apis/purchase/purchaseSlice'
import classnames from 'classnames'
import '@assets/css/components/PlayerCard.css'
import {
  convertToFixed,
  getCountryCode,
  getCountryNameNew,
  getFlooredFixed,
  getFlooredNumber,
  getMarketValue,
  getPercentageEst,
  getPlayerLevelName,
  getPlayerLevelClassName,
  getUsdFromMatic,
  getRoundedFixed,
} from '@utils/helpers'
import TooltipLabel from '@components/TooltipLabel'
import 'flag-icons/css/flag-icons.min.css'
import { NO_STYLE_MODE, PLAYER_STATUS, RANK_STYLE_MODE } from '@root/constants'
import '@assets/css/components/MyCard.css'
import { toast } from 'react-hot-toast'
import { getPlayer1Contract } from '@root/apis/playerCoins/playerCoinsSlice'
import Diamond from '../../assets/images/DIA_small.webp'
import Gold from '../../assets/images/GOLD_small.webp'
import Silver from '../../assets/images/SILVER_small.webp'
import Bronze from '../../assets/images/BRONZ_small.webp'
import Empty from '../../assets/images/EMPTY_small.webp'
import ImageComponent from '@components/ImageComponent'
import ArrowDownFilled from '@components/Svg/ArrowDownFilled'
import ArrowUpFilled from '@components/Svg/ArrowUpFilled'
import { RootState } from '@root/store/rootReducers'
import { useInView } from 'react-intersection-observer'
import VerifiedIcon from '@assets/icons/icon/verified.png'
import { ethers } from 'ethers'
import {
  setTourStep,
  showSignupForm,
} from '@root/apis/onboarding/authenticationSlice'
import { ProgressBar } from 'react-progressbar-fancy'
import SubmitButton from '@components/Button/SubmitButton'
import { postRequestAuth } from '@root/apis/axiosClientAuth'
import {
  fetchMyVotingPlayerList,
  fetchVotingPlayerList,
  fetchVotingStats,
} from '@root/apis/playerVoting/playerVotingSlice'
interface Props {
  card: CardProps
  playercardjson: any
  prevData?: any
  isDesignMode?: any
  navigation?: boolean
  reflection?: boolean
  isLanding?: boolean
  hasTour?: boolean
  getClassName: any
  onBuy: any
  onSell: any
  shareCard?: boolean
  futureTime?: any
  isVotingCard?: boolean
  votingTimer?: any
}

const BaseCard: React.FC<Props> = ({
  card,
  playercardjson,
  prevData = null,
  navigation = true,
  reflection = false,
  isLanding = false,
  isDesignMode = false,
  hasTour = false,
  getClassName,
  onBuy,
  onSell,
  shareCard = false,
  futureTime,
  isVotingCard = false,
  votingTimer,
}) => {
  const votingLocal = card?.isvoting || isVotingCard
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const nodeRef = useRef<any>(null)
  const usdRef = useRef<any>(null)
  const percentageRef = useRef<any>(null)
  const percentageReflectionRef = useRef<any>(null)
  const playerStatsData = useSelector((state: RootState) => state.playerstats)

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const { playersOwnershipData } = playerCoinData

  const {
    voteAvailableIn,
    userlevel,
    minuserlevelrequired,
    votestolaunchplayer,
  } = useSelector((state: RootState) => state.playerVoting)

  const [ownPct, setOwnPct] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')

  useEffect(() => {
    if (card?.playercontract) {
      const availableToken = playersOwnershipData.findIndex(
        (item: any) =>
          ethers.utils.getAddress(item.playercontract) ===
          ethers.utils.getAddress(card?.playercontract),
      )
      if (availableToken > -1 && card?.coin_issued > 0) {
        setOwnPct(playersOwnershipData[availableToken].ownership)
      }
    }
  }, [playersOwnershipData])

  const { customcardsetting } = useSelector(
    (state: RootState) => state.authentication,
  )
  const isDummy = isDesignMode ? false : customcardsetting === NO_STYLE_MODE

  const playercardjsonRankingList = {
    Diamond: {
      givenname_color: 'purple',
      surname_color: 'purple',
      border_color: 'purple',
      border_stroke: false,
      avatar_color: 'purple',
      bottom_decor_color: 'purple',
      background_image: 4,
    },
    Gold: {
      givenname_color: 'gold',
      surname_color: 'gold',
      border_color: 'gold',
      border_stroke: false,
      avatar_color: 'gold',
      bottom_decor_color: 'gold',
      background_image: 3,
    },
    Silver: {
      givenname_color: 'silver',
      surname_color: 'silver',
      border_color: 'silver',
      border_stroke: false,
      avatar_color: 'silver',
      bottom_decor_color: 'silver',
      background_image: 2,
    },
    Bronze: {
      givenname_color: 'orange',
      surname_color: 'orange',
      border_color: 'orange',
      border_stroke: false,
      avatar_color: 'orange',
      bottom_decor_color: 'orange',
      background_image: 1,
    },
    None: null,
  }

  const playercardjsonData = isDesignMode
    ? playercardjson
    : customcardsetting === NO_STYLE_MODE
    ? null
    : customcardsetting === RANK_STYLE_MODE
    ? playercardjsonRankingList[getPlayerLevelName(card?.playerlevelid)]
    : playercardjson ??
      playercardjsonRankingList[getPlayerLevelName(card?.playerlevelid)]

  const { fetchedPlayerStatsDataNL } = playerStatsData

  const playerStatus = card?.playerstatusid?.id ?? card?.playerstatusid

  const { ref, inView } = useInView({ delay: 200 })

  const handleClick = () => {
    if (hasTour || card?.playerpicturethumb?.includes('hacker')) {
      return
    }
    if (navigation && card?.country_id) {
      if (
        parseFloat(nodeRef.current.parentNode.parentNode.style.opacity) > 0 &&
        parseFloat(nodeRef.current.parentNode.parentNode.style.opacity) < 1
      ) {
        return
      }
      if (nodeRef.current.parentNode.parentNode.style.clear === 'both') {
        return
      }
      const player = card.detailpageurl

      if (votingLocal && !card.approvedbyadmin) {
        return
      }
      navigate(`/app/player/${player}`)
    }
  }

  const handleBuy = (e: any) => {
    if (hasTour) {
      dispatch(setTourStep('buy'))
      return
    }
    // if (
    //   (card?.playerstatusid?.id === 5 ||
    //     card?.playerstatusid === 5 ||
    //     card?.playerlevelid === 5) &&
    //   card?.exlistingon === false
    // ) {
    //   e.stopPropagation()
    //   toast(t('player is not listed yet'))
    // } else {
    //   e.stopPropagation()
    //   const profileLink = `player/${card.id}`
    //   dispatch(setPurchasePlayerId(profileLink))
    //   onBuy()
    // }
    e.stopPropagation()
    const profileLink = `player/${card.id}`
    console.log({ card })
    dispatch(setPurchasePlayerId(profileLink))
    dispatch(setPurchasePlayerContract(card?.playercontract))
    onBuy()
  }

  const handleSell = (e: any) => {
    // if (
    //   (card?.playerstatusid?.id === 5 ||
    //     card?.playerstatusid === 5 ||
    //     card?.playerlevelid === 5) &&
    //   card?.exlistingon === false
    // ) {
    //   e.stopPropagation()
    //   toast(t('player is not listed yet'))
    // } else {
    //   e.stopPropagation()
    //   const profileLink = `player/${card.id}`
    //   dispatch(setPurchasePlayerId(profileLink))
    //   dispatch(getPlayer1Contract({ url: card?.detailpageurl }))
    //   onSell()
    // }
    if (hasTour) {
      return
    }
    e.stopPropagation()
    const profileLink = `player/${card.id}`
    dispatch(setPurchasePlayerId(profileLink))
    dispatch(getPlayer1Contract({ url: card?.detailpageurl }))
    onSell()
  }

  useEffect(() => {
    handleUsdAnimation()
    if (percentageRef.current) {
      handlePercentageAnimation()
    }
  }, [card])

  const handleUsdAnimation = () => {
    if (usdRef?.current?.classList[3] === 'profit-style') {
      usdRef?.current?.classList.remove('profit')
    } else if (usdRef?.current?.classList[3] === 'loss-style') {
      usdRef?.current?.classList.remove('loss-style')
    }
    setTimeout(() => {
      if (getUsdFromMatic(card).usdNow > getUsdFromMatic(card).usdOld) {
        usdRef?.current?.classList.add('profit-style')
      } else {
        usdRef?.current?.classList.add('loss-style')
      }
    }, 500)
  }

  const handlePercentageAnimation = () => {
    if (!fetchedPlayerStatsDataNL && isLanding) {
      percentageRef.current.style.animation = 'unset'
    } else {
      percentageRef.current.style.animation = ''
    }

    if (percentageRef?.current?.classList[1] === 'profit') {
      percentageRef?.current?.classList.remove('profit')
      percentageReflectionRef?.current?.classList.remove('profit')
    } else if (percentageRef?.current?.classList[1] === 'loss') {
      percentageRef?.current?.classList.remove('loss')
      percentageReflectionRef?.current?.classList.remove('loss')
    }
    setTimeout(
      () => {
        if (
          getPercentageEst(card).oldNumber < getPercentageEst(card).newNumber
        ) {
          percentageRef?.current?.classList.add('profit')
          percentageReflectionRef?.current?.classList.add('profit')
          if (percentageRef?.current) {
            percentageRef.current.style.color = 'var(--profit-color)'
          }
          if (percentageReflectionRef?.current) {
            percentageReflectionRef.current.style.color = 'var(--profit-color)'
          }
        } else {
          percentageRef?.current?.classList.add('loss')
          percentageReflectionRef?.current?.classList.add('loss')
          if (percentageRef?.current && percentageReflectionRef?.current) {
            percentageRef.current.style.color = 'var(--loss-color)'
          }
          if (percentageReflectionRef?.current) {
            percentageReflectionRef.current.style.color = 'var(--loss-color)'
          }
        }
      },
      !fetchedPlayerStatsDataNL && isLanding ? 0 : 500,
    )
  }

  const [state, setState] = useState({
    day: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })
  const [isVoted, setIsVoted] = useState(false)

  const updateState = (data: any) => {
    setState(state => ({ ...state, ...data }))
  }

  const initCountDown = () => {
    setInterval(function () {
      const countDownDate = new Date(
        votingLocal
          ? voteAvailableIn * 1000
          : card?.subscriptionstartdate * 1000,
      ).getTime()
      const now = new Date().getTime()
      const distance = countDownDate < now ? 0 : countDownDate - now

      const day = ~~(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      updateState({
        day,
        hours,
        minutes,
        seconds,
      })
    }, 1000)
  }

  useEffect(() => {
    if (
      playerStatus <= PLAYER_STATUS.COMINGSOON &&
      card?.subscriptionstartdate > 0
    ) {
      initCountDown()
    }
  }, [voteAvailableIn])

  // APIS
  const votePlayer = () => {
    if (!loginInfo && !loginId) {
      return dispatch(showSignupForm())
    }

    setIsLoading(true)
    postRequestAuth('players/vote_listed_player/', { id: card.id })
      .then(() => {
        setIsVoted(true)
        // dispatch(fetchVotingPlayerList())
        // dispatch(fetchMyVotingPlayerList())
      })
      .catch(() => {})
      .finally(() => {
        dispatch(fetchVotingStats())
        setIsLoading(false)
      })
  }

  const isVotingDisabled = () => {
    if (
      voteAvailableIn !== 0 ||
      voteAvailableIn !== 0 ||
      userlevel < minuserlevelrequired ||
      (isVoted && card?.vote + 1 === votestolaunchplayer)
    ) {
      return true
    } else {
      return false
    }
  }

  const isOutOfTournament = card?.disqualified || false

  return (
    <>
      {isOutOfTournament && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            // background: '#f3b2270e',
            zIndex: 101,
          }}
          className="flex items-center justify-center"
        >
          <div className="capitalize text-gold text-lg">out of tournament</div>
        </div>
      )}
      <div
        className={classnames(
          'my-card',
          playercardjsonData?.border_color,
          playercardjsonData?.border_stroke
            ? 'stroke-active'
            : 'stroke-inactive',
        )}
        style={
          isOutOfTournament
            ? {
                opacity: 0.5,
              }
            : {}
        }
        onClick={handleClick}
        ref={ref}
      >
        <div
          className={classnames(
            'background-image',
            'background' + (playercardjsonData?.background_image ?? 0),
          )}
          ref={nodeRef}
        />
        <div
          className={classnames(
            'avatar',
            inView && playercardjsonData?.avatar_color,
          )}
        >
          {card?.rank ? (
            <div className="tournament-ranking">{card?.rank}</div>
          ) : null}
          {inView && playercardjsonData?.avatar_color.startsWith('Fire') ? (
            <>
              <div className="player-image">
                {/* <img
                  src={card?.playerpicturethumb || card?.playerpicture}
                  alt=""
                  loading="lazy"
                /> */}
                <ImageComponent
                  src={card?.playerpicturethumb || card?.playerpicture}
                  alt="player_image"
                />
              </div>
              <div className="circle"></div>
              <svg className="fire-icon">
                <filter id="wavy">
                  <feTurbulence
                    x="0"
                    y="0"
                    baseFrequency="0.009"
                    numOctaves="5"
                    speed="2"
                  >
                    <animate
                      attributeName="baseFrequency"
                      dur="60s"
                      values="0.02; 0.005; 0.02"
                      repeatCount="indefinite"
                    />
                  </feTurbulence>
                  <feDisplacementMap
                    in="SourceGraphic"
                    scale="3"
                  ></feDisplacementMap>
                </filter>
              </svg>
            </>
          ) : (
            <div
              className={
                card?.playerpicturethumb?.includes('hacker')
                  ? 'hacker-image'
                  : 'player-image'
              }
            >
              {/* <img
                src={card?.playerpicturethumb || card?.playerpicture}
                alt=""
                loading="lazy"
              /> */}
              <ImageComponent
                src={card?.playerpicturethumb || card?.playerpicture}
                alt="player_image"
              />
            </div>
          )}
        </div>
        <div className="country-ranking">
          <TooltipLabel
            title={getCountryNameNew(card?.country_id || card?.nationality_id)}
          >
            <span
              className={`fi fis fi-${getCountryCode(
                card?.country_id || card?.nationality_id,
              )}`}
            ></span>
          </TooltipLabel>
        </div>
        <div className="player-givenname-wrapper">
          <div
            className={classnames(
              'player-givenname',
              inView && playercardjsonData?.givenname_color,
            )}
          >
            {card?.givenname && card?.givenname.length > 20
              ? card?.givenname.substring(0, 20) + '...'
              : card?.givenname}
          </div>
          {card?.givenname === 'Coming Soon' ? '' : '|'}
          <div className="player-birthyear">
            {card?.dateofbirth?.substr(0, 4) ?? '1988'}
          </div>
          {!isDummy ? (
            <>
              {getPlayerLevelName(card?.playerlevelid) === 'Diamond' ? (
                <ImageComponent
                  className="player_batch"
                  src={Diamond}
                  alt=""
                  loading="lazy"
                />
              ) : getPlayerLevelName(card?.playerlevelid) === 'Gold' ? (
                <ImageComponent
                  className="player_batch"
                  src={Gold}
                  alt=""
                  loading="lazy"
                />
              ) : getPlayerLevelName(card?.playerlevelid) === 'Silver' ? (
                <ImageComponent
                  className="player_batch"
                  src={Silver}
                  alt=""
                  loading="lazy"
                />
              ) : getPlayerLevelName(card?.playerlevelid) === 'Bronze' ? (
                <ImageComponent
                  className="player_batch"
                  src={Bronze}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <ImageComponent
                  className="player_batch"
                  src={Empty}
                  alt=""
                  loading="lazy"
                />
              )}
            </>
          ) : null}
        </div>
        <div className="player-surname-wrapper">
          <div
            className={classnames(
              'player-surname',
              inView && playercardjsonData?.surname_color,
            )}
          >
            {card?.surname && card?.surname.length > 16
              ? card?.surname.substring(0, 16) + '...'
              : card?.surname}{' '}
            {card?.ticker && <span>{`$${card?.ticker}`}</span>}
          </div>
          {card?.sharetype ? (
            <ImageComponent
              src={VerifiedIcon}
              alt=""
              loading="lazy"
              title={t('official')}
            />
          ) : null}
        </div>
        {votingLocal ? (
          <div className="content-wrapper">
            {card.approvedbyadmin ? (
              <>
                {card?.uservote || card?.uservote === 0 ? (
                  <div
                    style={{
                      textAlign: 'left',
                    }}
                    className="my-vote-count-cont "
                  >
                    {card?.uservote || 0}
                  </div>
                ) : null}
                <div className="market-value-wrapper  ">
                  <div className="comingsoon-text voting-cont">
                    <span>
                      {(card?.vote + (isVoted ? 1 : 0) || 0) +
                        ' ' +
                        (card?.vote + (isVoted ? 1 : 0) > 1
                          ? t('Votes')
                          : t('vote'))}
                    </span>
                    <div className="voting-progressbar-cont">
                      <span>0</span>
                      <ProgressBar
                        className="space"
                        label={'Current Level'}
                        primaryColor={'#81df0d'}
                        secondaryColor={'#0bf4ff'}
                        darkTheme
                        score={
                          ((card?.vote + (isVoted ? 1 : 0) || 0) /
                            (votestolaunchplayer || 100)) *
                          100
                        }
                        hideText
                      />
                      <span>{votestolaunchplayer || 100}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="market-value-wrapper  ">
                  <div className="comingsoon-text waiting-approval-cont voting-cont">
                    {t('Waiting Approval')}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : playerStatus > PLAYER_STATUS.COMINGSOON ? (
          <div
            style={{
              paddingTop: '1rem',
            }}
            className="content-wrapper"
          >
            <div className="characteristics">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
                className="coin-issued"
              >
                {/* <TooltipLabel title={t('coins Existing')}>
                  <div className="coin-issued-symbol" />
                </TooltipLabel> */}
                <label className="text-md text-left w-full text-gray font-bold ">
                  {t('price')}
                </label>
                <div className="">
                  {/* First */}

                  <div
                    style={{
                      marginTop: '-0.3rem',
                    }}
                    className="changed-price"
                  >
                    <div
                      ref={usdRef}
                      style={{ color: 'white' }}
                      className={classnames(
                        'number-color font-bold w-full text-left',
                        'pt-5',
                        'usd-price',
                        'textSize',
                        shareCard
                          ? ''
                          : !isDummy &&
                              getPlayerLevelClassName(card?.playerlevelid),
                        getUsdFromMatic(card).usdNow >
                          getUsdFromMatic(card).usdOld
                          ? getClassName('profit-style')
                          : getClassName('loss-style'),
                      )}
                    >
                      ${getFlooredFixed(getUsdFromMatic(card)?.usdNow, 3)}
                    </div>
                  </div>

                  {/* {getFlooredNumber(
                    getMarketValue(
                      card?.matic ?? card?.matic_price,
                      card?.exchangeRateUSD?.rate,
                      card?.coin_issued,
                    ),
                  )} */}
                  {/* {card?.coin_issued
                    ? convertToFixed(card?.coin_issued).toLocaleString()
                    : '0.00'} */}
                </div>
              </div>
              {ownPct >= 0.01 && (
                <div className="coin-issued-text">
                  {t('you own ')}
                  {getRoundedFixed(ownPct, 2)}%
                </div>
              )}
            </div>

            <div className="market-value-wrapper">
              {/* <div className="market-value"> */}
              <div className="price-value">
                <label className="text-md w-full text-left text-gray font-bold capitalize ">
                  {t('24H Change')}
                </label>
                <div className="changed-price">
                  {getPercentageEst(card).oldNumber ===
                  getPercentageEst(card).newNumber ? (
                    <ArrowUpFilled isPlayerCard={true} />
                  ) : getPercentageEst(card).oldNumber <
                    getPercentageEst(card).newNumber ? (
                    <ArrowUpFilled isPlayerCard={true} />
                  ) : (
                    <ArrowDownFilled isPlayerCard={true} />
                  )}
                  <div
                    ref={percentageRef}
                    className={classnames(
                      'number-color',
                      getPercentageEst(card).oldNumber <
                        getPercentageEst(card).newNumber
                        ? getClassName('profit')
                        : getClassName('loss'),
                    )}
                    style={{ fontSize: '20px' }}
                  >
                    {getFlooredFixed(getPercentageEst(card).percentage, 2)}%
                  </div>
                </div>
                {/* <div
                  className={classnames(
                    'player-info-stats',
                    'number-color',
                    'matic-value',
                    'matic-figure',
                    shareCard
                      ? ''
                      : !isDummy &&
                          getPlayerLevelClassName(card?.playerlevelid),
                    !card?.coin_issued
                      ? ''
                      : getMarketValue(
                          card?.matic ?? card?.matic_price,
                          card?.exchangeRateUSD?.rate,
                          card?.coin_issued,
                        ) >=
                        getMarketValue(
                          prevData?.matic ?? prevData?.matic_price,
                          prevData?.exchangeRateUSD?.rate,
                          prevData?.coin_issued,
                        )
                      ? getClassName('profit')
                      : getClassName('loss'),
                  )}
                  style={{
                    fontSize: '24px',
                    color: 'white',
                  }}
                >
                  $
                  {getFlooredNumber(
                    getMarketValue(
                      card?.matic ?? card?.matic_price,
                      card?.exchangeRateUSD?.rate,
                      card?.coin_issued,
                    ),
                  )}
                </div> */}
              </div>
              <div className="price-value">
                <label className="text-md text-gray font-bold capitalize ">
                  {t('market value')}
                </label>
                <div
                  className={classnames(
                    'player-info-stats',
                    'number-color',
                    'matic-value',
                    'matic-figure',
                    shareCard
                      ? ''
                      : !isDummy &&
                          getPlayerLevelClassName(card?.playerlevelid),
                    !card?.coin_issued
                      ? ''
                      : getMarketValue(
                          card?.matic ?? card?.matic_price,
                          card?.exchangeRateUSD?.rate,
                          card?.coin_issued,
                        ) >=
                        getMarketValue(
                          prevData?.matic ?? prevData?.matic_price,
                          prevData?.exchangeRateUSD?.rate,
                          prevData?.coin_issued,
                        )
                      ? getClassName('profit')
                      : getClassName('loss'),
                  )}
                  style={{
                    fontSize: '24px',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  $
                  {getFlooredNumber(
                    getMarketValue(
                      card?.matic ?? card?.matic_price,
                      card?.exchangeRateUSD?.rate,
                      card?.coin_issued,
                    ),
                  )}
                </div>
                {/* CHANGED PRICE */}
                {/* <div className="changed-price">
                  {getPercentageEst(card).oldNumber ===
                  getPercentageEst(card).newNumber ? (
                    <ArrowUpFilled isPlayerCard={true} />
                  ) : getPercentageEst(card).oldNumber <
                    getPercentageEst(card).newNumber ? (
                    <ArrowUpFilled isPlayerCard={true} />
                  ) : (
                    <ArrowDownFilled isPlayerCard={true} />
                  )}
                  <div
                    ref={percentageRef}
                    className={classnames(
                      'number-color',
                      getPercentageEst(card).oldNumber <
                        getPercentageEst(card).newNumber
                        ? getClassName('profit')
                        : getClassName('loss'),
                    )}
                    style={{ fontSize: '20px' }}
                  >
                    {getFlooredFixed(getPercentageEst(card).percentage, 2)}%
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        ) : card?.subscriptionstartdate > 0 ? (
          <div className="content-wrapper">
            <div className="countdown-wrapper">
              <div className="countdown-text">{t('launching in')}</div>
              <div className="comingsoon-text">
                {state.day.toString().padStart(2, '0')}
                {t('D')} &nbsp;
                {state.hours.toString().padStart(2, '0')}
                {t('H')} &nbsp;
                {state.minutes.toString().padStart(2, '0')}
                {t('M')} &nbsp;
                {state.seconds.toString().padStart(2, '0')}
                {t('S')}
              </div>
            </div>
          </div>
        ) : (
          <div className="content-wrapper">
            <div className="characteristics"></div>
            <div className="market-value-wrapper">
              <div className="comingsoon-text">{t('coming soon')}</div>
            </div>
          </div>
        )}

        {votingLocal ? (
          card.approvedbyadmin ? (
            voteAvailableIn ? (
              <div
                style={{
                  background: 'transparent',
                }}
                className="content-wrapper"
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="countdown-wrapper"
                >
                  <div
                    style={{
                      paddingTop: 0,
                    }}
                    className="countdown-text"
                  >
                    {t('Vote Available in')}
                  </div>
                  <div
                    style={{
                      scale: '0.8',
                    }}
                    className="comingsoon-text"
                  >
                    {votingTimer}
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={e => {
                  e.stopPropagation()
                  votePlayer()
                }}
                className="voting-button-wrapper"
              >
                <SubmitButton
                  title={false ? t('Voted') : t('Vote')}
                  className="vote-submit-button"
                  onPress={() => {}}
                  isDisabled={isVotingDisabled()}
                  isLoading={isLoading}
                />
              </div>
            )
          ) : null
        ) : (
          <div className="purchase-button-wrapper">
            <div
              className={classnames(
                'buy-button',
                playerStatus === PLAYER_STATUS.PRO ||
                  playerStatus === PLAYER_STATUS.SUBSCRIBE
                  ? 'purchase-active'
                  : 'purchase-inactive',
              )}
              onClick={handleBuy}
            >
              {t('buy')}
            </div>
            <div
              className={classnames(
                'sell-button',
                playerStatus === PLAYER_STATUS.PRO ||
                  playerStatus === PLAYER_STATUS.SUBSCRIBE
                  ? 'purchase-active'
                  : 'purchase-inactive',
              )}
              onClick={handleSell}
            >
              {t('sell')}
            </div>
          </div>
        )}

        {playercardjsonData?.achievements > 0 && (
          <div className="achievements">
            {Array.from(
              { length: playercardjsonData?.achievements },
              (_, k) => k + 1,
            ).map((_, index) => (
              <div
                key={index}
                className={'achievements-symbol-' + (index + 1)}
              />
            ))}
          </div>
        )}
        <div
          className={classnames(
            'bottom-decor',
            playercardjsonData?.bottom_decor_color,
          )}
        />
      </div>
      {reflection ? (
        <div
          className={classnames(
            'my-card reflection-card',
            playercardjsonData?.border_color,
            playercardjsonData?.border_stroke
              ? 'stroke-active'
              : 'stroke-inactive',
            hasTour ? 'hidden' : '',
          )}
        >
          <div
            className={classnames(
              'background-image',
              'background' + (playercardjsonData?.background_image ?? 0),
            )}
          />
          <div className="player-givenname-wrapper">|</div>
          <div className="player-surname">
            <span>|</span>
          </div>
          <div className="content-wrapper">
            <div className="characteristics">
              <div className="coin-issued">
                <div className="coin-issued-text">|</div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="market-value-wrapper">
              {playerStatus <= PLAYER_STATUS.COMINGSOON ? (
                <div className="comingsoon-text">{t('coming soon')}</div>
              ) : (
                <>
                  <div className="market-value">
                    <div className="market-value-label">
                      {t('market value')}
                    </div>
                    <div
                      className={classnames(
                        'player-info-stats',
                        'number-color',
                        'matic-value',
                        'matic-figure',
                        shareCard
                          ? ''
                          : !isDummy &&
                              getPlayerLevelClassName(card?.playerlevelid),
                        !card?.coin_issued
                          ? ''
                          : getMarketValue(
                              card?.matic ?? card?.matic_price,
                              card?.exchangeRateUSD?.rate,
                              card?.coin_issued,
                            ) >=
                            getMarketValue(
                              prevData?.matic ?? prevData?.matic_price,
                              prevData?.exchangeRateUSD?.rate,
                              prevData?.coin_issued,
                            )
                          ? getClassName('profit')
                          : getClassName('loss'),
                      )}
                      style={{
                        fontSize: '24px',
                        color: 'white',
                      }}
                    >
                      $
                      {getFlooredNumber(
                        getMarketValue(
                          card?.matic ?? card?.matic_price,
                          card?.exchangeRateUSD?.rate,
                          card?.coin_issued,
                        ),
                      )}
                    </div>
                  </div>
                  <div className="price-value">
                    <div
                      ref={usdRef}
                      style={{ color: 'white' }}
                      className={classnames(
                        'number-color',
                        'pt-5',
                        'usd-price',
                        'textSize',
                        shareCard
                          ? ''
                          : !isDummy &&
                              getPlayerLevelClassName(card?.playerlevelid),
                        getUsdFromMatic(card).usdNow >
                          getUsdFromMatic(card).usdOld
                          ? getClassName('profit-style')
                          : getClassName('loss-style'),
                      )}
                    >
                      ${getFlooredFixed(getUsdFromMatic(card)?.usdNow, 3)}
                    </div>
                    <div className="changed-price">
                      {getPercentageEst(card).oldNumber ===
                      getPercentageEst(card).newNumber ? (
                        <ArrowUpFilled isPlayerCard={true} />
                      ) : getPercentageEst(card).oldNumber <
                        getPercentageEst(card).newNumber ? (
                        <ArrowUpFilled isPlayerCard={true} />
                      ) : (
                        <ArrowDownFilled isPlayerCard={true} />
                      )}
                      <div
                        ref={percentageReflectionRef}
                        className={classnames(
                          'number-color',
                          getPercentageEst(card).oldNumber <
                            getPercentageEst(card).newNumber
                            ? getClassName('profit')
                            : getClassName('loss'),
                        )}
                        style={{ fontSize: '20px' }}
                      >
                        {getFlooredFixed(getPercentageEst(card).percentage, 2)}%
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="purchase-button-wrapper">
            <div className="buy-button purchase-inactive">{t('buy')}</div>
            <div className="sell-button purchase-inactive">{t('sell')}</div>
          </div>
          <div
            className={classnames(
              'bottom-decor',
              playercardjsonData?.bottom_decor_color,
            )}
          />
        </div>
      ) : null}
    </>
  )
}

export default BaseCard
