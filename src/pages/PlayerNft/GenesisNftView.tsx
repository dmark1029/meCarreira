/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react'
import NftForm from './NftForm'
import NftDetail from './NftDetail'
import '@assets/css/pages/PlayerNft.css'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { fetchGenesisNFTData } from '@root/apis/gallery/gallerySlice'
import classNames from 'classnames'
import ImageComponent from '@components/ImageComponent'
import {
  checkTokenId,
  getPlayerLevelName,
  isMobile,
  isUserWallet,
  sleep,
} from '@utils/helpers'
import '@assets/css/components/XPProgressBar.css'
import { ProgressBar } from 'react-progressbar-fancy'
import { useTranslation } from 'react-i18next'
import BottomPopup from '@components/Dialog/BottomPopup'
import SendNft from './SendNft'
import {
  getGeneralSettings,
  showNftDetailForm,
  showNftForm,
  showSignupForm,
} from '@root/apis/onboarding/authenticationSlice'
import Web3 from 'web3'
import Web3BottomPopup from '@components/Dialog/Web3BottomPopup'
import ApiBottomPopup from '@components/Dialog/ApiBottomPopup'
import { nftGenesisTransfer } from '@root/apis/playerCoins/playerCoinsSlice'
import InfiniteIcon from '@assets/icons/icon/infinity.png'
import { useWalletHelper } from '@utils/WalletHelper'
import { BASE_EXPLORE_URL } from '@root/constants'
import CloseAbsolute from '@components/Form/CloseAbsolute'
interface Props {
  genesisNftDetails?: any
  genesisNftItemData?: any
  isBid?: boolean
  isEndable?: boolean
  onClose?: () => any
}

const GenesisNftView: React.FC<Props> = ({
  genesisNftDetails,
  genesisNftItemData,
  onClose,
}) => {
  console.log({ genesisNftItemData, genesisNftDetails })
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const [showPopup, setShowPopup] = useState(false)
  const [txnError, setTxnError] = useState('')
  const [txnHash, setTxnHash] = useState('')
  const [showBottomPopup, setShowBottomPopup] = useState(false)
  const [apiAction, setApiAction] = useState('')
  const [amount, setAmount] = useState('0')
  const [isLoader, setIsLoader] = useState(true)
  const loginInfo = localStorage.getItem('loginInfo')
  // const { centralNftContract, centralNftContractAbi } = useSelector(
  //   (state: RootState) => state.playercoins,
  // )
  const centralNftContractAbi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'safeTransferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ]
  const {
    userWalletData,
    selectedThemeRedux,
    centralNftContract,
    // centralNftContractAbi,
  } = authenticationData

  const { callWeb3Method } = useWalletHelper()

  const { isLoading, nftData, isFetchGenesisNFTData } = useSelector(
    (state: RootState) => state.gallery,
  )

  useEffect(() => {
    handleAsyncLoading()
  }, [])

  const handleAsyncLoading = async () => {
    for (let i = 0; i < 2; i++) {
      await sleep(i * 1000)
    }
    setIsLoader(false)
  }
  useEffect(() => {
    dispatch(showNftDetailForm({ isNftDetailFormVisible: true }))
    return () => {
      dispatch(showNftDetailForm({ isNftDetailFormVisible: false }))
    }
  }, [])

  useEffect(() => {
    if (genesisNftItemData) {
      // Select the last occurrence of an element with ID 'walletModal'
      const walletModal = document.getElementById('walletModal')

      // Add the class 'genesis_modal' to the selected element
      if (walletModal) {
        walletModal.classList.add('genesis_modal')
      }
      dispatch(fetchGenesisNFTData({ tokenId: genesisNftItemData?.tokenid }))
      dispatch(getGeneralSettings())
    }
  }, [genesisNftItemData])

  const handleShowExplorer = () => {
    window.open(
      `${BASE_EXPLORE_URL}/token/${isFetchGenesisNFTData?.nftcontract}?a=${isFetchGenesisNFTData?.tokenid}#inventory`,
      '_blank',
    )
  }

  const handleShowPopup = () => {
    if (!validateLogin()) {
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
  // console.log('contract', { centralNftContract, centralNftContractAbi })
  const handleSubmit = (arg: any) => {
    setShowPopup(false)
    setShowBottomPopup(true)
    setAmount(arg)
    if (localStorage.getItem('loginId')) {
      setApiAction(isFetchGenesisNFTData?.tokenid ? 'safeTransferFrom' : '')
      return
    }
    if (isFetchGenesisNFTData?.tokenid) {
      // const newData = [...centralNftContractAbi]
      // newData.splice(26, 1)
      // console.log('removed one', { centralNftContract, newData })
      const promise = callWeb3Method(
        'safeTransferFrom',
        centralNftContract,
        centralNftContractAbi,
        [
          localStorage.getItem('loginInfo'),
          arg,
          isFetchGenesisNFTData?.tokenid,
        ],
      )
      console.log(
        'for test safeTransferFrom promise',
        promise,
        localStorage.getItem('loginInfo'),
        arg,
        isFetchGenesisNFTData?.tokenid,
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

  const handleClose = () => {
    dispatch(fetchGenesisNFTData({ tokenId: isFetchGenesisNFTData?.tokenid }))
    setShowBottomPopup(false)
    setTxnError('')
    setTxnHash('')
    onClose()
  }
  const handleGenesisNftApi = (user_secret: any) => {
    const formData = new FormData()
    formData.append('user_secret', user_secret)
    if (apiAction === 'safeTransferFrom') {
      formData.append('token_id', isFetchGenesisNFTData?.tokenid)
      formData.append('to_wallet', amount)
      dispatch(nftGenesisTransfer(formData))
    }
  }
  return (
    <section
      className={classNames(
        'nft-view-container',
        isMobile() ? 'bg-secondary-color' : '',
      )}
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
            onSubmit={handleGenesisNftApi}
            onClose={handleClose}
            customClass="purchase-pc-bottomwrapper"
          />
        ))}
      {isLoading || isLoader ? (
        <div className="loading-spinner m-auto flex-center">
          <div className="spinner"></div>
        </div>
      ) : isFetchGenesisNFTData ? (
        <div>
          <div className={classNames('tab-bar-container')}></div>
          {/* <NftForm
            // nft={{ ...nftData, ...nftDataX }}
            nft={nftData}
            isBid={isBid}
            isEndable={isEndable}
          />
          <NftDetail nft={{ ...nftData, ...nftDataX }} /> */}
          <div className="nft-container" style={{ cursor: 'unset' }}>
            <div className="flex-middle">
              <div className="nft-image-cover">
                <video className="nft-image" autoPlay loop>
                  <source
                    src={
                      isFetchGenesisNFTData?.artwork ||
                      isFetchGenesisNFTData?.artwork_thumb
                    }
                    type="video/webm"
                  ></source>
                  Your browser does not support the video tag
                </video>
                {/* <ImageComponent
                  loading="lazy"
                  src={
                    isFetchGenesisNFTData?.artwork ||
                    isFetchGenesisNFTData?.artwork_thumb
                  }
                  alt=""
                  className="nft-image"
                  // onClick={handleViewImage}
                /> */}
              </div>

              <div className="nft-info-wrapper">
                <div className="nft-info">
                  <div
                    className={classNames(
                      'nft-info-title',
                      getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                        'Diamond'
                        ? 'nft_level_diamond'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Gold'
                        ? 'nft_level_gold'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Silver'
                        ? 'nft_level_silver'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Bronze'
                        ? 'nft_level_bronze'
                        : '',
                    )}
                  >
                    {isFetchGenesisNFTData?.name}&nbsp;
                    {checkTokenId(isFetchGenesisNFTData?.tokenid)}
                  </div>
                </div>
                <div className="progress-bar-wrapper mt-20">
                  <div className="genesis-progress-label">
                    <span
                      className={classNames(
                        getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Diamond'
                          ? 'nft_level_diamond'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Gold'
                          ? 'nft_level_gold'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Silver'
                          ? 'nft_level_silver'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Bronze'
                          ? 'nft_level_bronze'
                          : '',
                      )}
                    >
                      {getPlayerLevelName(isFetchGenesisNFTData?.level)}
                    </span>
                    <span
                      className={classNames(
                        getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Diamond'
                          ? 'nft_level_diamond'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Gold'
                          ? 'nft_level_gold'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Silver'
                          ? 'nft_level_silver'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Bronze'
                          ? 'nft_level_bronze'
                          : '',
                      )}
                    >
                      {getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                      'Diamond'
                        ? ''
                        : `+
                          ${Math.floor(
                            isFetchGenesisNFTData?.xp_needed,
                          ).toLocaleString()}${' '}
                          ${t('xp needed')}`}
                    </span>
                  </div>
                  <ProgressBar
                    className="space"
                    // label={''}
                    primaryColor={
                      getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                      'Diamond'
                        ? '#c879f9'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Gold'
                        ? '#f5b933'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Silver'
                        ? '#95979a'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Bronze'
                        ? '#c37b47'
                        : '#666fe9'
                      // : '#f40bff'
                    }
                    secondaryColor={
                      getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                      'Diamond'
                        ? '#d0deec'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Gold'
                        ? '#fbe9b3'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Silver'
                        ? '#e7e7e8'
                        : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Bronze'
                        ? '#feddc4'
                        : '#1422df'
                      // : '#0bf4ff'
                    }
                    darkTheme
                    score={
                      getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                      'Diamond'
                        ? 100
                        : (isFetchGenesisNFTData?.xp /
                            (isFetchGenesisNFTData?.xp +
                              isFetchGenesisNFTData?.xp_needed)) *
                          100
                    }
                  />
                </div>
                <div className="nft-separate-line"></div>
                <div className="flex_container_space_between mb-10 mt-20">
                  <div className="owners_wrapper center_owner">
                    <p
                      className={classNames(
                        'title_text_owner',
                        getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Diamond'
                          ? 'nft_level_diamond'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Gold'
                          ? 'nft_level_gold'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Silver'
                          ? 'nft_level_silver'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Bronze'
                          ? 'nft_level_bronze'
                          : '',
                      )}
                    >
                      {t('unlocks initial')}
                    </p>
                    <p
                      className={classNames(
                        'title_text_owner unlock_param',
                        getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Diamond'
                          ? 'nft_level_diamond'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Gold'
                          ? 'nft_level_gold'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Silver'
                          ? 'nft_level_silver'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Bronze'
                          ? 'nft_level_bronze'
                          : '',
                      )}
                    >
                      {getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                      'Diamond' ? (
                        <img src={InfiniteIcon} alt="" width={24} height={24} />
                      ) : (
                        isFetchGenesisNFTData?.totalunlocks
                      )}
                    </p>
                  </div>
                  <div className="owners_wrapper center_owner">
                    <p
                      className={classNames(
                        'title_text_owner',
                        getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Diamond'
                          ? 'nft_level_diamond'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Gold'
                          ? 'nft_level_gold'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Silver'
                          ? 'nft_level_silver'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Bronze'
                          ? 'nft_level_bronze'
                          : '',
                      )}
                    >
                      {t('remaining')}
                    </p>
                    <p
                      className={classNames(
                        'title_text_owner unlock_param',
                        getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                          'Diamond'
                          ? 'nft_level_diamond'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Gold'
                          ? 'nft_level_gold'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Silver'
                          ? 'nft_level_silver'
                          : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                            'Bronze'
                          ? 'nft_level_bronze'
                          : '',
                      )}
                    >
                      {getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                      'Diamond' ? (
                        <img src={InfiniteIcon} alt="" width={24} height={24} />
                      ) : (
                        isFetchGenesisNFTData?.remainingunlocks
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isUserWallet(isFetchGenesisNFTData?.owner) ? (
              <>
                <button
                  className="nft-btn"
                  style={{ margin: '20px auto 18px' }}
                  onClick={handleShowPopup}
                >
                  {t('send')}
                </button>
                <button
                  className="nft-btn btn-active mt-20"
                  onClick={handleShowExplorer}
                >
                  {t('show on explorer')}
                </button>
                {/* <button
                className="nft-btn"
                style={{ background: '#c9a009' }}
                // onClick={handleOpenBoost}
              >
                {t('boost')}
              </button> */}
              </>
            ) : (
              <button
                className="nft-btn btn-active mt-20"
                onClick={handleShowExplorer}
              >
                {t('show on explorer')}
              </button>
            )}
          </div>
          <div
            className="nft-detail-container"
            style={{ padding: isMobile() ? '0px 0px' : '' }}
          >
            <div>
              <div
                className={classNames(
                  isFetchGenesisNFTData?.description ? 'nft-detail-title' : '',
                )}
              >
                <span
                  className={classNames(
                    getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                      'Diamond'
                      ? 'nft_level_diamond'
                      : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                        'Gold'
                      ? 'nft_level_gold'
                      : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                        'Silver'
                      ? 'nft_level_silver'
                      : getPlayerLevelName(isFetchGenesisNFTData?.level) ===
                        'Bronze'
                      ? 'nft_level_bronze'
                      : '',
                  )}
                >
                  {t('genesis_by_mecarreira')}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
      <BottomPopup
        mode={'nft'}
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false)
        }}
      >
        {/* <CloseAbsolute
          onClose={() => {
            setShowPopup(false)
          }}
        /> */}
        {showPopup ? (
          <>
            <SendNft
              onSubmit={handleSubmit}
              onClose={() => {
                setShowPopup(false)
              }}
            />
          </>
        ) : null}
      </BottomPopup>
    </section>
  )
}

export default GenesisNftView
