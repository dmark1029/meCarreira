import React, {
  useEffect,
  useCallback,
  useRef,
  useContext,
  useState,
} from 'react'
import ReactCanvasConfetti from 'react-canvas-confetti'
import MetamaskIcon from '@assets/icons/icon/metamask.svg'
import CoinbaseIcon from '@assets/icons/icon/coinbase.svg'
import WalletIcon from '@assets/icons/icon/wallet.webp'
import { useTranslation } from 'react-i18next'
import BottomPopup from './BottomPopup'
import classNames from 'classnames'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import {
  getTxnConfirm,
  resetTxnConfirmationData,
  setTxnConfirmError,
  setTxnConfirmSuccess,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { isMobile } from '@utils/helpers'
import ImageComponent from '@components/ImageComponent'
import { ConnectContext } from '@root/WalletConnectProvider'
import { getUserXp } from '@root/apis/onboarding/authenticationSlice'
import { BASE_EXPLORE_URL, MIN_MATIC_BALANCE } from '@root/constants'
import BalanceCheckPrompt from './BalanceCheckPrompt'
import { useWalletHelper } from '@utils/WalletHelper'
import CloseAbsolute from '@components/Form/CloseAbsolute'
interface Props {
  showPopup: boolean
  txnHash: string
  txnErr: string
  customClass?: string
  onClose: any
  // isLowBalance?: boolean
}
let txnCheckInterval: any = null

const canvasStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
} as React.CSSProperties

const Web3BottomPopup: React.FC<Props> = ({
  showPopup,
  txnHash,
  txnErr,
  onClose,
  // isLowBalance = false,
  customClass = '',
}) => {
  const { t } = useTranslation()
  const playerCoinData: any = useSelector(
    (state: RootState) => state.playercoins,
  )
  const dispatch = useDispatch()
  const { isTxnChecking, txnConfirmResp } = playerCoinData

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const { selectedThemeRedux } = authenticationData
  const { getTxnStatus } = useContext(ConnectContext)
  const loginInfo = localStorage.getItem('loginInfo')

  const [isAnotherTxn, setIsAnotherTxn] = useState(false)
  useEffect(() => {
    if (txnConfirmResp?.length > 0) {
      setIsAnotherTxn(true)
    }

    return () => {
      clearInterval(txnCheckInterval)
      dispatch(resetTxnConfirmationData())
    }
  }, [])

  useEffect(() => {
    if (txnHash) {
      handleTxnCheck()
    }
  }, [txnHash])

  useEffect(() => {
    if (
      txnConfirmResp[0]?.haserror === 0 ||
      txnConfirmResp[0]?.haserror === 1
    ) {
      clearInterval(txnCheckInterval)
    }
  }, [txnConfirmResp])

  const handleTxnCheck = () => {
    if (loginInfo) {
      getTxnStatus(txnHash)
        .then(txn => dispatch(setTxnConfirmSuccess(txn?.status)))
        .catch(() => dispatch(setTxnConfirmError()))
    } else {
      dispatch(getTxnConfirm(txnHash))
      txnCheckInterval = setInterval(() => {
        dispatch(getTxnConfirm(txnHash))
      }, 10000)
    }
  }

  const handleClose = () => {
    clearInterval(txnCheckInterval)
    onClose()
  }

  useEffect(() => {
    clearInterval(txnCheckInterval)
    if (!document.hidden) {
      if (txnHash) {
        handleTxnCheck()
      }
    }
  }, [document.hidden])

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
    if (!isTxnChecking && txnConfirmResp[0]?.haserror === 0 && !isAnotherTxn) {
      fire()
      dispatch(getUserXp({ isFirstLoading: false }))
    }
  }, [isTxnChecking, txnConfirmResp[0]])

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
  //             handleClose()
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

  const { getLoggedWalletBalance } = useWalletHelper()

  const [isLowBalance, setisLowBalance] = useState(false)

  const validateIsLowBalance = async () => {
    const balanceResult = await getLoggedWalletBalance()

    if (balanceResult > MIN_MATIC_BALANCE) {
      setisLowBalance(false)
    } else {
      setisLowBalance(true)
    }
  }

  useEffect(() => {
    validateIsLowBalance()
  }, [])

  return (
    <>
      <BottomPopup
        mode={`wallet drafting-players-loader vertical-flex top-index ${customClass}`}
        isOpen={showPopup}
        onClose={onClose}
      >
        {/* <CloseAbsolute onClose={onClose} /> */}
        {isLowBalance ? (
          <BalanceCheckPrompt customCallback={handleClose} />
        ) : (
          <>
            <ImageComponent
              loading="lazy"
              src={
                localStorage.getItem('wallet') === 'Metamask'
                  ? MetamaskIcon
                  : localStorage.getItem('wallet') === 'Privy'
                  ? WalletIcon
                  : CoinbaseIcon
              }
              alt="metamask-icon"
            />

            {localStorage.getItem('wallet') === 'Privy' ? (
              <div className="input-label approve-blockchain internal-mechanism-note">
                {t('sending_transaction_to_the_blockchain')}
              </div>
            ) : (
              <div className="input-label approve-blockchain">
                {t('please approve the blockchain transaction') +
                  ' ' +
                  localStorage.getItem('wallet')}
              </div>
            )}
            {!txnHash && !txnErr ? (
              <div className="checkout-loader-wrapper mt-20">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              </div>
            ) : (
              <>
                {txnHash ? (
                  <div
                    className={classNames(
                      'purchase-submit-wrapper',
                      'btn-purchase',
                      'web3action-success',
                      'mt-20',
                    )}
                  >
                    <div className="check-container-txn">
                      <CheckCircleOutlinedIcon className="response-icon success-icon web3-success-check" />
                      {txnConfirmResp.length === 0 ? (
                        <div
                          className={classNames('spinner check-spinner')}
                        ></div>
                      ) : (
                        <>
                          {txnConfirmResp[0]?.haserror === 0 ? (
                            <CheckCircleOutlinedIcon className="response-icon success-icon web3-success-check" />
                          ) : (
                            <CancelOutlinedIcon className="response-icon error-icon" />
                          )}
                        </>
                      )}
                    </div>
                    <span>{t('transaction sent')}</span>
                    {txnConfirmResp.length > 0 ? (
                      <span
                        style={{
                          fontSize: isMobile() ? '20px' : '17px',
                          margin: 'unset',
                        }}
                        className={classNames(
                          txnConfirmResp[0]?.haserror === 0
                            ? 'txn-confirm-success'
                            : 'txn-confirm-error',
                        )}
                      >
                        {!isTxnChecking && txnConfirmResp[0]?.haserror === 0
                          ? t('transaction confirmed')
                          : !isTxnChecking && txnConfirmResp[0]?.haserror === 1
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
                        className="tx-link button-box close-button-zindex"
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
                    <div className="input-feedback">{txnErr}</div>
                  </div>
                )}
              </>
            )}
            {/* <div className="close-button" onClick={handleClose}>
              {t('close')}
            </div> */}

            <ReactCanvasConfetti
              refConfetti={getInstance}
              style={canvasStyles}
            />
          </>
        )}
      </BottomPopup>
    </>
  )
}

export default Web3BottomPopup
