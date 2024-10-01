import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import {
  getOpenVoteList,
  getOpenVoteListInit,
  getVoteInfo,
  vote,
} from '@root/apis/playerCoins/playerCoinsSlice'
import {
  getVotePercentage,
  isMobile,
  displayDate,
  getFlooredFixed,
} from '@utils/helpers'
import DialogBox from '@components/Dialog/DialogBox'
import Web3BottomPopup from '@components/Dialog/Web3BottomPopup'
import classNames from 'classnames'
import {
  setCurTab,
  showSignupForm,
} from '@root/apis/onboarding/authenticationSlice'
import toast from 'react-hot-toast'
import HotToaster from '@components/HotToaster'
import '@assets/css/components/ComingSoon.css'
import SubmitButton from '@components/Button/SubmitButton'
import ApiBottomPopup from '@components/Dialog/ApiBottomPopup'
import { useWalletHelper } from '@utils/WalletHelper'

interface Props {
  playercontract: string
  ticker: string
}
const VotingPolls: React.FC<Props> = ({ playercontract, ticker }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [countDownDate, setCountDownDate] = useState(-1)
  const [showPopup, setShowPopup] = useState(false)
  const [showBottomPopup, setShowBottomPopup] = useState(false)
  const [txnHash, setTxnHash] = useState<string>('')
  const [txnErr, setTxnErr] = useState('')
  const [option, setOption] = useState(-1)

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const { stakingBalance } = useSelector(
    (state: RootState) => state.playercoins,
  )
  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')

  const [openVoteInfo, setOpenVoteInfo] = useState([])

  const {
    isLoading,
    openVoteList,
    voteInfo,
    player1contract,
    stakingcontract,
    stakingcontractabi,
    isGetOpenVoteListSuccess,
    isGetVoteInfoSuccess,
  } = playerCoinData
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const { selectedThemeRedux, playerShareHold } = authenticationData

  const votingPower =
    openVoteInfo.reduce((acc, curr) => acc + (curr?.uservotesum ?? 0), 0) > 0
      ? getFlooredFixed(
          (openVoteInfo.reduce(
            (acc, curr) => acc + (curr?.uservotesum ?? 0),
            0,
          ) /
            openVoteInfo[0]?.votesumtotal) *
            100,
          2,
        )
      : stakingBalance > 0
      ? getFlooredFixed(
          (stakingBalance / (stakingBalance + openVoteInfo[0]?.votesumtotal)) *
            100,
          2,
        )
      : playerShareHold > 0
      ? getFlooredFixed(
          (playerShareHold /
            (playerShareHold + openVoteInfo[0]?.votesumtotal)) *
            100,
          2,
        )
      : 0

  const { getStakingContract } = useWalletHelper()

  useEffect(() => {
    if (isGetVoteInfoSuccess) {
      setOpenVoteInfo(voteInfo)
    }
  }, [isGetVoteInfoSuccess])

  let countDown: any = null
  const [state, setState] = useState({
    days: '0',
    hours: '0',
    minutes: '0',
    seconds: '0',
  })

  const updateState = (data: any) => {
    setState(state => ({ ...state, ...data }))
  }

  const initCountDown = () => {
    countDown = setInterval(function () {
      const now = new Date().getTime()
      const distance = countDownDate < now ? 0 : countDownDate - now
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (distance < 0) {
        clearInterval(countDown)
        updateState({
          days: '0',
          hours: '0',
          minutes: '0',
          seconds: '0',
        })
      } else {
        updateState({
          days,
          hours,
          minutes,
          seconds,
        })
      }
    }, 1000)
  }

  useEffect(() => {
    dispatch(getOpenVoteList(playercontract))
    return () => {
      dispatch(getOpenVoteListInit())
      clearInterval(countDown)
    }
  }, [])

  useEffect(() => {
    if (isGetOpenVoteListSuccess && openVoteList.length > 0) {
      if (openVoteList[0]?.votelaunchdate) {
        const endDate = new Date(openVoteList[0]?.blockdeadline).getTime()
        if (endDate > new Date().getTime()) {
          setCountDownDate(endDate)
        }
      }
      let param =
        'vote_id=' + openVoteList[0]?.voteid + '&contract=' + playercontract
      if (loginInfo) {
        param += '&walletaddress=' + loginInfo
      }
      if (param) {
        dispatch(getVoteInfo(param))
      }
    }
  }, [isGetOpenVoteListSuccess])

  useEffect(() => {
    if (countDownDate > -1) {
      if (countDown) {
        clearInterval(countDown)
      }
      initCountDown()
    }
  }, [countDownDate])

  const handleVoteAction = (arg: number) => {
    if (!loginInfo && !loginId) {
      dispatch(showSignupForm())
      return
    }
    if (countDownDate <= 0) {
      toast.error(t('voting is already ended'))
      return
    }
    if (voteInfo.filter((item: any) => item.hasivoted === 1).length > 0) {
      return
    }
    if (stakingBalance <= 0) {
      toast.error(t('please buy and stake tokens to vote'))
      return
    }
    if (!stakingcontract) {
      return
    }
    setShowPopup(true)
    setOption(arg)
  }

  const handleVote = async () => {
    setShowBottomPopup(true)
    if (localStorage.getItem('loginId')) {
      return
    }
    const stakingContract = await getStakingContract(
      stakingcontract,
      stakingcontractabi,
    )
    stakingContract
      ?.vote(option)
      .then(async (txn: any) => {
        setTxnHash(txn.hash)
      })
      .catch((err: any) => {
        const isErrorGasEstimation = `${err}`.includes('cannot estimate gas')
        if (err.message === '406') {
          setTxnErr(t('this functionality unavailable for internal users'))
        }
        if (isErrorGasEstimation) {
          setTxnErr(t('not enough funds to pay for blockchain transaction'))
        } else {
          console.log(err.reason || err.message)
          setTxnErr(t('transaction failed'))
        }
      })
  }

  const handleVoteApi = (user_secret: any) => {
    const locationUrl = window.location.href
    const urlPlayer = locationUrl.split('/')
    const formData = new FormData()
    formData.append('options', option.toString())
    formData.append('user_secret', user_secret)
    formData.append('detail_page_url', urlPlayer[urlPlayer.length - 1])
    dispatch(vote(formData))
  }

  const handleClose = () => {
    setShowBottomPopup(false)
    setTxnErr('')
    setTxnHash('')
    // setShowPopup(false)
    handleCloseVotePopup()
  }

  useEffect(() => {
    if (txnHash) {
      try {
        dispatch(getOpenVoteList(player1contract))
        if (openVoteList.length > 0) {
          let param =
            'vote_id=' + openVoteList[0]?.voteid + '&contract=' + playercontract
          if (loginInfo) {
            param += '&walletaddress=' + loginInfo
          }
          if (param) {
            dispatch(getVoteInfo(param))
          }
        }
      } catch (error) {
        console.log('voting_poll_err', error)
      }
    }
  }, [txnHash])

  useEffect(() => {
    if (showPopup || showBottomPopup) {
      document.body.style.overflow = 'hidden'
      if (isMobile()) {
        document.body.style.position = 'fixed'
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
    }
  }, [showPopup, showBottomPopup])

  const handleCloseVotePopup = () => {
    setShowPopup(false)
    if (openVoteList.length > 0) {
      let param =
        'vote_id=' + openVoteList[0]?.voteid + '&contract=' + playercontract
      if (loginInfo) {
        param += '&walletaddress=' + loginInfo
      }
      if (param) {
        dispatch(getVoteInfo(param))
      }
    } else {
      console.log('hcv_openvotelist_empty')
    }
  }

  return (
    <>
      {isLoading ? (
        // <section className="profile-voting-section">
        //   <div
        //     className={classNames(
        //       'loading-spinner-container mb-40 mt-40',
        //       isLoading ? 'show' : '',
        //     )}
        //   >
        //     <div className="loading-spinner">
        //       <div className="spinner"></div>
        //     </div>
        //   </div>
        // </section>
        <></>
      ) : openVoteList.length > 0 ? (
        <section className="profile-voting-section">
          <HotToaster />
          {showPopup && (
            <DialogBox
              isOpen={showPopup}
              // onClose={() => {
              //   setShowPopup(false)
              // }}
              onClose={() => handleCloseVotePopup()}
              contentClass={classNames(
                'onboarding-popup',
                isMobile() ? 'mobile-popup' : '',
              )}
            >
              {!showBottomPopup ? (
                <div className="confirm-voting-container">
                  <div className="new-draft-title">
                    {t('you are about to vote ')}
                    <br />
                    <div className="vote_info">
                      {voteInfo[option].selectiontext}
                    </div>
                    {t('do you want to continue?')}
                  </div>
                  <div className="mt-60">
                    <SubmitButton
                      title={t('yes')}
                      className="m-0auto mt-20"
                      onPress={handleVote}
                    />
                    <SubmitButton
                      title={t('no')}
                      className="m-0auto mt-20 btn-disabled"
                      onPress={() => setShowPopup(false)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="nft-tab-title pt-50">
                    {t('please wait')}...
                  </div>
                  {localStorage.getItem('loginInfo') ? (
                    <Web3BottomPopup
                      showPopup={showBottomPopup}
                      txnHash={txnHash}
                      txnErr={txnErr}
                      onClose={handleClose}
                    />
                  ) : (
                    <ApiBottomPopup
                      showPopup={showBottomPopup}
                      onSubmit={handleVoteApi}
                      onClose={handleClose}
                      customClass="purchase-pc-bottomwrapper"
                    />
                  )}
                </>
              )}
            </DialogBox>
          )}
          <div className="blog-title" style={{ marginBottom: '30px' }}>
            {t('open voting polls')}
          </div>
          <div className="open-votes-wrapper">
            <div className="voting-alert-wrapper">
              {(!loginInfo && !loginId) || playerShareHold === 0 ? (
                <div className="voting-alert-text">
                  <span
                    className="underline"
                    onClick={evt => {
                      evt.stopPropagation()
                      // dispatch(setCurTab({ curTab: 'profile' }))
                      window.scrollTo(0, 0)
                    }}
                  >{`Buy $${ticker} `}</span>
                  {`Shares and stake them to earn XP and be eligible to vote`}
                </div>
              ) : stakingBalance === 0 ? (
                <>
                  <div className="voting-alert-text">{`Stake your ${getFlooredFixed(
                    playerShareHold,
                    2,
                  )} $${ticker} Shares in order to vote`}</div>
                  <div className="voting-alert-comment">{`Your current voting power is ${votingPower}% of all votes`}</div>
                </>
              ) : openVoteInfo.filter((item: any) => item.hasivoted === 1)
                  .length === 0 ? (
                <div className="voting-alert-text">{`Your current voting power is ${votingPower}% of all votes`}</div>
              ) : (
                <div className="voting-alert-text fg-primary-color">{`Your vote currently holds ${votingPower}% of voting power`}</div>
              )}
            </div>
            <div className="open-votes-content player-dashboard-container">
              {openVoteList.map((item: any, index: number) => (
                <div
                  className="NftList-poll-container NftList-poll-closed-container"
                  key={index}
                >
                  <div className="NftList-poll-header">{item.question}</div>
                  <div className="NftList-poll-body">
                    {openVoteInfo.filter((item: any) => item.hasivoted === 1)
                      .length === 0 ? (
                      <>
                        {openVoteInfo.map(
                          (voteItem: any, detailIndex: number) => (
                            <div
                              className={classNames(
                                'NftList-poll-item',
                                selectedThemeRedux,
                              )}
                              key={detailIndex}
                              onClick={() => handleVoteAction(detailIndex)}
                            >
                              <div className="text-content">
                                <div className="text-content-left">
                                  {voteItem?.selectiontext}
                                </div>
                                <div
                                  className={classNames(
                                    'fg-primary-color capitalize text-content-right',
                                    countDownDate <= 0 ? 'voting-disabled' : '',
                                  )}
                                >
                                  {t('vote')}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </>
                    ) : (
                      <>
                        {openVoteInfo.map(
                          (voteItem: any, detailIndex: number) => (
                            <div
                              className={classNames(
                                'NftList-poll-item poll-voted',
                                voteItem.hasivoted > 0 ? 'poll-voted-item' : '',
                                selectedThemeRedux,
                              )}
                              style={{ position: 'relative' }}
                              key={detailIndex}
                            >
                              <div
                                className="grey-bar"
                                style={{
                                  width: getVotePercentage(voteItem) + '%',
                                }}
                              />
                              <div className="poll-text text-content">
                                <div className="text-content-left">
                                  {voteItem?.selectiontext}
                                </div>
                                <div className="text-content-right">
                                  {getVotePercentage(voteItem)}%
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </>
                    )}
                  </div>
                  {countDownDate > -1 && (
                    <div className="poll-countdown-container">
                      <div className="coming-soon-time-card">
                        <div className="timer">
                          <div className="heading">{t('days')}</div>
                          <div className="time">
                            {~~state.days < 10 && 0}
                            {state.days}
                          </div>
                        </div>
                        <div className="timer">
                          <div className="heading">{t('hours')}</div>
                          <div className="time">
                            {~~state.hours < 10 && 0}
                            {state.hours}
                          </div>
                        </div>
                        <div className="timer">
                          <div className="heading">{t('mins')}</div>
                          <div className="time">
                            {~~state.minutes < 10 && 0}
                            {state.minutes}
                          </div>
                        </div>
                        <div className="timer">
                          <div className="heading">{t('secs')}</div>
                          <div className="time">
                            {~~state.seconds < 10 && 0}
                            {state.seconds}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={classNames('NftList-poll-footer')}>
                    <div>
                      {t('ends')}
                      &nbsp;
                      {displayDate(item.blockdeadline)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

export default VotingPolls
