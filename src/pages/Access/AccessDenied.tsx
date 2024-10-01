import React, { useCallback, useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import Logo from '@assets/images/logo-min.webp'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { getCircleColor, isMobile } from '@utils/helpers'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { RootState } from '@root/store/rootReducers'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '@components/Spinner'
import useQualificationStatus from '@utils/hooks/qualificationStatusHook'
import { toast, useToaster, useToasterStore } from 'react-hot-toast'
import ImageComponent from '@components/ImageComponent'
import CloseIcon from '../../assets/icons/icon/closeIcon.svg'
import { API_CONSTANTS, THEME_COLORS } from '@root/constants'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { setShowMore } from '@root/apis/onboarding/authenticationSlice'
import MaintenancePage from '@navigation/MaintenancePage'
import { getRequest } from '@root/apis/axiosClient'
import { showMaintenance } from '@root/apis/commonSlice'

let redirectTimeout = null
export function RootLayout() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { toasts } = useToaster()
  const [closeClicked, setCloseClicked] = useState(false)

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const isUnderMaintenance = useSelector(
    (state: RootState) => state.nftnavigation.isUnderMaintenance,
  )

  const {
    directappaccess,
    QualificationSettingData,
    qualifiedPublicKey,
    qualifiedInviteLinked,
    getLiveNotificationData,
    selectedThemeRedux,
  } = authenticationData
  const navigate = useNavigate()
  const [isPageAccessRestricted] = useQualificationStatus()

  const handleAccess = () => {
    window.location.href = '/'
  }

  useEffect(() => {
    clearTimeout(redirectTimeout)
    if (
      ([1, 2, 3].includes(QualificationSettingData) &&
        getIsAccessRestricted()) ||
      QualificationSettingData === 0
    ) {
      redirectTimeout = setTimeout(() => {
        handleAccess()
      }, 5000)
    }

    // directappaccess logic

    if (
      QualificationSettingData !== 3 ||
      localStorage.getItem('accessToken') ||
      directappaccess === null
    ) {
      return
    }
    if (!directappaccess) {
      window.location.href = '/info'
    }
  }, [
    directappaccess,
    QualificationSettingData,
    localStorage.getItem('accessToken'),
  ])

  const getIsAccessRestricted = () => {
    if (parseInt(QualificationSettingData) === 0) {
      return true
    } else if (parseInt(QualificationSettingData) === 1) {
      if (!localStorage.getItem('loginInfo')) {
        return true
      } else {
        if (qualifiedInviteLinked === false) {
          return true
        } else {
          return false
        }
      }
    } else if (parseInt(QualificationSettingData) === 2) {
      if (!qualifiedPublicKey) {
        return true
      } else {
        return false
      }
    } else if (parseInt(QualificationSettingData) === 3) {
      return false
    }
  }

  // useEffect(() => {
  //   if (toasts.length < 1 && closeClicked) {
  //     dispatch(setShowMore(false))
  //   }
  // }, [toasts])

  useEffect(() => {
    // console.log({ toasts })
    // if (toasts.length < 1) {
    //   dispatch(setShowMore(false))
    // } else {
    //   dispatch(setShowMore(true))
    // }
    hideNotificationConsole()
  }, [toasts])

  const hideNotificationConsole = useCallback(() => {
    // refAnimationInstance.current = instance
    console.log({ toasts, closeClicked })
    if (toasts.length < 1 && closeClicked) {
      dispatch(setShowMore(false))
    } else {
      // dispatch(setShowMore(true))
    }
  }, [toasts, closeClicked])

  useEffect(() => {
    // setInterval(() => {
    //   dispatch(getNotificationsCount())
    // }, 15000)
    console.log({ getLiveNotificationData })
    displayAllNotifications()
  }, [getLiveNotificationData])

  // checking is under maintenance
  useEffect(() => {
    getRequest('health-check')
      .then(res => {
        if (res.status !== 200) {
          dispatch(showMaintenance(true))
        } else {
          dispatch(showMaintenance(false))
        }
      })
      .catch(() => {
        dispatch(showMaintenance(true))
      })
  }, [])

  const displayAllNotifications = async () => {
    await setCloseClicked(false)
    if (
      getLiveNotificationData.length > 0 &&
      window.location.pathname.includes('/app') &&
      !window.location.pathname.includes('/notifications')
    ) {
      getLiveNotificationData.map((item: any, index: any) =>
        toast(
          <div
            style={{
              width: isMobile() ? '90%' : '',
              display: 'flex',
              justifyContent: isMobile() ? 'flex-start' : 'space-between',
              alignItems: 'center',
              gap: '20px',
              margin: isMobile() ? '2px 0' : '10px 0',
            }}
            // onTouchStart={handleTouchStart}
            // onTouchMove={handleTouchMove}
          >
            {!isMobile() && (
              <ImageComponent
                onClick={() => {
                  setCloseClicked(true)
                  console.log('deletingIndex--', index, toasts)
                  toast.remove(`notif_toast${index}`)

                  // if (toasts.length < 1) {
                  //   dispatch(setShowMore(false))
                  // }
                }}
                className={classNames(
                  'close_icon_notification',
                  isMobile() ? 'close_icon_notification_mobile' : '',
                )}
                src={CloseIcon}
                alt=""
              />
            )}
            <div
              className="img-compact"
              style={{
                background: getCircleColor(item?.playerlevelid),
              }}
            >
              <ImageComponent
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
                src={item.playerpicturethumb || item.playerpicture}
                alt=""
                onClick={() => {
                  // window
                  //   ?.open(
                  //     `${window.location.origin}/app/player/${item.detailpageurl}`,
                  //     '_blank',
                  //   )
                  //   ?.focus()
                  console.log('hiee')

                  if (item.detailpageurl) {
                    navigate(`/app/player/${item.detailpageurl}`)
                  }
                }}
              />
            </div>
            <div
              onClick={() => {
                // window
                //   ?.open(
                //     `${window.location.origin}/app/player/${item.detailpageurl}`,
                //     '_blank',
                //   )
                //   ?.focus()
                console.log('hiee')
                toast.remove()
                dispatch(setShowMore(false))
                if (item.detailpageurl) {
                  navigate(`/app/player/${item.detailpageurl}`)
                }
              }}
              style={{ cursor: 'pointer', width: isMobile() ? '72%' : '' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Rajdhani-semibold',
                    fontSize: '18px',
                    fontWeight: '600',
                    lineHeight: ' 18px',
                    color: 'var(--primary-foreground-color)',
                    margin: '0px',
                  }}
                >
                  {item.title}
                </p>
                <ArrowForwardIosIcon
                  className="text-secondary-color"
                  style={{
                    fontSize: '12px',
                  }}
                />
              </div>
              <div
                className="text-secondary-color"
                style={{
                  width: isMobile() ? '90%' : '320px',
                  fontFamily: 'Rajdhani-regular',
                  fontSize: '16px',
                  fontWeight: '400',
                  marginTop: isMobile() ? '5px' : '0px',
                }}
              >
                {item.title === 'New Vote'
                  ? `${item.playername} ${t(
                      'has a new vote that will end in',
                    )} ${item.hrs} ${t('hour')} `
                  : item.title === 'New Raffle'
                  ? `${item.playername} ${t(
                      'has just launched a new raffle that ends in',
                    )} ${item.hrs} ${t('hour')}. ${t('participate now!')}`
                  : item.title === 'Go Live'
                  ? `${item.playername} ${t(
                      'has gone live and is available for trading',
                    )}`
                  : item.title === 'Gone PRO!'
                  ? `${item.playername} ${t(
                      'is now PRO! Stake your coins and unlock your rewards',
                    )}`
                  : item.title === 'New Auction'
                  ? `${item.playername} ${t(
                      'has just launched a new auction that ends in',
                    )} ${item.hrs} ${t('hour')}`
                  : item.title === 'New NFT minted'
                  ? `${item.playername} ${t('has minted a new NFT with id')} ${
                      item.tokenid
                    }`
                  : item.body}
                {item.title === 'New Vote' ? (
                  <b className="text-primary-color">{item.question}</b>
                ) : (
                  ''
                )}
              </div>
              <div
                style={{
                  fontFamily: 'Rajdhani-semibold',
                  fontSize: '14px',
                  fontWeight: '600',
                  lineHeight: '14px',
                  marginTop: '5px',
                }}
              >
                {/* {item.timestamp} */}
                {item?.timestamp &&
                  item?.timestamp?.substring(0, 19).replace('T', ' ')}
              </div>
            </div>
          </div>,
          {
            id: `notif_toast${index}`,
            duration: Infinity,
            position: 'bottom-right',

            // Styling
            style: {
              minWidth: isMobile() ? '100%' : '450px',
              maxWidth: isMobile() ? '100%' : '450px',
              border: '1px solid var(--primary-foreground-color)',
              padding: '5px 0px',
              color: THEME_COLORS[selectedThemeRedux]['PrimaryText'],
              background:
                THEME_COLORS[selectedThemeRedux]['SecondaryBackground'],
              marginRight: isMobile() ? '' : '20px',
              marginBottom:
                isMobile() && window.location.pathname !== '/'
                  ? '160px'
                  : '90px',
              marginTop:
                isMobile() && window.location.pathname !== '/'
                  ? '-160px'
                  : '-90px',
            },
          },
        ),
      )
    }
  }

  return (
    <>
      {QualificationSettingData === null ||
      QualificationSettingData === undefined ? (
        <div className="main_content_wrapper">
          <div className="denied_header">
            <ArrowBackIcon onClick={handleAccess} className="icon-color" />
            <img src={Logo} style={{ width: '120px' }} alt="" />
            <div className="icon-color" style={{ margin: '32px' }}>
              {' '}
            </div>
          </div>
          <div
            className={classNames(
              'main_content',
              isMobile() ? 'main_content_mobile' : 'main_content_desktop',
            )}
          >
            <div>
              <img src={Logo} style={{ width: '120px' }} alt="" />
            </div>
            <div className="access_denied_heading m-0">
              {t('checking status')}
            </div>
            <div className="bottom-caption-wrapper">
              <span
                className="blog-content bottom-content pg-lg text-left"
                style={{ fontSize: '20px' }}
              >
                {t('please wait')}..
              </span>
            </div>
            <div style={{ marginTop: '-40px' }}>
              <Spinner spinnerStatus={true} title={''} />
            </div>
          </div>
        </div>
      ) : ([1, 2, 3].includes(QualificationSettingData) &&
          getIsAccessRestricted()) ||
        QualificationSettingData === 0 ? (
        <div className="main_content_wrapper">
          <div className="denied_header">
            <ArrowBackIcon onClick={handleAccess} className="icon-color" />
            <img src={Logo} style={{ width: '120px' }} alt="" />
            <div className="icon-color" style={{ margin: '32px' }}>
              {' '}
            </div>
          </div>
          <div
            className={classNames(
              'main_content',
              isMobile() ? 'main_content_mobile' : 'main_content_desktop',
            )}
          >
            <div>
              <img src={Logo} style={{ width: '120px' }} alt="" />
            </div>
            <div className="access_denied_heading">
              {t('you do not have app access')}
            </div>
            <div
              className={classNames('green-line-btn mt-40')}
              style={{
                color: '#6bc909',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={() => handleAccess()}
            >
              {t('back to homepage')}
            </div>
          </div>
        </div>
      ) : (QualificationSettingData === 4 &&
          !localStorage.getItem('bypassAppQualification')) ||
        isUnderMaintenance ? (
        <MaintenancePage onBack={handleAccess} />
      ) : ([1, 2, 3].includes(QualificationSettingData) &&
          !getIsAccessRestricted()) ||
        QualificationSettingData === 3 ? (
        <Outlet />
      ) : null}
    </>
  )
}
