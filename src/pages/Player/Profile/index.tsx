/* eslint-disable prettier/prettier */
import { useRef } from 'react'
import PlayerInfo from './PlayerInfo'
import { PLAYER_STATUS } from '@root/constants'
import { isMobile, sleep } from '@utils/helpers'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import NewNFTs from './NewNFTs'
import VotingPolls from './VotingPolls'
import Giveaways from './Giveaways'
import { useEffect, useState } from 'react'
import PlayerChart from './PlayerChart'
import { RootState } from '@root/store/rootReducers'
import {
  getDraftedByData,
  getPreviewNftsData,
  getPlayer1Contract,
  getStakingBalance,
  getPlayerDetailsReset,
} from '@root/apis/playerCoins/playerCoinsSlice'
import classNames from 'classnames'
import {
  fetchPlayersStats,
  fetchPlayersStatsReset,
} from '@root/apis/playerStats/playerStatsSlice'
import {
  getLatestTradeHistory,
  getPlayerSharesInit,
  showPurchaseForm,
  showSignupForm,
  showStakingForm,
  clearLatestTradesFetch,
  togglePopupState,
  resetLatestTradeHistory,
} from '@root/apis/onboarding/authenticationSlice'
import PlayersDisplay from './PlayersDisplay'
import NftSkeleton from '@components/Card/NftSkeleton'
import { Dialog } from '@material-ui/core'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NftSkeletonMobile from '@components/Card/NftSkeletonMobile'
import PlayerKiosk from './PlayerKiosk'
import { useIdleTimer } from 'react-idle-timer'
import DialogBox from '@components/Dialog/DialogBox'
import { toast } from 'react-hot-toast'
import { THEME_COLORS } from '@root/constants'
import FanClubList from '@pages/LaunchCoin/FanClubList'
import FanClubToast from './components/FanClubToast'
import TradeHistory from './TradeHistory'
import ItemsSold from './ItemsSold'
import PlayerStory from './PlayerStory'

let playerProfileInterval: any = null
const getTradeHistoryInterval: any = null
let tradesTimer: any = null

const Profile = ({ isVotingPlayer = false, setIsVotingPlayer }) => {
  const { t } = useTranslation()
  const playerRef = useRef<any>(null)
  const dispatch = useDispatch()
  const [chartView, setChartView] = useState(false)
  const [isFirstLoad, setFirstLoad] = useState(true)
  const [disabledPlayer, setDisabledPlayer] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [stakeFlag, setStakeFlag] = useState(false)
  const [tradesQueue, setTradesQueue] = useState([])
  /*
  #1.PAUSING_RESUMING_BG_APIS-
  using lastTimestamp for fetching latest trades using setLastTimeStamp()
  */
  const [lastTimeStamp, setLastTimeStamp] = useState('')
  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')
  const accessToken = localStorage.getItem('accessToken')

  useEffect(() => {
    return () => {
      // dispatch(getPlayerSharesInit())
      // dispatch(getPlayerDetailsReset())
      dispatch(fetchPlayersStatsReset())
    }
  }, [])

  const handlePurchaseOpen = (value: string, data: any) => {
    if (!loginInfo && !loginId) {
      dispatch(showSignupForm())
      return
    }
    dispatch(
      showPurchaseForm({
        mode: value.toUpperCase(),
        playerData: data ? data : profileData,
      }),
    )
  }

  const handleStakeFormOpen = () => {
    if (!loginInfo && !loginId) {
      dispatch(showSignupForm())
      return
    }
    dispatch(showStakingForm({ playerData: profileData }))
  }

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const {
    getPlayerDetailsSuccessData,
    getPlayerDetailsErrorMsg,
    previewNftsData,
    isLoadingNfts,
    cardPlayerDetailsSuccessData,
    playerDraftedByData,
    isGetStakingBalanceSuccess,
  } = playerCoinData
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    selectedThemeRedux,
    isVisibleModal,
    isPurchaseFormVisible,
    latestTradeHistoryData,
    initialLatestTradesFetched,
    newTrades,
  } = authenticationData
  const playerStatsData = useSelector((state: RootState) => state.playerstats)
  const { fetchPlayerStatsData } = playerStatsData
  const [windowSize, setWindowSize] = useState(0)
  const [pauseStakingBalanceApi, setPauseStakingBalanceApi] = useState(false)

  useEffect(() => {
    // Update coin_issued when close purchase form
    if (!isPurchaseFormVisible && !isFirstLoad) {
      handleGetPriceStats([getPlayerDetailsSuccessData.playercontract])
    }
  }, [isPurchaseFormVisible])

  const createTestPlayers = () => {
    const playerProfileData = {
      ...getPlayerDetailsSuccessData,
      ...fetchPlayerStatsData[0],
    }
    if (Object.keys(playerProfileData).length > 0) {
      console.log('besto1')
      setProfileData(playerProfileData)
      if (playerProfileData?.isvoting) {
        setIsVotingPlayer(playerProfileData?.isvoting)
      }
    }
  }

  const handleGetPriceStats = (playersData: any) => {
    if (isFirstLoad) {
      setFirstLoad(false)
    }
    dispatch(fetchPlayersStats({ contracts: playersData, query: 'complex' }))
  }

  const onIdle = () => {
    clearInterval(playerProfileInterval)
  }

  const onActive = () => {
    clearInterval(playerProfileInterval)
    if (
      !document.hidden &&
      !isVisibleModal &&
      getPlayerDetailsSuccessData?.playerstatusid?.id >= 3
    ) {
      playerProfileInterval = setInterval(() => {
        handleGetPriceStats([getPlayerDetailsSuccessData.playercontract])
      }, 20000)
    }
  }

  const onAction = () => {
    /**/
  }

  useIdleTimer({
    onIdle,
    onActive,
    onAction,
    timeout: 60000,
    throttle: 500,
  })

  useEffect(() => {
    if (
      getPlayerDetailsSuccessData &&
      getPlayerDetailsSuccessData.playerstatusid?.id >= PLAYER_STATUS.COMINGSOON
    ) {
      setDisabledPlayer(false)
      handleGetPriceStats([getPlayerDetailsSuccessData.playercontract])

      // if ([3, 4, 5].includes(getPlayerDetailsSuccessData?.playerstatusid?.id)) {
      //   dispatch(getPreviewNftsData(getPlayerDetailsSuccessData.playercontract))
      // }
      if (getPlayerDetailsSuccessData?.detailpageurl) {
        dispatch(
          getPlayer1Contract({
            url: getPlayerDetailsSuccessData?.detailpageurl,
          }),
        )
      }
    }
    if (fetchPlayerStatsData.length < 1) {
      console.log('besto2')
      setProfileData(getPlayerDetailsSuccessData)
      if (getPlayerDetailsSuccessData?.isvoting) {
        setIsVotingPlayer(getPlayerDetailsSuccessData?.isvoting)
      }
    }

    if (getPlayerDetailsSuccessData?.playercontract) {
      dispatch(
        getLatestTradeHistory({
          params: {
            playercontract: getPlayerDetailsSuccessData?.playercontract,
            offset: '0',
          },
          isFirstLoad: true,
          loader: true,
        }),
      )
      // getTradeHistoryInterval = setInterval(() => {
      //   console.log('firist2')
      //   // dispatch(getFeedPlayers({ params: {}, isFirstLoad: true }))
      //   // dispatch(
      //   //   getLatestTradeHistory({
      //   //     player_contract: getPlayerDetailsSuccessData?.playercontract,
      //   //     offset: '0',
      //   //     loader: false,
      //   //     tradetimestamp: latestTradeHistoryData[0]?.tradetimestamp,
      //   //   }),
      //   // )
      // }, 15000)
    }
  }, [getPlayerDetailsSuccessData])

  /*
    #4.PAUSING_RESUMING_BG_APIS-
    using lastTimestamp as value to tradetimestamp key when modal goes off 
    as latestTradeHistoryData[0]?.timestamp will return blank
    array due to api response.
  */
  useEffect(() => {
    clearInterval(tradesTimer)
    if (
      (initialLatestTradesFetched &&
        latestTradeHistoryData.length > 0 &&
        !isVisibleModal) ||
      (!isVisibleModal && lastTimeStamp)
    ) {
      console.log({ initialLatestTradesFetched, latestTradeHistoryData })
      tradesTimer = setInterval(async () => {
        console.log('firist2')

        // TODO: TRADE HISTORY INTERVAL

        // dispatch(
        //   getLatestTradeHistory({
        //     params: {
        //       playercontract: getPlayerDetailsSuccessData?.playercontract,
        //       offset: '0',
        //       tradetimestamp:
        //         latestTradeHistoryData[0]?.timestamp || lastTimeStamp,
        //     },
        //     loader: false,
        //   }),
        // )
      }, 15000)

      // window.addEventListener('pause_bgApiCall', () => {
      //   console.log('bgAPICALL_pause_trade_history')
      //   clearInterval(tradesTimer)
      // })
      // window.addEventListener('resume_bgApiCall', () => {
      //   console.log('bgAPICALL_resume_trade_history')
      //   tradesTimer = setInterval(async () => {
      //     console.log('firist2')
      //     dispatch(
      //       getLatestTradeHistory({
      //         params: {
      //           playercontract: getPlayerDetailsSuccessData?.playercontract,
      //           offset: '0',
      //           tradetimestamp: latestTradeHistoryData[0]?.timestamp,
      //         },
      //         loader: false,
      //       }),
      //     )
      //   }, 15000)
      // })
      // return () => {
      //   console.log('clearing_trades')
      //   dispatch(clearLatestTradesFetch())
      //   clearInterval(tradesTimer)
      // }
    }
  }, [initialLatestTradesFetched, isVisibleModal, lastTimeStamp])

  async function updateTradesList() {
    const newElement = 'New Element' // Replace with the actual element you want to add
    const tradesTemp = [...tradesQueue]
    for (let i = 0; i < newTrades.length; i++) {
      tradesTemp.unshift(newTrades[i])
    }

    // Removing one from the bottom if the list exceeds a certain length (e.g., 10)
    // const maxLength = 8
    // if (tradesTemp.length > maxLength) {
    //   tradesTemp.pop()
    // }

    // Display the updated list (you can replace this with your own logic)
    console.log({ tradesTemp })
    setTradesQueue(tradesTemp)
    // const span = scrollRef.current // corresponding DOM node
    // span.className = 'animate-move user-list-column'
    // await sleep(1000)
    // span.className = 'user-list-column'
    /*
    #3.PAUSING_RESUMING_BG_APIS-
    setting lastTimestamp here if trades has some new trades so lastTimeStamp will be updated to 
    most recent timestamp
  */
    if (newTrades[0] && newTrades[0]?.tradetimestamp) {
      console.log('profile_setting_last_timestamp')
      setLastTimeStamp(newTrades[0]?.tradetimestamp)
      clearInterval(tradesTimer)
      setTradesQueue([])
      dispatch(clearLatestTradesFetch())
      // dispatch(getFeedPlayers({ params: {}, isFirstLoad: true }))
      dispatch(
        getLatestTradeHistory({
          params: {
            playercontract: getPlayerDetailsSuccessData?.playercontract,
            offset: '0',
          },
          isFirstLoad: true,
          loader: true,
        }),
      )
    }
  }

  useEffect(() => {
    console.log({ newTrades })
    if (newTrades.length > 0) {
      updateTradesList()
    }
    // dispatch(getFeedPlayers({ params: {}, isFirstLoad: true }))
  }, [newTrades])

  /*
  #2.PAUSING_RESUMING_BG_APIS-
  setting last timestamp for fetching trades using setLastTimeStamp()
  */
  useEffect(() => {
    if (latestTradeHistoryData.length > 0) {
      console.log('fpps--', latestTradeHistoryData)
      setLastTimeStamp(latestTradeHistoryData[0]?.timestamp)
      setTradesQueue(prevFeeds => [
        ...latestTradeHistoryData, //.slice(0, 8),
        ...prevFeeds,
      ])
    }
  }, [latestTradeHistoryData])

  useEffect(() => {
    console.log({ profileData, loginInfo, pauseStakingBalanceApi })
    if (
      (accessToken || loginInfo) &&
      !pauseStakingBalanceApi &&
      !isGetStakingBalanceSuccess
    ) {
      profileData?.playercontract &&
        dispatch(getStakingBalance(profileData?.playercontract))
      // if (profileData && !stakeFlag) {
      //   setStakeFlag(true)
      // }
    }
  }, [profileData])

  useEffect(() => {
    clearInterval(playerProfileInterval)
    if (
      getPlayerDetailsSuccessData &&
      getPlayerDetailsSuccessData.playerstatusid?.id >= PLAYER_STATUS.COMINGSOON
    ) {
      if (!document.hidden && !isVisibleModal) {
        playerProfileInterval = setInterval(() => {
          handleGetPriceStats([getPlayerDetailsSuccessData.playercontract])
        }, 20000)
      }
    }
  }, [document.hidden, isVisibleModal])

  useEffect(() => {
    if (fetchPlayerStatsData.length > 0) {
      createTestPlayers()
    }
  }, [fetchPlayerStatsData])

  useEffect(() => {
    return () => {
      clearInterval(playerProfileInterval)
      clearInterval(getTradeHistoryInterval)
      // return () => {
      //   console.log('clearing_trades')
      //   dispatch(clearLatestTradesFetch())
      //   clearInterval(tradesTimer)
      // }
      console.log('clearing_trades')
      dispatch(clearLatestTradesFetch())
      dispatch(resetLatestTradeHistory())
      clearInterval(tradesTimer)
    }
  }, [])

  useEffect(() => {
    if (
      cardPlayerDetailsSuccessData &&
      cardPlayerDetailsSuccessData?.playercontract
    ) {
      const playerContract = {
        contract: cardPlayerDetailsSuccessData?.playercontract,
      }
      dispatch(getDraftedByData(playerContract))
    }
  }, [cardPlayerDetailsSuccessData])

  useEffect(() => {
    playerRef.current = profileData
  }, [profileData])

  useEffect(() => {
    if (chartView) {
      document.body.style.overflow = 'hidden'
      if (isMobile()) {
        document.body.style.position = 'fixed'
      } else {
        document.getElementsByClassName('player-chart-dialog')[0].style.width =
          window.innerWidth >= 800 ? '60%' : `${window.innerWidth - 65}px`
        document.getElementsByClassName('player-chart-dialog')[0].style.height =
          'fit-content'
      }
    } else if (isVisibleModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
    }
  }, [chartView])

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [window.innerWidth])

  const handleCloseChart = val => {
    setChartView(val)
    // dispatch(togglePopupState({
    //   playerChart: val
    // }))
    dispatch(togglePopupState(val))
  }

  return (
    <section
      className={classNames(
        'profile-container',
        selectedThemeRedux === 'Black' ? 'fullWidth_Black' : 'fullwidth',
      )}
    >
      {chartView ? (
        isMobile() ? (
          <Dialog
            open={chartView}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'md'}
            className={classNames('chart-dialog player-container')}
          >
            <PlayerChart
              onCardView={() => handleCloseChart(false)}
              profileData={profileData}
            />
            <div
              className="mobile-back-button chart-back-button"
              onClick={() => handleCloseChart(false)}
            >
              <ArrowBackIcon />
            </div>
          </Dialog>
        ) : (
          <DialogBox
            isOpen={chartView}
            onClose={() => handleCloseChart(false)}
            contentClass={'player-chart-dialog'}
          >
            <PlayerChart
              onCardView={() => handleCloseChart(false)}
              profileData={profileData}
            />
          </DialogBox>
        )
      ) : null}
      {profileData && getPlayerDetailsSuccessData ? (
        <>
          <PlayerInfo
            isInitial={isFirstLoad}
            isPlayerNotLaunched={
              getPlayerDetailsSuccessData?.playerstatusid?.id < 4
            }
            launchDate={
              getPlayerDetailsSuccessData.playercontractsubscriptionstart
            }
            marketCap={getPlayerDetailsSuccessData.market_cap}
            card={profileData}
            draftedBy={playerDraftedByData?.drafted_by}
            prevData={playerRef.current}
            disabledPlayer={disabledPlayer}
            onBuy={(data: any) => handlePurchaseOpen('buy', data)}
            onStake={handleStakeFormOpen}
            onSell={(data: any) => handlePurchaseOpen('sell', data)}
            onChartView={() => handleCloseChart(true)}
            isVotingPlayer={isVotingPlayer}
          />
        </>
      ) : (
        <div className="new-nft-loading">
          <div className="spinner"></div>
          <div
            className={classNames(
              'input-feedback text-center otp-error mt-20',
              !getPlayerDetailsErrorMsg ? 'hidden' : '',
            )}
          >
            {getPlayerDetailsErrorMsg}
          </div>
        </div>
      )}
      <div className="sections-wrapper">
        {isVotingPlayer
          ? null
          : !disabledPlayer && (
              <>
                <PlayerStory />
                <PlayerKiosk playerId={getPlayerDetailsSuccessData?.id} />
                <ItemsSold
                  playercontract={getPlayerDetailsSuccessData.playercontract}
                />
                <TradeHistory
                  tradesData={tradesQueue}
                  ticker={getPlayerDetailsSuccessData?.ticker}
                  onBuy={(data: any) => handlePurchaseOpen('buy', data)}
                />
                <VotingPolls
                  playercontract={getPlayerDetailsSuccessData.playercontract}
                  ticker={getPlayerDetailsSuccessData?.ticker}
                />
                <Giveaways playerStatus={getPlayerDetailsSuccessData} />
              </>
            )}
        <PlayersDisplay
          onBuy={(playerData: any) => handlePurchaseOpen('buy', playerData)}
          onSell={(playerData: any) => handlePurchaseOpen('sell', playerData)}
          isVotingPlayer={isVotingPlayer}
          playerId={getPlayerDetailsSuccessData?.id}
        />
      </div>
    </section>
  )
}

export default Profile
