import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/NftCard.css'
import '@assets/css/components/Kiosk.css'
import {
  getCheckPlayerCoinBal,
  getPlayerKioskList,
  getUserXp,
  postCheckItemTempOrder,
  postConfirmKioskOrder,
  postKioskItemTempOrder,
  postPlaceKioskOrder,
  resetKioskItemDetail,
  resetPlaceKioskOrderUnlimited,
  resetPostKioskItem,
  resetPostPlaceKioskOrder,
  showKioskItemDetail,
  showSignupForm,
  showStakingForm,
  togglePayForItem,
} from '@root/apis/onboarding/authenticationSlice'
import classNames from 'classnames'
import { toast } from 'react-hot-toast'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import MetamaskIcon from '@assets/icons/icon/metamask.svg'
import CoinbaseIcon from '@assets/icons/icon/coinbase.svg'
import WalletIcon from '@assets/icons/icon/wallet.webp'
import { useDispatch, useSelector } from 'react-redux'
import EditIcon from '@mui/icons-material/Edit'
import BidButton from '@components/Button/BidButton'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import {
  getBtnDisabledStatusForAddress,
  getCircleColor,
  getCountryCodeNew,
  getFlooredFixed,
  isMobile,
  sleep,
  toKPIIntegerFormat,
  toKPINumberFormat,
} from '@utils/helpers'
import { RootState } from '@root/store/rootReducers'
import PlayerImage from '@components/PlayerImage'
import { useNavigate } from 'react-router-dom'
import ImageComponent from '@components/ImageComponent'
import AliceCarousel from 'react-alice-carousel'
import leftArrow from '@assets/images/left_angle_bracket.webp'
import rightArrow from '@assets/images/right_angle_bracket.webp'
import 'react-alice-carousel/lib/alice-carousel.css'
import '@assets/css/components/Carousel.css'
import {
  getPlayer1Contract,
  getPlayerDetails,
  getSendMaticTxnConfirm,
  getStakingBalance,
  getUserPayedItems,
  payForItem,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { countries } from '@components/CountryDropdown'
import TooltipLabel from '@components/TooltipLabel'
import LinkIcon from '@mui/icons-material/Link'
import ShareIcon from '@components/Svg/ShareIcon'
import { ShareSocial } from 'react-share-social'
import { BASE_EXPLORE_URL, PLAYER_STATUS, SALES_OPTION } from '@root/constants'
import BottomPopup from '@components/Dialog/BottomPopup'
import KioskAddressPopup from '@pages/Kiosk/KioskAddressPopup'
import KioskBidPopup from '@pages/Kiosk/KioskBidPopup'
import Stake from '@pages/PlayerNft/Stake'
import { useWalletHelper } from '@utils/WalletHelper'
import { ethers } from 'ethers'
import ReactCanvasConfetti from 'react-canvas-confetti'
import CloseAbsolute from '@components/Form/CloseAbsolute'

const canvasStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
} as React.CSSProperties
let txnCheckInterval: any = null
let checkKioskOrderTimeout: any = null
const KioskItemDetail: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    KioskItemDetailLoader,
    KioskItemDetail,
    showKioskItemDetailsBuy,
    CheckPlayerCoinBalLoader,
    CheckPlayerCoinBal,
    getUserSettingsData,
    checkItemTempError,
    ipLocaleCurrency,
    currencyRate,
    itemAddressData,
    postPlaceKioskOrderSuccess,
    payForItemPrice,
    checkItemTempData,
    postPlaceKioskOrderData,
    kioskItem,
    kioskItemInfo,
    payForItemName,
    isTransferTxnHash,
    isTxnHash,
    deliveryModeRedux,
    gasFeeIncreasePercentage,
  } = authenticationData
  const walletType = localStorage.getItem('wallet')
  const { getWeb3Provider, getEthereumProvider } = useWalletHelper()
  const currencySymbol =
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD'

  const nativeAmount = KioskItemDetail?.itemPrice
    ? KioskItemDetail?.itemPrice *
      (KioskItemDetail?.coinprice ?? 1) *
      KioskItemDetail?.exchangeRateUSD?.rate *
      currencyRate
    : 0

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
  const [inviteLink, setInviteLink] = useState('')
  const [tempOrderLoader, setTempOrderLoader] = useState(false)
  const [detail, setDetail] = useState('')
  const [isLoadingMatic, setIsLoadingMatic] = useState(false)
  const [txnHash, setTxnHash] = useState('')
  const [txnError, setTxnError] = useState('')
  const [web3CallInProgress, setWeb3CallInProgress] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showAddressPopup, setShowAddressPopup] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [showFanPopup, setShowFanPopup] = useState(false)

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const {
    getPlayerDetailsSuccessData,
    allPlayersData,
    stakingBalance,
    stakingBalLoader,
    stakingcontract,
    stakingcontractabi,
    txnConfirmResp,
    txnConfirmSuccess,
    isTxnChecking,
  } = playerCoinData
  const [buyBalance, setBuyBalance] = useState(false)

  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')

  useEffect(() => {
    return () => {
      clearInterval(txnCheckInterval)
      dispatch(resetKioskItemDetail())
      dispatch(resetPostPlaceKioskOrder())
    }
  }, [])

  useEffect(() => {
    clearInterval(txnCheckInterval)
    if (!document.hidden) {
      if (txnHash) {
        handleTxnCheck()
      }
    }
  }, [document.hidden])

  useEffect(() => {
    if (checkItemTempError !== '') {
      toast.error(checkItemTempError, {
        duration: 4000,
      })
    }
  }, [checkItemTempError])

  useEffect(() => {
    console.log('ending_txncheck1', txnConfirmResp)
    if (
      txnConfirmResp[0]?.haserror === 0 ||
      txnConfirmResp[0]?.haserror === 1 ||
      txnConfirmResp?.message === 'Transaction failed'
    ) {
      console.log('ending_txncheck')
      clearInterval(txnCheckInterval)
    }
  }, [txnConfirmResp])

  const handleTxnCheck = () => {
    console.log({ kioskItem })
    if (!kioskItem) {
      dispatch(
        payForItem({
          item: payForItemName,
          transactionhash: txnHash || isTransferTxnHash,
        }),
      )
    }
    console.log('gsmtc1')
    dispatch(getSendMaticTxnConfirm(txnHash || isTxnHash || isTransferTxnHash))
    txnCheckInterval = setInterval(() => {
      console.log('gsmtc8')
      dispatch(
        getSendMaticTxnConfirm(txnHash || isTxnHash || isTransferTxnHash),
      )
    }, 10000)
  }

  useEffect(() => {
    if (KioskItemDetail?.detailpageurl && (loginInfo || loginId)) {
      // it is called for getting getPlayerDetailsSuccessData to show staking form when there is staking balance
      // dispatch(getPlayerDetails(KioskItemDetail?.detailpageurl))
      dispatch(getPlayer1Contract({ url: KioskItemDetail?.detailpageurl }))
    }
  }, [KioskItemDetail?.detailpageurl])

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
    if (txnConfirmSuccess) {
      clearInterval(txnCheckInterval)
      setTimeout(() => {
        dispatch(getUserPayedItems())
      }, 10000)
    }
  }, [txnConfirmSuccess])

  useEffect(() => {
    if (
      (!isTxnChecking && txnConfirmResp[0]?.haserror === 0) ||
      txnConfirmSuccess
    ) {
      fire()
      dispatch(getUserXp({ isFirstLoading: false }))
      const formData = new FormData()
      if (checkItemTempData || postPlaceKioskOrderData?.hash) {
        formData.append(
          'hash',
          checkItemTempData || postPlaceKioskOrderData?.hash,
        )
      }
      formData.append('itemId', kioskItemInfo.itemid)
      formData.append('transaction_hash', txnHash)
      dispatch(postConfirmKioskOrder(formData))
    }
  }, [isTxnChecking, txnConfirmResp[0], txnConfirmSuccess])

  const handleBid = () => {
    if (!loginInfo && !loginId) {
      dispatch(showKioskItemDetail({ showKioskItemDetailsBuy: false }))
      dispatch(showSignupForm())
      return
    }
    if (stakingBalance >= KioskItemDetail?.itemPrice) {
      if (showKioskItemDetailsBuy) {
        setTempOrderLoader(true)
        if (!KioskItemDetail?.unlimitedInventory) {
          dispatch(postKioskItemTempOrder({ itemId: KioskItemDetail?.itemId }))
        }
        dispatch(
          togglePayForItem({
            visible: false,
            price: KioskItemDetail?.itemPrice,
            name: KioskItemDetail?.itemName,
            kioskItem: true,
            kioskItemInfo: {
              itemid: KioskItemDetail?.itemId,
              playercontract: KioskItemDetail?.playerContract,
              playercontractabi: KioskItemDetail?.playerContractAbi,
              playerlevelid: KioskItemDetail?.playerLevelId,
              playerpicturethumb: KioskItemDetail?.playerPictureThumb,
              name: KioskItemDetail?.name,
              ticker: KioskItemDetail?.ticker,
              buyerInstructions: KioskItemDetail?.buyerInstructions,
            },
            deliveryModeRedux: KioskItemDetail?.delivery_mode,
          }),
        )
      }
    } else if (stakingBalance < KioskItemDetail?.itemPrice) {
      handleStakeFormOpen()
    }
  }

  const handleNextStep = (values: any) => {
    setDetail(values.detail)
    setStep(2)
  }

  useEffect(() => {
    console.log({ postPlaceKioskOrderSuccess })
    if (postPlaceKioskOrderSuccess) {
      payForKioskItemExternal()
    }
  }, [postPlaceKioskOrderSuccess])

  const payForKioskItemExternal = async () => {
    setIsLoadingMatic(true)
    setShowFanPopup(false)
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
          amount: ethers.utils.parseEther(KioskItemDetail?.itemPrice.toString())
            ._hex,
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

  const handleStakeFormOpen = async () => {
    if (!loginInfo && !loginId) {
      dispatch(showSignupForm())
      return
    }
    if (getPlayerDetailsSuccessData) {
      await dispatch(showKioskItemDetail({ showKioskItemDetailsBuy: false }))
      dispatch(showStakingForm({ playerData: getPlayerDetailsSuccessData }))
    } else {
      console.log('no_player_detail_data')
    }
  }

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
    if (KioskItemDetail?.playerContract && (loginInfo || loginId)) {
      // dispatch(getCheckPlayerCoinBal(KioskItemDetail?.playerContract))
      dispatch(getStakingBalance(KioskItemDetail?.playerContract))
    }
  }, [KioskItemDetail?.playerContract])

  useEffect(() => {
    if (stakingBalance > KioskItemDetail?.itemPrice) {
      setBuyBalance(false)
    } else {
      setBuyBalance(true)
    }
  }, [stakingBalance, KioskItemDetail])

  const gotoPlayer = (event: any) => {
    event.stopPropagation()
    dispatch(showKioskItemDetail({ showKioskItemDetailsBuy: false }))
    const player = KioskItemDetail.detailpageurl
    navigate(`/app/player/${player}`)
    dispatch(showKioskItemDetail({ showKioskItemDetailsBuy: false }))
  }
  const responsiveItemDefault = {
    0: {
      items: 1,
    },
  }
  const [itemData, setItemData] = useState({})
  const [items, setItems] = useState([])
  const [step, setStep] = useState(0) // 0: loading, 1: first step, 2: second step, 3: no step
  const minLength = 1
  const [hovered, setHovered] = useState(false)
  const isAuction =
    KioskItemDetail?.salesMethod?.toString() === SALES_OPTION.AUCTION
  const isRaffle =
    KioskItemDetail?.salesMethod?.toString() === SALES_OPTION.RAFFLE
  const isFan = KioskItemDetail?.salesMethod?.toString() === SALES_OPTION.FAN

  useEffect(() => {
    if (KioskItemDetail?.additionalImages?.length > 0) {
      setItems(
        KioskItemDetail?.additionalImages.map((image, index) => (
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
  }, [KioskItemDetail?.additionalImages])

  useEffect(() => {
    console.log({ buyBalance, KioskItemDetail })
  }, [buyBalance, KioskItemDetail])

  const pauseFunc = async () => {
    for (let i = 0; i < 2; i++) {
      await sleep(i * 1000)
    }
  }

  useEffect(() => {
    console.log('chkdsk2', { checkItemTempData })
    if (checkItemTempData) {
      setIsLoadingMatic(true)
      pauseFunc()
      setWeb3CallInProgress(true)
      setShowFanPopup(false)
      if (loginInfo) {
        deliveryModeRedux === 'postal'
          ? handleOrderItem(itemAddressData)
          : handleOrderItemDigital(itemAddressData)
      }
    }
  }, [checkItemTempData])

  console.log({ itemAddressData })

  /*
  ---------------------------------------------------------------------------------------------------------------------------------------
   unlimited_order_#2 calling /kioskItemOrder API with address details
   fetched from /default_order_address API response, only in case of unlimited orders
  ---------------------------------------------------------------------------------------------------------------------------------------
  */
  // useEffect(() => {
  //   if (KioskItemDetail?.unlimitedInventory && itemAddressData) {
  //     console.log({ itemAddressData, KioskItemDetail })
  //     handleOrderItem()
  //   }
  // }, [KioskItemDetail?.unlimitedInventory, itemAddressData])

  const getBuyDisabledStatus = () => {
    if ([true, 1].includes(KioskItemDetail?.unlimitedInventory)) {
      return false
    } else if (KioskItemDetail?.itemAvailable < 1) {
      return true
    }
    return false
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${process.env.REACT_APP_APP_URL}/app/player-items/${KioskItemDetail?.itemhash}`,
    )
  }

  const handleShareLink = () => {
    setInviteLink(
      `${process.env.REACT_APP_APP_URL}/app/player-items/${KioskItemDetail?.itemhash}`,
    )
    setShowSharePopup(true)
  }

  const styleShare = {
    root: {
      width: '40%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 'auto',
      height: '60px',
      padding: '5px',
      background: 'transparent',
      borderRadius: 3,
      border: 0,
      color: 'white',
    },
    copyContainer: {
      display: 'none',
      border: '1px solid blue',
      background: 'rgb(0,0,0,0.7)',
    },
    title: {
      color: 'aquamarine',
      fontStyle: 'italic',
    },
  }

  const checkKioskOrder = (values: any) => {
    console.log('chkdsk--', values)
    setItemData(values)
    try {
      handleBid()
      // setItemData(values)
      clearTimeout(checkKioskOrderTimeout)
      checkKioskOrderTimeout = setTimeout(() => {
        setTempOrderLoader(false)
        if (!KioskItemDetail?.unlimitedInventory) {
          dispatch(postCheckItemTempOrder({ itemId: KioskItemDetail?.itemId }))
        } else if (KioskItemDetail?.unlimitedInventory) {
          setIsLoadingMatic(true)
          setWeb3CallInProgress(true)
          setShowFanPopup(false)
          if (loginInfo) {
            console.log('pps1', KioskItemDetail.delivery_mode)
            if (KioskItemDetail?.delivery_mode === 'postal') {
              console.log('pps2', KioskItemDetail.delivery_mode)
              handleOrderItem(itemAddressData)
            } else {
              console.log('pps3', KioskItemDetail.delivery_mode)
              handleOrderItemDigital(itemAddressData)
            }
          }
        }
      }, 2000)
    } catch (error) {
      console.log(error)
    }
  }

  const handleOrderItem = (values: any) => {
    console.log('chkdsk1--', values)
    const formData = new FormData()
    formData.append('name', values.recipientname)
    formData.append('address', values.recipientaddress)
    formData.append('ZIP', values.recipientpostalcode)
    formData.append('city', values.recipientcity)
    formData.append(
      'country_id',
      values?.country?.phone || values?.recipientcountry,
    )
    formData.append('country_code', values?.country?.code || 'IN')
    formData.append('sharedetails', detail || values?.additional_info)
    formData.append('itemId', KioskItemDetail.itemId)
    if (values.additional_info) {
      formData.append('additional_information', values.additional_info)
    }
    dispatch(postPlaceKioskOrder(formData))
  }

  const handleOrderItemDigital = (values: any) => {
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('sharedetails', detail)
    formData.append('itemId', KioskItemDetail.itemId)
    if (values.additional_info) {
      formData.append('additional_information', values.additional_info)
    }
    dispatch(postPlaceKioskOrder(formData))
  }

  return (
    <div
      className={classNames(
        'main_kiosk_wrapper_Buy kiosk-nft-container',
        isMobile() ? 'kiosk-main-mobile' : '',
      )}
    >
      {web3CallInProgress ? (
        <BottomPopup
          isOpen={true}
          mode={`wallet ${isMobile() ? 'exwallet-bottomwrapper' : ''}`}
          onClose={handleCloseDialog}
        >
          <CloseAbsolute onClose={handleCloseDialog} />
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
                    className={classNames(
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
                          className={classNames('spinner check-spinner')}
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
                    {txnConfirmResp.length > 0 ||
                    txnConfirmResp?.message === 'Transaction failed' ||
                    txnConfirmSuccess ? (
                      <span
                        style={{
                          fontSize: isMobile() ? '20px' : '17px',
                          margin: 'unset',
                        }}
                        className={classNames(
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
                            txnConfirmSuccess ||
                            txnConfirmResp?.message === 'Transaction failed'
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
      ) : null}
      <BottomPopup
        mode={
          // (showPopup && (isRaffle || isFan)) ||
          (showAddressPopup && KioskItemDetail?.delivery_mode === 'digital') ||
          stakingBalance === 0
            ? 'stake'
            : 'nft'
        }
        isOpen={showPopup || showAddressPopup}
        onClose={() => {
          if (showPopup) {
            setShowPopup(false)
          } else {
            setShowAddressPopup(false)
            setShowFanPopup(true)
          }
        }}
      >
        {showPopup ? (
          <>
            {/* <CloseAbsolute
              onClose={() => {
                setShowPopup(false)
              }}
            /> */}
            <Stake
              detailpageurl={KioskItemDetail?.detailpageurl}
              isPro={KioskItemDetail?.playerstatusid === PLAYER_STATUS.PRO}
              onClose={() => {
                setShowPopup(false)
              }}
            />
          </>
        ) : showAddressPopup ? (
          <>
            {/* <CloseAbsolute
              onClose={() => {
                setShowAddressPopup(false)
                setShowFanPopup(true)
              }}
            /> */}
            <KioskAddressPopup
              kioskItem={KioskItemDetail}
              onClose={() => {
                setShowAddressPopup(false)
                setShowFanPopup(true)
              }}
            />
          </>
        ) : null}
      </BottomPopup>
      <BottomPopup
        mode={'stake'}
        isOpen={showFanPopup}
        onClose={() => {
          setShowFanPopup(false)
        }}
      >
        {/* <CloseAbsolute
          onClose={() => {
            setShowFanPopup(false)
          }}
        /> */}
        {showFanPopup && (
          <section
            className={classNames('wallet-container', 'bid-list-container')}
            style={{
              position: 'relative',
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <div className="bid-header-container mt-20 mb-20">
              <div className="stake-bid-header uppercase">{t('buy')}</div>
            </div>
            <div className="item-address-wrapper">
              {itemAddressData?.recipientcountry ? (
                KioskItemDetail?.delivery_mode === 'digital' ? (
                  <div className="item-address-addicon">
                    <MailOutlineIcon />
                  </div>
                ) : (
                  <span
                    className={`fi fis fi-${getCountryCodeNew(
                      itemAddressData?.recipientcountry,
                    )?.toLowerCase()}`}
                  ></span>
                )
              ) : (
                <div
                  className="item-address-addicon"
                  onClick={() => {
                    setShowFanPopup(false)
                    setShowAddressPopup(true)
                  }}
                >
                  <AddCircleOutlinedIcon />
                </div>
              )}
              <b>
                {KioskItemDetail?.delivery_mode === 'digital'
                  ? itemAddressData?.email ?? t('please add email')
                  : itemAddressData?.recipientaddress
                  ? `${itemAddressData?.recipientaddress}, ${itemAddressData?.recipientcity}`
                  : t('please add delivery address')}
              </b>
              <div
                onClick={() => {
                  console.log('dudu')
                  setShowFanPopup(false)
                  setShowAddressPopup(true)
                }}
              >
                <EditIcon />
              </div>
            </div>
            <div className="fullwidth mt-20">
              {tempOrderLoader ? (
                <div className="d-flex-center">
                  <div className={classNames('spinner size-small')}></div>
                </div>
              ) : (
                <button
                  disabled={getBtnDisabledStatusForAddress(
                    itemAddressData,
                    KioskItemDetail,
                  )}
                  className={classNames(
                    'form-submit-btn m-0auto',
                    getBtnDisabledStatusForAddress(
                      itemAddressData,
                      KioskItemDetail,
                    )
                      ? 'btn-disabled'
                      : '',
                  )}
                  onClick={checkKioskOrder}
                >
                  {t('confirm')}
                </button>
              )}
              {/* <div
                className="form-submit-btn btn-disabled mt-20 m-0auto"
                onClick={() => {
                  setShowFanPopup(false)
                }}
              >
                {t('close')}
              </div> */}
            </div>
          </section>
        )}
      </BottomPopup>
      <div className="kiosk-scroll-wrapper">
        {KioskItemDetailLoader ? (
          <div
            className="loading-spinner"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 'auto',
              height: '100%',
            }}
          >
            <div className="spinner">
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="nft">
              <div className="nft-image-cover" style={{ position: 'relative' }}>
                {/* <ImageComponent
                  loading="lazy"
                  src={KioskItemDetail?.itemPicture}
                  alt=""
                  className="nft-image"
                  style={{
                    borderTopLeftRadius: isMobile() ? '' : '20px',
                    borderTopRightRadius: isMobile() ? '' : '20px',
                    height: isMobile() ? '100vw' : '400px',
                  }}
                /> */}
                {KioskItemDetail?.additionalImages?.length > 0 && (
                  <div
                    className={classNames(
                      'circle-carousel kiosk',
                      items.length <= 3 ? 'center-carousel' : 'carousel',
                    )}
                    onMouseOver={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                  >
                    <AliceCarousel
                      infinite={items.length > minLength}
                      mouseTracking
                      items={items}
                      disableButtonsControls={false}
                      keyboardNavigation={true}
                      responsive={responsiveItemDefault}
                      // autoPlayInterval={5000}
                      // infinite
                      // autoPlay={items.length > minLength}
                      // activeIndex={activeIndex}
                      renderPrevButton={() => {
                        return items.length > minLength &&
                          (isMobile() || hovered) ? (
                          <div style={{ opacity: 0.6, transition: '0.5s' }}>
                            <ImageComponent
                              src={leftArrow}
                              alt=""
                              className="img-radius carousel-arrow"
                              style={{ margin: '2px 5px 2px 0' }}
                            />
                          </div>
                        ) : (
                          <div style={{ opacity: 0, transition: '0.5s' }}>
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
                        return items.length > minLength &&
                          (isMobile() || hovered) ? (
                          <div style={{ opacity: 0.6, transition: '0.5s' }}>
                            <ImageComponent
                              src={rightArrow}
                              alt=""
                              className="img-radius carousel-arrow"
                              style={{ margin: '2px 3px 2px 2px' }}
                            />
                          </div>
                        ) : (
                          <div style={{ opacity: 0, transition: '0.5s' }}>
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

                <div className="currency_mark_wrapper kiosk-item-flag-buyItem w-none mb-5">
                  <div
                    className="currency_mark_img"
                    style={{
                      background: getCircleColor(
                        KioskItemDetail?.playerLevelId ||
                          getPlayerDetailsSuccessData?.playerlevelid,
                      ),
                    }}
                  >
                    <PlayerImage
                      src={
                        KioskItemDetail?.playerPictureThumb ||
                        getPlayerDetailsSuccessData?.playerpicturethumb ||
                        getPlayerDetailsSuccessData?.playerpicture ||
                        getPlayerDetailsSuccessData?.img
                      }
                      className="img-radius_kiosk currency_mark"
                    />
                  </div>
                  <div>
                    {toKPIIntegerFormat(KioskItemDetail?.itemPrice)}
                    <span>
                      {' '}
                      {KioskItemDetail?.ticker ||
                        getPlayerDetailsSuccessData?.ticker ||
                        allPlayersData[0]?.ticker}
                    </span>
                    &nbsp;/&nbsp;{toKPINumberFormat(nativeAmount)}&nbsp;
                    {currencySymbol}
                  </div>
                </div>
              </div>
            </div>
            {showSharePopup ? (
              <div
                className="kiosk-share-wrapper"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Rajdhani-bold',
                    fontWeight: '400',
                    fontSize: '20px',
                    textAlign: 'center',
                    marginTop: '120px',
                  }}
                >
                  {t('share with your friends')}
                </p>
                <ShareSocial
                  url={inviteLink}
                  socialTypes={['whatsapp', 'facebook', 'twitter', 'telegram']}
                  style={styleShare}
                  onSocialButtonClicked={data => console.log(data)}
                />
                <p style={{ marginBottom: '100px' }}></p>
                {/* <div
                  className="nft-close-link mt-20 mb-0 m-0auto"
                  onClick={() => {
                    setShowSharePopup(false)
                  }}
                  style={{ position: 'absolute', bottom: '40px', left: '45%' }}
                >
                  {t('close')}
                </div> */}
              </div>
            ) : (
              <div
                className="createnft-input-container"
                style={{
                  padding: isMobile() ? '20px 30px 30px' : '30px',
                }}
              >
                <div className="copy_share_icon_wrapper">
                  <div
                    className="share_wrapper"
                    style={{ width: 34, height: 34, marginBottom: 6 }}
                  >
                    <TooltipLabel title="Copy Link">
                      <LinkIcon
                        onClick={handleCopyLink}
                        className="share_icon"
                      />
                    </TooltipLabel>
                  </div>
                  <TooltipLabel title="Share Code">
                    <div
                      className="share_wrapper share-code-btn"
                      style={{ width: 34, height: 34, marginBottom: 6 }}
                      onClick={handleShareLink}
                    >
                      <ShareIcon />
                    </div>
                  </TooltipLabel>
                </div>
                <div className="kiosk_player_name" onClick={gotoPlayer}>
                  {KioskItemDetail?.name ||
                    allPlayersData[0]?.name ||
                    getPlayerDetailsSuccessData?.name}
                </div>
                <div className={classNames('kiosk_name_wrapper mb-0')}>
                  <h2 className="nft-title mb-10">
                    {KioskItemDetail?.itemName}
                  </h2>
                </div>
                <div className={classNames('item-description buy_item_desc')}>
                  {KioskItemDetail?.itemDescription}
                </div>
                <div
                  className={classNames('textinput-wrapper')}
                  style={{
                    width: 'unset',
                    height: '100px',
                    overflowY: 'auto',
                    padding: '10px 0px 10px 10px',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <div className={classNames('item-description buy_item_desc')}>
                    {KioskItemDetail?.additionalDescription}
                  </div>
                </div>

                <div
                  className={classNames(
                    'player_reward_percentage_wrapper kiosk-item-available',
                    KioskItemDetail?.itemAvailable > 0 ? '' : 'grey-color',
                  )}
                  style={{ minHeight: '20px' }}
                >
                  {!KioskItemDetail?.unlimitedInventory && (
                    <>
                      <div className="input-label">
                        {KioskItemDetail?.salesMethod?.toString() ===
                        SALES_OPTION.FAN
                          ? t('winners')
                          : t('available')}
                        :
                      </div>
                      <div className="percentage_value_wrapper">
                        <p className="">{KioskItemDetail?.itemAvailable}</p>
                        {KioskItemDetail?.temporders ? (
                          <>
                            /{' '}
                            <span style={{ color: 'orange' }}>
                              {KioskItemDetail?.temporders !== undefined
                                ? KioskItemDetail?.temporders
                                : 0}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
                <BidButton
                  // isDisabled={buyBalance || KioskItemDetail?.itemAvailable < 1}
                  // isDisabled={KioskItemDetail?.itemAvailable < 1}
                  isDisabled={getBuyDisabledStatus()}
                  isLoading={stakingBalLoader}
                  title={t('buy')}
                  className={classNames(
                    'createnft-createbtn margin_fix_btn caps',
                  )}
                  // onPress={() => handleBid()}
                  onPress={() =>
                    stakingBalance > 0
                      ? setShowFanPopup(true)
                      : setShowPopup(true)
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default KioskItemDetail
