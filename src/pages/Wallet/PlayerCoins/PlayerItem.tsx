import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  getCircleColor,
  getFlooredFixed,
  isMobile,
  toKPINumberFormat,
} from '@utils/helpers'
import classNames from 'classnames'
import HoverMenu from '@components/HoverMenu'
import { RootState } from '@root/store/rootReducers'
import { PLAYER_STATUS } from '@root/constants'
import { useNavigate } from 'react-router'
import { showWalletForm } from '@root/apis/onboarding/authenticationSlice'
import { getPlayerDetails } from '@root/apis/playerCoins/playerCoinsSlice'
import ArrowDownFilled from '@components/Svg/ArrowDownFilled'
import ArrowUpFilled from '@components/Svg/ArrowUpFilled'
import classnames from 'classnames'
import ImageComponent from '@components/ImageComponent'
import { toast } from 'react-hot-toast'
import usdc from '@assets/images/usdc.webp'
import bitcoin from '@assets/images/wrapped-bitcoin.webp'
import tether from '@assets/images/tether.webp'
import ethereum from '@assets/images/ethereum-eth.webp'
import maticIcon from '@assets/images/matic-token-icon.webp'
interface playerItem {
  img?: string
  statusid?: number
  name?: string
  matic?: number
  price?: number
  playerpicture?: string
  playerpicturethumb?: string
  stakingbalance?: number
  balance?: any
  status?: any
  isShown?: boolean
  isCoin?: boolean
  playerstatusid?: any
  playerlevelid?: any
  pctChange?: any
  detailpageurl?: string
  ticker?: string
}

interface Props {
  index?: number
  item: playerItem
  handleStake: any
  handleMoreClick: any
  isOpted?: boolean
  usdRate?: number
  statData?: any
  isSendOpen?: boolean
  playerItemcallBack?: any
  onCancelStake: () => void
  onStake: () => void
  activeIndex: number
}

const PlayerItem: React.FC<Props> = props => {
  const {
    index,
    item,
    handleStake,
    handleMoreClick,
    isSendOpen,
    statData = { coin_issued: '', matic: '' },
    playerItemcallBack,
    onStake,
    onCancelStake,
    activeIndex,
  } = props
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const { getPlayerDetailsSuccessData, fetchBalancePlayersData } =
    playerCoinData

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const {
    currencyRate,
    getUserSettingsData,
    ipLocaleCurrency,
    selectedThemeRedux,
  } = authenticationData

  const currencySymbol =
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD'

  const [clicked, setClicked] = useState(false)
  const [stakee, setStakee] = useState<any>(-1)

  const prevStatRef: any = useRef()
  useEffect(() => {
    prevStatRef.current = statData
  }, [statData])

  useEffect(() => {
    if (getPlayerDetailsSuccessData && stakee > -1) {
      setStakee(-1)
      handleStake(getPlayerDetailsSuccessData)
    }
  }, [getPlayerDetailsSuccessData])

  const handleClick = (evt: any) => {
    // if (item?.statusid === 5) {
    //   if (
    //     !['more-icon', 'hover-modal-menuitem'].includes(evt.target.id) &&
    //     !isSendOpen
    //   ) {
    //     if (!clicked) onStake()
    //     handleMoreClick(false)
    //   }
    // }
    if (
      !['more-icon', 'hover-modal-menuitem'].includes(evt.target.id) &&
      !isSendOpen
    ) {
      if (!clicked) onStake()
      handleMoreClick(false)
    }
  }

  const getUsdPrice = () => {
    console.log('statData', statData)
    console.log('prevStatRef', prevStatRef)
    let matic = prevStatRef?.current?.matic || 0
    let usd_rate = prevStatRef?.current?.usd_rate || 0
    let totalUsd = 0
    if (statData) {
      matic = statData.matic || 0
      usd_rate = statData.usd_rate || 0
    }
    const totalValue =
      parseFloat(matic) * (parseFloat(item.balance) + item.stakingbalance) //item.balance
    totalUsd = totalValue * usd_rate * currencyRate
    console.log({ totalValue, usd_rate, currencyRate })
    console.log('totalUsd', totalUsd, prevStatRef)
    return getFlooredFixed(totalUsd, 2)
  }
  // const handleStakeClick = () => {
  //   if (fetchBalancePlayersData?.matic >= 0.05) {
  //     setStakee(index)
  //     dispatch(getPlayerDetails(item?.detailpageurl))
  //     setClicked(false)
  //   } else {
  //     toast.error(t('Insufficient Matic for gas price'))
  //   }
  // }

  const handleStakeClick = () => {
    setStakee(index)
    dispatch(getPlayerDetails(item?.detailpageurl))
    setClicked(false)
  }

  const onSendOpt = (val: any) => {
    if (playerItemcallBack) {
      playerItemcallBack(val)
    }
  }

  const handleClickImg = () => {
    const player = item?.detailpageurl
    if (player) {
      dispatch(showWalletForm({}))
      navigate(`/app/player/${player}`)
    }
  }

  const getMenuDisabled = (sId: number | string) => {
    if ((sId && sId === PLAYER_STATUS.PRO) || sId === PLAYER_STATUS.SUBSCRIBE) {
      return false
    } else {
      return true
    }
  }

  const onCancelStaking = (evt: any) => {
    evt.stopPropagation()
    onCancelStake()
  }

  return (
    <div
      key={index}
      className={classNames(
        'nft-item pointer',
        'token-ticket',
        isMobile() ? 'wallet-player-coin' : '',
      )}
      style={isMobile() ? { justifyContent: 'flex-start', gap: '10px' } : {}}
      onClick={handleClick}
    >
      <div className="nft-image-section">
        <HoverMenu
          options={
            item?.ticker === 'MATIC' ||
            item?.ticker === 'USDT' ||
            item?.ticker === 'USDC' ||
            item?.ticker === 'WETH' ||
            item?.ticker === 'WBTC'
              ? ['send']
              : ['more', 'send', 'buy', 'sell']
          }
          onItemPress={onSendOpt}
          // isDisabled={getMenuDisabled(item?.statusid)}
          isDisabled={
            item?.ticker === 'MATIC' ||
            item?.ticker === 'USDT' ||
            item?.ticker === 'USDC' ||
            item?.ticker === 'WETH' ||
            item?.ticker === 'WBTC'
              ? getMenuDisabled(4)
              : getMenuDisabled(item?.statusid)
          }
        />
        <div
          className="image-border pc-avatar-container"
          style={{
            background: getCircleColor(item?.playerlevelid),
          }}
        >
          <ImageComponent
            loading="lazy"
            src={
              item?.ticker === 'MATIC'
                ? maticIcon
                : item?.ticker === 'WETH'
                ? ethereum
                : item?.ticker === 'USDT'
                ? tether
                : item?.ticker === 'USDC'
                ? usdc
                : item?.ticker === 'WBTC'
                ? bitcoin
                : item?.playerpicture || item?.playerpicturethumb
            }
            alt=""
            className="nft-image"
            onClick={handleClickImg}
          />
        </div>
      </div>
      {activeIndex === index ? (
        <div className="nft-name-section nft-first-name-section">
          <div
            className="select_nft_stake bottom-border"
            onClick={() => handleStakeClick()}
          >
            {t('stake') + '/' + t('unstake')}
          </div>
          <div
            className="select_nft_cancel bottom-border"
            onClick={onCancelStaking}
          >
            {t('cancel')}
          </div>
        </div>
      ) : (
        <div className="nft-name-section pc-name-section">
          {stakee === index ? (
            <div className="stake-spin-container">
              <div className={classNames('spinner size-small')}></div>
            </div>
          ) : (
            <>
              <div className="nft-name">
                {item?.isCoin ? `${item.name} (${item.ticker})` : item.name}
              </div>
              <div className="balance-wrapper">
                <div>
                  {item?.stakingbalance && item?.stakingbalance > 0 ? (
                    <span className="fg-primary-color">
                      {getFlooredFixed(item?.stakingbalance, 2)} / {''}
                    </span>
                  ) : null}
                  {getFlooredFixed(item?.balance, 5)}
                </div>
                <div className="percentage_change_wrapper">
                  <div className="nft-price">
                    {currencySymbol === 'USD' ? '$' : ''}
                    {toKPINumberFormat(getUsdPrice())}{' '}
                    {currencySymbol === 'USD' ? '' : currencySymbol}
                  </div>
                  <div className="percentage_container">
                    {!isNaN(item?.pctChange) && item?.pctChange >= 0 ? (
                      <ArrowUpFilled />
                    ) : (
                      <ArrowDownFilled />
                    )}
                    <div
                      className={classnames(
                        'number-color',
                        !isNaN(item?.pctChange) && item?.pctChange >= 0
                          ? 'profit'
                          : 'loss',
                      )}
                    >
                      {isNaN(item?.pctChange)
                        ? '0.00'
                        : getFlooredFixed(
                            !isNaN(item?.pctChange) && item?.pctChange < 0
                              ? item?.pctChange * -1
                              : item?.pctChange,
                            2,
                          )}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default PlayerItem
