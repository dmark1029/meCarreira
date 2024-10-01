import React, { useState, useEffect, useCallback, useRef } from 'react'
import classnames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import maticIcon from '@assets/images/matic-token-icon.webp'
import {
  togglePayForItem,
  postPlaceKioskOrder,
  postKioskItemPayment,
  getPlayerKioskList,
  resetPostPlaceKioskOrder,
  showKioskItemDetail,
  getUserXp,
  postCheckItemTempOrder,
  resetPostKioskItem,
  postConfirmKioskOrder,
  resetPlaceKioskOrderUnlimited,
} from '@root/apis/onboarding/authenticationSlice'
import MetamaskIcon from '@assets/icons/icon/metamask.svg'
import CoinbaseIcon from '@assets/icons/icon/coinbase.svg'
import WalletIcon from '@assets/icons/icon/wallet.webp'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import ReactCanvasConfetti from 'react-canvas-confetti'
import {
  getSendMaticTxnConfirm,
  resetTxnConfirmationData,
  payForItem,
  getUserPayedItems,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { transferToWallet } from '@root/apis/onboarding/authenticationSlice'
import { getCircleColor, getCountryCodeNew, isMobile } from '@utils/helpers'
import ApiBottomPopup from '@components/Dialog/ApiBottomPopup'
import { ethers } from 'ethers'
import BottomPopup from '@components/Dialog/BottomPopup'
import PlayerImage from '@components/PlayerImage'
import { Formik } from 'formik'
import * as Yup from 'yup'
import SubmitButton from '@components/Button/SubmitButton'
import FormInput from '@components/Form/FormInput'
import CountrySelect, { countries } from '@components/CountryDropdown'
import ImageComponent from '@components/ImageComponent'
import FormTextArea from '@components/Form/FormTextArea'
import { useWalletHelper } from '@utils/WalletHelper'
import { styled } from '@mui/material/styles'
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress'
import { THEME_COLORS, BASE_EXPLORE_URL } from '@root/constants'
import TimerIcon from '@mui/icons-material/Timer'
import CountdownTimer from './CountdownTimer'
import CloseAbsolute from '@components/Form/CloseAbsolute'

let txnCheckInterval: any = null
const canvasStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
} as React.CSSProperties
const maxNumber = 250
const PayForItems: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const loginId = localStorage.getItem('loginId')
  const loginInfo = localStorage.getItem('loginInfo')
  const [web3CallInProgress, setWeb3CallInProgress] = useState(false)
  const [txnHash, setTxnHash] = useState('')
  const [txnError, setTxnError] = useState('')
  const [isLoadingMatic, setIsLoadingMatic] = useState(false)
  const [disableFlag, setDisableFlag] = useState(false)
  const [step, setStep] = useState(0) // 0: loading, 1: first step, 2: second step, 3: no step
  const [detail, setDetail] = useState('')
  const walletType = localStorage.getItem('wallet')
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const {
    isTxnChecking,
    txnConfirmResp,
    serviceFeeAddress,
    txnConfirmSuccess,
    player1contractabi,
    player1contract,
    player2contract,
    player2contractabi,
    allPlayersData,
    stakingcontract,
    stakingcontractabi,
  } = playerCoinData
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    isTxnHash,
    payForItemPrice,
    payForItemName,
    isTransferTxnHash,
    userWalletData: { balance },
    selectedThemeRedux,
    kioskItem,
    kioskItemInfo,
    deliveryModeRedux,
    postPlaceKioskOrderLoader,
    showKioskItemDetailsBuy,
    getUserSettingsData,
    kioskItemTempData,
    timerFinished,
    checkItemTempData,
    userAddressData,
    KioskItemDetail,
    postPlaceKioskOrderData,
    postPlaceKioskOrderSuccess,
    gasFeeIncreasePercentage,
  } = authenticationData

  const { getWeb3Provider, getEthereumProvider } = useWalletHelper()

  const kioskInitialValues = {
    name: userAddressData?.recipientname || '',
    email: getUserSettingsData?.email ? getUserSettingsData?.email : '',
    detail: '',
    address: userAddressData?.recipientaddress || '',
    buyerInstructions: kioskItemInfo?.buyerInstructions || '',
    zip: userAddressData?.recipientpostalcode || '',
    city: userAddressData?.recipientcity || '',
    country: userAddressData?.recipientcountry
      ? countries.filter(
          country =>
            country.code ===
            getCountryCodeNew(userAddressData?.recipientcountry),
        )[0]
      : null,
    additional_info: userAddressData?.additional_info || '',
  }

  const [lowBalance, setLowBalance] = useState('')
  console.log({ userAddressData, getUserSettingsData, kioskInitialValues })
  useEffect(() => {
    if (payForItemPrice > balance) {
      setLowBalance(t('not enough balance'))
    } else {
      setLowBalance('')
    }
  }, [payForItemPrice, balance])

  useEffect(() => {
    console.log('item_detail_popup')
    return () => {
      clearInterval(txnCheckInterval)
      dispatch(resetTxnConfirmationData())
      dispatch(resetPostPlaceKioskOrder())
    }
  }, [])

  useEffect(() => {
    if (txnHash) {
      handleTxnCheck()
    }
    if (isTxnHash) {
      handleTxnCheck()
    }
    if (isTransferTxnHash) {
      handleTxnCheck()
    }
  }, [txnHash, isTxnHash, isTransferTxnHash])

  useEffect(() => {
    if (
      txnConfirmResp[0]?.haserror === 0 ||
      txnConfirmResp[0]?.haserror === 1
    ) {
      clearInterval(txnCheckInterval)
    }
  }, [txnConfirmResp])

  useEffect(() => {
    if (txnConfirmSuccess) {
      clearInterval(txnCheckInterval)
      setTimeout(() => {
        dispatch(getUserPayedItems())
      }, 10000)
    }
  }, [txnConfirmSuccess])

  const handleTxnCheck = () => {
    if (!kioskItem) {
      dispatch(
        payForItem({
          item: payForItemName,
          transactionhash: txnHash || isTransferTxnHash,
        }),
      )
    }
    console.log('gsmtc9')
    dispatch(getSendMaticTxnConfirm(txnHash || isTxnHash || isTransferTxnHash))
    txnCheckInterval = setInterval(() => {
      console.log('gsmtc10')
      dispatch(
        getSendMaticTxnConfirm(txnHash || isTxnHash || isTransferTxnHash),
      )
    }, 10000)
  }

  useEffect(() => {
    clearInterval(txnCheckInterval)
    if (!document.hidden) {
      if (txnHash) {
        handleTxnCheck()
      }
    }
  }, [document.hidden])

  const handleCloseDialog = () => {
    console.log('closed_modal')
    clearInterval(txnCheckInterval)
    setWeb3CallInProgress(false)
    dispatch(resetPostKioskItem())
    dispatch(togglePayForItem({ visible: false }))
    if (kioskItem) {
      dispatch(resetPostPlaceKioskOrder())
      dispatch(getPlayerKioskList(kioskItemInfo?.playercontract))
    }
    if (showKioskItemDetailsBuy) {
      dispatch(showKioskItemDetail({ showKioskItemDetailsBuy: false }))
    }
    if (KioskItemDetail?.unlimitedInventory && postPlaceKioskOrderData?.hash) {
      console.log('unlimited&hash')
      dispatch(resetPlaceKioskOrderUnlimited())
    }
  }

  useEffect(() => {
    if (postPlaceKioskOrderSuccess) {
      payForKioskItemExternal()
    }
  }, [postPlaceKioskOrderSuccess])

  const payForKioskItemExternal = async () => {
    setIsLoadingMatic(true)
    if (walletType) {
      //for temporary
      const mockAbi = [
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_amount',
              type: 'uint256',
            },
            {
              internalType: 'string',
              name: '_hash',
              type: 'string',
            },
          ],
          name: 'pay',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ]
      const provider = await getWeb3Provider()
      // const playerContract = new ethers.Contract(
      //   player1contract || player2contract || kioskItemInfo?.playercontract, // contract address of Router
      //   player1contractabi ||
      //     player2contractabi ||
      //     kioskItemInfo?.playercontractabi ||
      //     mockAbi, //  contract abi of Router
      //   //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      //   provider.getSigner(loginInfo!),
      // )
      const playerContract = new ethers.Contract(
        stakingcontract,
        stakingcontractabi || mockAbi, //  contract abi of Router
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        provider.getSigner(loginInfo!),
      )

      try {
        const options = {
          amount: ethers.utils.parseEther(payForItemPrice.toString())._hex,
          hash: checkItemTempData || postPlaceKioskOrderData?.hash,
        }
        const tx = await playerContract?.pay(options.amount, options.hash, {
          gasLimit: ethers.utils.hexlify(
            2000000 * ((gasFeeIncreasePercentage + 100) / 100),
          ),
        })
        setTxnHash(tx?.hash)
        setIsLoadingMatic(false)
      } catch (err: any) {
        console.log({ err })
        const isErrorGasEstimation = `${err}`.includes('cannot estimate gas')
        if (err.message === '406') {
          setTxnError(t('this functionality unavailable for internal users'))
        }
        if (isErrorGasEstimation) {
          setTxnError(t('not enough funds to pay for blockchain transaction'))
        } else {
          console.log(err.reason || err.message)
          setTxnError(t('transaction failed'))
        }
        setIsLoadingMatic(false)
      }
    } else {
      setTxnError(t('this functionality unavailable for internal users'))
    }
  }
  const payForItemExternal = async () => {
    setIsLoadingMatic(true)
    const provider = await getEthereumProvider()
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    })
    const account = accounts[0]
    const from = localStorage.getItem('loginInfo')
    if (account.toLowerCase() !== from?.toLowerCase()) {
      return
    }

    const params = {
      from: ethers.utils.getAddress(from ? from : ''),
      to: ethers.utils.getAddress(serviceFeeAddress),
      gas: '0x5208', // 21000
      maxFeePerGas: ethers.utils.parseEther('0.000001')._hex,
      value: ethers.utils.parseEther(payForItemPrice.toString())._hex,
    }

    provider
      .request({
        method: 'eth_sendTransaction',
        params: [params],
      })
      .then((txHash: any) => {
        setTxnHash(txHash)
        setIsLoadingMatic(false)
      })
      .catch((err: any) => {
        // If the request fails, the Promise will reject with an error.
        const isErrorGasEstimation = `${err}`.includes('cannot estimate gas')
        if (err.message === '406') {
          setTxnError(t('this functionality unavailable for internal users'))
        }
        if (isErrorGasEstimation) {
          setTxnError(t('not enough funds to pay for blockchain transaction'))
        } else {
          console.log(err.reason || err.message)
          setTxnError(t('transaction failed'))
        }
        setIsLoadingMatic(false)
      })
  }

  const handleSendApi = (user_secret: any) => {
    if (loginId) {
      if (kioskItem === true) {
        const reqFormData = new FormData()
        reqFormData.append('hash', checkItemTempData)
        reqFormData.append('user_secret', user_secret)
        dispatch(postKioskItemPayment(reqFormData))
      } else {
        const reqParams = new FormData()
        reqParams.append('user_secret', user_secret)
        reqParams.append('ticker', 'MATIC')
        reqParams.append('to_address', serviceFeeAddress)
        reqParams.append('amount', payForItemPrice)
        dispatch(transferToWallet(reqParams))
      }
    }
  }

  // confetti
  const refAnimationInstance = useRef<any>(null)

  const getInstance = useCallback(instance => {
    refAnimationInstance.current = instance
  }, [])

  const makeShot = useCallback((particleRatio, opts) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      })
  }, [])

  const fire = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    })

    makeShot(0.2, {
      spread: 60,
    })

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  }, [makeShot])

  useEffect(() => {
    if (
      (!isTxnChecking && txnConfirmResp[0]?.haserror === 0) ||
      txnConfirmSuccess
    ) {
      fire()
      dispatch(getUserXp({ isFirstLoading: false }))
      if (checkItemTempData) {
        const formData = new FormData()
        formData.append('hash', checkItemTempData)
        formData.append('itemId', kioskItemInfo.itemid)
        formData.append('transaction_hash', txnHash)
        dispatch(postConfirmKioskOrder(formData))
      }
    }
  }, [isTxnChecking, txnConfirmResp[0], txnConfirmSuccess])
  const handleCancelPayment = () => {
    dispatch(togglePayForItem({ visible: false }))
  }
  const handleBuyItem = () => {
    if (lowBalance === '') {
      setWeb3CallInProgress(true)
      if (loginInfo) {
        payForItemExternal()
      }
    }
  }

  const handleNextStep = (values: any) => {
    setDetail(values.detail)
    setStep(2)
  }

  useEffect(() => {
    if (kioskItemInfo?.buyerInstructions) {
      setStep(1)
    }
  }, [kioskItemInfo?.buyerInstructions])

  const [itemData, setItemData] = useState({})

  const checkKioskOrder = (values: any) => {
    setItemData(values)
    if (!KioskItemDetail?.unlimitedInventory) {
      dispatch(postCheckItemTempOrder({ itemId: kioskItemInfo?.itemid }))
    } else if (KioskItemDetail?.unlimitedInventory) {
      setWeb3CallInProgress(true)
      if (loginInfo) {
        deliveryModeRedux === 'postal'
          ? handleOrderItem(values)
          : handleOrderItemDigital(values)
      }
    }
  }
  const handleOrderItem = (values: any) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('address', values.address)
    formData.append('ZIP', values.zip)
    formData.append('city', values.city)
    formData.append('country_id', values.country.phone)
    formData.append('country_code', values.country.code)
    formData.append('sharedetails', detail)
    formData.append('itemId', kioskItemInfo.itemid)
    if (values.additional_info) {
      formData.append('additional_information', values.additional_info)
    }
    dispatch(postPlaceKioskOrder(formData))
  }

  const handleOrderItemDigital = (values: any) => {
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('sharedetails', detail)
    formData.append('itemId', kioskItemInfo.itemid)
    if (values.additional_info) {
      formData.append('additional_information', values.additional_info)
    }
    dispatch(postPlaceKioskOrder(formData))
  }

  /*
  ---------------------------------------------------------------------------------------------------------------------------------------
   unlimited_order_#3 allowing to initiate calling pay contract call 
   when hash has been obtained from /kioskItemOrder API
  ---------------------------------------------------------------------------------------------------------------------------------------
  */
  // useEffect(() => {
  //   console.log({ checkItemTempData, postPlaceKioskOrderData })
  //   if (
  //     checkItemTempData ||
  //     (KioskItemDetail?.unlimitedInventory && postPlaceKioskOrderData?.hash)
  //   ) {
  //     setWeb3CallInProgress(true)
  //     if (loginInfo) {
  //       payForKioskItemExternal()
  //     }
  //   }
  // }, [checkItemTempData, postPlaceKioskOrderData?.hash])

  useEffect(() => {
    if (checkItemTempData) {
      setWeb3CallInProgress(true)
      if (loginInfo) {
        deliveryModeRedux === 'postal'
          ? handleOrderItem(itemData)
          : handleOrderItemDigital(itemData)
      }
    }
  }, [checkItemTempData])

  const deliveryMode = deliveryModeRedux

  // const privyDialogRef = useRef(null)
  // useEffect(() => {
  //   const handleMutations = mutationsList => {
  //     mutationsList.forEach(mutation => {
  //       if (mutation.type === 'childList') {
  //         const privyDialog = document.getElementById('headlessui-portal-root')
  //         if (privyDialog) {
  //           privyDialogRef.current = privyDialog
  //         }
  //         const privyDialogExist = privyDialogRef.current
  //         if (privyDialogExist) {
  //           if (!document.body.contains(privyDialogExist)) {
  //             handleCloseDialog()
  //           }
  //         }
  //       }
  //     })
  //   }
  //   const observer = new MutationObserver(handleMutations)
  //   observer.observe(document.body, { childList: true, subtree: true })
  //   return () => {
  //     observer.disconnect()
  //   }
  // }, [])

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    width: true ? '100%' : '80%',
    margin: '30px auto 0px auto',
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: THEME_COLORS[selectedThemeRedux]['SecondaryBackground'],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: THEME_COLORS[selectedThemeRedux]['SecondaryForeground'],
    },
  }))

  const getInitialErrors = () => {
    if (deliveryMode === 'digital') {
      if (!getUserSettingsData?.email) {
        return {
          email: '',
        }
      }
    } else if (deliveryMode === 'postal') {
      if (
        userAddressData?.recipientaddress &&
        userAddressData?.recipientpostalcode &&
        userAddressData?.recipientcity &&
        userAddressData?.recipientcountry
      ) {
        return null
      } else {
        return kioskInitialValues
      }
    }
  }

  return (
    <section
      className={classnames(
        'wallet-container pay-for-item-container',
        isMobile() ? 'scrollForMobile' : '',
      )}
    >
      {!web3CallInProgress ? (
        <div
          className="fullwidth m0-auto mb-20 wallet-heading mt-30 passphrase-heading"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {kioskItemTempData > 0 && timerFinished === false ? (
            <div className="timer_wrapper">
              <TimerIcon style={{ color: '#6bc909' }} />{' '}
              <CountdownTimer initialSeconds={kioskItemTempData} />
            </div>
          ) : timerFinished ? (
            <div>
              <p className="input-feedback text-center m-0">
                {t('trans_time_out')}
              </p>
            </div>
          ) : kioskItemTempData === 0 ? (
            <div style={{ height: 16 }}>
              <p className="input-feedback text-center m-0"></p>
            </div>
          ) : (
            <p className="my_card_skeleton player_name_skeleton"></p>
          )}
          {step === 1 ? (
            <BorderLinearProgress variant="determinate" value={50} />
          ) : step === 2 ? (
            <BorderLinearProgress variant="determinate" value={100} />
          ) : null}
          <p className="sub-title">{t('you want to pay for Item')}</p>
          <p
            style={{
              textTransform: 'capitalize',
              margin: '0px 0px',
              color: 'var(--secondary-foreground-color)',
            }}
          >
            {payForItemName}
          </p>
          {kioskItem && (
            <div>
              {step === 1 ? (
                <>
                  <Formik
                    enableReinitialize={true}
                    initialValues={kioskInitialValues}
                    onSubmit={(values: any) => handleNextStep(values)}
                    validationSchema={Yup.object().shape({
                      detail: Yup.string().required(t('field is required')),
                    })}
                  >
                    {props => {
                      const {
                        values,
                        touched,
                        errors,
                        dirty,
                        isValid,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                      } = props
                      const [currentNumber, setCurrentNumber] = useState(
                        values.detail
                          ? maxNumber - values.detail.length
                          : maxNumber,
                      )
                      return (
                        <form
                          className="pb-m-2"
                          autoComplete="off"
                          onSubmit={handleSubmit}
                        >
                          <div
                            className={classNames(
                              'createnft-fileload',
                              'no-border',
                              'createitem-fileload',
                            )}
                          >
                            <div style={{ margin: '30px 0px' }}>
                              <h2
                                className="kiosk_sub_title"
                                style={{
                                  textAlign: 'left',
                                  marginTop: '30px',
                                }}
                              >
                                {t('player wants this information:')}
                              </h2>
                              <FormTextArea
                                id="detail"
                                type="text"
                                name="detail"
                                disabled={true}
                                containerClass="textarea-wrapper kiosk_digital_detail"
                                value={values.buyerInstructions}
                                handleChange={(e: any) => handleChange(e)}
                                onBlur={handleBlur}
                              />
                            </div>
                            <div style={{ margin: '30px 0px' }}>
                              <h2
                                className="kiosk_sub_title"
                                style={{
                                  textAlign: 'left',
                                  marginTop: '30px',
                                }}
                              >
                                {t('your response:')}
                              </h2>
                              <FormTextArea
                                id="detail"
                                type="text"
                                name="detail"
                                containerClass="textarea-wrapper kiosk_digital_detail"
                                value={values.detail}
                                maxLength={maxNumber}
                                handleChange={(e: any) => {
                                  const length = e.target.value.length
                                  setCurrentNumber(maxNumber - length)
                                  handleChange(e)
                                }}
                                onBlur={handleBlur}
                              />
                              {errors.detail && touched.detail && (
                                <div className="input-feedback">
                                  {errors.detail.toString()}
                                </div>
                              )}
                              {currentNumber < 251 && currentNumber >= 0 && (
                                <div className="characters_left">
                                  {t('characters left')}: {currentNumber}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-20">
                            <SubmitButton
                              isDisabled={timerFinished || !isValid}
                              title={t('NEXT')}
                              className="pay_order"
                              onPress={handleSubmit}
                              isLoading={postPlaceKioskOrderLoader}
                            />
                          </div>
                        </form>
                      )
                    }}
                  </Formik>
                </>
              ) : (
                <>
                  {deliveryMode === 'postal' ? (
                    <p className="review_message">
                      {t(
                        'if you fill in the wrong fields the package wont arrive Please review your data',
                      )}
                    </p>
                  ) : null}
                  <Formik
                    enableReinitialize={true}
                    initialValues={kioskInitialValues}
                    // validate={validate}
                    onSubmit={
                      (values: any) => checkKioskOrder(values)
                      // deliveryModeRedux === 'postal'
                      //   ? handleOrderItem(values)
                      //   : handleOrderItemDigital(values)
                    }
                    // validate={validate}
                    validationSchema={Yup.object().shape(
                      deliveryModeRedux === 'postal'
                        ? {
                            name: Yup.string().required(t('field is required')),
                            address: Yup.string().required(
                              t('field is required'),
                            ),
                            zip: Yup.string().required(t('field is required')),
                            city: Yup.string().required(t('field is required')),
                            country: Yup.object()
                              .nullable()
                              .required(t('field is required')),
                          }
                        : {
                            email: Yup.string()
                              .email(t('invalid email'))
                              .required(t('email Required')),
                          },
                    )}
                    // validationSchema={Yup.object().shape({
                    //   email: Yup.string()
                    //     .email('Invalid email')
                    //     .required('Email is required'),
                    // })}
                    initialErrors={getInitialErrors()}
                    // validateOnChange={false}
                  >
                    {props => {
                      const {
                        values,
                        touched,
                        errors,
                        isValid,
                        dirty,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        setFieldValue,
                      } = props
                      const [currentNumber, setCurrentNumber] = useState(
                        values.additional_info
                          ? maxNumber - values.additional_info.length
                          : maxNumber,
                      )
                      return (
                        <form
                          className="pb-m-2"
                          autoComplete="off"
                          onSubmit={handleSubmit}
                        >
                          {console.log({
                            values,
                            errors,
                            isValid,
                            dirty,
                          })}
                          <div
                            className={classNames(
                              'createnft-fileload',
                              'no-border',
                              'createitem-fileload',
                            )}
                          >
                            {deliveryMode === 'digital' ? (
                              <div style={{ margin: '30px 0px' }}>
                                <h2
                                  className="kiosk_sub_title"
                                  style={{
                                    textAlign: 'left',
                                    marginTop: '30px',
                                  }}
                                >
                                  {t('Delivery to:')}
                                </h2>
                                {console.log({
                                  values,
                                  errors,
                                  isValid,
                                  dirty,
                                })}
                                <FormInput
                                  id="email"
                                  type="email"
                                  placeholder={t('enter_your_email')}
                                  name="email"
                                  value={values.email}
                                  handleChange={handleChange}
                                  onBlur={handleBlur}
                                  disabled={false}
                                />
                                {errors.email && touched.email && (
                                  <div className="input-feedback">
                                    {errors.email.toString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                {' '}
                                <FormInput
                                  id="name"
                                  type="text"
                                  placeholder={t('enter_your_name')}
                                  name="name"
                                  value={values.name}
                                  handleChange={handleChange}
                                  onBlur={handleBlur}
                                  disabled={false}
                                />
                                {errors.name && touched.city && (
                                  <div className="input-feedback">
                                    {errors.name.toString()}
                                  </div>
                                )}
                                <FormInput
                                  id="additional_info"
                                  type="text"
                                  placeholder={t('additional information')}
                                  name="additional_info"
                                  value={values.additional_info}
                                  handleChange={handleChange}
                                  onBlur={handleBlur}
                                  disabled={false}
                                  classNameWrapper="mt-20"
                                />
                                <div className="mt-20">
                                  <FormInput
                                    id="address"
                                    type="text"
                                    placeholder={t('enter_your_address')}
                                    name="address"
                                    value={values.address}
                                    handleChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={false}
                                  />
                                </div>
                                {errors.address && touched.city && (
                                  <div className="input-feedback">
                                    {errors.address.toString()}
                                  </div>
                                )}
                                <div className="flexMode mt-10">
                                  <FormInput
                                    id="zip"
                                    type="text"
                                    placeholder={t('zip')}
                                    name="zip"
                                    value={values.zip}
                                    handleChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={false}
                                    paymentFormZip={true}
                                  />
                                  <FormInput
                                    id="city"
                                    type="text"
                                    placeholder={t('city')}
                                    name="city"
                                    value={values.city}
                                    handleChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={false}
                                    paymentFormCity={true}
                                  />
                                </div>
                                <div className="flexMode">
                                  {errors.zip && touched.city && (
                                    <div
                                      className="input-feedback-pay"
                                      style={{ textAlign: 'left' }}
                                    >
                                      {errors.zip.toString()}
                                    </div>
                                  )}
                                  {errors.city && touched.city && (
                                    <div
                                      className="input-feedback-pay"
                                      style={{ textAlign: 'right' }}
                                    >
                                      {errors.city.toString()}
                                    </div>
                                  )}
                                </div>
                                <div className="pay-select mt-20">
                                  <CountrySelect
                                    countryName={values.country}
                                    setCountry={e =>
                                      setFieldValue('country', e)
                                    }
                                  />
                                  {errors.country && touched.country && (
                                    <div className="input-feedback">
                                      {errors.country.toString()}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          <div
                            className={classNames('proxy_method_wrapper mt-20')}
                          >
                            <div className="proxy_method">
                              <div
                                className="currency_mark_img"
                                style={{
                                  background: getCircleColor(
                                    kioskItemInfo?.playerlevelid ||
                                      allPlayersData[0]?.playerlevelid,
                                  ),
                                }}
                              >
                                <PlayerImage
                                  src={
                                    kioskItemInfo?.playerpicturethumb ||
                                    allPlayersData[0]?.playerpicturethumb
                                  }
                                  className="img-radius_kiosk currency_mark"
                                />
                              </div>
                              <div>
                                <div className="pay-detail">
                                  {kioskItemInfo?.ticker ||
                                    allPlayersData[0]?.ticker}
                                </div>
                              </div>
                            </div>
                            <div
                              className="pay-detail"
                              style={{ fontSize: '20px' }}
                            >
                              <span>{payForItemPrice.toFixed(5)}</span>
                            </div>
                          </div>
                          <div className="mt-20">
                            <SubmitButton
                              isDisabled={timerFinished || !isValid}
                              title={t('place_order_and_pay')}
                              className="pay_order"
                              onPress={handleSubmit}
                              isLoading={postPlaceKioskOrderLoader}
                            />
                          </div>
                        </form>
                      )
                    }}
                  </Formik>
                </>
              )}
            </div>
          )}
          {!kioskItem && (
            <>
              <div style={{ width: '80%', margin: '30px 0px' }}>
                <div className={classNames('proxy_method_wrapper')}>
                  <div className="proxy_method">
                    <div className="proxy_icon">
                      <ImageComponent
                        className="proxy_icon"
                        src={maticIcon}
                        alt="MATIC"
                      />
                    </div>
                    <div>
                      <div className="h-4">{'Polygon'}</div>
                      <div className="pay-detail">{'MATIC'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="pay-detail" style={{ fontSize: '20px' }}>
                      <span>{payForItemPrice.toFixed(5)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {lowBalance && (
                <div className="input-feedback text-center fullwidth mt-40">
                  {lowBalance}
                </div>
              )}
              <div
                className={classNames(
                  'form-submit-btn  mt-20 m-0 auto',
                  lowBalance ? 'btn-disabled' : '',
                )}
                style={{ width: '80%' }}
                onClick={handleBuyItem}
              >
                {t('pay')}
              </div>
              <div
                className="form-submit-btn btn-disabled mt-30 m-0 auto"
                style={{ width: '80%' }}
                onClick={handleCancelPayment}
              >
                {t('cancel')}
              </div>
            </>
          )}
        </div>
      ) : localStorage.getItem('loginInfo') ? (
        <BottomPopup
          isOpen={true}
          mode={`wallet ${isMobile() ? 'exwallet-bottomwrapper' : ''}`}
          onClose={handleCloseDialog}
        >
          {/* <CloseAbsolute onClose={handleCloseDialog} /> */}
          <section className="new-draft vertical-flex buy-fly pay-item">
            <ImageComponent
              loading="lazy"
              src={
                walletType === 'Metamask'
                  ? MetamaskIcon
                  : walletType === 'Privy'
                  ? WalletIcon
                  : CoinbaseIcon
              }
              className="draftee-metamaskicon"
              alt="metamask-icon"
            />
            {walletType === 'Privy' ? (
              <div className="input-label approve-blockchain internal-mechanism-note">
                {t('sending_transaction_to_the_blockchain')}
              </div>
            ) : (
              <div className="input-label approve-blockchain">
                {t('please approve the blockchain transaction') +
                  ' ' +
                  walletType}
              </div>
            )}
            {isLoadingMatic && !txnHash && !txnError ? (
              <div
                className={classNames(
                  isMobile()
                    ? 'checkout-loader-wrapper-mobile mt-40'
                    : 'checkout-loader-wrapper draftee-propmt mt-40',
                )}
              >
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              </div>
            ) : (
              <>
                {txnHash ? (
                  <div
                    style={{ height: '50px' }}
                    className={classnames(
                      'add-draftee-success',
                      'web3action-success',
                      'mt-20',
                    )}
                  >
                    <div className="check-container-txn">
                      <CheckCircleOutlinedIcon className="response-icon success-icon web3-success-check" />
                      {(txnConfirmResp.length === 0 || isTxnChecking) &&
                      !txnConfirmSuccess ? (
                        <div
                          className={classnames('spinner check-spinner')}
                        ></div>
                      ) : (
                        <>
                          {txnConfirmResp[0]?.haserror === 0 ||
                          txnConfirmSuccess ? (
                            <CheckCircleOutlinedIcon className="response-icon success-icon web3-success-check" />
                          ) : (
                            <CancelOutlinedIcon className="response-icon error-icon" />
                          )}
                        </>
                      )}
                    </div>
                    <span>{t('transaction sent')}</span>
                    {txnConfirmResp.length > 0 || txnConfirmSuccess ? (
                      <span
                        style={{
                          fontSize: isMobile() ? '20px' : '17px',
                          margin: 'unset',
                        }}
                        className={classnames(
                          txnConfirmResp[0]?.haserror === 0 || txnConfirmSuccess
                            ? 'txn-confirm-success'
                            : 'txn-confirm-error',
                        )}
                      >
                        {(!isTxnChecking &&
                          txnConfirmResp[0]?.haserror === 0) ||
                        txnConfirmSuccess
                          ? t('transaction confirmed')
                          : (!isTxnChecking &&
                              txnConfirmResp[0]?.haserror === 1) ||
                            txnConfirmSuccess
                          ? t('transaction failed')
                          : ''}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: isMobile() ? '20px' : '17px',
                          color: 'var(--primary-text-color)',
                        }}
                      >
                        {t('confirming transaction') + '...'}
                      </span>
                    )}
                    {txnHash && (
                      <a
                        className="tx-link button-box"
                        href={`${BASE_EXPLORE_URL}/tx/${txnHash}`}
                        target="_blank"
                      >
                        {t('show transaction')}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="txn-err-wrapper">
                    <CancelOutlinedIcon className="response-icon error-icon" />
                    <span>{t('transaction failed')}</span>
                    <div className="input-feedback">{txnError}</div>
                  </div>
                )}
              </>
            )}
            {/* <div className="close-button" onClick={handleCloseDialog}>
              {t('close')}
            </div> */}
            <ReactCanvasConfetti
              refConfetti={getInstance}
              style={canvasStyles}
            />
          </section>
        </BottomPopup>
      ) : (
        <ApiBottomPopup
          showPopup={true}
          onSubmit={handleSendApi}
          onClose={handleCloseDialog}
          customClass="purchase-pc-bottomwrapper"
        />
      )}
    </section>
  )
}

export default PayForItems
