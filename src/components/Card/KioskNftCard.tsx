import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/NftCard.css'
import { useLocation, useNavigate } from 'react-router-dom'
import BidPopup from '@components/Dialog/BidPopup'
import BidForm from '@components/Dialog/BidForm'
import {
  getKioskItemDetail,
  resetKioskItemDetail,
  setStakeFormShowed,
  showNftForm,
  showSignupForm,
  showWalletForm,
} from '@root/apis/onboarding/authenticationSlice'
import { useDispatch, useSelector } from 'react-redux'
import BidButton from '@components/Button/BidButton'
import classNames from 'classnames'
import StakeForm from '@components/Dialog/StakeForm'
import {
  getFlooredFixed,
  getPlayerLevelName,
  isMobile,
  toFixed,
  toKPIIntegerFormat,
  toKPINumberFormat,
} from '@utils/helpers'
import ImageComponent from '@components/ImageComponent'
import { SALES_OPTION } from '@root/constants'
import { RootState } from '@root/store/rootReducers'
import EditIcon from '@assets/images/edit.webp'
import AliceCarousel from 'react-alice-carousel'
import leftArrow from '@assets/images/left_angle_bracket.webp'
import rightArrow from '@assets/images/right_angle_bracket.webp'

function TimeTrack(props) {
  const { nft } = props
  const { t } = useTranslation()

  const isAuction = nft?.salesmethod?.toString() === SALES_OPTION.AUCTION
  const isRaffle = nft?.salesmethod?.toString() === SALES_OPTION.RAFFLE
  const isFan = nft?.salesmethod?.toString() === SALES_OPTION.FAN

  const isEnded = new Date(nft?.blockdeadline).getTime() <= new Date().getTime()
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
  const [endable, setEndable] = useState(false)
  let countDown: any = null

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

  useEffect(() => {
    return () => {
      if (countDown) {
        clearInterval(countDown)
      }
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

  return (
    <div className="fullwidth">
      <div className="nft-bid-info-header">
        <div>{t('ending in')}</div>
        {isAuction ? (
          <div>{t('current Bid')}</div>
        ) : isFan ? (
          <div>{t('top')}</div>
        ) : null}
      </div>
      <div
        className={classNames(
          'nft-bid-info-body',
          isRaffle && 'yellow-color',
          isFan && 'diamond-color',
        )}
      >
        <div>
          {isEnded
            ? t('ended')
            : `${state.day}d ${state.hours}h ${state.minutes}m ${state.seconds}s`}
        </div>
        {isAuction ? (
          <div className="bid-value-wrapper">
            {/* <b>
              {toKPINumberFormat(nativeAmount)}&nbsp;
              {currencySymbol}
            </b> */}
            {/* <div>{toKPIIntegerFormat(nft?.maxbid ?? 0)}</div> */}
            <div>{toFixed(nft?.maxbid ?? 0, 3)}</div>
          </div>
        ) : isFan ? (
          <div className="bid-value-wrapper">
            <div>{toKPIIntegerFormat(nft?.actualinventory ?? 0)} Fans</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface Props {
  nft?: any //INftCard
  isNavigate?: boolean | null
  isWalletNavigate?: boolean | null
  showTitle?: boolean | null
  className?: string
  isEndable?: boolean | null
  isAdmin?: boolean | null
  onEditItem?: any
}

const KioskNftCard: React.FC<Props> = ({
  nft,
  isNavigate,
  showTitle,
  className = '',
  isWalletNavigate,
  isEndable,
  isAdmin,
  onEditItem,
}) => {
  const { winChances, isFetchGenesisNFTDataSuccess, isFetchNFTDataSuccess } =
    useSelector((state: RootState) => state.gallery)
  const { stakingBalance } = useSelector(
    (state: RootState) => state.playercoins,
  )
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const isAuction = nft?.salesmethod?.toString() === SALES_OPTION.AUCTION
  const isRaffle = nft?.salesmethod?.toString() === SALES_OPTION.RAFFLE
  const isFan = nft?.salesmethod?.toString() === SALES_OPTION.FAN

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { getUserSettingsData, ipLocaleCurrency, currencyRate } =
    authenticationData

  const navigate = useNavigate()
  const location = useLocation()
  const [showBidPopup, setShowBidPopup] = useState(false)
  const [items, setItems] = useState([])
  const [hovered, setHovered] = useState(false)

  const responsiveItemDefault = {
    0: {
      items: 1,
    },
  }

  const isParticipated = () => {
    if (!isFetchGenesisNFTDataSuccess && isFetchNFTDataSuccess) {
      const currentUserCoins = winChances[0]?.coinsparticipateduser
      if (parseInt(currentUserCoins) > 0) {
        return true
      }
      return false
    }
    return false
  }

  const handleClick = () => {
    dispatch(resetKioskItemDetail())
    isMobile()
      ? dispatch(showNftForm({ nft, nftMobile: true }))
      : dispatch(showNftForm({ nft }))
  }

  const gotoPlayer = (event: any) => {
    event.stopPropagation()
    const player = nft.detailpageurl
    navigate(`/app/player/${player}`)
  }

  const isEnded = new Date(nft?.blockdeadline).getTime() <= new Date().getTime()

  useEffect(() => {
    if (nft?.additionalImages?.length > 0) {
      setItems(
        nft?.additionalImages.map((image, index) => (
          <img
            src={image}
            alt={`Selected ${index + 1}`}
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: isMobile() ? '0px' : '20px 20px 0px 0px',
            }}
          />
        )),
      )
    }
  }, [nft?.additionalImages])

  return (
    <div
      className={classNames(
        'nft-card kiosk-card',
        className,
        nft?.itemstatusid === 0 ? 'pending-item' : '',
      )}
      onClick={(event: any) => {
        if (event.target.className !== 'img-radius carousel-arrow') {
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
        }
      }}
    >
      <div>
        <div className="nft-image-cover" style={{ position: 'relative' }}>
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
          ) : null}
          {nft?.additionalImages?.length > 0 && (
            <div
              id="nft-card-carousel"
              className={classNames(
                'circle-carousel-mob alice-carousel',
                items.length <= 3 ? 'center-carousel' : 'carousel',
              )}
              style={{ padding: 0 }}
              onMouseOver={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <AliceCarousel
                infinite={items.length > 1}
                mouseTracking
                items={items}
                disableButtonsControls={false}
                keyboardNavigation={true}
                responsive={responsiveItemDefault}
                renderPrevButton={() => {
                  return items.length > 1 && (isMobile() || hovered) ? (
                    <div
                      style={{
                        marginLeft: '20px',
                        opacity: 0.6,
                        transition: '0.5s',
                        zIndex: 1000,
                      }}
                    >
                      <ImageComponent
                        src={leftArrow}
                        alt=""
                        className="img-radius carousel-arrow"
                        style={{ margin: '2px 5px 2px 0' }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        marginLeft: '20px',
                        opacity: 0,
                        transition: '0.5s',
                        zIndex: 1000,
                      }}
                    >
                      <ImageComponent
                        src={leftArrow}
                        alt=""
                        className="img-radius carousel-arrow"
                        style={{ margin: '2px 5px 2px 0' }}
                      />
                    </div>
                  )
                }}
                renderNextButton={() => {
                  return items.length > 1 && (isMobile() || hovered) ? (
                    <div
                      style={{
                        marginRight: '20px',
                        opacity: 0.6,
                        transition: '0.5s',
                        zIndex: 1000,
                      }}
                    >
                      <ImageComponent
                        src={rightArrow}
                        alt=""
                        className="img-radius carousel-arrow"
                        style={{ margin: '2px 3px 2px 2px' }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        marginRight: '20px',
                        opacity: 0,
                        transition: '0.5s',
                        zIndex: 1000,
                      }}
                    >
                      <ImageComponent
                        src={rightArrow}
                        alt=""
                        className="img-radius carousel-arrow"
                        style={{ margin: '2px 3px 2px 2px' }}
                      />
                    </div>
                  )
                }}
                // onSlideChanged={handleSlideChange}
              />
            </div>
          )}
        </div>
      </div>
      <div className={classNames('second-part')}>
        <TimeTrack nft={nft} />
        <div
          className={classNames('nft-name', (isAuction || isRaffle) && 'p-0')}
          onClick={gotoPlayer}
        >
          {nft?.name}&nbsp;
        </div>
        {showTitle ? (
          <>
            <div className={classNames('nft-title')}>{nft.itemname}</div>
          </>
        ) : (
          <div
            className={classNames('nft-title')}
            style={{
              maxHeight: '30px',
              height: '30px',
            }}
          >
            {nft.itemname}
          </div>
        )}
        <div
          className={classNames('nft-description')}
          style={{ maxHeight: '74px', height: '74px', whiteSpace: 'normal' }}
        >
          <p style={{ fontSize: '16px' }}>{nft.additionaldescription}</p>
        </div>
        {isAuction && !isEnded ? (
          <div
            className={classNames('nft-bid-info-body mt-10 place-bid-text')}
            style={{ justifyContent: 'center' }}
          >
            {t('place bid')}
          </div>
        ) : (isRaffle || isFan) && !isParticipated() && !isEnded ? (
          <div
            className={classNames(
              'nft-bid-info-body mt-10',
              isRaffle ? 'yellow-color' : 'diamond-color',
            )}
            style={{ justifyContent: 'center' }}
          >
            {t(stakingBalance > 0 ? 'participate' : 'stake to win')}
          </div>
        ) : null}
      </div>
      <BidPopup isOpen={showBidPopup}>
        {showBidPopup ? (
          <>
            {isAuction ? (
              <BidForm nft={nft} onClose={() => setShowBidPopup(false)} />
            ) : (
              <StakeForm
                detailpageurl={nft.detailpageurl}
                onClose={() => setShowBidPopup(false)}
              />
            )}
          </>
        ) : null}
      </BidPopup>
    </div>
  )
}

export default KioskNftCard
