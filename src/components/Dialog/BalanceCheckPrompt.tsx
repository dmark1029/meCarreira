import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'
import {
  showPurchaseForm,
  showStakingForm,
  showWalletForm,
} from '@root/apis/onboarding/authenticationSlice'
import { RootState } from '@root/store/rootReducers'
import visaIcon from '@assets/images/visa-white.webp'
import visaIconBlack from '@assets/images/visa.webp'
import masterCardIcon from '@assets/images/mastercard-large.webp'
import maticIcon from '@assets/images/matic-token-icon.webp'
import ApplePayIcon from '@assets/images/apple_pay.webp'
import ImageComponent from '@components/ImageComponent'
import { useNavigate } from 'react-router-dom'
interface Props {
  nft?: any
  onClose?: () => void
  customCallback?: () => void
}

const BalanceCheckPrompt: React.FC<Props> = props => {
  const { customCallback } = props
  const navigate = useNavigate()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { isStakingFormVisible, isPurchaseFormVisible, selectedThemeRedux } =
    authenticationData

  const logoSet = [
    { id: 1, img: maticIcon, class: 'mc-method-logo' },
    {
      id: 2,
      img:
        selectedThemeRedux === 'Light' ||
        selectedThemeRedux === 'Ladies' ||
        selectedThemeRedux === 'Black'
          ? visaIconBlack
          : visaIcon,
      class: 'visa-method-logo',
    },
    { id: 3, img: masterCardIcon, class: 'mc-method-logo' },
  ]

  const handleGetDeposit = () => {
    console.log(customCallback)
    if (isStakingFormVisible) {
      dispatch(showStakingForm({}))
    } else if (isPurchaseFormVisible) {
      dispatch(showPurchaseForm({}))
    }
    dispatch(showWalletForm({ deposit: true }))
    if (window.location.pathname.includes('draft_confirmation')) {
      navigate(-1)
    }
    if (customCallback) {
      customCallback()
    }
  }

  return (
    <div
      id="balanceCheckPrompt"
      className={classNames('btn-purchase', 'web3action-success', 'mt-20')}
    >
      <div className="name">
        <span>{t('not enough funds')}</span>
      </div>
      <div className="pg-lg">
        {t('you were about to issue a blockchain transaction')}
      </div>
      <div
        className="tx-link button-box close-button-zindex form-submit-btn mt-60"
        onClick={handleGetDeposit}
      >
        {t('deposit')}
      </div>
      <div className="pay-logo-wrapper">
        {logoSet.map((item: any) => (
          <ImageComponent
            key={item.id}
            src={item?.img}
            className={item.class}
            alt=""
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(BalanceCheckPrompt)
