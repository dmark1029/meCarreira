/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect, useContext, useCallback } from 'react'
import SearchBar from '@components/SearchBar'
import PlayerItem from './PlayerItem'
import DialogBox from '@components/Dialog/DialogBox'
import StakedForm from './StakedForm'
import { isMobile, getCircleColor, getFlooredFixed } from '@utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPlayersBalance,
  resetPlayersBalance,
  getPlayerDetails,
  fetchPlayerWalletInfo,
  fetchPlayerTrades,
} from '@root/apis/playerCoins/playerCoinsSlice'
import {
  getPlayerCoinChart,
  resetStakingRewardXp,
  showPurchaseForm,
  getLatestTradeHistory,
  showWalletForm,
  storeBalance,
} from '@root/apis/onboarding/authenticationSlice'
import { RootState } from '@root/store/rootReducers'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { getUsdRate } from '@root/apis/purchase/purchaseSlice'
import {
  fetchPlayerCoinStats,
  fetchPlayersStatsHT,
} from '@root/apis/playerStats/playerStatsSlice'
import SendAsset from '../MyWallet/SendAsset'
import { ConnectContext } from '@root/WalletConnectProvider'
import {
  sendMaticsReset,
  showStakingForm,
} from '@root/apis/onboarding/authenticationSlice'
import { ethers } from 'ethers'
import MultiChart from '@components/MultiChart'
import PeriodBar from '@components/PeriodBar'
import BottomPopup from '@components/Dialog/BottomPopup'
import classnames from 'classnames'
// mui
import { Dialog } from '@material-ui/core'
import Stack from '@mui/material/Stack'
// css
import '@assets/css/pages/Wallet.css'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import debounce from 'lodash.debounce'
import { useWalletHelper } from '@utils/WalletHelper'
import ImageComponent from '@components/ImageComponent'
import usdc from '@assets/images/usdc.webp'
import bitcoin from '@assets/images/wrapped-bitcoin.webp'
import tether from '@assets/images/tether.webp'
import ethereum from '@assets/images/ethereum-eth.webp'
import maticIcon from '@assets/images/matic-token-icon.webp'
import CloseAbsolute from '@components/Form/CloseAbsolute'

let intervalId: any = null
let usdRateInterval: any = null
interface Props {
  onChartView: any
}

const PlayerCoins: React.FC<Props> = ({ onChartView }) => {
  const [showFormPopup, setShowFormPopup] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [optedId, setOptedId] = useState(NaN)
  const [traverseTokens, setTraverseTokens] = useState([])
  const [isSendCoin, setSendCoin] = useState<boolean>(false)
  const [isLoadingMatic, setLoadingMatic] = useState(false)
  const [isShowMoreInfo, setIsShowMoreInfo] = useState(false)
  const [playerMoreInfo, setPlayerMoreInfo] = useState(null)
  const [playerDetails, setPlayerDetails] = useState(null)
  const [txnHash, setTxnHash] = useState('')
  const [txnError, setTxnError] = useState('')
  const [stakee, setStakee] = useState(-1)
  const [sendData, setSendData] = useState<any>(null)
  const [chartView, setChartView] = useState(false)
  const [xAxisData, setXAxisData] = useState<any>([])
  const [series, setSeries] = useState([])
  const [coinAction, setCoinAction] = useState('')
  const [chartPeriod, setChartPeriod] = useState('7D')
  const dispatch = useDispatch()
  const loginInfo = localStorage.getItem('loginInfo')
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const playerStatsData = useSelector((state: RootState) => state.playerstats)
  const { fetchPlayerCoinStatsData, fetchPlayerStatsRateDataHT } =
    playerStatsData
  const purchaseData = useSelector((state: RootState) => state.purchases)
  const { usdRate } = purchaseData
  const { t } = useTranslation()
  const {
    fetchBalancePlayersProgress,
    fetchBalancePlayersSuccess,
    fetchBalancePlayersData,
    fetchBalancePlayersError,
    isStakingOnlySelected,
    getPlayerDetailsSuccessData,
    playerWalletLowestPrice,
    isLoadingPlayerWalletInfo,
    playerWalletAveragePrice,
    playerWalletPrice,
    playerTradeHistory,
  } = playerCoinData
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    userWalletData: { address },
    playerCoinChartData,
    isGetPlayerCoinChartSuccess,
    loadingChart,
    stakingRewardXpData,
    selectedThemeRedux,
    walletAddress,
    currencyListData: { payment_options, contract_abi },
    gasFeeIncreasePercentage,
  } = authenticationData
  const { token = [] } = fetchBalancePlayersData

  const { getBalance, sendWithWallet, sendTokenWithWallet } = useWalletHelper()
  const [tokenList, setTokenList] = useState<any>([
    {
      ticker: 'MATIC',
      name: 'Polygon',
      balance: '0.00',
      decimals: 18,
      isCoin: true,
    },
  ])

  const MATIC = fetchBalancePlayersData?.matic ?? 0
  const [WETH, setWETH] = useState('0.00000')
  const [USDT, setUSDT] = useState('0.00000')
  const [USDC, setUSDC] = useState('0.00000')
  const [WBTC, setWBTC] = useState('0.00000')
  const [isFetchedBalance, setIsFetchedBalance] = useState(false)

  const { getWeb3Provider } = useWalletHelper()

  const balanceOfCurrencyList = async el => {
    const currencyContract = el?.contract
    const ticker = el?.ticker

    if (loginInfo) {
      const web3Provider = await getWeb3Provider()

      const providerSigner = web3Provider.getSigner(loginInfo!)
      const playerContract = new ethers.Contract(
        currencyContract, // contract address of Router
        contract_abi, //  contract abi of Router
        providerSigner,
        // provider.getSigner(loginInfo!),
      )

      try {
        const balanceTx = await playerContract.balanceOf(loginInfo)
        const balance =
          parseInt(balanceTx._hex) / Math.pow(10, el?.decimals ?? 0)

        const balance1 = balance.toString()

        if (ticker === 'WETH') {
          // console.log('Currency', parseFloat(balance1).toFixed(5), balance1)

          balance1 === '0'
            ? setWETH('0.00000')
            : // : setWETH(parseFloat(balance1).toFixed(5))
              setWETH(parseFloat(balance1) + '')
          dispatch(
            storeBalance({
              ticker: ticker,
              balance:
                balance1 === '0' ? '0.00000' : parseFloat(balance1).toFixed(5),
            }),
          )
        } else if (ticker === 'USDT') {
          balance1 === '0'
            ? setUSDT('0.00000')
            : setUSDT(parseFloat(balance1).toFixed(5))
          dispatch(
            storeBalance({
              ticker: ticker,
              balance:
                balance1 === '0' ? '0.00000' : parseFloat(balance1).toFixed(5),
            }),
          )
        } else if (ticker === 'USDC') {
          balance1 === '0'
            ? setUSDC('0.00000')
            : setUSDC(parseFloat(balance1).toFixed(5))
          dispatch(
            storeBalance({
              ticker: ticker,
              balance:
                balance1 === '0' ? '0.00000' : parseFloat(balance1).toFixed(5),
            }),
          )
        } else if (ticker === 'WBTC') {
          balance1 === '0'
            ? setWBTC('0.00000')
            : setWBTC(parseFloat(balance1).toFixed(5))
          dispatch(
            storeBalance({
              ticker: ticker,
              balance:
                balance1 === '0' ? '0.00000' : parseFloat(balance1).toFixed(5),
            }),
          )
          setIsFetchedBalance(true)
        }
      } catch (err: any) {
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
      }
    }
  }
  useEffect(() => {
    if (payment_options) {
      if (loginInfo) {
        payment_options?.map(el => balanceOfCurrencyList(el))
      }
    }
  }, [payment_options])

  useEffect(() => {
    if (isFetchedBalance) {
      if (loginInfo) {
        let oldBalance = fetchBalancePlayersData
          ? fetchBalancePlayersData?.currency_24h_USD_balance['matic']
          : 0
        let usdBalance = usdRate * MATIC
        let pctChange = oldBalance > 0 ? (usdBalance / oldBalance - 1) * 100 : 0
        const list = [
          {
            ticker: 'MATIC',
            name: 'Polygon',
            balance: MATIC,
            stakingbalance: 0,
            decimals: 18,
            pctChange,
            isCoin: true,
          },
        ]
        payment_options?.map(el => {
          const balance =
            el?.ticker === 'WETH'
              ? WETH
              : el?.ticker === 'USDT'
              ? USDT
              : el?.ticker === 'USDC'
              ? USDC
              : WBTC
          usdBalance = fetchBalancePlayersData
            ? fetchBalancePlayersData?.currency_USD_rate_dict[el?.contract] *
              parseFloat(balance)
            : 0
          oldBalance = fetchBalancePlayersData
            ? fetchBalancePlayersData?.currency_24h_USD_balance[el?.contract]
            : 0
          pctChange =
            oldBalance > 0 ? (parseFloat(balance) / oldBalance - 1) * 100 : 0
          if (parseFloat(balance) > 0) {
            list.push({
              ...el,
              balance,
              stakingbalance: 0,
              pctChange,
              isCoin: true,
            })
          }
        })
        setTokenList(list)
      }
    }
  }, [isFetchedBalance, fetchBalancePlayersData])

  const getTokenStatData = (ticker: any) => {
    if (ticker === 'MATIC') {
      if (usdRate > 0) {
        return {
          coin_issued: '000',
          matic: 1,
          usd_rate: usdRate,
        }
      }
    } else {
      if (fetchBalancePlayersData?.currency_USD_rate_dict) {
        return {
          coin_issued: '000',
          matic: 1,
          usd_rate: fetchBalancePlayersData?.currency_USD_rate_dict[ticker],
        }
      }
    }
    return {
      coin_issued: '000',
      matic: '000',
      usd_rate: '000',
    }
  }

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

  const handleClose = (event: any) => {
    event.stopPropagation()
    if (stakingRewardXpData) {
      dispatch(resetStakingRewardXp())
    }
    setShowFormPopup(false)
    setStakee(-1)
    const reqParams = {
      address: loginInfo || address,
    }
    dispatch(fetchPlayersBalance(reqParams))
  }

  const handleStake = (item: any, playerItem: any) => {
    clearInterval(usdRateInterval)
    setPlayerDetails(playerItem)
    dispatch(showWalletForm({}))
    dispatch(
      showStakingForm({
        playerData: playerItem,
      }),
    )
  }
  const handleSearch = (value: string | undefined) => {
    const traverseTemp: any = []
    let i: number
    const filter = value?.toUpperCase()

    for (i = 0; i < token?.length; i++) {
      if (token[i]?.name?.toUpperCase()?.indexOf(filter) > -1) {
        traverseTemp?.push(token[i])
      } else {
        traverseTemp?.filter((item: any) => item?.name === token[i]?.name)
      }
    }
    setTraverseTokens(traverseTemp)
  }
  const optimizedHandleSearch = useCallback(debounce(handleSearch, 500), [])
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
    if (traverseTokens.length > 0 && !playerDetails) {
      const tokensSet: any = traverseTokens.map((item: any) => item?.contract)
      dispatch(
        fetchPlayersStatsHT({
          contracts: tokensSet,
          query: 'simple',
        }),
      )
      clearInterval(usdRateInterval)
      usdRateInterval = setInterval(() => {
        dispatch(
          fetchPlayersStatsHT({
            contracts: tokensSet,
            query: 'simple',
          }),
        )
      }, 20000)
    }
  }, [traverseTokens, playerDetails])

  const handleGetPriceStats = () => {
    const playersSet: number[] = token.map((item: any) => item?.contract)
    if (playersSet?.length > 0) {
      dispatch(fetchPlayerCoinStats(playersSet))
    }
  }

  useEffect(() => {
    dispatch(getUsdRate())
    const _getBalance = async () => {
      if (loginInfo) {
        await getBalance()
      }
    }
    _getBalance()
    return () => {
      clearInterval(intervalId)
      clearInterval(usdRateInterval)
      // dispatch(resetPlayersBalance())
      // if (document.getElementById('walletModalContent')) {
      //   document.getElementById('walletModalContent').style.width = '375px'
      //   document.getElementById('walletModalContent').style.height = '790px'
      //   document.getElementsByClassName('wallet-container')[0].style.height =
      //     '100%'
      // }
    }
  }, [])

  useEffect(() => {
    const reqParams = {
      address: loginInfo || address,
    }
    clearInterval(intervalId)
    setTraverseTokens([])
    dispatch(fetchPlayersBalance(reqParams))
  }, [isStakingOnlySelected])

  useEffect(() => {
    if (token?.length > 0) {
      if (!hasCompleted) {
        handleGetPriceStats()
        setHasCompleted(true)
      }
      clearInterval(intervalId)
      intervalId = setInterval(() => {
        handleGetPriceStats()
      }, 20000)
      setTraverseTokens(token)
    }
  }, [token])

  useEffect(() => {
    clearInterval(usdRateInterval)
    clearInterval(intervalId)
    if (!document.hidden) {
      if (traverseTokens.length > 0 && !playerDetails) {
        usdRateInterval = setInterval(() => {
          const tokensSet: any = traverseTokens.map(
            (item: any) => item?.contract,
          )
          dispatch(
            fetchPlayersStatsHT({
              contracts: tokensSet,
              query: 'simple',
            }),
          )
        }, 20000)
      }
      if (token?.length > 0) {
        intervalId = setInterval(() => {
          handleGetPriceStats()
        }, 20000)
      }
    }
  }, [document.hidden])

  const onMoreClick = (checked: boolean, id: number) => {
    if (checked) {
      setOptedId(id)
    } else {
      setOptedId(NaN)
    }
  }
  const getStatData = (playerContract: any) => {
    let index = null
    if (fetchPlayerCoinStatsData && fetchPlayerCoinStatsData.length > 0) {
      index = fetchPlayerCoinStatsData?.findIndex((item: any) => {
        if (item.player && playerContract) {
          return (
            ethers.utils.getAddress(item?.player) ===
            ethers.utils.getAddress(playerContract)
          )
        } else {
          return -1
        }
      })
      if (index > -1) {
        return {
          coin_issued: fetchPlayerCoinStatsData[index]?.coin_issued,
          matic: fetchPlayerCoinStatsData[index]?.matic,
          usd_rate: fetchPlayerCoinStatsData[index]?.exchangeRateUSD?.rate,
        }
      } else {
        return {
          coin_issued: '', //fetchPlayerCoinStatsData[0]?.coin_issued,
          matic: '', //fetchPlayerCoinStatsData[0]?.matic,
          usd_rate: '', //fetchPlayerCoinStatsRateData[0]?.exchangeRateUSD?.rate,
        }
      }
    }

    return {
      coin_issued: '000',
      matic: '000',
      usd_rate: '000',
    }
  }

  const handleContainerClick = (evt: any) => {
    evt.preventDefault()
    setOptedId(NaN)
  }

  useEffect(() => {
    if (getPlayerDetailsSuccessData && ['BUY', 'SELL'].includes(coinAction)) {
      dispatch(showWalletForm({}))
      dispatch(
        showPurchaseForm({
          mode: coinAction,
          playerData: getPlayerDetailsSuccessData,
        }),
      )
    }
  }, [getPlayerDetailsSuccessData])

  const handlePlayerCallback = (val: string, data: any) => {
    setCoinAction(val.toUpperCase())
    if (val === 'send') {
      setSendCoin(true)
      setSendData(data)
    } else if (val === 'buy' || val === 'sell') {
      if (data?.detailpageurl) {
        dispatch(getPlayerDetails(data?.detailpageurl))
      }
    } else if (val === 'more') {
      setIsShowMoreInfo(true)
      setPlayerMoreInfo(data)
      dispatch(fetchPlayerWalletInfo(data?.contract))
      dispatch(fetchPlayerTrades(data?.contract))
    }
  }

  useEffect(() => {
    console.log('send_data_changed:', { sendData })
  }, [sendData])

  const handleCloseSecret = () => {
    setSendCoin(false)
  }

  const handleCloseBottomPopup = () => {
    setLoadingMatic(false)
    setSendCoin(false)
    setTxnHash('')
    setTxnError('')
    // setSendData(null)
    const reqParams = {
      address: loginInfo || address,
    }
    dispatch(fetchPlayersBalance(reqParams))
  }

  const handleFetchTransactionData = (data: any) => {
    setTxnHash('')
    setTxnError('')
    setLoadingMatic(true)
    if (loginInfo) {
      if (data.assetType === 'MATIC') {
        sendWithWallet(
          data.to_address,
          data.amount,
          txnHash => {
            setLoadingMatic(false)
            setTxnHash(txnHash)
          },
          err => {
            setLoadingMatic(false)
            console.log('send wallet', err)
            if (`${err}`.includes('gas required exceeds allowance')) {
              setTxnError('Insufficient funds to pay Gas fees')
            }
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
          },
        )
      } else if (['WETH', 'USDT', 'USDC', 'WBTC'].includes(data.assetType)) {
        sendCurrencyWithWallet(
          data?.assetType,
          data?.to_address,
          data?.amount,
          txnHash => {
            setLoadingMatic(false)
            setTxnHash(txnHash)
          },
          error => {
            setLoadingMatic(false)
            setTxnError(error.message)
          },
        )
      } else {
        sendTokenWithWallet(
          data.to_address,
          // sendData.contract,
          sendData.address,
          data.amount,
          loginInfo,
          (txnHash: any) => {
            setLoadingMatic(false)
            setTxnHash(txnHash)
          },
          (err: any) => {
            setLoadingMatic(false)
            if (`${err}`.includes('gas required exceeds allowance')) {
              setTxnError('Insufficient funds to pay Gas fees')
            }
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
          },
        )
      }
    } else {
      dispatch(sendMaticsReset())
    }
  }

  const sendCurrencyWithWallet = async (
    assetType: string,
    receiverAddress: string,
    amount: number,
    successCallback?: any,
    errorCallBack?: any,
  ) => {
    let currencyContractTran
    for (let i = 0; i < payment_options?.length; i++) {
      if (payment_options[i]?.ticker === assetType) {
        currencyContractTran = payment_options[i]?.contract
      }
    }
    const provider = await getWeb3Provider()
    const tokenContract = new ethers.Contract(
      currencyContractTran, // player contract address of the player coin
      contract_abi, // player contract abi of the player coin
      provider.getSigner(loginInfo!), // signer of the currently logged in user wallet address
    )
    let valueAmount: any = amount
    const decimalIndex = payment_options.findIndex(
      item => item.ticker === assetType,
    )
    console.log({ decimalIndex })
    if (decimalIndex > -1) {
      valueAmount = ethers.utils
        .parseUnits(amount.toString(), payment_options[decimalIndex]?.decimals)
        .toHexString()
    } else {
      if (assetType === 'WBTC') {
        valueAmount = ethers.utils.hexlify(amount * 100000000)
      } else {
        valueAmount = ethers.utils.parseEther(amount.toString())._hex
      }
    }
    try {
      const txn = await tokenContract.transfer(receiverAddress, valueAmount, {
        gasLimit: ethers.utils.hexlify(
          2000000 * ((gasFeeIncreasePercentage + 100) / 100),
        ),
      })
      successCallback(txn.hash)
    } catch (err: any) {
      errorCallBack(err.reason || err.message)
    }
  }

  const handleSelectForStake = (coin: any, index: number) => {
    setStakee(index)
  }

  const handleChartView = () => {
    if (!isMobile()) {
      if (!chartView) {
        document.getElementById('walletModalContent').style.width =
          window.innerWidth >= 800 ? '60%' : `${window.innerWidth - 65}px`
        document.getElementById('walletModalContent').style.height = '70vh'
      } else {
        document.getElementById('walletModalContent').style.width = '375px'
        document.getElementById('walletModalContent').style.height = '790px'
        document.getElementsByClassName('wallet-container')[0].style.height =
          '100%'
      }
    }
    setTimeout(() => setChartView(!chartView), chartView ? 0 : 500)
    onChartView()
  }

  useEffect(() => {
    if (showFormPopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [showFormPopup])

  return (
    <>
      <div className="wallet-player-coins" style={{ width: '100%' }}>
        {!chartView && (
          <SearchBar
            isSwitchEnabled={true}
            mode="wallet"
            onEdit={optimizedHandleSearch}
            onClose={() => handleSearch('')}
            isFilterDisabled
          />
        )}
        {showFormPopup ? (
          <DialogBox
            isOpen={showFormPopup}
            onClose={handleClose}
            contentClass=""
            closeBtnClass="close-purchase"
          >
            <StakedForm playerData={playerDetails} />
          </DialogBox>
        ) : null}
        {isSendCoin ? (
          <SendAsset
            mode="playercoin"
            playerData={sendData}
            isOpen={isSendCoin}
            onSend={handleFetchTransactionData}
            onCloseSend={handleCloseSecret}
            onClose={handleCloseBottomPopup}
            txnError={txnError}
            txnHash={txnHash}
            isLoadingMatic={isLoadingMatic}
          />
        ) : null}
        {chartView ? (
          <div>
            {!isMobile() && (
              <div className="chart-modal-body-content">
                <Stack direction={'column'} justifyContent="center">
                  {loadingChart ? (
                    <div
                      className="balance-progress"
                      style={{ width: '100%', height: 'calc(60vh - 40px)' }}
                    >
                      <div
                        className={classnames(
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
                          style={{ width: '100%', height: 'calc(60vh - 40px)' }}
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
            )}
          </div>
        ) : (
          <div
            className={classNames(
              'dlg-content border-top m-0',
              'token-wrapper',
            )}
            style={{
              height: isMobile() ? 'calc(100vh - 190px)' : '560px',
              padding: isMobile() ? '0px 10px' : 'unset',
            }}
            onClick={handleContainerClick}
          >
            {!isStakingOnlySelected &&
              fetchBalancePlayersData &&
              tokenList?.length > 0 &&
              tokenList?.map((item: any, index: number) => (
                <PlayerItem
                  isSendOpen={isSendCoin}
                  item={item}
                  activeIndex={-1}
                  key={index}
                  index={index}
                  statData={getTokenStatData(item?.ticker)}
                  handleStake={() => {}}
                  handleMoreClick={() => {}}
                  isOpted={optedId === index}
                  playerItemcallBack={(value: string) =>
                    handlePlayerCallback(value, item)
                  }
                  usdRate={fetchPlayerStatsRateDataHT.rate}
                  onStake={() => {}}
                  onCancelStake={() => {}}
                />
              ))}
            {fetchBalancePlayersData && traverseTokens?.length > 0 ? (
              traverseTokens?.map((item: any, index: number) => (
                <PlayerItem
                  isSendOpen={isSendCoin}
                  item={item}
                  activeIndex={stakee}
                  key={index}
                  index={index}
                  statData={getStatData(item?.contract)}
                  handleStake={(playerDetails: any) =>
                    handleStake(item, playerDetails)
                  }
                  handleMoreClick={checked => onMoreClick(checked, index)}
                  isOpted={optedId === index}
                  playerItemcallBack={(value: string) =>
                    handlePlayerCallback(value, item)
                  }
                  usdRate={fetchPlayerStatsRateDataHT.rate}
                  onStake={() => handleSelectForStake(item, index)}
                  onCancelStake={() => setStakee(-1)}
                />
              ))
            ) : (
              <div
                className="checkout-loader-wrapper"
                style={{
                  height: '100%',
                  overflowX: 'hidden',
                  minHeight: 'unset',
                }}
              >
                {((((fetchBalancePlayersProgress &&
                  !fetchBalancePlayersSuccess) ||
                  !fetchPlayerCoinStatsData?.length) &&
                  !fetchBalancePlayersError) ||
                  !fetchBalancePlayersData) && (
                  <>
                    {fetchBalancePlayersSuccess &&
                    traverseTokens?.length === 0 ? (
                      <div></div>
                    ) : (
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
        <Dialog
          open={chartView && isMobile()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth={'md'}
          className="chart-dialog"
        >
          <div className="chart-modal-body">
            <div className="chart-modal-body-content">
              <Stack direction={'column'} justifyContent="center">
                {series.length > 1 ? (
                  <div className="chart">
                    <MultiChart
                      xAxisData={xAxisData}
                      series={series}
                      chartOption={'Balance'}
                    />
                    <PeriodBar
                      chartPeriod={chartPeriod}
                      setChartPeriod={setChartPeriod}
                    />
                  </div>
                ) : (
                  <div
                    className="blog-title yellow-color"
                    style={{ width: '700px', height: '300px' }}
                  >
                    {t('no data yet')}
                  </div>
                )}
                <div
                  className="mobile-back-button chart-back-button"
                  onClick={handleChartView}
                >
                  <ArrowBackIcon />
                </div>
              </Stack>
            </div>
          </div>
        </Dialog>
        <BottomPopup
          mode={`wallet ${isMobile() ? 'exwallet-bottomwrapper' : ''}`}
          isOpen={isShowMoreInfo}
          contentClass="currency_drop_container-send"
          onClose={() => {
            setIsShowMoreInfo(false)
          }}
        >
          {/* <CloseAbsolute
            onClose={() => {
              setIsShowMoreInfo(false)
            }}
          /> */}
          <div className="asset-info-container">
            <div
              className="wallet-flex-container"
              style={{ marginTop: 18, marginBottom: 10 }}
            >
              <div className="asset-info-avatar-wrapper">
                <div
                  className="image-border pc-avatar-container"
                  style={{
                    background: getCircleColor(playerMoreInfo?.playerlevelid),
                  }}
                >
                  <ImageComponent
                    loading="lazy"
                    src={
                      playerMoreInfo?.ticker === 'MATIC'
                        ? maticIcon
                        : playerMoreInfo?.ticker === 'WETH'
                        ? ethereum
                        : playerMoreInfo?.ticker === 'USDT'
                        ? tether
                        : playerMoreInfo?.ticker === 'USDC'
                        ? usdc
                        : playerMoreInfo?.ticker === 'WBTC'
                        ? bitcoin
                        : playerMoreInfo?.playerpicture ||
                          playerMoreInfo?.playerpicturethumb
                    }
                    alt=""
                    className="nft-image"
                    onClick={() => console.log('2222')}
                  />
                </div>
                <div className="nft-name">
                  {playerMoreInfo?.name}
                  {playerMoreInfo?.ticker}
                </div>
              </div>
              {isLoadingPlayerWalletInfo ? (
                <span
                  className="nft-name skeleton"
                  style={{ width: '60px', height: '20px', marginRight: 20 }}
                ></span>
              ) : (
                <div
                  className="nft-name"
                  style={{ color: '#FFF', fontSize: 24, paddingRight: 20 }}
                >
                  {playerWalletPrice?.toFixed(4)}
                </div>
              )}
            </div>
            <div className="price-container">
              <span>{t('Average entry price')}</span>
              {isLoadingPlayerWalletInfo ? (
                <span
                  className="skeleton"
                  style={{ width: '60px', height: '20px' }}
                ></span>
              ) : (
                <span>${playerWalletAveragePrice?.toFixed(4)}</span>
              )}
            </div>
            <div className="price-container">
              <span>{t('Lowest entry price')}</span>
              {isLoadingPlayerWalletInfo ? (
                <span
                  className="skeleton"
                  style={{ width: '60px', height: '20px' }}
                ></span>
              ) : (
                <span>${playerWalletLowestPrice?.toFixed(4)}</span>
              )}
            </div>

            <div className="asset-info-title">{t('Transaction History')}</div>
            <div className="tx-history-container">
              {playerTradeHistory?.length > 0 &&
                playerTradeHistory?.map(tradeItem => (
                  <div style={{ padding: '10px 14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        className={classNames(
                          'trade-amount',
                          tradeItem?.direction > 0 &&
                            (tradeItem?.amt ?? tradeItem?.amountcoins) > 0
                            ? 'green-color '
                            : 'red-color ',
                        )}
                      >
                        {tradeItem?.amountcoins} ${tradeItem?.ticker}
                      </span>
                      <span
                        className={classNames(
                          'trade-amount',
                          tradeItem?.direction > 0 &&
                            (tradeItem?.amt ?? tradeItem?.amountcoins) > 0
                            ? 'green-color '
                            : 'red-color ',
                        )}
                      >
                        {getFlooredFixed(tradeItem?.totalamountusd, 3)} USD
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>
                        {tradeItem?.tradetimestamp?.replace('T', ' ')}
                      </span>
                      <span style={{ fontSize: 16 }}>
                        {getFlooredFixed(
                          tradeItem?.totalamountusd / tradeItem?.amountcoins,
                          2,
                        )}
                        /$
                        {tradeItem?.ticker}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            {/* <div
              className="nft-close-link mt-20 mb-0 m-0auto"
              onClick={() => {
                setIsShowMoreInfo(false)
              }}
              style={{ position: 'absolute', bottom: '26px', left: '45%' }}
            >
              {t('close')}
            </div> */}
          </div>
        </BottomPopup>
        {chartView ? (
          <div className="chart-back-button" onClick={handleChartView}>
            <ArrowBackIcon />
          </div>
        ) : (
          <div className="chart-view-button" onClick={handleChartView} />
        )}
      </div>
    </>
  )
}

export default PlayerCoins
