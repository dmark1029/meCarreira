/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { getCountryNameNew, initTagManager, isMobile } from '@utils/helpers'
import '@assets/css/pages/NftList.css'
import '@assets/css/pages/TransfermarktRegister.css'

import classNames from 'classnames'
import {
  createKioskItemReset,
  showCreteKioskItemForm,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  getPendingKioskList,
  getFulfilledKioskList,
  getMyPlayerKioskList,
  kioskItemCategoriesList,
  resetKioskItemDetail,
  resetDeleteKioskImage,
  showTransfermarktForm,
} from '@root/apis/onboarding/authenticationSlice'
import Stack from '@mui/material/Stack'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import KioskItem from '@components/Card/KioskItem'
import NftSkeletonMobile from '@components/Card/NftSkeletonMobile'
import NftSkeleton from '@components/Card/NftSkeleton'
import SubmitButton from '@components/Button/SubmitButton'
import DialogBox from '@components/Dialog/DialogBox'
import CircleCarousel from '@components/Carousel/CircleCarousel'
// import CreateItem from './components/CreateItem'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import TabGroup from '@components/Page/TabGroup'
import { SALES_OPTION } from '@root/constants'
import FormInput from '@components/Form/FormInput'
import ImageComponent from '@components/ImageComponent'
import { getRequestAuth, postRequestAuth } from '@root/apis/axiosClientAuth'
import {
  fetchComingPlayerList,
  fetchMyVotingPlayerList,
  fetchVotingPlayerList,
  fetchVotingStats,
} from '@root/apis/playerVoting/playerVotingSlice'

interface FiltersData {
  limit?: string
  offset?: string
  search?: string
}

const Voting: React.FC = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [editData, setEditData] = useState<any>(null)
  const [newItemStep, setNewItemStep] = useState(1)
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const {
    isCreateKioskItemFormVisible,
    isItemSwitchedToEdit,
    selectedPlayer,
    player1contract,
  } = playerCoinData

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const { isTransfermarktFormVisible } = authenticationData

  const [loading, setLoading] = useState({
    stage1: false,
    stage2: false,
  })
  const [tmLink, setTmLink] = useState('')
  const [instaUrl, setInstaUrl] = useState('')
  const [playerData, setplayerData] = useState(null)
  const [errors, setErrors] = useState(null)
  const [isSuccess, setIsSuccess] = useState(0)

  const closeCreateItemForm = async () => {
    await dispatch(createKioskItemReset())
    dispatch(showTransfermarktForm(false))
    setNewItemStep(1)
    if (editData) {
      setEditData(null)
    }
  }

  // apis
  const addTransferMarketLink = async url => {
    setLoading({
      ...loading,
      stage1: true,
    })
    setErrors(null)

    await postRequestAuth('players/player_listing_request/', {
      tmurl: url,
    })
      .then(res => {
        // console.log('Step1', res)

        const interval = setInterval(() => {
          getRequestAuth('players/player_listing_request/')
            .then(res => {
              if (res?.data?.data?.id) {
                setNewItemStep(2)
                setLoading({
                  ...loading,
                  stage1: false,
                })
                setplayerData(res?.data?.data)

                clearInterval(interval)
              }

              // console.log('Step 2', res?.data?.data)
            })
            .catch(err => {
              console.log(err)
              setErrors(err?.response?.data.message)
              setLoading({
                ...loading,
                stage1: false,
              })
            })
        }, 2000)
      })
      .catch(err => {
        setErrors(err?.response?.data.message)
        setLoading({
          ...loading,
          stage1: false,
        })
      })
  }

  const addInsta = (id, instagram_url) => {
    setErrors(null)
    setLoading({
      ...loading,
      stage2: true,
    })
    postRequestAuth('players/player_listing_insta/', {
      id,
      instagram_url,
    })
      .then(res => {
        console.log('Insta data', res)
        setplayerData({
          ...playerData,
          playerpicture: res?.data?.picture || playerData.playerpicture,
        })
        setIsSuccess(1)
      })
      .catch(err => {
        setErrors(err?.response?.data.message)
      })
      .finally(() => {
        setLoading({
          ...loading,
          stage2: false,
        })
      })
  }

  const addRequest = id => {
    setErrors(null)
    setLoading({
      ...loading,
      stage2: true,
    })
    postRequestAuth('players/player_listing_request_confirm/', {
      id,
    })
      .then(res => {
        setIsSuccess(2)

        setTimeout(() => {
          closeCreateItemForm()
        }, 2000)

        dispatch(fetchVotingPlayerList())
        dispatch(fetchMyVotingPlayerList())
        dispatch(fetchVotingStats())
        dispatch(fetchVotingStats())
        dispatch(fetchComingPlayerList())
      })
      .catch(err => {
        setErrors(err?.response?.data.message)
      })
      .finally(() => {
        setLoading({
          ...loading,
          stage2: false,
        })
      })
  }

  const verifyDotComDomain = value => {
    try {
      if (value.includes('www.transfermarkt.')) {
        return true
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  return (
    <section
      className="nft-list-container"
      style={{
        width: '100%',
      }}
    >
      {isTransfermarktFormVisible && (
        <DialogBox
          isOpen={isTransfermarktFormVisible}
          onClose={closeCreateItemForm}
          parentClass={isMobile() ? 'flex-dialog' : ''}
          contentClass="dilog-wrapper create-item-dilog"
        >
          <div
            className={classNames(
              isMobile() ? 'dilog-container' : 'dilog-container-mob',
              'rounded-corners',
            )}
          >
            {
              newItemStep === 1 && (editData === false || editData === null) ? (
                <div className=" tm-cont create_item_step1_wrapper">
                  {/* <h1 className="menu-item text-center text-uppercase">
                    Transfermarkt Link
                  </h1> */}
                  {/* <h3 className="select-one-option text-uppercase">
                      Please Enter the link to transfermarkt in order for us to
                      verify that this footballer exists. Paste link with entire
                      URL.
                    </h3> */}

                  <div className="text-left tm-head-cont ">
                    <label className="tm-heading">
                      {t('transfermarkt link')}
                    </label>

                    <label className="">
                      {t('transfermarkt link description')}
                    </label>
                  </div>
                  <div className="tm-example-cont">
                    <span className={classNames('sub-content1 ct-p1')}>
                      {t('example')}:
                    </span>
                    <span className={classNames('sub-content1 ct-p1')}>
                      {
                        'https://www.transfermarkt.com/cristiano-ronaldo/profil/spieler/8198'
                      }
                    </span>
                  </div>

                  <div className=" width-full dark">
                    <label></label>
                    <FormInput
                      id="passphrase"
                      type="text"
                      placeholder={t('transfermarkt link')}
                      name="passphrase"
                      value={tmLink}
                      handleChange={e => {
                        setTmLink(e.target.value)

                        if (e.target.value?.includes('.')) {
                          if (e.target.value?.includes('www.transfermarkt.')) {
                            setErrors(null)
                          } else {
                            setErrors('Invalid URL')
                          }
                        } else {
                          setErrors(null)
                        }
                      }}
                      disabled={loading.stage1}
                      onBlur={() => {}}
                    />
                  </div>

                  <div className=" width-full new_create_item_next_btn">
                    <SubmitButton
                      title={t('load')}
                      className="new_next_btn createnft-createbtn vote-submit-button"
                      onPress={() => {
                        addTransferMarketLink(tmLink)
                      }}
                      isDisabled={
                        tmLink.length <= 0 || !verifyDotComDomain(tmLink)
                      }
                      isLoading={loading.stage1}
                    />
                  </div>

                  {errors && (
                    <div className="text-left text-error text-center tm-head-cont uppercase">
                      <label className="text-center">{errors}</label>
                    </div>
                  )}
                </div>
              ) : newItemStep === 2 ? (
                <div className="tm-cont create_item_step1_wrapper">
                  <div className="text-left uppercase tm-head-cont">
                    <label className="tm-heading">
                      {t('transfermarkt link')}
                    </label>

                    <label className="">
                      {t('transfermarkt link description')}
                    </label>
                  </div>
                  <div className="player-description-cont">
                    <div className="player-img-cont">
                      {/* <div
                          className="profile-img-loader"
                          style={{ display: loading.stage2 ? 'flex' : 'none' }}
                        >
                          <div className="loading-spinner">
                            <div className="spinner"></div>
                          </div>
                        </div> */}

                      {false ? (
                        <div className={'spinner size-small'}></div>
                      ) : (
                        <div>
                          <ImageComponent
                            key={1}
                            src={playerData?.playerpicture}
                            alt="player-profile-img"
                            className="player-img-comp"
                          />
                        </div>
                      )}
                    </div>

                    <div className="player-stats-cont text-left">
                      <div className="tr-data-fields ">
                        <label>{t('name')}:</label>
                        <span className="ct-p1">{playerData?.name}</span>
                      </div>

                      <div className="tr-data-fields">
                        <label>{t('birthday')}:</label>
                        <span className="ct-p1">{playerData?.dateofbirth}</span>
                      </div>

                      <div className="tr-data-fields">
                        <label>{t('nationality')}:</label>
                        <span className="ct-p1">
                          {getCountryNameNew(
                            playerData?.country_id || playerData?.nationality,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="width-full tm-example-cont">
                    <span className={classNames('sub-content1 ct-p1')}>
                      {t('example')}:
                    </span>
                    <span className={classNames('sub-content1 ct-p1')}>
                      {'http://www.instagram.com/cristiano'}
                    </span>
                  </div>

                  <div className=" width-full dark">
                    <label></label>
                    <FormInput
                      disabled={isSuccess !== 0 || loading.stage2}
                      id="passphrase"
                      type="text"
                      placeholder={t('Add instagram handle or url')}
                      name="passphrase"
                      value={instaUrl}
                      handleChange={e => {
                        setInstaUrl(e.target.value)
                      }}
                      onBlur={() => {}}
                    />
                  </div>

                  <div className="width-full new_create_item_next_btn">
                    <SubmitButton
                      title={
                        isSuccess === 0
                          ? t('Upload Instagram')
                          : isSuccess === 1
                          ? t('Send Request')
                          : t('success')
                      }
                      className="new_next_btn createnft-createbtn vote-submit-button"
                      onPress={() => {
                        if (isSuccess === 1) {
                          return addRequest(playerData?.id)
                        }
                        addInsta(playerData?.id, instaUrl)
                      }}
                      isLoading={loading.stage2}
                      isDisabled={isSuccess === 2}
                    />
                  </div>

                  {errors && (
                    <div className="text-left text-error text-center tm-head-cont uppercase">
                      <label className="text-center">{errors}</label>
                    </div>
                  )}
                </div>
              ) : null
              // <CreateItem
              //   salesMethod={
              //     editData && editData?.salesmethod
              //       ? editData?.salesmethod.toString()
              //       : salesMethod
              //   }
              //   nftImg={editData?.itempicturethumb || ''}
              //   onOpenGallery={() => console.log('')}
              //   onSuccess={() => setEditData(null)}
              //   customClass={
              //     isMobile() ? 'create-kiosk-item-mob' : 'create-kiosk-item'
              //   }
              //   usageMode="kiosk"
              //   selectShopCategories={selectShopCategories}
              //   toEdit={editData}
              //   closePopup={closeCreateItemForm}
              // />
            }
          </div>
        </DialogBox>
      )}
    </section>
  )
}

export default Voting
