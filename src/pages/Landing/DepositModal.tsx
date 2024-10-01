import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import '@assets/css/components/WalletModal.css'
import { useTranslation } from 'react-i18next'
import masterCardIcon from '@assets/images/mastercard-large.webp'
import visaIcon from '@assets/images/visa-pay.webp'
import applyPayIcon from '@assets/images/apple-pay.webp'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { v4 as uuidv4 } from 'uuid'
import WertWidget from '@wert-io/widget-initializer'
import {
  getQualificationSetting,
  getWalletDetails,
} from '@root/apis/onboarding/authenticationSlice'
import DialogBox from '@components/Dialog/DialogBox'
import { isMobile } from '@utils/helpers'
import classNames from 'classnames'
import ImageComponent from '@components/ImageComponent'
import { THEME_COLORS } from '@root/constants'
import WertBumper from '@components/Page/WertBumper'
import { makeGetRequestAdvance } from '@root/apis/axiosClient'
import { Close } from '@mui/icons-material'
import axios from 'axios'

interface Props {
  isOpen: boolean
  onClose: any
}
let wertTimeout: any = null

const DepositModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const [wertLoading, setWertLoading] = useState<any>(false)
  const [widgetInitiated, setWidgetInitiated] = useState(false)
  const dispatch = useDispatch()

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const {
    userWalletData: { address },
    currencyRate,
    selectedThemeRedux,
    enablecreditcardpurchase,
  } = authenticationData
  const loginInfo = localStorage.getItem('loginInfo')

  const [topupAmount, setTopupAmount] = useState(0)
  const [isShowWertBumper, setIsShowWertBumper] = useState(false)

  const currency = 'USD'

  const getCommoditiesSet = () => {
    if (process.env.REACT_APP_POLYGON_NETWORK === 'MAINNET') {
      return '[{"commodity":"MATIC","network":"polygon"}]'
    }
    return '[{"commodity":"MATIC","network":"amoy"}]'
  }

  const handleHideWert = () => {
    dispatch(getWalletDetails())
    setWidgetInitiated(false)
  }

  const handleWertTopup = async amount => {
    if (!enablecreditcardpurchase) {
      return
    }
    setTopupAmount(amount)
    const result = await makeGetRequestAdvance('accounts/wert_acknowledge')
    if (!result?.data?.wert_acknowledged) {
      setIsShowWertBumper(true)
      return
    }

    const amnt = await axios
      .post(
        process.env.REACT_APP_WERT_ORIGIN + '/api/v3/partners/convert',
        {
          from: 'USD',
          network:
            process.env.REACT_APP_POLYGON_NETWORK === 'MAINNET'
              ? 'polygon'
              : 'amoy',
          to: 'MATIC',
          amount: parseFloat(amount),
          address: loginInfo || address,
        },
        {
          headers: {
            'X-Partner-ID': process.env.REACT_APP_WERT_PARTNER_ID,
            'Content-Type': 'application/json',
          },
        },
      )
      .then(res => {
        if (res?.data?.body) {
          let amnt = parseFloat(amount)

          const { currency_amount, currency_miner_fee, fee_percent } =
            res.data.body

          amnt = amnt * fee_percent + amnt
          amnt = amnt + currency_miner_fee
          amnt = (amnt * 0.1) / 100 + amnt

          console.log(amnt)
          return amnt
        }
      })
      .catch(err => {
        console.log(err)
      })

    console.log('AMNT', amnt)

    setWertLoading(true)
    clearTimeout(wertTimeout)
    const options = {
      // partner_id: '01G2A9N1TZ18NWM0EGCYFX9E33',
      partner_id: process.env.REACT_APP_WERT_PARTNER_ID,
      // is_crypto_hidden: true,
      origin: process.env.REACT_APP_WERT_ORIGIN,
      // container_id: 'topup-box',
      address: loginInfo || address,
      click_id: uuidv4(), // unique id of purhase in your system
      width: 370,
      height: 550,
      color_background: THEME_COLORS[selectedThemeRedux]['PrimaryBackground'],
      color_buttons: THEME_COLORS[selectedThemeRedux]['SecondaryForeground'],
      color_buttons_text: THEME_COLORS[selectedThemeRedux]['PrimaryBackground'],
      color_main_text: THEME_COLORS[selectedThemeRedux]['SecondaryText'],
      currency: 'USD',
      // commodity: 'MATIC',
      currency_amount: amnt ?? 50, /// currencyRate,
      // network:
      //   process.env.REACT_APP_POLYGON_NETWORK === 'MAINNET'
      //     ? 'network'
      //     : 'amoy',
      commodities: getCommoditiesSet(),
      listeners: {
        loaded: () => console.log('loaded'),
        position: (data: any) => console.log('topup_step:', data.step),
        close: (evt: any) => {
          handleHideWert()
        },
        error: (error: any) => console.log('topup_ERROR_WERT:', error),
      },
    }
    const wertTopupWidget = new WertWidget(options)
    console.log('-------wertData-------', options)
    wertTopupWidget.mount()

    const purchaseBox = document.getElementById('topup-box')
    const iframe = purchaseBox?.getElementsByTagName('iframe')?.[0]
    if (iframe) {
      purchaseBox.removeChild(iframe)
    }
    const iframeLength = document.getElementsByTagName('iframe').length
    document.getElementsByTagName('iframe')[iframeLength - 1].style.position =
      'relative'
    document
      .getElementById('topup-box')
      .append(document.getElementsByTagName('iframe')[iframeLength - 1])

    wertTimeout = setTimeout(() => {
      setWidgetInitiated(true)
      setWertLoading(false)
    }, 1000)
  }

  useEffect(() => {
    if (widgetInitiated) {
      document.body.style.overflow = 'hidden'
      if (isMobile()) {
        document.body.style.position = 'fixed'
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
    }
  }, [widgetInitiated])

  return (
    <div
      id="depositModal"
      className={classnames('deposit-modal', isOpen ? 'show' : '')}
    >
      <DialogBox
        isOpen={widgetInitiated}
        onClose={handleHideWert}
        parentClass={
          isMobile() ? 'flex-dialog wert-deposit-modal' : 'wert-deposit-modal'
        }
      >
        {isMobile() && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '0rem 1rem',
              alignItems: 'center',
              fontSize: '25px',
              color: '#171923',
              fontWeight: '500',
              paddingTop: '0.5rem',
              position: 'absolute',
              top: '1rem',
              right: '0.8rem',
            }}
            onClick={() => handleHideWert()}
            className="wert-iframe-close-icon"
          >
            <Close className="icon-color-search gray" />
          </div>
        )}
        <div id="topup-box" className="wert-widget-wrapper"></div>
        {/* {!isMobile() && (
          <div
            className={classNames(
              'green-line-btn',
              isMobile() ? 'close-button-wert' : 'close-button mt-20',
            )}
            onClick={handleHideWert}
          >
            {t('close')}
          </div>
        )} */}
      </DialogBox>
      {isShowWertBumper && (
        <DialogBox
          isOpen={isShowWertBumper}
          onClose={() => setIsShowWertBumper(false)}
          parentClass={isMobile() ? 'flex-dialog top-layer' : 'top-layer'}
        >
          <WertBumper
            onAccept={() => {
              setIsShowWertBumper(false)
              handleWertTopup(topupAmount)
            }}
            onClose={() => setIsShowWertBumper(false)}
          />
        </DialogBox>
      )}
      <div className="wallet-modal-content deposit-modal-content">
        <button className="wallet-modal-close">
          <span onClick={onClose}>&times;</span>
        </button>
        <div className="deposit-title-wrapper">
          <span>{t('top up account')}</span>
          <div className="footer-icons">
            {/* <ImageComponent
              className="card-logo"
              src={applyPayIcon}
              style={{ height: '36px', marginRight: '-7px' }}
              alt=""
            /> */}
            {!isMobile() && (
              <div style={{ width: '86px', height: '39px' }}></div>
            )}
            <ImageComponent
              className="card-logo"
              src={visaIcon}
              style={{ height: '35px' }}
              alt=""
            />
            <ImageComponent
              className="card-logo"
              src={masterCardIcon}
              style={{ height: '43px' }}
              alt=""
            />
          </div>
        </div>
        <div className="deposit-amount-wrapper">
          {wertLoading ? (
            <div className="flex-center m-auto">
              <div className="loading-spinner">
                <div className="spinner size-small"></div>
              </div>
            </div>
          ) : (
            <>
              <span
                className={enablecreditcardpurchase ? '' : 'bg-grey-color'}
                onClick={() => handleWertTopup(20)}
              >
                20 {currency}
              </span>
              <span
                className={enablecreditcardpurchase ? '' : 'bg-grey-color'}
                onClick={() => handleWertTopup(50)}
              >
                50 {currency}
              </span>
              <span
                className={enablecreditcardpurchase ? '' : 'bg-grey-color'}
                onClick={() => handleWertTopup(100)}
              >
                100 {currency}
              </span>
              <span
                className={enablecreditcardpurchase ? '' : 'bg-grey-color'}
                onClick={() => handleWertTopup(200)}
              >
                200 {currency}
              </span>
              <span
                className={enablecreditcardpurchase ? '' : 'bg-grey-color'}
                onClick={handleWertTopup}
              >
                {t('other amount')}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DepositModal
