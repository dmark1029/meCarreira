import { useEffect, useState } from 'react'
import Profile from './Profile'
import Nfts from './Nfts'
import Drafts from './Drafts'
import Supporters from './Supporters'
import Votes from './Votes'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import '@assets/css/pages/Player.css'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import classNames from 'classnames'
import { isMobile } from '@utils/helpers'
import PlayerListTabGroup from '@pages/PlayerList/components/PlayerListTabGroup'
import {
  resetPlayer1Contract,
  resetPlayerDetails,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { resetFPS } from '@root/apis/playerStats/playerStatsSlice'
import {
  getWalletDetails,
  showWalletForm,
  getShowTabsByPlayerAddress,
} from '@root/apis/onboarding/authenticationSlice'
import Spinner from '@components/Spinner'
import PlayerShop from '@pages/PlayerDashboard/PlayerCoin/PlayerShop'
import Messages from './Messages'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

const PlayerDetailForm = (props: any) => {
  const { getActiveTab } = props
  const dispatch = useDispatch()
  const curTab = useSelector((state: RootState) => state.authentication.curTab)
  const [activeTab, setActiveTab] = useState('profile')
  const [scrollIndex, setScrollIndex] = useState(0)
  const [isFirstLoading, setIsFirstLoading] = useState(true)
  const [fiveSecTimerTriggered, setFiveSecTimerTriggered] = useState(false)
  const { t } = useTranslation()

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const { getPlayerDetailsSuccessData, getDetailsLoading } = playerCoinData
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const accessToken = localStorage.getItem('accessToken')
  const {
    isNoWallet,
    userName,
    selectedThemeRedux,
    walletDetailAddress,
    userTabsData,
  } = authenticationData

  useEffect(() => {
    // five sec wait request trigger for loader

    setTimeout(() => {
      // setFiveSecTimerTriggered(() => true)
    }, 2000)
  }, [fiveSecTimerTriggered])

  useEffect(() => {
    // 5s trigger to remove spinner and show no data found message
    const ref = setTimeout(() => {
      if (getDetailsLoading) {
        setFiveSecTimerTriggered(true)
      }
    }, 5000)

    if (userName) {
      if (accessToken && !walletDetailAddress) {
        dispatch(getWalletDetails()) // COMMENTED FOR PROD
      }
    }

    return () => {
      setFiveSecTimerTriggered(false)
      clearTimeout(ref)
    }
  }, [userName, getPlayerDetailsSuccessData])

  useEffect(() => {
    if (getPlayerDetailsSuccessData && isFirstLoading) {
      if (getPlayerDetailsSuccessData?.playerstatusid?.id < 4) {
        setActiveTab('coming soon')
      } else {
        setActiveTab('profile')
      }
      setIsFirstLoading(false)
    }
  }, [getPlayerDetailsSuccessData])

  useEffect(() => {
    if (curTab) {
      setActiveTab(curTab)
    }
  }, [curTab])

  useEffect(() => {
    if (isNoWallet && !localStorage.getItem('loginInfo')) {
      dispatch(showWalletForm({ isMandatory: true }))
    }
  }, [isNoWallet])

  const handleGetTab = (tab: string) => {
    if (isVotingPlayer) {
      return
    }

    setActiveTab(tab)
    getActiveTab(tab)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    window.addEventListener('change_tab', () => {
      setActiveTab('profile')
    })
    return () => {
      dispatch(resetPlayerDetails())
      dispatch(resetFPS())
      dispatch(resetPlayer1Contract())
    }
  }, [])

  const handleScroll = (direction: string) => {
    if (direction === 'forth') {
      if (scrollIndex <= 300) {
        setScrollIndex(scrollIndex + 30)
      }
    } else {
      if (scrollIndex > 0) {
        setScrollIndex(scrollIndex - 30)
      }
    }
  }

  useEffect(() => {
    if (getPlayerDetailsSuccessData?.playercontract) {
      dispatch(
        getShowTabsByPlayerAddress(getPlayerDetailsSuccessData?.playercontract),
      )
    }
  }, [getPlayerDetailsSuccessData?.playercontract])

  const [userTabs, setUserTabs] = useState([])

  // TODO:VOTING PLAYER
  const [isVotingPlayer, setIsVotingPlayer] = useState(true)

  const location = useLocation()

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const isVotingCard = queryParams.get('ivc')
    setIsVotingPlayer(isVotingCard ? true : false)
  }, [location])

  useEffect(() => {
    if (isVotingPlayer) {
      setUserTabs(['Vote OnGoing'])
    } else {
      setUserTabs(
        [
          'profile',
          'members',
          'messages' +
            (userTabsData?.messagecount
              ? `(${userTabsData?.messagecount})`
              : ''),
          userTabsData?.showitem &&
            'items' +
              (userTabsData?.itemcount ? `(${userTabsData?.itemcount})` : ''),
          userTabsData?.votecount &&
            'votes' +
              (userTabsData?.itemcount ? `(${userTabsData?.votecount})` : ''),
          userTabsData?.showdraft &&
            'drafts' +
              (userTabsData?.draftedycount
                ? `(${userTabsData?.draftedycount})`
                : ''),
        ].filter(Boolean),
      )
    }
  }, [userTabsData])

  return (
    <section
      className={classNames(activeTab !== 'items' ? 'player-container' : '')}
    >
      <>
        {!getDetailsLoading && !getPlayerDetailsSuccessData?.isdeleted && (
          <div
            style={{ position: 'relative' }}
            className={classNames(
              'tab-bar-container',
              isMobile() ? 'players-list-tabgroup' : '',
            )}
          >
            <ArrowBackIosNewIcon
              style={{
                display: isMobile() && scrollIndex > 10 ? 'block' : 'none',
                fontSize: 15,
                position: 'absolute',
                left: '10px',
                top: '37%',
              }}
              onClick={() => handleScroll('back')}
            />
            <PlayerListTabGroup
              defaultTab={activeTab}
              getScrollIndex={(index: number) => setScrollIndex(index)}
              tabSet={
                !getPlayerDetailsSuccessData
                  ? []
                  : getPlayerDetailsSuccessData?.playerstatusid?.id < 4
                  ? ['coming soon']
                  : userTabs
              }
              getSwitchedTab={handleGetTab}
              scrollTo={scrollIndex}
            />
            {!getDetailsLoading && (
              <ArrowForwardIosIcon
                style={{
                  display: isMobile() && scrollIndex < 168 ? 'block' : 'none',
                  fontSize: 15,
                  position: 'absolute',
                  right: '10px',
                  top: '37%',
                }}
                onClick={() => handleScroll('forth')}
              />
            )}
          </div>
        )}
        {getDetailsLoading ||
        (!getDetailsLoading && getPlayerDetailsSuccessData?.isdeleted) ? (
          <>
            {isFirstLoading && window.scrollTo(0, 0)}

            {fiveSecTimerTriggered || getPlayerDetailsSuccessData?.isdeleted ? (
              // <div className="alert-wrapper">
              <div
                style={{
                  height: '70vh',
                  textAlign: 'center',
                }}
                className="heading-title unverified-alert"
              >
                {t('player_not_found')}
              </div>
            ) : (
              <Spinner className="player-spinner" title={''} />
            )}
          </>
        ) : (
          <>
            {(activeTab === 'profile' || activeTab === 'coming soon') && (
              <>
                {isFirstLoading && window.scrollTo(0, 0)}
                <Profile
                  isVotingPlayer={isVotingPlayer}
                  setIsVotingPlayer={setIsVotingPlayer}
                />
              </>
            )}
            {activeTab ===
              'messages' +
                (userTabsData?.messagecount
                  ? `(${userTabsData?.messagecount})`
                  : '') && <Messages />}
            {/* {activeTab === 'nft’s' && (
              <Nfts playerData={getPlayerDetailsSuccessData} />
            )} */}
            {activeTab ===
              'votes' +
                (userTabsData?.itemcount
                  ? `(${userTabsData?.votecount})`
                  : '') && <Votes />}
            {activeTab ===
              'drafts' +
                (userTabsData?.draftedycount
                  ? `(${userTabsData?.draftedycount})`
                  : '') && <Drafts />}
            {activeTab === 'members' && <Supporters />}
            {activeTab ===
              'items' +
                (userTabsData?.itemcount
                  ? `(${userTabsData?.itemcount})`
                  : '') && <PlayerShop />}
          </>
        )}
      </>
    </section>
  )
}

export default PlayerDetailForm
