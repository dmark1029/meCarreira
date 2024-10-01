import ImageComponent from '@components/ImageComponent'
import AppLayout from '@components/Page/AppLayout'
import PlayerImage from '@components/PlayerImage'
import TooltipLabel from '@components/TooltipLabel'
import { getCircleColor, isMobile } from '@utils/helpers'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Spark from '@assets/images/mycard/background-sparks.gif'
import CardFire from '@assets/images/mycard/cardFire.gif'
import maticIcon from '@assets/images/matic-token-icon.webp'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import {
  getKioskOrderDetail,
  showKioskItemDetail,
} from '@root/apis/onboarding/authenticationSlice'
import { useEffect } from 'react'
import { getUserPayedItems } from '@root/apis/playerCoins/playerCoinsSlice'

const UserMyItemsWrapper = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const loginId = localStorage.getItem('loginId')
  const loginInfo = localStorage.getItem('loginInfo')

  const playerCoinData: any = useSelector(
    (state: RootState) => state.playercoins,
  )

  const { userPayedItemsData, isUserPayedLoading } = playerCoinData

  useEffect(() => {
    window.scrollTo(0, 0)
    dispatch(getUserPayedItems())
  }, [])

  const viewOrder = hash => {
    // console.log('viewOrder')
    dispatch(getKioskOrderDetail({ hash, reload: true }))
    dispatch(showKioskItemDetail({ showKioskItemDetails: true }))
  }

  const checkOpen = orderstatus => {
    // Order Status
    // 1. Pending : Status when auction or raffle has not ended
    // 2. Open: Status when auction or raffle ended and need user action on order
    // 3. Inprogress : When player need to fullfill the order
    // 4. Complete : When player has fullfilled the order
    // 5. Closed : Order get closed in case nobody participated or bid
    return !orderstatus || orderstatus === 1 || orderstatus === 2
  }

  return (
    <AppLayout className="notifications my-settings">
      {!loginId && !loginInfo ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <h2 className="page-heading">{t('404! page not found')}</h2>
          <div
            className="button-box button1"
            onClick={() => {
              navigate('/')
            }}
          >
            {t('go to home')}
          </div>
        </div>
      ) : (
        <div className="kiosk-wrapper my-settings">
          {/* list of items paid */}
          <div style={{ marginBottom: '50px' }}>
            <div className="title">
              <h2>{t('purchase history')}</h2>
            </div>
            <div className="content show">
              {isUserPayedLoading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div
                    className="loading-spinner"
                    style={{ marginTop: isMobile() ? '30px' : '30px' }}
                  >
                    <div className="spinner"></div>
                  </div>
                </div>
              ) : (
                <>
                  {userPayedItemsData.length ? (
                    userPayedItemsData.map((el, ind) => {
                      return (
                        <div
                          className="list_of_items_wrapper"
                          style={{ padding: isMobile() ? '10px' : '10px 20px' }}
                          key={ind}
                        >
                          <div
                            className="title_item_wrapper"
                            style={{ gap: '20px' }}
                          >
                            <div>
                              {' '}
                              {el?.itempicturethumb === null ? (
                                el?.item.includes('Flame') ? (
                                  <div className="item_thumb">
                                    <p className="Flame">{t('flame')}</p>
                                  </div>
                                ) : el?.item.includes('Angle') ? (
                                  <div className="item_thumb">
                                    <p className="Angle">{t('angle')}</p>
                                  </div>
                                ) : el?.item.includes('Neon') ? (
                                  <div className="item_thumb">
                                    <p className={el?.item.split(':')[1]}>
                                      {t('neon')}
                                    </p>
                                  </div>
                                ) : el?.item === 'cardBG:Sparks' ? (
                                  <ImageComponent
                                    className="item_thumb"
                                    src={Spark}
                                    alt=""
                                  />
                                ) : el?.item.includes('cardRing') ? (
                                  <ImageComponent
                                    className="item_thumb"
                                    src={CardFire}
                                    alt=""
                                  />
                                ) : null
                              ) : (
                                <ImageComponent
                                  className="item_thumb"
                                  src={el?.itempicturethumb}
                                  alt=""
                                />
                              )}
                            </div>

                            <div className="amount_date_wrapper">
                              <TooltipLabel title={el?.item.replace(':', ' ')}>
                                <div className="amount_date_wrapper_inner">
                                  <p className="item_title">
                                    {el?.item.replace(':', ' ')}
                                  </p>
                                  <p
                                    className={classnames(
                                      'item_title',
                                      checkOpen(el?.orderstatus)
                                        ? 'gold-color'
                                        : 'fg-primary-color',
                                    )}
                                  >
                                    {checkOpen(el?.orderstatus)
                                      ? 'Open'
                                      : 'Completed'}
                                  </p>
                                </div>
                              </TooltipLabel>
                              <div
                                className={classnames(
                                  isMobile() ? '' : 'amount_date_wrapper_inner',
                                )}
                              >
                                <p
                                  className={classnames(
                                    checkOpen(el?.orderstatus)
                                      ? 'gold-color'
                                      : 'fg-primary-color',
                                  )}
                                  style={{
                                    margin: '10px 0px 0px 0px',
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    gap: '10px',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div className="pay-item-subtitle">
                                    {/* {t('amount: ')} */}
                                    {el?.ticker === null ? (
                                      <TooltipLabel title="MATIC">
                                        <ImageComponent
                                          src={maticIcon}
                                          alt=""
                                          className="method-matic"
                                        />
                                      </TooltipLabel>
                                    ) : (
                                      <div className="player-title-wrapper-paid-items">
                                        <div
                                          className="currency_mark_img"
                                          style={{
                                            background: getCircleColor(
                                              el?.playerlevelid,
                                            ),
                                            alignItems: 'center',
                                            width: '32px',
                                            height: '32px',
                                          }}
                                        >
                                          <PlayerImage
                                            src={el?.playerpicturethumb}
                                            className="img-radius_kiosk currency_mark"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    {el?.amount}
                                    {el?.ticker === null ? (
                                      <span style={{ fontSize: '14px' }}>
                                        {' '}
                                        MATIC
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '14px' }}>
                                        {' '}
                                        {el?.ticker}
                                      </span>
                                    )}
                                  </div>
                                </p>
                                <p
                                  className={classnames(
                                    checkOpen(el?.orderstatus)
                                      ? 'gold-color'
                                      : 'fg-primary-color',
                                  )}
                                  style={{
                                    margin: '10px 0px 0px 0px',
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    gap: '10px',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div className="pay-item-subtitle date-label">
                                    <CalendarMonthIcon
                                      className={classnames(
                                        checkOpen(el?.orderstatus)
                                          ? 'gold-color'
                                          : 'fg-primary-color',
                                      )}
                                    />
                                  </div>
                                  <div>
                                    {el?.paidat &&
                                      new Date(el?.paidat * 1000)
                                        .toLocaleString('en-GB')
                                        .replace(',', ' ')}
                                  </div>
                                </p>
                                <p style={{ margin: '5px 0px' }}>
                                  {el?.ticker === null ? (
                                    ''
                                  ) : isMobile() ? (
                                    <button
                                      onClick={() => {
                                        viewOrder(el?.order_hash)
                                      }}
                                      className={classnames(
                                        'form-submit-btn wallet-btn',
                                        checkOpen(el?.orderstatus)
                                          ? 'btn-gold'
                                          : '',
                                      )}
                                      style={{
                                        width: isMobile() ? '90px' : '100px',
                                        height: '30px',
                                        fontSize: '14px',
                                        margin: '0px 4px',
                                      }}
                                    >
                                      {t('view_order')}
                                    </button>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                          </div>
                          {el?.ticker !== null && !isMobile() && (
                            <button
                              onClick={() => viewOrder(el?.order_hash)}
                              className={classnames(
                                'form-submit-btn wallet-btn',
                                checkOpen(el?.orderstatus) ? 'btn-gold' : '',
                              )}
                              style={{
                                width: isMobile() ? '90px' : '100px',
                                height: '30px',
                                fontSize: '14px',
                              }}
                            >
                              {t('view_order')}
                            </button>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="no_paid_items" style={{ marginTop: '50px' }}>
                      {t('no paid items')}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

export default UserMyItemsWrapper
