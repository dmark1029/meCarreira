import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/NftCard.css'
import { useLocation, useNavigate } from 'react-router-dom'
import debounce from 'lodash.debounce'
import {
  showSignupForm,
  showKioskItemDetail,
  getKioskOrderDetail,
  getCheckPlayerCoinBal,
  togglePayForItem,
  getKioskItemDetail,
  getItemAddress,
  postPlaceKioskOrder,
} from '@root/apis/onboarding/authenticationSlice'
import { useDispatch, useSelector } from 'react-redux'
import BidButton from '@components/Button/BidButton'
import classNames from 'classnames'
import {
  getCircleColor,
  getCountryCodeNew,
  getFlooredFixed,
  isMobile,
  toKPIIntegerFormat,
  toKPINumberFormat,
} from '@utils/helpers'
import { RootState } from '@root/store/rootReducers'
import PlayerImage from '@components/PlayerImage'
import EditIcon from '@assets/images/edit.webp'
import ImageComponent from '@components/ImageComponent'
import KioskNftCardMobile from './KioskNftCardMobile'
import KioskNftCard from './KioskNftCard'
import { SALES_OPTION } from '@root/constants'
import { countries } from '@components/CountryDropdown'
import AliceCarousel from 'react-alice-carousel'
import leftArrow from '@assets/images/left_angle_bracket.webp'
import rightArrow from '@assets/images/right_angle_bracket.webp'

interface Props {
  kioskItem?: any
  fullFilled?: boolean | null
  buyItem?: boolean | null
  className?: string
  isAdmin?: boolean
  disableBuy?: boolean
  onEditItem?: any
}

const KioskItem: React.FC<Props> = ({
  kioskItem,
  fullFilled,
  buyItem,
  className = '',
  onEditItem = () => console.log(),
  isAdmin = false,
  disableBuy = false,
}) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const myPlayerContract = localStorage.getItem('playercontract')
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const { getPlayerDetailsSuccessData, allPlayersData } = playerCoinData
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    getUserSettingsData,
    ipLocaleCurrency,
    currencyRate,
    CheckPlayerCoinBal,
    itemAddressData,
    KioskItemDetail,
  } = authenticationData

  const currencySymbol =
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD'

  const nativeAmount = kioskItem?.itemprice
    ? kioskItem?.itemprice *
      (kioskItem?.coinprice ?? 1) *
      kioskItem?.exchangeRateUSD?.rate *
      currencyRate
    : 0

  const location = useLocation()
  const [buyBalance, setBuyBalance] = useState(false)
  const [items, setItems] = useState([])
  const [hovered, setHovered] = useState(false)

  const responsiveItemDefault = {
    0: {
      items: 1,
    },
  }

  useEffect(() => {
    if (kioskItem?.additionalImages?.length > 0) {
      setItems(
        kioskItem?.additionalImages.map((image, index) => (
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
  }, [kioskItem?.additionalImages])

  const handleClick = hash => {
    console.log({ buyItem })
    if (buyItem) {
      dispatch(showKioskItemDetail({ showKioskItemDetailsBuy: true }))
      dispatch(getKioskItemDetail(kioskItem?.itemid))
      //---------------------------------------------------------------------------------------------------------------------------------------
      // unlimited_order_#1 - calling /default_order_address api to get address details (especially for unlimited items)
      //---------------------------------------------------------------------------------------------------------------------------------------
      if (localStorage.getItem('loginInfo')) {
        dispatch(getItemAddress(kioskItem?.itemid))
      }
    } else {
      dispatch(getKioskOrderDetail({ hash, reload: true }))
      dispatch(showKioskItemDetail({ showKioskItemDetails: true }))
    }
  }

  // useEffect(() => {
  //   if (buyItem && (loginInfo || loginId)) {
  //     dispatch(
  //       getCheckPlayerCoinBal(
  //         kioskItem?.playercontract ||
  //           getPlayerDetailsSuccessData?.playercontract ||
  //           myPlayerContract,
  //       ),
  //     )
  //   }
  // }, [buyItem])

  useEffect(() => {
    if (CheckPlayerCoinBal > kioskItem?.itemprice) {
      setBuyBalance(false)
    } else {
      setBuyBalance(true)
    }
  }, [CheckPlayerCoinBal])

  const loginId = localStorage.getItem('loginId')
  const loginInfo = localStorage.getItem('loginInfo')

  const handleBid = (event: any) => {
    if (fullFilled) {
      dispatch(showKioskItemDetail({ showKioskItemDetails: true }))
    }
    if (buyItem) {
      event.stopPropagation()
      if (loginId || loginInfo) {
        // dispatch(
        //   togglePayForItem({
        //     visible: true,
        //     price: kioskItem?.itemprice,
        //     name: kioskItem?.itemname,
        //     kioskItem: true,
        //     kioskItemInfo: {
        //       itemid: kioskItem?.itemid,
        //       playercontract: kioskItem?.playercontract,
        //       playerlevelid: kioskItem?.playerlevelid,
        //       playerpicturethumb: kioskItem?.playerpicturethumb,
        //       name: kioskItem?.name,
        //       ticker: kioskItem?.ticker,
        //     },
        //     deliveryModeRedux: kioskItem?.delivery_mode,
        //   }),
        // )
        dispatch(showKioskItemDetail({ showKioskItemDetailsBuy: true }))
        dispatch(getKioskItemDetail(kioskItem?.itemid))
      } else {
        dispatch(showSignupForm())
      }
    }
  }

  const gotoPlayer = (event: any) => {
    event.stopPropagation()
    const player = kioskItem.detailpageurl
    navigate(`/app/player/${player}`)
  }

  return (
    <>
      {kioskItem?.salesmethod &&
      kioskItem?.salesmethod?.toString() !== SALES_OPTION.FIX ? (
        isMobile() ? (
          <KioskNftCardMobile
            nft={kioskItem}
            isNavigate={true}
            isAdmin={isAdmin}
            onEditItem={onEditItem}
          />
        ) : (
          <KioskNftCard
            nft={kioskItem}
            isNavigate={true}
            isAdmin={isAdmin}
            onEditItem={onEditItem}
          />
        )
      ) : (
        <div
          className={classNames(
            'nft-card',
            className,
            kioskItem?.itemstatusid === 0 ? 'pending-item' : '',
          )}
          onClick={(event: any) => {
            if (event.target.className !== 'img-radius carousel-arrow') {
              if (window.location.pathname.includes('/player-dashboard')) {
                if (isAdmin) {
                  onEditItem(event, 'open')
                  dispatch(getKioskItemDetail(kioskItem?.itemid))
                } else {
                  handleClick(kioskItem?.hash)
                }
              } else {
                handleClick(kioskItem?.hash)
              }
            }
          }}
        >
          <div
            className="nft"
            style={{ height: isMobile() ? '' : 'fit-content' }}
          >
            <div className="nft-image-cover" style={{ position: 'relative' }}>
              {isAdmin ? (
                <div
                  className="edit-box"
                  onClick={(event: any) => {
                    onEditItem(event, 'edit')
                    dispatch(getKioskItemDetail(kioskItem?.itemid))
                  }}
                >
                  <ImageComponent loading="lazy" src={EditIcon} alt="" />
                </div>
              ) : null}
              {isMobile() ? (
                <ImageComponent
                  loading="lazy"
                  src={kioskItem?.itempicturethumb}
                  alt=""
                  className="nft-image"
                />
              ) : (
                kioskItem?.additionalImages?.length > 0 && (
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
                              zIndex: 100,
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
                              zIndex: 100,
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
                )
              )}
              {!isAdmin ? (
                kioskItem?.temporders > 0 ? (
                  <div className="coins_issued_over_nft">
                    {kioskItem?.unlimitedinventory
                      ? '∞'
                      : kioskItem?.actualinventory}
                    /{' '}
                    <span style={{ color: 'orange' }}>
                      {kioskItem?.temporders}
                    </span>
                  </div>
                ) : (
                  <div className="coins_issued_over_nft">
                    <span className="fg-primary-color">
                      {kioskItem?.unlimitedinventory
                        ? '∞'
                        : buyItem
                        ? kioskItem?.actualinventory
                        : kioskItem?.quantity}
                    </span>
                  </div>
                )
              ) : null}
              {fullFilled ? (
                <div className="kiosk-item-flag-shipped">{t('shipped')}</div>
              ) : buyItem ? (
                <div className="currency_mark_wrapper kiosk-item-flag-buyItem w-none">
                  <div
                    className="currency_mark_img"
                    style={{
                      background: getCircleColor(
                        kioskItem?.playerlevelid ||
                          getPlayerDetailsSuccessData?.playerlevelid,
                      ),
                    }}
                  >
                    <PlayerImage
                      src={
                        isAdmin
                          ? kioskItem?.playerpicturethumb ||
                            allPlayersData[0]?.playerpicturethumb
                          : kioskItem?.playerpicturethumb ||
                            getPlayerDetailsSuccessData?.playerpicturethumb ||
                            getPlayerDetailsSuccessData?.playerpicture ||
                            getPlayerDetailsSuccessData?.img
                      }
                      className="img-radius_kiosk currency_mark"
                    />
                  </div>
                  <div className={isMobile() ? 'item-price-container' : ''}>
                    {!isMobile() ? (
                      <>
                        {toKPIIntegerFormat(kioskItem?.itemprice)}
                        <span>
                          {' '}
                          {kioskItem?.ticker ||
                            getPlayerDetailsSuccessData?.ticker ||
                            allPlayersData[0]?.ticker}
                        </span>
                        &nbsp;/&nbsp;{toKPINumberFormat(nativeAmount)}&nbsp;
                        {currencySymbol}
                      </>
                    ) : (
                      <>
                        {' '}
                        &nbsp;{toKPIIntegerFormat(kioskItem?.itemprice)}
                        &nbsp;/&nbsp;{toKPINumberFormat(nativeAmount)}&nbsp;
                        {currencySymbol}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="kiosk-item-flag">{t('paid')}</div>
              )}
            </div>
          </div>
          <div
            className={classNames('second-part', 'kiosk-item-details-wrapper')}
          >
            <div>
              <div className="kiosk_player_name" onClick={gotoPlayer}>
                {kioskItem?.name ||
                  allPlayersData[0]?.name ||
                  getPlayerDetailsSuccessData?.name}
              </div>
              <div
                className={classNames(
                  'nft-title',
                  isMobile() ? '' : 'clamped-text',
                )}
                // style={{ color: '#fff', height: '50px', whiteSpace: 'nowrap' }}
              >
                {kioskItem?.itemname}
              </div>

              <div
                className={classNames('nft-description')}
                style={{
                  maxHeight: '74px',
                  height: '74px',
                  whiteSpace: 'normal',
                }}
              >
                <p style={{ fontSize: '16px' }}>
                  {kioskItem?.additionaldescription}
                </p>
              </div>
            </div>
            {!isMobile() &&
              (fullFilled ? (
                <div className={classNames('completed_title')}>
                  {t('completed')}
                </div>
              ) : buyItem ? (
                <>
                  {/* <BidButton
                isDisabled={false}
                isLoading={false}
                title={t('details')}
                className={classNames('nft-bid-button')}
                onPress={(event: any) => handleBid(event)}
                kiosk={true}
              /> */}
                </>
              ) : (
                <BidButton
                  isDisabled={false}
                  isLoading={false}
                  title={t('fulfill')}
                  className={classNames('nft-bid-button')}
                  onPress={(event: any) => handleBid(event)}
                />
              ))}
          </div>
        </div>
      )}
    </>
  )
}

export default KioskItem
