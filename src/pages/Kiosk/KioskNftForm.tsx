import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import BottomPopup from '@components/Dialog/BottomPopup'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import {
  getBtnDisabledStatusForAddress,
  getCountryCodeNew,
  getPlayerLevelName,
  isMobile,
  toKPIIntegerFormat,
} from '@utils/helpers'
import Spinner from '@components/Spinner'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import {
  bidOnAuction,
  claimNft,
  closeAction,
  consumeNft,
  drawWinner,
  enrollRaffle,
  getBids,
  getFansRanking,
  getMinStaking,
  getPlayer1Contract,
  getStakingBalance,
  getWinChance,
  nftTransfer,
  resetBids,
  resetWinChance,
} from '@root/apis/playerCoins/playerCoinsSlice'
import Web3BottomPopup from '@components/Dialog/Web3BottomPopup'
import { getFlooredFixed } from '@utils/helpers'
import { BigNumber, ethers } from 'ethers'
import {
  setStakeFormShowed,
  showNftForm,
  showSignupForm,
  showNftDetailForm,
  getKioskItemDetail,
  setKioskItemUpdate,
  postPlaceKioskOrder,
  postConfirmKioskOrder,
  getUserXp,
  resetPostPlaceKioskOrder,
} from '@root/apis/onboarding/authenticationSlice'
import { PLAYER_STATUS, SALES_OPTION } from '@root/constants'
import ApiBottomPopup from '@components/Dialog/ApiBottomPopup'
import ImageComponent from '@components/ImageComponent'
import '@assets/css/components/XPProgressBar.css'
import { useWalletHelper } from '@utils/WalletHelper'
import Confirmed from '@pages/PlayerNft/Confirmed'
import Stake from '@pages/PlayerNft/Stake'
import Send from '@pages/PlayerNft/Send'
import { postRequestAuth } from '@root/apis/axiosClientAuth'
import { Formik } from 'formik'
import FormInput from '@components/Form/FormInput'
import SubmitButton from '@components/Button/SubmitButton'
import CountrySelect, { countries } from '@components/CountryDropdown'
import * as Yup from 'yup'
import KioskBidPopup from './KioskBidPopup'
import EditIcon from '@mui/icons-material/Edit'
import KioskAddressPopup from './KioskAddressPopup'
import AliceCarousel from 'react-alice-carousel'
import leftArrow from '@assets/images/left_angle_bracket.webp'
import rightArrow from '@assets/images/right_angle_bracket.webp'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import TooltipLabel from '@components/TooltipLabel'
import LinkIcon from '@mui/icons-material/Link'
import ShareIcon from '@components/Svg/ShareIcon'
import { ShareSocial } from 'react-share-social'
import toast from 'react-hot-toast'
import CloseAbsolute from '@components/Form/CloseAbsolute'

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
    <div>
      {isEnded
        ? t('ended')
        : `${state.day}d ${state.hours}h ${state.minutes}m ${state.seconds}s`}
    </div>
  )
}

interface Props {
  kioskItem: any
  isBid?: boolean
  isEndable?: boolean
}

const KioskNftForm: React.FC<Props> = ({ kioskItem, isBid, isEndable }) => {
  const [showPopup, setShowPopup] = useState(false)
  const [showAddressPopup, setShowAddressPopup] = useState(false)
  const [showFanPopup, setShowFanPopup] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showBidList, setShowBidList] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [txnError, setTxnError] = useState('')
  const [txnHash, setTxnHash] = useState('')
  const [showBottomPopup, setShowBottomPopup] = useState(false)
  const [action, setAction] = useState('Bid')
  const [isEnded, setIsEnded] = useState(false)
  const [isHighestBidder, setIsHighestBidder] = useState(false)
  const [apiAction, setApiAction] = useState('')
  const [amount, setAmount] = useState('0')
  const [items, setItems] = useState([])
  const [hovered, setHovered] = useState(false)
  const loginInfo = localStorage.getItem('loginInfo')
  const {
    isGetBidsLoading,
    bidList,
    stakingBalance,
    stakingcontract,
    stakingcontractabi,
    isGetStakingBalanceSuccess,
    isGetPlayer1ContractSuccess,
    isGetBidsSuccess,
    winChances,
    txnConfirmResp,
  } = useSelector((state: RootState) => state.playercoins)
  const accessToken = localStorage.getItem('accessToken')

  const authenticationData: any = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    isNftFormBid,
    isNftEndable,
    isStakeFormShowed,
    userWalletData: { balance },
    itemAddressData,
    getUserSettingsData,
    ipLocaleCurrency,
    currencyRate,
    postPlaceKioskOrderSuccess,
    postPlaceKioskOrderError,
  } = authenticationData

  const currencySymbol =
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD'

  const nativeAmount = kioskItem?.maxbid
    ? kioskItem?.maxbid *
      (kioskItem?.coinprice ?? 1) *
      kioskItem?.exchangeRateUSD?.rate *
      currencyRate
    : 0

  const getNativeAmount = value =>
    value
      ? value *
        (kioskItem?.coinprice ?? 1) *
        kioskItem?.exchangeRateUSD?.rate *
        currencyRate
      : 0

  const [inviteLink, setInviteLink] = useState('')
  const [showSharePopup, setShowSharePopup] = useState(false)

  const walletAddress = useSelector(
    (state: RootState) => state.authentication.walletAddress,
  )

  const { callWeb3Method } = useWalletHelper()

  const responsiveItemDefault = {
    0: {
      items: 1,
    },
  }
  const isAuction = kioskItem?.salesMethod?.toString() === SALES_OPTION.AUCTION
  const isRaffle = kioskItem?.salesMethod?.toString() === SALES_OPTION.RAFFLE
  const isFan = kioskItem?.salesMethod?.toString() === SALES_OPTION.FAN

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

  const handleBid = (values: any) => {
    if (!itemAddressData?.email && !itemAddressData?.recipientaddress) {
      toast.error(t('address or email is required'))
      return
    }

    if (itemAddressData?.email || itemAddressData?.recipientaddress) {
      if (isEnded) {
        handleEnd()
        return
      }
      // if (isHighestBidder) {
      //   return
      // }
      setShowPopup(false)
      setShowBottomPopup(true)
      setAmount(values.amount)
      if (localStorage.getItem('loginId')) {
        setApiAction('bidOnAuction')
        return
      }
      setAction('Bid')
      if (kioskItem?.delivery_mode === 'postal') {
        handleOrderItem(values)
      } else {
        handleOrderItemDigital(values)
      }
    }
  }

  useEffect(() => {
    if (postPlaceKioskOrderSuccess) {
      if (action === 'Participate') {
        if (isFan) {
          dispatch(getKioskItemDetail(kioskItem?.itemId))
          dispatch(resetPostPlaceKioskOrder())
          return
        }
        setShowBottomPopup(true)
        if (localStorage.getItem('loginId')) {
          setApiAction('enrollToRaffle')
          return
        }
        const promise = callWeb3Method(
          'enrollToRaffle',
          stakingcontract,
          stakingcontractabi,
          [],
        )
        setShowFanPopup(false)
        promise
          .then((txn: any) => {
            setTxnHash(txn.hash)
          })
          .catch((err: any) => {
            const isErrorGasEstimation = `${err}`.includes(
              'cannot estimate gas',
            )
            if (err.message === '406') {
              setTxnError(
                t('this functionality unavailable for internal users'),
              )
            }
            if (isErrorGasEstimation) {
              setTxnError(
                t('not enough funds to pay for blockchain transaction'),
              )
            } else {
              console.log(err.reason || err.message)
              setTxnError(t('transaction failed'))
            }
          })
      } else {
        if (itemAddressData?.email || itemAddressData?.recipientaddress) {
          const exp = ethers.BigNumber.from('10').pow(13)
          const bidAmount = ethers.BigNumber.from(
            Math.floor(parseFloat(amount) * Math.pow(10, 5)),
          ).mul(exp)
          const promise = callWeb3Method(
            'bidOnAuction',
            stakingcontract,
            stakingcontractabi,
            [kioskItem?.auctionid ?? 1, bidAmount],
          )

          promise
            .then((txn: any) => {
              setTxnHash(txn.hash)
            })
            .catch((err: any) => {
              const isErrorGasEstimation = `${err}`.includes(
                'cannot estimate gas',
              )
              if (err.message === '406') {
                setTxnError(
                  t('this functionality unavailable for internal users'),
                )
              }
              if (isErrorGasEstimation) {
                setTxnError(
                  t('not enough funds to pay for blockchain transaction'),
                )
              } else {
                console.log(err.reason || err.message)
                setTxnError(t('transaction failed'))
              }
            })
        }
      }
    } else if (postPlaceKioskOrderError) {
      toast.error(postPlaceKioskOrderError)
    }
  }, [postPlaceKioskOrderSuccess, postPlaceKioskOrderError])

  const handleOrderItem = (values: any) => {
    const formData = new FormData()
    const countryData = itemAddressData?.recipientcountry
      ? countries.filter(
          country =>
            country.code ===
            getCountryCodeNew(itemAddressData?.recipientcountry),
        )[0]
      : null
    formData.append('name', itemAddressData?.recipientname)
    formData.append('address', itemAddressData?.recipientaddress)
    formData.append('ZIP', itemAddressData?.recipientpostalcode)
    formData.append('city', itemAddressData?.recipientcity)
    formData.append('country_id', countryData?.phone)
    formData.append('country_code', countryData?.code)
    formData.append('sharedetails', '')
    formData.append('itemId', kioskItem.itemid ?? kioskItem.itemId)
    if (itemAddressData?.additional_info) {
      formData.append(
        'additional_information',
        itemAddressData?.additional_info,
      )
    }
    dispatch(postPlaceKioskOrder(formData))
  }

  const handleOrderItemDigital = (values: any) => {
    const formData = new FormData()
    formData.append('email', itemAddressData?.email)
    formData.append('sharedetails', '')
    formData.append('itemId', kioskItem.itemid ?? kioskItem.itemId)
    if (itemAddressData?.additional_info) {
      formData.append(
        'additional_information',
        itemAddressData?.additional_info,
      )
    }
    dispatch(postPlaceKioskOrder(formData))
  }

  const handleParticipate = values => {
    if (kioskItem?.isClosed) {
      return
    }
    if (!validateLogin()) {
      return
    }
    if (isEnded) {
      handleEnd()
      return
    }
    if (isParticipated()) {
      return
    }
    setAction('Participate')
    if (kioskItem?.delivery_mode === 'postal') {
      handleOrderItem(values)
    } else {
      handleOrderItemDigital(values)
    }
  }

  const handleEnd = () => {
    if (!validateLogin()) {
      return
    }
    if (isFan) {
      // close item
      closeKioskItem()
      return
    }
    setShowBottomPopup(true)

    if (localStorage.getItem('loginId')) {
      setApiAction(isAuction ? 'closeAuction' : 'drawRandomRaffleWinner')
      return
    }
    const promise = callWeb3Method(
      isAuction ? 'closeAuction' : 'drawRandomRaffleWinner',
      stakingcontract,
      stakingcontractabi,
      [
        isAuction
          ? kioskItem?.auctionid
          : BigNumber.from(Math.floor(Math.random() * 999999)),
      ],
    )
    promise
      .then((txn: any) => {
        setTxnHash(txn.hash)
      })
      .catch((err: any) => {
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
      })
  }

  const gotoPlayer = () => {
    dispatch(showNftForm({}))
    navigate(`/app/player/${kioskItem?.detailpageurl}`)
  }

  useEffect(() => {
    dispatch(resetBids())
    document.body.style.backgroundColor = '#171923'
    if (kioskItem?.detailpageurl) {
      dispatch(getPlayer1Contract({ url: kioskItem?.detailpageurl }))
      dispatch(showNftDetailForm({ isNftDetailFormVisible: true }))
      dispatch(getMinStaking())
      if (isRaffle || isFan) {
        dispatch(
          getWinChance({
            raffleid: kioskItem?.raffleid,
            playercontract: kioskItem?.playerContract,
          }),
        )
      }
      if (loginInfo || accessToken) {
        dispatch(getStakingBalance(kioskItem?.playerContract))
      }
    }

    const isEndedAuction =
      new Date(kioskItem?.blockdeadline).getTime() <= new Date().getTime()
    setIsEnded(isEndedAuction)
    if (isBid || isNftFormBid) {
      if (isAuction && !isEndedAuction) {
        setShowPopup(true)
      }
    }
    console.log('tester kioskItem', kioskItem)
    return () => {
      document.body.style.backgroundColor = '#222435'
      dispatch(showNftDetailForm({ isNftDetailFormVisible: false }))
      dispatch(resetBids())
      dispatch(resetPostPlaceKioskOrder())
      dispatch(resetWinChance())
    }
  }, [])

  useEffect(() => {
    if (
      isGetStakingBalanceSuccess &&
      isGetPlayer1ContractSuccess &&
      isStakeFormShowed
    ) {
      if (kioskItem?.isClosed) {
        return
      }
      if ((isBid || isNftFormBid) && (isRaffle || isFan)) {
        dispatch(setStakeFormShowed())
        if (!validateLogin()) {
          return
        }
        if (stakingBalance > 0) {
          // handleParticipate()
        } else if (!isEnded) {
          setShowPopup(true)
        }
      }
      if (isEndable || isNftEndable) {
        dispatch(setStakeFormShowed())
        handleEnd()
      }
    }
  }, [isGetStakingBalanceSuccess, isGetPlayer1ContractSuccess])

  useEffect(() => {
    if (isEnded) {
      setShowPopup(false)
    }
  }, [isEnded])

  useEffect(() => {
    if (isAuction && kioskItem?.playerContract) {
      dispatch(
        getBids(
          'player_contract=' +
            kioskItem?.playerContract +
            '&auction_id=' +
            kioskItem?.auctionid,
        ),
      )
    } else if (isFan && kioskItem?.playerContract) {
      dispatch(
        getFansRanking(
          'player_contract=' +
            kioskItem?.playerContract +
            '&itemId=' +
            kioskItem?.itemId,
        ),
      )
    }
  }, [kioskItem])

  useEffect(() => {
    if (isGetBidsSuccess && bidList.length > 0) {
      if (bidList[0].address?.toLowerCase() === walletAddress.toLowerCase()) {
        setShowPopup(false)
        setIsHighestBidder(true)
      }
    }
  }, [isGetBidsSuccess])

  const handleViewImage = () => {
    const image = new Image()
    image.src = kioskItem?.itemPicture
    const w = window.open('')
    w?.document.write(image.outerHTML)
  }

  const handleShowBids = () => {
    setShowBidList(true)
  }

  const closeKioskItem = async () => {
    const result = await postRequestAuth('players/kioskItemClose/', {
      tx_hash: txnHash,
      itemId: kioskItem?.itemId,
    })
    if (!result?.data?.success) {
      console.log('Failed closeKioskItem', result?.data)
      // toast.error('Failed closeKioskItem')
    }
    dispatch(getKioskItemDetail(kioskItem?.itemId))
  }

  const handleClose = () => {
    dispatch(getKioskItemDetail(kioskItem?.itemId))
    if (txnHash && txnConfirmResp[0]?.haserror === 0) {
      dispatch(setKioskItemUpdate(true))
      if (isEnded) {
        closeKioskItem()
      }
    }
    setShowBottomPopup(false)
    setTxnError('')
    setTxnHash('')
  }

  useEffect(() => {
    if (txnHash && txnConfirmResp[0]?.haserror === 0) {
      dispatch(getUserXp(false))
      const formData = new FormData()
      formData.append('itemId', kioskItem?.itemId)
      formData.append('transaction_hash', txnHash)
      dispatch(postConfirmKioskOrder(formData))
    }
  }, [txnHash, txnConfirmResp[0]])

  const handleShowPopup = () => {
    if (kioskItem?.isClosed) {
      return
    }
    if (!validateLogin()) {
      return
    }
    if (isEnded) {
      handleEnd()
      return
    }
    setShowPopup(true)
  }

  const validateLogin = () => {
    if (
      !localStorage.getItem('loginInfo') &&
      !localStorage.getItem('loginId')
    ) {
      dispatch(showNftForm({}))
      dispatch(showSignupForm())
      return false
    }
    return true
  }

  const handleNftApi = (user_secret: any) => {
    const formData = new FormData()
    formData.append('user_secret', user_secret)
    formData.append('contract', kioskItem?.playerContract)
    if (apiAction === 'bidOnAuction') {
      formData.append('auction_id', kioskItem?.auctionid ?? 1)
      formData.append('amount', amount)
      dispatch(bidOnAuction(formData))
    } else if (apiAction === 'closeAuction') {
      formData.append('auction_id', kioskItem?.auctionid ?? 1)
      formData.append('amount', amount)
      dispatch(closeAction(formData))
    } else if (apiAction === 'drawRandomRaffleWinner') {
      dispatch(drawWinner(formData))
    } else if (apiAction === 'safeTransferFrom') {
      formData.append('nft_id', kioskItem?.tokenid)
      formData.append('amount', '1')
      formData.append('address', amount)
      dispatch(nftTransfer(formData))
    } else if (apiAction === 'enrollToRaffle') {
      dispatch(enrollRaffle(formData))
    } else if (apiAction === 'claimNFT') {
      formData.append('playercontract', kioskItem?.playerContract)
      formData.append('tokenid', kioskItem?.tokenid)
      dispatch(claimNft(formData))
    } else if (apiAction === 'consumeNFT') {
      formData.append('playercontract', kioskItem?.playerContract)
      formData.append('tokenid', kioskItem?.tokenid)
      dispatch(consumeNft(formData))
    }
  }

  const isParticipated = () => {
    if (isFan) {
      return kioskItem?.participated
    }
    const currentUserCoins = winChances[0]?.coinsparticipateduser
    if (parseInt(currentUserCoins) > 0) {
      return true
    }
    return false
  }

  const getRaffleData = () => {
    if (
      !localStorage.getItem('loginInfo') &&
      !localStorage.getItem('loginId')
    ) {
      return {
        label: t('coins_participating'),
        value: getFlooredFixed(winChances[0]?.coinsparticipating, 2).toString(),
        suffix: '',
      }
    } else {
      if (isParticipated()) {
        return {
          label: t('winning_chance'),
          value: getFlooredFixed(
            winChances[0]?.chancetowinparticipated,
            2,
          ).toString(),
          suffix: '%',
        }
      } else if (winChances[0]?.chancetowinstaked) {
        return {
          label: t('winning_chance'),
          value: getFlooredFixed(
            winChances[0]?.chancetowinstaked,
            2,
          ).toString(),
          suffix: '%',
        }
      } else if (
        !winChances[0]?.chancetowinstaked &&
        winChances[0]?.aschancetowinholding
      ) {
        return {
          label: t('stake_coins_for_chance'),
          value: getFlooredFixed(
            winChances[0]?.aschancetowinholding,
            2,
          ).toString(),
          suffix: '%',
        }
      } else if (
        !winChances[0]?.chancetowinstaked &&
        !winChances[0]?.aschancetowinholding
      ) {
        if (
          (winChances[0]?.coinsstakeduser ||
            winChances[0]?.coinsholdinguser ||
            balance) &&
          winChances[0]?.coinsparticipating < 1 &&
          !isEnded
        ) {
          return {
            label: t('winning_chance'),
            value: '100',
            suffix: '%',
          }
        }
        return {
          label: t('coins_participating'),
          value: getFlooredFixed(
            winChances[0]?.coinsparticipating,
            2,
          ).toString(),
          suffix: '',
        }
      }
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${process.env.REACT_APP_APP_URL}/app/player-items/${kioskItem?.itemhash}`,
    )
  }

  const handleShareLink = () => {
    setInviteLink(
      `${process.env.REACT_APP_APP_URL}/app/player-items/${kioskItem?.itemhash}`,
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

  return (
    <div
      className={classNames(
        'nft-container flex-middle kiosk-nft-container',
        isAuction
          ? 'kiosk-auction-item'
          : isRaffle
          ? 'kiosk-raffle-item'
          : 'kiosk-fan-item',
      )}
      style={{ cursor: 'unset', marginBottom: '0px' }}
    >
      {showBottomPopup &&
        (localStorage.getItem('loginInfo') ? (
          <Web3BottomPopup
            showPopup={showBottomPopup}
            txnHash={txnHash}
            txnErr={txnError}
            onClose={handleClose}
            customClass={isMobile() ? 'exwallet-bottomwrapper' : ''}
          />
        ) : (
          <ApiBottomPopup
            showPopup={showBottomPopup}
            onSubmit={handleNftApi}
            onClose={handleClose}
            customClass="purchase-pc-bottomwrapper"
          />
        ))}
      <div>
        <div className="nft-image-cover" style={{ position: 'relative' }}>
          {kioskItem?.additionalImages?.length > 0 && (
            <div
              className={classNames(
                'circle-carousel kiosk',
                items.length <= 3 ? 'center-carousel' : 'carousel',
              )}
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
                  return items.length > 1 && (isMobile() || hovered) ? (
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

          {kioskItem?.actualinventory > 0 ? (
            <div className="coins_issued_over_nft">
              <span className="fg-primary-color">
                {kioskItem?.balance > 0 ? '/' : null}
                {kioskItem?.actualinventory}
              </span>
            </div>
          ) : (
            <></>
          )}
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
            <div
              className="nft-close-link mt-20 mb-0 m-0auto"
              onClick={() => {
                setShowSharePopup(false)
              }}
              style={{ position: 'absolute', bottom: '20px', left: '45%' }}
            >
              {t('close')}
            </div>
          </div>
        ) : (
          <div className="nft-info-wrapper">
            <div className="copy_share_icon_wrapper">
              <div className="share_wrapper">
                <TooltipLabel title="Copy Link">
                  <LinkIcon onClick={handleCopyLink} className="share_icon" />
                </TooltipLabel>
              </div>
              <TooltipLabel title="Share Code">
                <div
                  className="share_wrapper share-code-btn"
                  onClick={handleShareLink}
                >
                  <ShareIcon />
                </div>
              </TooltipLabel>
            </div>
            <div className="nft-info">
              <div className={classNames('nft-info-title')}>
                {kioskItem?.itemName}&nbsp;
              </div>
              <div className="nft-info-by" onClick={() => gotoPlayer()}>
                {t('by')}: <a>{kioskItem?.name}</a>
              </div>
            </div>
            <div className="nft-separate-line"></div>
            <div className="fullwidth">
              <div className="nft-bid-info-header">
                <div>{t('ending in')}</div>
                {isAuction ? (
                  <div>{t('current Bid')}</div>
                ) : isFan ? (
                  <div>{t('top')}</div>
                ) : (
                  <div>{getRaffleData()?.label}</div>
                )}
              </div>
              <div
                className={classNames(
                  'nft-bid-info-body',
                  isRaffle ? 'yellow-color' : isFan ? 'diamond-color' : '',
                )}
              >
                <TimeTrack nft={kioskItem} />
                {isAuction ? (
                  <div className="bid-value-wrapper">
                    <b>
                      {getFlooredFixed(nativeAmount, 2)}&nbsp;
                      {currencySymbol}
                    </b>
                    &nbsp;
                    <div>{kioskItem?.maxbid ?? 0}</div>
                  </div>
                ) : isFan ? (
                  <div className="diamond-color">
                    {toKPIIntegerFormat(kioskItem?.actualinventory ?? 0)} Fans
                  </div>
                ) : (
                  <div className="yellow-color">
                    {getRaffleData()?.value + getRaffleData()?.suffix}
                  </div>
                )}
              </div>
            </div>
            <div className="nft-separate-line mb-20"></div>
            {isRaffle || isFan ? (
              <>
                {isRaffle && kioskItem?.raffleid === null && !isEnded ? (
                  <div
                    className={classNames(
                      'nft-bid-info-body flex-center red-color',
                    )}
                  >
                    {t('something went wrong')}
                  </div>
                ) : isParticipated() && !isEnded ? (
                  <div
                    className={classNames(
                      'nft-bid-info-body flex-center',
                      isRaffle ? 'yellow-color' : 'diamond-color',
                    )}
                  >
                    {t('you have already participated')}
                  </div>
                ) : (
                  <>
                    {kioskItem?.isClosed ? null : stakingBalance > 0 &&
                      !isEnded ? (
                      <>
                        <button
                          className={classNames(
                            'nft-btn',
                            isRaffle ? 'bg-yellow-color' : 'bg-diamond-color',
                          )}
                          onClick={() => setShowFanPopup(true)}
                        >
                          {t('participate')}
                        </button>
                      </>
                    ) : (
                      <button
                        className={classNames(
                          'nft-btn',
                          isRaffle ? 'bg-yellow-color' : 'bg-diamond-color',
                        )}
                        onClick={handleShowPopup}
                      >
                        {t(isEnded ? 'draw winner' : 'stake to win')}
                      </button>
                    )}
                  </>
                )}
                {isFan ? (
                  <button
                    className="nft-btn btn-disabled-diamond"
                    onClick={handleShowBids}
                  >
                    {t('show ranking')}
                  </button>
                ) : null}
              </>
            ) : isAuction ? (
              <>
                {isHighestBidder && !isEnded ? (
                  <div className="nft-bid-info-body flex-center">
                    {t('you are the highest bidder')}
                  </div>
                ) : null}
                {kioskItem?.isClosed ? null : (
                  <button
                    className={classNames('nft-btn')}
                    onClick={handleShowPopup}
                  >
                    {t(isEnded ? 'close auction' : 'place bid')}
                  </button>
                )}
                <button
                  className="nft-btn btn-disabled"
                  onClick={handleShowBids}
                >
                  {t('show bids')}
                </button>
              </>
            ) : null}
            <div className={classNames('item-description buy_item_desc')}>
              {kioskItem?.itemDescription}
            </div>
            <div
              className={classNames('textinput-wrapper')}
              style={{
                width: 'unset',
                height: '100px',
                overflowY: 'auto',
                marginTop: '10px',
                padding: '10px 0px 10px 10px',
                justifyContent: 'flex-start',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <div className={classNames('item-description buy_item_desc')}>
                {kioskItem?.additionalDescription}
              </div>
            </div>
            <BottomPopup
              mode={
                (showPopup && (isRaffle || isFan)) ||
                (showAddressPopup && kioskItem?.delivery_mode === 'digital') ||
                stakingBalance === 0
                  ? 'stake'
                  : 'nft'
              }
              isOpen={showPopup || showAddressPopup}
              onClose={() => {
                setShowPopup(false)
              }}
            >
              {showPopup ? (
                <>
                  {/* <CloseAbsolute
                    onClose={() => {
                      setShowPopup(false)
                    }}
                  /> */}
                  {isRaffle || isFan || stakingBalance === 0 ? (
                    <Stake
                      detailpageurl={kioskItem?.detailpageurl}
                      isPro={kioskItem?.playerstatusid === PLAYER_STATUS.PRO}
                      onClose={() => {
                        setShowPopup(false)
                      }}
                    />
                  ) : isAuction ? (
                    <KioskBidPopup
                      kioskItem={kioskItem}
                      onSubmit={handleBid}
                      onClose={() => {
                        setShowPopup(false)
                      }}
                    />
                  ) : null}
                </>
              ) : showAddressPopup ? (
                <KioskAddressPopup
                  kioskItem={kioskItem}
                  onClose={() => {
                    setShowAddressPopup(false)
                    setShowFanPopup(true)
                  }}
                />
              ) : null}
            </BottomPopup>
            <BottomPopup
              mode="nft"
              isOpen={isConfirmed}
              onClose={() => {
                setIsConfirmed(false)
              }}
            >
              {/* <CloseAbsolute
                onClose={() => {
                  setIsConfirmed(false)
                }}
              /> */}
              {isConfirmed ? (
                <Confirmed
                  onClose={() => {
                    setIsConfirmed(false)
                  }}
                />
              ) : null}
            </BottomPopup>
            <BottomPopup
              mode={`nft ${isMobile() ? 'bids-mobile-wrapper' : ''}`}
              isOpen={showBidList}
              onClose={() => {
                setShowBidList(false)
              }}
            >
              {/* <CloseAbsolute
                onClose={() => {
                  setShowBidList(false)
                }}
              /> */}
              {showBidList ? (
                <section
                  className={classNames(
                    'wallet-container',
                    'bid-list-container',
                  )}
                  style={{ position: 'relative' }}
                >
                  <div className="bid-header-container">
                    {bidList.length > 0 && (
                      <div className="stake-bid-header">
                        {t(isAuction ? 'current bids' : 'ranking as of now')}
                      </div>
                    )}
                  </div>
                  {isGetBidsLoading ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      <Spinner
                        className="bid-loader"
                        spinnerStatus={isGetBidsLoading}
                        title={''}
                      />
                    </div>
                  ) : bidList.length > 0 ? (
                    <div className="bid-body-container">
                      {bidList.map((item: any, index: number) => (
                        <div className="nft-bid-item" key={index}>
                          <div className="nft-bid-item-no">#{index + 1}</div>
                          <div
                            className={classNames(
                              'nft-bid-item-date nft-item',
                              item?.address?.toLowerCase() ===
                                loginInfo?.toLowerCase()
                                ? 'selected-item'
                                : '',
                            )}
                          >
                            <div className="nft-image-section">
                              <div className="image-border">
                                <div
                                  className={classNames(
                                    'nft-image',
                                    item?.avatar ?? 'anonymous',
                                  )}
                                />
                              </div>
                              <div className="user-name">
                                <div className="user-name-text">
                                  {item?.username ?? t('anonymous')}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="nft-bid-item-amount">
                            {(isAuction ? item?.bid : item?.stakingbalance) ??
                              '0.00'}
                            &nbsp;
                            {item?.ticker}
                          </div>
                          <div className="nft-bid-item-amount">
                            {getFlooredFixed(
                              getNativeAmount(
                                isAuction ? item?.bid : item?.stakingbalance,
                              ),
                              2,
                            )}
                            &nbsp;
                            {currencySymbol}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bid-list-title">
                      {t(
                        isAuction
                          ? 'no bids yet'
                          : isFan
                          ? 'no participant yet'
                          : 'no winner yet',
                      )}
                    </div>
                  )}
                  {/* <div
                    className="nft-close-link mt-20 mb-0 m-0auto"
                    onClick={() => {
                      setShowBidList(false)
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '24px',
                      left: '45%',
                    }}
                  >
                    {t('close')}
                  </div> */}
                </section>
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
                  className={classNames(
                    'wallet-container',
                    'bid-list-container',
                  )}
                  style={{
                    position: 'relative',
                    paddingLeft: 20,
                    paddingRight: 20,
                  }}
                >
                  <div className="bid-header-container mt-20 mb-20">
                    <div className="stake-bid-header">{t('participate')}</div>
                  </div>
                  <div className="item-address-wrapper">
                    {itemAddressData?.recipientcountry ? (
                      <span
                        className={`fi fis fi-${getCountryCodeNew(
                          itemAddressData?.recipientcountry,
                        )?.toLowerCase()}`}
                      ></span>
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
                      {kioskItem?.delivery_mode === 'digital'
                        ? itemAddressData?.email ?? t('please add email')
                        : itemAddressData?.recipientaddress
                        ? `${itemAddressData?.recipientaddress}, ${itemAddressData?.recipientcity}`
                        : t('please add delivery address')}
                    </b>
                    <div
                      onClick={() => {
                        setShowFanPopup(false)
                        setShowAddressPopup(true)
                      }}
                    >
                      <EditIcon />
                    </div>
                  </div>
                  <div className="fullwidth mt-20">
                    <button
                      disabled={getBtnDisabledStatusForAddress(
                        itemAddressData,
                        kioskItem,
                      )}
                      className={classNames(
                        'form-submit-btn m-0auto',
                        getBtnDisabledStatusForAddress(
                          itemAddressData,
                          kioskItem,
                        )
                          ? 'btn-disabled'
                          : '',
                      )}
                      onClick={handleParticipate}
                    >
                      {t('confirm')}
                    </button>
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
          </div>
        )}
      </div>
    </div>
  )
}

export default KioskNftForm
