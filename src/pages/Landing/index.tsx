/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useRef, useState } from 'react'
import { AppLayout } from '@components/index'
import { RootState } from '@root/store/rootReducers'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  showWalletForm,
  getWalletDetails,
  getWalletAddress,
  getUserSettings,
  setActiveTab,
  showSignupForm,
  getQualificationSetting,
  setAddToHomeScreen,
  setTourStep,
  getTourCategories,
  setTourCategories,
  setShowTourModal,
  setTourCategoryId,
  setHideTourHeader,
  getKioskCategories,
  makeAppInstall,
  togglePopupState,
  getWalletChart,
  getPlayerCoinChart,
} from '@root/apis/onboarding/authenticationSlice'
import PlayerCarousel from './PlayerCarousel'
import Bottom from './Bottom'
import '@assets/css/pages/Landing.css'
import '@assets/css/pages/Tour.css'
import HeaderTicker from './HeaderTicker'
import Collectibles from './Collectibles'
import RatedPlayers from './RatedPlayers'
import DraftedPlayers from './DraftedPlayers'
import Tutorials from './Tutorials'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VersusPlayers from './VersusPlayers'
import classNames from 'classnames'
import Trending from './Trending'
import WalletModal from '@components/Dialog/WalletModal'
import Kiosk from './Kiosk'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useTranslation } from 'react-i18next'
import {
  checkPlayerStatus,
  claimPrize,
  getBanner,
  getSeasonDetails,
  getSeasonPrize,
  getTopTrades,
  resetTopTrades,
} from '@root/apis/playerCoins/playerCoinsSlice'
import XPProgressBar from '@components/XPProgressBar'
import ImageComponent from '@components/ImageComponent'
import Prize from '@assets/images/how_it_works4.webp'
import BannerDesktop from '@assets/images/banner_desktop.webp'
import BannerMobile from '@assets/images/banner_mobile.webp'
import DialogBox from '@components/Dialog/DialogBox'
import Web3BottomPopup from '@components/Dialog/Web3BottomPopup'
import ApiBottomPopup from '@components/Dialog/ApiBottomPopup'
import { Dialog } from '@material-ui/core'
import WalletDialog from '@components/Dialog/WalletDialog'
import {
  getBrowserName,
  getFlooredFixed,
  isMobile,
  toNumberFormat,
  isPwa,
} from '@utils/helpers'
import { getAllChats } from '@root/apis/onboarding/authenticationSlice'
import { ethers } from 'ethers'
import DepositModal from './DepositModal'
import LoginSkeleton from './LoginSkeleton'
import {
  getRequest,
  makeGetRequest,
  makeGetRequestAdvance,
} from '@root/apis/axiosClient'
import { useWalletHelper } from '@utils/WalletHelper'
import leftArrow from '@assets/images/left_angle_bracket.webp'
import rightArrow from '@assets/images/right_angle_bracket.webp'
import MyPlayers from './MyPlayers'
import WatchList from './WatchList'
import Feed from './Feed'
import LandingBannerCarousel from '@components/Carousel/LandingBannerCarousel'
import AddToHomeScreen from './AddToHomeScreen'
import WelcomeTourModal from '@pages/Tour/WelcomeTourModal'
import OverviewTourModal from '@pages/Tour/OverviewTourModal'
import TourButton from '@pages/Tour/TourButton'
import DepositTour from '@pages/Tour/DepositTour'
import TradeTourBuy from '@pages/Tour/TradeTourBuy'
import Typed from 'typed.js'
import { postRequestAuth } from '@root/apis/axiosClientAuth'
import KioskOverview from './KioskOverview'
import TopTradesForm from '@pages/TopTrades/TopTradesForm'
import { MECARREIRA_FEEDBACK_URL } from '@root/constants'
import MyOrders from './MyOrders'
import Stack from '@mui/material/Stack'
import MultiChart from '@components/MultiChart'
import PeriodBar from '@components/PeriodBar'
import WhoNext from './WhoNext'
import Chat from './Chat'
import TabularVotePlayers from './TabularVotePlayers'
import RecentVisitsLanding from './RecentVisitsLanding'
import LoadingIcon from '@assets/icons/icon/loading.svg'

const a2hsTimeout: any = null
// let a2hsTimeout: any = null
const Landing: React.FC = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const navigate = useNavigate()
  const {
    walletConnectConfirmPopUp,
    isNoWallet,
    selectedThemeRedux,
    userName,
    isUserNewVerified,
    userProfile,
    centralContract,
    centralContractAbi,
    userWalletData: { USDBalance, balance },
    QualificationSettingData,
    isLandingShown,
    pwaPrompt,
    tourStep,
    tourCategories,
    tourCategoryId,
    isGetTourCategoriesSuccess,
    isTourXPClaimed,
    showTourModal,
    totalXp,
    kioskCategoriesLoader,
    kioskCategoriesData,
    appInstallFlag,
    isVisibleModal,
    tourModalState,
    loadingChart,
    isGetPlayerCoinChartSuccess,
    playerCoinChartData,
    allChats,
    getAllChatsLoading,
  } = authenticationData
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const {
    isLoadingKiosk,
    landingKioskData,
    season,
    prevbannermobile,
    prevbanner,
    hasSeasonPrev,
    prevseasonid,
    isGetSeasonDetailSuccess,
    seasonPrizeAmount,
    isGetSeasonPrizeSuccess,
    mainBanner,
    extraBanner,
    loadingBanner,
    allowShowAddToHomeScreenPopup,
  } = playerCoinData

  const { getWeb3Provider, callWeb3Method } = useWalletHelper()
  const currentBrowser = getBrowserName()

  const [showWalletModalNew, setShowWalletModalNew] = useState(false)
  // const [showAddToHomeScreenPopup, setShowAddToHomeScreenPopup] =
  //   useState(false)
  const [hoverClass, setHoverClass] = useState('')
  const accessToken = localStorage.getItem('accessToken')
  const player = localStorage.getItem('player')
  const loginId = localStorage.getItem('loginId')
  const loginInfo = localStorage.getItem('loginInfo')

  const [claimStatus, setClaimStatus] = useState(false)

  const [remainingTime, setRemainingTime] = useState(0)
  const [daysDuration, setDaysDuration] = useState(0)
  const [countDownTime, setCountDownTime] = useState<number>(0)
  const [prizeAmount, setPrizeAmount] = useState('0.00')
  const [txnError, setTxnError] = useState('')
  const [txnHash, setTxnHash] = useState('')
  const [showBottomPopup, setShowBottomPopup] = useState(false)
  const [tourInternal, setTourInternal] = useState(true)
  const [showAddToHomeScreenPopup, setShowAddToHomeScreenPopup] =
    useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWelcomeTourModal, setShowWelcomeTourModal] = useState(false)
  const [showOverviewTourModal, setShowOverviewTourModal] = useState(false)
  // console.log({ pwaPrompt })
  const [showChart, setShowChart] = useState(false)
  const [xAxisData, setXAxisData] = useState<any>([])
  const [series, setSeries] = useState<any>([])
  const [chartPeriod, setChartPeriod] = useState('7D')
  const [openChatComp, setOpenChatComp] = useState(false)

  let countDown: any = null
  const [state, setState] = useState({
    day: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  const updateState = (data: any) => {
    setState(state => ({ ...state, ...data }))
  }

  const initCountDown = () => {
    countDown = setInterval(function () {
      const countDownDate = new Date(countDownTime).getTime()
      const now = new Date().getTime()
      const distance = countDownDate < now ? 0 : countDownDate - now
      const day = ~~(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (distance <= 0) {
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
    if (isGetPlayerCoinChartSuccess) {
      const seriesValues: any = []
      let data: any = []
      let xAxisDataValues: any = []
      for (const player in playerCoinChartData) {
        if (playerCoinChartData[player][0]?.playername === 'Matic') {
          continue
        }
        data = []
        xAxisDataValues = []
        playerCoinChartData[player].forEach((item: any) => {
          data.push(item.balanceusd ?? 0)
          xAxisDataValues.push(item?.dateintime)
        })
        seriesValues.push({
          name: playerCoinChartData[player][0]?.playername,
          type: 'line',
          data: data.reverse(),
        })
      }
      setXAxisData(xAxisDataValues.reverse())
      setSeries(seriesValues)
    }
  }, [isGetPlayerCoinChartSuccess])

  useEffect(() => {
    if (!localStorage.getItem('isApp')) {
      localStorage.setItem('isApp', 'true')
    }
    // dispatch(getQualificationSetting())
    if (accessToken) {
      // dispatch(checkPlayerStatus())
    }
    dispatch(getSeasonDetails(null))
    dispatch(getBanner())
    dispatch(getTopTrades({}))
    document.querySelector('title')!.innerText = t('the player coin exchange')
    document
      .querySelector("meta[name='description']")!
      .setAttribute('content', t('earn your way to superfandom'))
    //   const handler = e => {
    //     try {
    //       e.preventDefault()
    //       // Save the event because you'll need to trigger it later.
    //       deferredPrompt = e
    //       console.log('we are being triggered :D')
    //       setSupportsPWA(true)
    //       setPromptInstall(e)
    //     } catch (error) {
    //       console.error('handlerErr', error)
    //     }
    //   }
    //   window.addEventListener('beforeinstallprompt', handler)
    //   return () => window.removeEventListener('transitionend', handler)
    return () => {
      dispatch(resetTopTrades())
    }
  }, [])

  useEffect(() => {
    if (showBottomPopup || showWelcomeTourModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [showBottomPopup, showWelcomeTourModal])

  // useEffect(() => {
  //   if (
  //     allowShowAddToHomeScreenPopup &&
  //     // window.location.origin.includes('app') &&
  //     !isPwa() &&
  //     ['Chrome', 'Safari'].includes(currentBrowser)
  //   ) {
  //     clearTimeout(a2hsTimeout)
  //     if (localStorage.getItem('a2hsprompt_hidden')) {
  //       const currentTime = new Date().getTime()
  //       const a2hsTimeStamp = parseInt(
  //         localStorage.getItem('a2hsprompt_hidden'),
  //       )
  //       const hrDiff = (currentTime - a2hsTimeStamp) / (1000 * 3600)
  //       if (hrDiff >= 48 && !localStorage.getItem('added_home')) {
  //         a2hsTimeout = setTimeout(() => {
  //           setShowAddToHomeScreenPopup(true)
  //           localStorage.removeItem('a2hsprompt_hidden')
  //         }, 4000)
  //       }
  //     } else {
  //       a2hsTimeout = setTimeout(() => {
  //         setShowAddToHomeScreenPopup(true)
  //       }, 4000)
  //     }
  //   }
  // }, [allowShowAddToHomeScreenPopup])

  useEffect(() => {
    if (parseFloat(USDBalance) === 0) {
      if (Boolean(loginInfo) || Boolean(loginId)) {
        setShowDepositModal(true)
      }
    } else {
      setShowDepositModal(false)
    }
  }, [USDBalance, balance])

  useEffect(() => {
    if (countDownTime > 0) {
      if (countDown) {
        clearInterval(countDown)
      }
      initCountDown()
    }
  }, [countDownTime])

  useEffect(() => {
    if (isGetSeasonDetailSuccess) {
      setCountDownTime(season?.end * 1000)
      setTimeout(() => {
        setHoverClass('hover-effect')
      }, 1000)
    }
  }, [isGetSeasonDetailSuccess])

  useEffect(() => {
    if (loginInfo) {
      if (isGetSeasonDetailSuccess && hasSeasonPrev && centralContract) {
        checkWinner()
        getXpConvPct()
      }
    } else if (loginId && prevseasonid) {
      dispatch(getSeasonPrize(prevseasonid))
    }
  }, [isGetSeasonDetailSuccess, centralContract, loginId, loginInfo]) // loginId, loginInfo is needed for updating state when login

  useEffect(() => {
    if (!loginInfo && !loginId) {
      setClaimStatus(false)
    }
  }, [loginInfo, loginId])

  useEffect(() => {
    if (isGetSeasonPrizeSuccess) {
      if (Number(seasonPrizeAmount) > 0) {
        setPrizeAmount(
          toNumberFormat(getFlooredFixed(Number(seasonPrizeAmount), 2)),
        )
        setClaimStatus(true)
      } else {
        setClaimStatus(false)
      }
    }
  }, [isGetSeasonPrizeSuccess])

  const checkWinner = async () => {
    try {
      const provider = await getWeb3Provider()

      const generalContract = new ethers.Contract(
        centralContract, // contract address of Router
        centralContractAbi,
        provider.getSigner(loginInfo!), // signer of the currently logged in user wallet address
      )
      const amount = await generalContract.getSeasonPrizeWin(prevseasonid)
      if (Number(amount) > 0) {
        const result = await makeGetRequestAdvance(
          'wallets/get_matic_usd_exchange_rate',
        )
        const exchangeRate = result?.data?.data[0]?.rate
        setPrizeAmount(
          toNumberFormat(
            getFlooredFixed(
              Number(ethers.utils.formatUnits(amount, 18)) * exchangeRate,
              2,
            ),
          ),
        )
        setClaimStatus(true)
        return true
      } else {
        setClaimStatus(false)
      }
    } catch (err: any) {
      console.log({ err })
    }
    return false
  }

  const getXpConvPct = async () => {
    try {
      const provider = await getWeb3Provider()

      const generalContract = new ethers.Contract(
        centralContract, // contract address of Router
        centralContractAbi,
        provider.getSigner(loginInfo!), // signer of the currently logged in user wallet address
      )
      const xpConvPct = await generalContract.xpConvPct()
      console.log({ xpConvPct })
    } catch (err: any) {
      console.log({ err })
    }
  }

  const handleClaim = () => {
    setShowBottomPopup(true)
    if (loginId) {
      return
    }
    if (loginInfo) {
      const promise = callWeb3Method(
        'withdrawPrize',
        centralContract,
        centralContractAbi,
        [prevseasonid],
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
  }

  const handleClaimApi = (user_secret: any) => {
    const formData = new FormData()
    formData.append('user_secret', user_secret)
    formData.append('season_id', prevseasonid)
    dispatch(claimPrize(formData))
  }

  const minuteSeconds = 60
  const hourSeconds = minuteSeconds * 60
  const daySeconds = hourSeconds * 24

  const getTimeSeconds = time =>
    Math.ceil(minuteSeconds - time) > 1
      ? Math.ceil(minuteSeconds - time) - 1
      : Math.ceil(minuteSeconds - time)
  const getTimeMinutes = time =>
    Math.ceil(time / minuteSeconds) > 1
      ? Math.ceil(time / minuteSeconds) - 1
      : Math.ceil(time / minuteSeconds)
  const getTimeHours = time =>
    Math.ceil(time / hourSeconds) > 1
      ? Math.ceil(time / hourSeconds) - 1
      : Math.ceil(time / hourSeconds)
  const getTimeDays = time =>
    Math.ceil(time / daySeconds) > 1
      ? Math.ceil(time / daySeconds) - 1
      : Math.ceil(time / daySeconds)

  useEffect(() => {
    if (season && season?.end > Math.floor(Date.now() / 1000)) {
      const tempValue = season?.end - Math.floor(Date.now() / 1000)
      setRemainingTime(tempValue)
      setDaysDuration(Math.ceil(tempValue / daySeconds) * daySeconds)
    }
  }, [season])

  const handleClose = () => {
    if (txnHash) {
      if (loginInfo) {
        checkWinner()
      } else if (loginId) {
        dispatch(getSeasonPrize(prevseasonid))
      }
    }
    setShowBottomPopup(false)
    setTxnError('')
    setTxnHash('')
  }

  useEffect(() => {
    dispatch(getAllChats(1))
  }, [])
  // useEffect(() => {
  //   if (
  //     allowShowAddToHomeScreenPopup &&
  //     // isLandingShown &&
  //     !isPwa() &&
  //     ['Chrome', 'Safari'].includes(currentBrowser)
  //   ) {
  //     clearTimeout(a2hsTimeout)
  //     if (localStorage.getItem('a2hsprompt_hidden')) {
  //       const currentTime = new Date().getTime()
  //       const a2hsTimeStamp = parseInt(
  //         localStorage.getItem('a2hsprompt_hidden'),
  //       )
  //       const hrDiff = (currentTime - a2hsTimeStamp) / (1000 * 3600)
  //       if (hrDiff >= 3 && !localStorage.getItem('added_home')) {
  //         a2hsTimeout = setTimeout(() => {
  //           setShowAddToHomeScreenPopup(true)
  //           localStorage.removeItem('a2hsprompt_hidden')
  //         }, 4000)
  //       }
  //     } else {
  //       a2hsTimeout = setTimeout(() => {
  //         setShowAddToHomeScreenPopup(true)
  //       }, 4000)
  //     }
  //   }
  // }, [allowShowAddToHomeScreenPopup])

  // useEffect(() => {
  //   if (appInstallFlag) {
  //     // a2hsTimeout = setTimeout(() => {
  //     //   setShowAddToHomeScreenPopup(true)
  //     //   localStorage.removeItem('a2hsprompt_hidden')
  //     // }, 4000)
  //     setShowAddToHomeScreenPopup(true)
  //     localStorage.removeItem('a2hsprompt_hidden')
  //   }
  // }, [appInstallFlag])

  useEffect(() => {
    if (userName || isUserNewVerified) {
      if (accessToken) {
        dispatch(getWalletDetails()) // COMMENTED FOR PROD
      }
    } else if (loginInfo) {
      dispatch(getWalletAddress(loginInfo))
    }
  }, [userName])

  useEffect(() => {
    if (isNoWallet && !localStorage.getItem('loginInfo')) {
      dispatch(showWalletForm({ isMandatory: true }))
    }
  }, [isNoWallet])

  const handleSignup = () => {
    dispatch(setActiveTab('register'))
    dispatch(showSignupForm())
  }

  const handleGotoSeason = (url: string) => {
    if (url) {
      const match = url.match(/\/season\/\d+/)
      const match_blog = url.match(/\/blog\/([^\/]+)\/?$/)

      if (match) {
        const extractedUrl = match[0]
        navigate('/app' + extractedUrl)
      } else if (match_blog) {
        const extractedUrl = match_blog[0]
        navigate(extractedUrl)
      } else {
        window.open(url, '_blank')
      }
    }
  }

  // const handleOnHomeScreen = async (evt: any, choice: string) => {
  //   dispatch(makeAppInstall(false))
  //   if (choice === 'yes') {
  //     onGetPWA(evt)
  //     // localStorage.setItem('added_home', 'yes')
  //     // dispatch(setAddToHomeScreen(false))
  //     // setShowAddToHomeScreenPopup(false)
  //   } else {
  //     // sessionStorage.setItem('added_home', 'no')
  //     dispatch(setAddToHomeScreen(false))
  //     setShowAddToHomeScreenPopup(false)
  //     localStorage.setItem('a2hsprompt_hidden', new Date().getTime().toString())
  //   }
  // }

  // const onGetPWA = evt => {
  //   try {
  //     evt.preventDefault()
  //     if (!pwaPrompt) {
  //       return
  //     }
  //     pwaPrompt.prompt()
  //     // promptInstall.prompt()
  //     pwaPrompt.userChoice.then(choiceResult => {
  //       if (choiceResult.outcome === 'accepted') {
  //         console.log('User accepted the A2HS prompt')
  //         localStorage.setItem('added_home', 'yes')
  //         localStorage.setItem(
  //           'a2hsprompt_hidden',
  //           new Date().getTime().toString(),
  //         )
  //         localStorage.setItem('added_home', 'yes')
  //         dispatch(setAddToHomeScreen(false))
  //         setShowAddToHomeScreenPopup(false)
  //       } else {
  //         console.log('User dismissed the A2HS prompt')
  //       }
  //       // promptInstall = null
  //       // setPromptInstall(null)
  //     })
  //     /*
  //     // hide our user interface that shows our A2HS button
  //     btnAdd.style.display = 'none';
  //     // Show the prompt
  //     deferredPrompt.prompt();
  //     // Wait for the user to respond to the prompt
  //     deferredPrompt.userChoice
  //       .then((choiceResult) => {
  //         if (choiceResult.outcome === 'accepted') {
  //           console.log('User accepted the A2HS prompt');
  //         } else {
  //           console.log('User dismissed the A2HS prompt');
  //         }
  //         deferredPrompt = null;
  //       });
  //     */
  //   } catch (error) {
  //     console.error('clickBait--', error)
  //   }
  // }

  // const handleOnHomeScreen = () => {
  //   setShowAddToHomeScreenPopup(false)
  //   localStorage.setItem('a2hsprompt_hidden', new Date().getTime().toString())
  // }

  useEffect(() => {
    if (loginInfo) {
      if (
        tourStep === 'sell' ||
        tourStep === 'scout' ||
        tourStep === 'staking'
      ) {
        setShowOverviewTourModal(true)
        dispatch(setTourStep(''))
      }
      if (accessToken) {
        dispatch(getTourCategories())
      }
    }
  }, [loginInfo, accessToken])

  useEffect(() => {
    const lastAlertTime = localStorage.getItem('setWelcomeTime')
    // Date.now() - parseInt(lastAlertTime, 10) >= 30 * 60 * 1000

    if (
      !lastAlertTime ||
      Date.now() - parseInt(lastAlertTime, 10) >= 72 * 60 * 60 * 1000
    ) {
      if (isGetTourCategoriesSuccess) {
        if (
          !tourStep &&
          !tourCategories[1] &&
          !tourCategories[2] &&
          !tourCategories[3] &&
          !tourCategories[4]
        ) {
          setTimeout(() => {
            // alert('trigger2')
            setShowWelcomeTourModal(() => true)
            dispatch(togglePopupState(true))
            localStorage.setItem('showWelcomeTour', 'true')
            localStorage.setItem('setWelcomeTime', Date.now().toString())
          }, 3000)
        }
      }
    }
  }, [isGetTourCategoriesSuccess])

  const handleWelcomeTour = async (choice: string) => {
    if (choice === 'yes') {
      setShowWelcomeTourModal(false)
      dispatch(togglePopupState(false))
      setShowOverviewTourModal(true)
    } else {
      setShowWelcomeTourModal(false)
      dispatch(togglePopupState(false))
    }
  }

  const handleOverviewTour = async (categoryId: number) => {
    if (categoryId > 0) {
      setShowOverviewTourModal(false)
      if (categoryId === 2) {
        // Trade football players Tour
        setTourInternal(false)
      } else if (categoryId === 4) {
        // Unlock Fanclub Tour
        dispatch(setTourStep('staking'))
        navigate('/app/player/tour-player')
      }
      dispatch(setTourCategoryId(categoryId))
    } else {
      dispatch(setShowTourModal(false))
      setShowOverviewTourModal(false)
      dispatch(setTourStep(''))
    }
  }

  useEffect(() => {
    if (tourStep === 'buy') {
      setTourInternal(true)
    }
  }, [tourStep])

  useEffect(() => {
    if (showTourModal) {
      if (
        !tourCategories[1] &&
        !tourCategories[2] &&
        !tourCategories[3] &&
        !tourCategories[4]
      ) {
        setShowWelcomeTourModal(true)
        dispatch(togglePopupState(true))
        return
      }
      setShowOverviewTourModal(true)
    }
  }, [showTourModal])

  useEffect(() => {
    if (tourCategoryId || showWelcomeTourModal || showOverviewTourModal) {
      if (!(tourCategoryId === 2 && !tourInternal)) {
        // alert('triggered')
        document.body.style.overflow = 'hidden'
        setTimeout(() => {
          document.body.style.overflow = 'hidden'
        }, 100)
      }
      if (tourCategoryId || showWelcomeTourModal) {
        window.scrollTo(0, 0)
      }
      if (tourCategoryId === 3) {
        dispatch(setHideTourHeader(false))
      }

      if (showWelcomeTourModal) {
        setShowOverviewTourModal(false)
      }

      if (showOverviewTourModal) {
        setShowWelcomeTourModal(false)
        dispatch(togglePopupState(false))
      }
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [
    tourCategoryId,
    showWelcomeTourModal,
    showOverviewTourModal,
    tourInternal,
  ])

  const handleTourComplete = async () => {
    // FYI need to integrate api to send completion state
    try {
      await postRequestAuth('accounts/wallet_app_tour_categories/', {
        categoryId: 1,
      })
    } catch (error) {
      console.log(error)
    }
    dispatch(setTourCategories({ ...tourCategories, 1: true }))
    dispatch(setTourCategoryId(0))
    setShowOverviewTourModal(true)
  }

  const handleSellTour = () => {
    dispatch(setTourStep('sell'))
    navigate('/app/player/tour-player')
  }

  const typedRef = useRef(null)
  const subTypedRef = useRef(null)

  useEffect(() => {
    let typed = null
    if ((tourCategoryId === 2 && !tourInternal) || tourCategoryId === 3) {
      const options = {
        strings: [
          t(
            tourCategoryId === 2
              ? 'hit_the_buy_button'
              : 'click_the_first_banner',
          ),
        ],
        typeSpeed: 25,
        backSpeed: 30,
        loop: false,
        showCursor: false,
        onStringTyped: () => {
          if (tourCategoryId === 3) {
            const subOptions = {
              strings: [t('click_on_the_banner')],
              typeSpeed: 25,
              backSpeed: 30,
              loop: false,
              showCursor: false,
            }
            const subTyped = new Typed(subTypedRef.current, subOptions)
            return () => {
              subTyped.destroy()
            }
          }
        },
      }
      typed = new Typed(typedRef.current, options)
    }

    // Cleanup: Destroy Typed instance on component unmount
    return () => {
      if (typed) {
        typed.destroy()
      }
    }
  }, [tourCategoryId, tourInternal])

  const handleClickTourBanner = () => {
    dispatch(setTourStep('season'))
    navigate('/app/season/tour-season')
  }

  useEffect(() => {
    dispatch(getKioskCategories())
  }, [])

  const goToTopTrades = () => {
    navigate('/app/top-trades')
  }

  const getIsPopupOpen = () => {
    const popupOpen = tourModalState.findIndex(item => item === true)

    if (popupOpen > -1 && popupOpen !== 6) {
      return true
    }
    return false
  }

  useEffect(() => {
    if (
      (showWelcomeTourModal ||
        showBottomPopup ||
        showOverviewTourModal ||
        showChart) &&
      !isMobile()
    ) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [showWelcomeTourModal, showBottomPopup, showOverviewTourModal, showChart])

  useEffect(() => {
    if (showChart && !isMobile()) {
      document.getElementById('walletModalContent').style.width =
        window.innerWidth >= 800 ? '60%' : `${window.innerWidth - 65}px`
      document.getElementById('walletModalContent').style.height = '70vh'
      document.getElementById('walletModalContent').style.paddingTop = '20px'
    }
  }, [showChart])

  const getCount = () => {
    if (chartPeriod === '7D') return 7
    else if (chartPeriod === '1M') return 30
    else if (chartPeriod === '3M') return 30 * 3
    else if (chartPeriod === '1Y') return 1 * 365
    else if (chartPeriod === 'YTD') {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 0)
      const diff = now.getTime() - start.getTime()
      const oneDay = 1000 * 60 * 60 * 24
      return Math.floor(diff / oneDay)
    } else if (chartPeriod === 'ALL') return 99999
    else return 12
  }

  useEffect(() => {
    if (chartPeriod === 'ALL') {
      dispatch(getPlayerCoinChart('all=true'))
    } else {
      const date_min = new Date()
      date_min.setDate(date_min.getDate() - getCount())
      dispatch(
        getPlayerCoinChart('date_min=' + date_min.toISOString().substr(0, 10)),
      )
    }
  }, [chartPeriod])

  return (
    <AppLayout className={classNames('home')} noPageFooter={true}>
      {showWalletModalNew && walletConnectConfirmPopUp === false && (
        <WalletModal
          isOpen={showWalletModalNew && walletConnectConfirmPopUp === false}
          onClick={() => setShowWalletModalNew(false)}
          onClose={() => setShowWalletModalNew(false)}
        />
      )}

      {/* {showAddToHomeScreenPopup ? (
        <DialogBox
          // isOpen={isMobile() && window.location.origin.includes('app')}
          // isOpen={isMobile()}
          // isOpen={
          //   showAddToHomeScreenPopup ||
          //   (browserName === 'Chrome' && !isMobile())
          // }
          isOpen={showAddToHomeScreenPopup}
          onClose={() => handleOnHomeScreen(null, 'no')}
          contentClass={
            isMobile() ? 'notification-pop pwa-pop' : 'pwa-pop-desktop'
          }
          closeBtnClass="close-notification d-none"
          parentClass="none-backdrop-filter top-zIndex"
        >
          <AddToHomeScreen
            promptEvt={pwaPrompt}
            onAccept={evt => handleOnHomeScreen(evt, 'yes')}
            onCancel={() => handleOnHomeScreen(null, 'no')}
          />
        </DialogBox>
      ) : null} */}

      {showWelcomeTourModal && (Boolean(loginInfo) || Boolean(loginId)) ? (
        <DialogBox
          isOpen={showWelcomeTourModal && !getIsPopupOpen()}
          // isOpen={showWelcomeTourModal}
          onClose={() => handleWelcomeTour('no')}
          contentClass={classNames(
            'welcome-tour-dialog',
            isMobile() ? 'notification-pop pwa-pop' : 'pwa-pop-desktop',
            // isVisibleModal ? 'd-none' : '',
          )}
          closeBtnClass="close-notification"
          parentClass={classNames(
            'none-backdrop-filter darken-background',
            // isVisibleModal ? 'd-none' : '',
          )}
        >
          <WelcomeTourModal
            onAccept={() => handleWelcomeTour('yes')}
            onCancel={() => handleWelcomeTour('no')}
          />
        </DialogBox>
      ) : showOverviewTourModal && (Boolean(loginInfo) || Boolean(loginId)) ? (
        <DialogBox
          isOpen={showOverviewTourModal}
          onClose={() => handleOverviewTour(0)}
          contentClass={classNames(
            'overview-tour-dialog',
            isMobile() ? 'notification-pop pwa-pop' : 'pwa-pop-desktop',
            localStorage.getItem('language') === 'de' ? 'de-popup' : '',
          )}
          closeBtnClass="close-notification"
          parentClass="none-backdrop-filter darken-background"
        >
          <OverviewTourModal
            onPlay={handleOverviewTour}
            onCancel={() => handleOverviewTour(0)}
          />
        </DialogBox>
      ) : null}
      {showBottomPopup && (
        <DialogBox
          isOpen={showBottomPopup}
          onClose={handleClose}
          contentClass="onboarding-popup"
        >
          <div className="nft-tab-title pt-50">{t('please wait')}...</div>
          {localStorage.getItem('loginInfo') ? (
            <Web3BottomPopup
              showPopup={showBottomPopup}
              txnHash={txnHash}
              txnErr={txnError}
              onClose={handleClose}
            />
          ) : (
            <ApiBottomPopup
              showPopup={showBottomPopup}
              onSubmit={handleClaimApi}
              onClose={handleClose}
              customClass="purchase-pc-bottomwrapper"
            />
          )}
        </DialogBox>
      )}
      <div className={classNames('app-landing-container')}>
        <section className="header-ticker-section">
          <HeaderTicker />
        </section>
        {claimStatus ? (
          <section className="seasons-rewards-section">
            <div
              className="seasons-rewards-wrapper"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.98), rgba(0, 0, 0, 0.6)), url('${
                  isMobile() ? prevbannermobile : prevbanner
                }')`,
              }}
            >
              <ImageComponent src={Prize} alt="" />
              <div className="seasons-rewards-content">
                <div className="seasons-rewards-prize-value">
                  ${prizeAmount}
                </div>
                <div
                  className="seasons-rewards-claim-btn"
                  onClick={handleClaim}
                >
                  {' '}
                  {t('claim prize')}
                </div>
                <div className="seasons-rewards-time-left">
                  {' '}
                  {t('time left')}&nbsp;{state.day}d {state.hours}h{' '}
                  {state.minutes}m {state.seconds}s
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {/* Banner */}
        {/* {tourCategoryId === 3 ? (
          <section
            className={classNames('seasons-rewards-section bright-area')}
            onClick={handleClickTourBanner}
          >
            <div className="seasons-rewards-section-banner-carousel">
              <div
                className={classNames('seasons-rewards-wrapper', hoverClass)}
                style={{
                  backgroundImage: `url('${
                    isMobile() ? BannerMobile : BannerDesktop
                  }')`,
                }}
              ></div>
            </div>
          </section>
        ) : (
          <section className={classNames('seasons-rewards-section')}>
            {!loadingBanner && mainBanner.length > 0 ? (
              mainBanner.length > 1 ? (
                <LandingBannerCarousel />
              ) : (
                <div className="seasons-rewards-section-banner-carousel">
                  <div
                    className={classNames(
                      'seasons-rewards-wrapper',
                      hoverClass,
                    )}
                    onClick={() => handleGotoSeason(mainBanner[0].banner_link)}
                    style={{
                      backgroundImage: `url('${
                        isMobile()
                          ? mainBanner[0].banner_mobile
                          : mainBanner[0].banner
                      }')`,
                    }}
                  ></div>
                </div>
              )
            ) : (
              <div className="seasons-rewards-skeleton" />
            )}
          </section>
        )} */}

        {tourCategoryId === 3 && (
          <section
            className={classNames('seasons-rewards-section bright-area')}
            onClick={handleClickTourBanner}
          >
            <div className="seasons-rewards-section-banner-carousel">
              <div
                className={classNames('seasons-rewards-wrapper', hoverClass)}
                style={{
                  backgroundImage: `url('${
                    isMobile() ? BannerMobile : BannerDesktop
                  }')`,
                }}
              ></div>
            </div>
          </section>
        )}

        {/* Login Box Old */}
        {/* {!isGetSeasonDetailSuccess &&
        !allowShowAddToHomeScreenPopup &&
        !loginInfo &&
        !loginId ? (
          <LoginSkeleton />
        ) : !loginInfo && !loginId ? (
          <div className="seasons-rewards-section">
            <div
              style={{
                marginTop: '2rem',
              }}
              className="login-wrapper"
            >
              <div className={classNames('new-launch-title')}>
                <div className="new-nft-title">
                  {t('create your account now')}
                </div>
                <div className="new-nft-content pg-lg">
                  {t('it will also create a polygon')}
                </div>
              </div>
              <div className="button-line">
                <div
                  className="button-box button1"
                  onClick={() => handleSignup()}
                >
                  {t('register')}
                </div>
                <div
                  className={classNames('button-box button2')}
                  onClick={() => setShowWalletModalNew(true)}
                >
                  {t('connect')}
                </div>
              </div>
            </div>
          </div>
        ) : null} */}

        {Boolean(loginInfo) || Boolean(loginId) ? (
          <>
            <DepositModal
              isOpen={showDepositModal}
              onClose={() => setShowDepositModal(false)}
            />
            {
              // (!tourCategories[1] ||
              //   !tourCategories[2] ||
              //   !tourCategories[3] ||
              //   !tourCategories[4]) &&
              isGetTourCategoriesSuccess && !isTourXPClaimed && !isMobile() && (
                <TourButton
                  onPress={() => {
                    if (isGetTourCategoriesSuccess) {
                      if (
                        !tourCategories[1] &&
                        !tourCategories[2] &&
                        !tourCategories[3] &&
                        !tourCategories[4]
                      ) {
                        setShowWelcomeTourModal(true)
                        dispatch(togglePopupState(true))
                        localStorage.setItem(
                          'setWelcomeTime',
                          Date.now().toString(),
                        )
                        return
                      }
                    }
                    setShowWelcomeTourModal(false)
                    dispatch(togglePopupState(false))
                    setShowOverviewTourModal(true)
                  }}
                />
              )
            }
          </>
        ) : null}
        <div>
          {tourCategoryId === 1 ? (
            <DepositTour onComplete={() => handleTourComplete()} />
          ) : tourCategoryId === 2 || tourCategoryId === 3 ? (
            tourCategoryId === 2 && tourInternal ? (
              <TradeTourBuy onComplete={() => handleSellTour()} />
            ) : (
              <>
                <div className="dark-overlay"></div>
                <div className="bright-rectangle">
                  <div
                    className={classNames(
                      'wallet-description fade-in',
                      tourCategoryId === 2
                        ? showDepositModal
                          ? 'start-trading-long'
                          : 'start-trading'
                        : 'landing-season',
                    )}
                  >
                    <b ref={typedRef}></b>
                    &nbsp;
                    <b className="fg-primary-color" ref={subTypedRef}></b>
                  </div>
                </div>
              </>
            )
          ) : null}
        </div>

        {isMobile() && (
          <section>
            <div
              className="mobile-chat-btn"
              onClick={() => setOpenChatComp(true)}
            >
              <div className='flex-container'>
                <div className='count-div'>
                  {getAllChatsLoading ? <div className="chat-spinner three"></div> : allChats?.count}
                </div>
                {t('24h Chat')}
              </div>
            </div>
          </section>
        )}

        <section
          className={classNames(
            'new-launches-nft',
            tourCategoryId === 2 && !tourInternal ? 'bright-area' : '',
          )}
        >
          <PlayerCarousel hasTour={tourCategoryId === 2 && !tourInternal} />
        </section>
        <section className="my-players-section">
          <MyOrders />
        </section>
        <section
          className="my-players-section"
          style={{ position: 'sticky', zIndex: 10 }}
        >
          <MyPlayers handleShowChart={() => setShowChart(!showChart)} />
        </section>

        <section className="watchlist-section">
          <WatchList />
        </section>

        {tourCategoryId === 3 ? (
          <section
            className={classNames('seasons-rewards-section bright-area')}
            onClick={handleClickTourBanner}
          >
            <div className="seasons-rewards-section-banner-carousel">
              <div
                className={classNames('seasons-rewards-wrapper', hoverClass)}
                style={{
                  backgroundImage: `url('${
                    isMobile() ? BannerMobile : BannerDesktop
                  }')`,
                }}
              ></div>
            </div>
          </section>
        ) : (
          <section
            style={{
              marginTop: loginId ? '0rem' : '2rem',
            }}
            className={classNames('seasons-rewards-section')}
          >
            {!loadingBanner && mainBanner.length > 0 ? (
              mainBanner.length > 1 ? (
                <LandingBannerCarousel />
              ) : (
                <div className="seasons-rewards-section-banner-carousel">
                  <div
                    className={classNames(
                      'seasons-rewards-wrapper',
                      hoverClass,
                    )}
                    onClick={() => handleGotoSeason(mainBanner[0].banner_link)}
                    style={{
                      backgroundImage: `url('${
                        isMobile()
                          ? mainBanner[0].banner_mobile
                          : mainBanner[0].banner
                      }')`,
                    }}
                  ></div>
                </div>
              )
            ) : (
              <div className="seasons-rewards-skeleton" />
            )}
          </section>
        )}

        {!isGetSeasonDetailSuccess &&
        !allowShowAddToHomeScreenPopup &&
        !loginInfo &&
        !loginId ? (
          <LoginSkeleton />
        ) : !loginInfo && !loginId ? (
          <div className="seasons-rewards-section">
            <div className="login-wrapper">
              <div className={classNames('new-launch-title')}>
                <div className="new-nft-title">
                  {t('create your account now')}
                </div>
                <div className="new-nft-content pg-lg">
                  {t('it will also create a polygon')}
                </div>
              </div>
              <div className="button-line">
                <div
                  className="button-box button1"
                  onClick={() => handleSignup()}
                >
                  {t('register')}
                </div>
                <div
                  className={classNames('button-box button2')}
                  onClick={() => setShowWalletModalNew(true)}
                >
                  {t('connect')}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <section
          style={{
            marginTop: '3rem',
          }}
          className="players-trending-section"
        >
          <Trending />
        </section>
        <section className="top-trades-section players-trending-section">
          <TopTradesForm showmore={true} isLanding />
        </section>
        <section className="my-players-section players-trending-section">
          <RecentVisitsLanding />
        </section>
        {/* <section className="my-players-section players-trending-section">
          <WhoNext />
        </section> */}
        <section
          style={{
            marginTop: '3rem',
          }}
          className="players-trending-section"
        >
          <TabularVotePlayers />
        </section>

        {!isLoadingKiosk && landingKioskData.length > 5 && (
          <section className="kiosk-section row">
            <Kiosk />
          </section>
        )}
        <section className="seasons-rewards-section">
          {!loadingBanner && extraBanner.length > 0 ? (
            <div className="seasons-rewards-section-second-banner-carousel">
              <div
                className={classNames('seasons-rewards-wrapper', hoverClass)}
                // onClick={() => navigate('/app/seasons')}
                onClick={() => handleGotoSeason(extraBanner[0].banner_link)}
                style={{
                  backgroundImage: `url('${
                    isMobile()
                      ? extraBanner[0].banner_mobile
                      : extraBanner[0].banner
                  }')`,
                }}
              ></div>
            </div>
          ) : (
            <div className="seasons-rewards-skeleton" />
          )}
        </section>

        <Chat
          isOpenChatModal={openChatComp}
          handleOpenChatModal={data => setOpenChatComp(data)}
        />

        <section className="feed-section">
          <Feed />
        </section>
        {!kioskCategoriesLoader && kioskCategoriesData.length > 1 && (
          <section className="rated-players-section">
            <KioskOverview />
          </section>
        )}
        {/* <section className={classNames('collectibles-section row')}>
          <Collectibles />
        </section> */}
        {/* <section className="rated-players-section row">
          <RatedPlayers />
        </section>
        <section className={classNames('versus-players-section row')}>
          <VersusPlayers />
        </section>
        <section className="drafted-players-section row">
          <DraftedPlayers />
        </section>
        <section className="tutorials-section row">
          <Tutorials />
        </section> */}
        <section className="rated-players-section">
          <RatedPlayers />
        </section>
        <section className="bottom-section row">
          <Bottom />
        </section>
        <WalletDialog
          isOpen={showChart && !isMobile()}
          onClose={() => setShowChart(!showChart)}
        >
          <div
            className={classNames('purchase-container wallet-wrapper')}
            style={{ height: '480px' }}
          >
            <div className="chart-modal-body-box">
              <div className="chart-modal-body-content">
                <Stack direction={'column'} justifyContent="center">
                  {loadingChart ? (
                    <div
                      className="balance-progress"
                      style={{ height: '60vh' }}
                    >
                      <div
                        className={classNames(
                          'loading-spinner-container mt-80',
                          'show',
                        )}
                      >
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {series.length > 0 ? (
                        <div className="chart">
                          <MultiChart
                            xAxisData={xAxisData}
                            series={series}
                            chartOption={'Balance'}
                          />
                        </div>
                      ) : (
                        <div
                          className="blog-title yellow-color"
                          style={{ height: '60vh' }}
                        >
                          {t('no data yet')}
                        </div>
                      )}
                    </>
                  )}
                  <PeriodBar
                    chartPeriod={chartPeriod}
                    setChartPeriod={setChartPeriod}
                  />
                </Stack>
              </div>
            </div>
          </div>
        </WalletDialog>

        <Dialog
          open={showChart && isMobile()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth={'md'}
          className="chart-dialog"
        >
          <div className={classNames('chart-modal-body')}>
            <div className="chart-modal-body-content">
              <Stack direction={'column'} justifyContent="center">
                {series.length > 0 ? (
                  <div className="chart">
                    <MultiChart
                      xAxisData={xAxisData}
                      series={series}
                      chartOption={'Balance'}
                    />
                  </div>
                ) : (
                  <div
                    className="blog-title yellow-color mt-30"
                    style={{ width: '100%', height: '300px' }}
                  >
                    {t('no data yet')}
                  </div>
                )}
                <PeriodBar
                  chartPeriod={chartPeriod}
                  setChartPeriod={setChartPeriod}
                />
                <div
                  className="mobile-back-button chart-back-button"
                  onClick={() => {
                    setShowChart(false)
                  }}
                >
                  <ArrowBackIcon />
                </div>
              </Stack>
            </div>
          </div>
        </Dialog>
      </div>
    </AppLayout>
  )
}

export default Landing
