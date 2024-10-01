import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/NftCard.css'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  getFlooredFixed,
  getPlayerLevelName,
  isMobile,
  toKPIIntegerFormat,
  toKPINumberFormat,
} from '@utils/helpers'
import classNames from 'classnames'
import {
  getKioskItemDetail,
  setStakeFormShowed,
  showGenesisNftForm,
  showNftForm,
  showSignupForm,
} from '@root/apis/onboarding/authenticationSlice'
import BottomPopup from '@components/Dialog/BottomPopup'
import Send from '@pages/PlayerNft/Send'
import ImageComponent from '@components/ImageComponent'
import PlayerImage from '@components/PlayerImage'
import DummyNftImage from '@assets/images/dummyNft.webp'
import { NFT_STATUS, SALES_OPTION } from '@root/constants'
import { RootState } from '@root/store/rootReducers'
import EditIcon from '@assets/images/edit.webp'
import CloseAbsolute from '@components/Form/CloseAbsolute'

interface Props {
  nft: any //INftCard
  isNavigate?: boolean | null
  showTitle?: boolean | null
  className?: string
  onNftDetailView?: any
  isEndable?: boolean | null
  isAdmin?: boolean | null
  onEditItem?: any
}

const KioskNftCardMobile: React.FC<Props> = ({
  nft,
  isNavigate,
  showTitle,
  className = '',
  onNftDetailView,
  isEndable,
  isAdmin,
  onEditItem,
}) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  let countDown: any = null
  const navigate = useNavigate()

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { getUserSettingsData, ipLocaleCurrency, currencyRate } =
    authenticationData

  const currencySymbol =
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD'

  const nativeAmount = nft?.maxbid
    ? nft?.maxbid * nft?.coinprice * nft?.exchangeRateUSD?.rate * currencyRate
    : 0

  const [state, setState] = useState({
    day: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })
  const { winChances } = useSelector((state: RootState) => state.gallery)
  const { stakingBalance, isGetEANftsBalanceSuccess } = useSelector(
    (state: RootState) => state.playercoins,
  )
  const [showPopup, setShowPopup] = useState(false)
  const [endable, setEndable] = useState(false)
  const isAuction = nft?.salesmethod?.toString() === SALES_OPTION.AUCTION
  const isRaffle = nft?.salesmethod?.toString() === SALES_OPTION.RAFFLE
  const isFan = nft?.salesmethod?.toString() === SALES_OPTION.FAN
  const updateState = (data: any) => {
    setState(state => ({ ...state, ...data }))
  }

  const initCountDown = () => {
    countDown = setInterval(function () {
      const countDownDate = new Date(nft?.blockdeadline).getTime()
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
          day: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
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

  const handleClick = () => {
    if (!isNavigate) return
    if (isMobile()) {
      dispatch(showNftForm({ nft, nftMobile: true }))
    } else {
      onNftDetailView ? onNftDetailView(nft) : dispatch(showNftForm({ nft }))
    }
  }

  useEffect(() => {
    return () => {
      clearInterval(countDown)
    }
  }, [])

  useEffect(() => {
    if (nft?.blockdeadline) {
      if (countDown) {
        clearInterval(countDown)
      }
      initCountDown()
    }
  }, [nft])

  const isParticipated = () => {
    const currentUserCoins = winChances[0]?.coinsparticipateduser
    if (parseInt(currentUserCoins) > 0) {
      return true
    }
    return false
  }

  const handleBid = () => {
    if (
      !localStorage.getItem('loginInfo') &&
      !localStorage.getItem('loginId')
    ) {
      dispatch(showSignupForm())
      return
    }
    if (nft?.isclosed) {
      return
    }
    dispatch(setStakeFormShowed())
    dispatch(showNftForm({ nft, isBid: !endable, isEndable: endable }))
  }

  const gotoPlayer = (event: any) => {
    event.stopPropagation()
    // const player = nft.detailpageurl
    // navigate(`/app/player/${player}`)
  }
  const isEnded = new Date(nft?.blockdeadline).getTime() <= new Date().getTime()

  return (
    <div
      className={classNames(
        'nft-card kiosk-card-mobile',
        className,
        nft?.itemstatusid === 0 ? 'pending-item' : '',
      )}
      onClick={(event: any) => {
        if (window.location.pathname.includes('/player-dashboard')) {
          if (isAdmin) {
            onEditItem(event, 'open')
            dispatch(getKioskItemDetail(nft?.itemid))
          } else {
            handleClick()
          }
        } else {
          handleClick()
        }
      }}
    >
      <div className="nft">
        <div className="nft-image-cover">
          {nft?.itempicturethumb ? (
            <ImageComponent
              loading="lazy"
              src={nft?.itempicturethumb}
              alt=""
              className="nft-image"
            />
          ) : (
            <ImageComponent
              loading="lazy"
              src={DummyNftImage}
              alt=""
              className="nft-image"
            />
          )}
          {isAdmin ? (
            <div
              className="edit-box"
              onClick={(event: any) => {
                onEditItem(event, 'edit')
                dispatch(getKioskItemDetail(nft?.itemid))
              }}
            >
              <ImageComponent loading="lazy" src={EditIcon} alt="" />
            </div>
          ) : nft?.actualinventory > 0 ? (
            <div className="coins_issued_over_nft">
              <span className="fg-primary-color">{nft?.actualinventory}</span>
            </div>
          ) : (
            <></>
          )}
          <div className="fullwidth">
            <div className="nft-bid-info-body">
              <div
                style={{
                  backgroundColor: isRaffle
                    ? '#f3b127e5'
                    : isFan
                    ? '#c879f9e5'
                    : '#6bc909e5',
                }}
              >
                {isEnded
                  ? t('ended')
                  : `${state.day}d ${state.hours}h ${state.minutes}m ${state.seconds}s`}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="second-part darkTheme">
        <div className="nft-name" onClick={gotoPlayer}>
          {nft?.name}&nbsp;
        </div>
        <div className={classNames('nft-title')}>{nft.itemname}</div>
        {isAuction && (
          <div className="kiosk-price-wrapper fg-primary-color">
            {toKPIIntegerFormat(nft?.maxbid ?? 0)} ${nft?.ticker}
            <b className="primary-text-color">
              &nbsp;/&nbsp;{toKPINumberFormat(nativeAmount)}&nbsp;
              {currencySymbol}
            </b>
          </div>
        )}

        {isAuction && !isEnded ? (
          <div className={classNames('gold-color btn-text')}>
            <span>{t('bid now')}</span>
          </div>
        ) : (isRaffle || isFan) && !isParticipated() && !isEnded ? (
          <div className={classNames('gold-color btn-text')}>
            <span>
              {t(stakingBalance > 0 ? 'participate' : 'stake to win')}
            </span>
          </div>
        ) : null}
      </div>
      {showPopup ? (
        <BottomPopup
          mode="nft"
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false)
          }}
        >
          {/* <CloseAbsolute
            onClose={() => {
              setShowPopup(false)
            }}
          /> */}
          <Send
            onSubmit={handleBid}
            onClose={() => {
              setShowPopup(false)
            }}
          />
        </BottomPopup>
      ) : null}
    </div>
  )
}

export default KioskNftCardMobile
