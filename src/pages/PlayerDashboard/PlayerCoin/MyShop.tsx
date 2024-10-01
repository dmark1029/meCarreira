/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { initTagManager, isMobile } from '@utils/helpers'
import '@assets/css/pages/NftList.css'
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
} from '@root/apis/onboarding/authenticationSlice'
import Stack from '@mui/material/Stack'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import KioskItem from '@components/Card/KioskItem'
import NftSkeletonMobile from '@components/Card/NftSkeletonMobile'
import NftSkeleton from '@components/Card/NftSkeleton'
import SubmitButton from '@components/Button/SubmitButton'
import CreateNft from '../Nfts/CreateNft'
import DialogBox from '@components/Dialog/DialogBox'
import CircleCarousel from '@components/Carousel/CircleCarousel'
import CreateItem from './components/CreateItem'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import TabGroup from '@components/Page/TabGroup'
import { SALES_OPTION } from '@root/constants'

interface FiltersData {
  limit?: string
  offset?: string
  search?: string
}

const MyShop: React.FC = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [editData, setEditData] = useState<any>(null)
  const [status, setStatus] = useState(0)
  const [selectShopCategories, setSelectShopCategories] = useState(0)
  const [newItemStep, setNewItemStep] = useState(1)
  const [salesMethod, setSalesMethod] = useState('0')
  const [months, setMonths] = useState(3)
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const {
    isCreateKioskItemFormVisible,
    isItemSwitchedToEdit,
    selectedPlayer,
    player1contract,
  } = playerCoinData

  const [appliedFilters, setAppliedFilters] = useState<FiltersData>({
    search: '',
  })
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const {
    PendingKioskLoader,
    PendingKioskList,
    FulfilledKioskLoader,
    FulfilledKioskList,
    PlayerKioskList,
    PlayerKioskLoader,
    nextPendingKioskListUrl,
    itemCategoriesListLoader,
    itemCategoriesListData,
    KioskItemDetail,
    postFulfillKioskOrderSuccess,
  } = authenticationData
  const [pendingKioskList, setPendingKioskList] = useState<any>([])
  const [fulfilledKioskList, setFulfilledKioskList] = useState<any>([])
  const [itemIndex, setItemIndex] = useState(0)
  const [windowSize, setWindowSize] = useState(0)
  const [isDeadEnd, setIsDeadEnd] = useState(false)

  useEffect(() => {
    initTagManager()
    dispatch(kioskItemCategoriesList())
    dispatch(getPendingKioskList(player1contract))
    dispatch(
      getFulfilledKioskList({
        player_contract: player1contract,
        last_month: months,
      }),
    )
  }, [])

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [window.innerWidth])

  useEffect(() => {
    if (postFulfillKioskOrderSuccess === true) {
      dispatch(getPendingKioskList(player1contract))
      dispatch(
        getFulfilledKioskList({
          player_contract: player1contract,
          last_month: 3,
        }),
      )
    }
  }, [postFulfillKioskOrderSuccess])

  useEffect(() => {
    if (appliedFilters.limit || appliedFilters.offset) {
      if (appliedFilters.search) {
        if (nextPendingKioskListUrl === null) {
          setPendingKioskList(PendingKioskList)
        } else {
          const url_string = nextPendingKioskListUrl
          const url = new URL(url_string)
          const obj = {
            limit: url.searchParams.get('limit'),
            offset: url.searchParams.get('offset'),
          }
          if (appliedFilters.offset === obj.offset) {
            setPendingKioskList(PendingKioskList)
          }
        }
      }
    } else {
      setPendingKioskList(PendingKioskList)
    }
  }, [PendingKioskList])

  useEffect(() => {
    if (isItemSwitchedToEdit) {
      setEditData(isItemSwitchedToEdit)
      dispatch(showCreteKioskItemForm({ show: true }))
    }
  }, [isItemSwitchedToEdit])

  const handleChangeStatus = (tab: string) => {
    if (tab === 'items') {
      setStatus(1)
      dispatch(getMyPlayerKioskList(player1contract))
    } else {
      setStatus(0)
    }
  }

  const handleChangeShopCategories = (event: SelectChangeEvent) => {
    setSelectShopCategories(Number(event.target.value))
  }
  const handleNewCreateNext = () => {
    setNewItemStep(3)
  }
  const handleChangeMonths = (event: SelectChangeEvent) => {
    setMonths(Number(event.target.value))
    dispatch(
      getFulfilledKioskList({
        player_contract: player1contract,
        last_month: Number(event.target.value),
      }),
    )
    console.log('months', Number(event.target.value))
  }

  const getUrlParams = (url: string, param1: string, param2: string) => {
    if (!url) {
      return url
    }
    const url_string = url
    const newUrl = new URL(url_string)
    const obj: any = new Object()
    obj[param1] = newUrl.searchParams.get(param1)
    obj[param2] = newUrl.searchParams.get(param2)
    return obj
  }

  const handleJumpToPage = (head: string) => {
    if (head !== 'back') {
      const paginationParams = getUrlParams(
        nextPendingKioskListUrl,
        'limit',
        'offset',
      )
      if (
        nextPendingKioskListUrl &&
        paginationParams.offset !== appliedFilters.offset
      ) {
        setAppliedFilters({ ...appliedFilters, ...paginationParams })
      }
    }
  }

  useEffect(() => {
    setPendingKioskList(PendingKioskList)
  }, [PendingKioskList])

  useEffect(() => {
    setFulfilledKioskList(FulfilledKioskList)
  }, [FulfilledKioskList])

  const handleNewCreate = () => {
    dispatch(resetKioskItemDetail())
    dispatch(showCreteKioskItemForm({ show: true }))
  }

  const handleEditItem = (event: any, flag: string, item: any) => {
    if (flag === 'open') {
      setEditData({ ...item, isOpenOnly: true })
    } else {
      setEditData(item)
    }
    event.stopPropagation()
    dispatch(showCreteKioskItemForm({ show: true }))
  }

  const closeCreateItemForm = async () => {
    await dispatch(createKioskItemReset())
    dispatch(showCreteKioskItemForm({ show: false }))
    if (editData) {
      setEditData(null)
    }
  }

  useEffect(() => {
    if (!isCreateKioskItemFormVisible) {
      setEditData(null)
      setNewItemStep(1)
      dispatch(resetDeleteKioskImage())
      document.body.style.overflow = ''
    } else {
      document.body.style.overflow = 'hidden'
    }
  }, [isCreateKioskItemFormVisible])

  const [isExistedRaffle, setIsExistedRaffle] = useState(false)
  const [isExistedFan, setIsExistedFan] = useState(false)

  useEffect(() => {
    const raffleList = PlayerKioskList.filter(
      obj => Number(obj.salesmethod) === Number(SALES_OPTION.RAFFLE),
    )
    const fanList = PlayerKioskList.filter(
      obj => Number(obj.salesmethod) === Number(SALES_OPTION.FAN),
    )
    if (raffleList?.length > 0) {
      setIsExistedRaffle(true)
    }
    if (fanList?.length > 0) {
      setIsExistedFan(true)
    }
  }, [PlayerKioskList])
  return (
    <section
      className="nft-list-container"
      style={{
        width: '100%',
      }}
    >
      {isCreateKioskItemFormVisible && (
        <DialogBox
          isOpen={isCreateKioskItemFormVisible}
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
            {newItemStep === 1 && (editData === false || editData === null) ? (
              <div className="create_item_step1_wrapper">
                <h1 className="menu-item text-uppercase">
                  {t('How to get it')}
                </h1>
                <div>
                  <h3 className="select-one-option text-uppercase">
                    {t('select one option')}
                  </h3>
                  <div
                    className="textinput-wrapper shop_categories_desc select-option"
                    onClick={() => {
                      setSalesMethod('1')
                      setNewItemStep(2)
                    }}
                  >
                    <span
                      className={classNames('sub-title ct-h2 text-uppercase')}
                    >
                      {t('fix price')}
                    </span>
                    <span className={classNames('sub-content1 ct-p1')}>
                      {t('price is fixed and paid in your tokens')}
                    </span>
                    <span className={classNames('sub-content2 ct-p1')}>
                      {t('multiple units of same item')}
                    </span>
                  </div>
                </div>
                <div>
                  <div
                    className="textinput-wrapper shop_categories_desc select-option"
                    onClick={() => {
                      setSalesMethod('2')
                      setNewItemStep(2)
                    }}
                  >
                    <span
                      className={classNames('sub-title ct-h2 text-uppercase')}
                    >
                      {t('Auction')}
                    </span>
                    <span className={classNames('sub-content1 ct-p1')}>
                      {t('highest bidder wins at end of auction')}
                    </span>
                    <span
                      className={classNames('sub-content2 ct-p1')}
                      style={{ color: '#c9a009' }}
                    >
                      {t('one item per auction')}
                    </span>
                  </div>
                </div>
                <div>
                  {isExistedRaffle ? (
                    <div className="textinput-wrapper shop_categories_desc select-option disabled-option">
                      <span
                        className={classNames('sub-title ct-h2 text-uppercase')}
                      >
                        {t('already open')}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="textinput-wrapper shop_categories_desc select-option"
                      onClick={() => {
                        setSalesMethod('3')
                        setNewItemStep(2)
                      }}
                    >
                      <span
                        className={classNames('sub-title ct-h2 text-uppercase')}
                      >
                        {t('random draw')}
                      </span>
                      <span className={classNames('sub-content1 ct-p1')}>
                        {t('every fan can participate with a lucky winner')}
                      </span>
                      <span
                        className={classNames('sub-content2 ct-p1')}
                        style={{ color: '#c9a009' }}
                      >
                        {t('one item per draw')}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  {isExistedFan ? (
                    <div className="textinput-wrapper shop_categories_desc select-option disabled-option">
                      <span
                        className={classNames('sub-title ct-h2 text-uppercase')}
                      >
                        {t('already open')}
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setSalesMethod('4')
                        setNewItemStep(2)
                      }}
                      className="textinput-wrapper shop_categories_desc select-option"
                    >
                      <span
                        className={classNames('sub-title ct-h2 text-uppercase')}
                      >
                        {t('best fans')}
                      </span>
                      <span className={classNames('sub-content1 ct-p1')}>
                        {t('only the best fans can have it')}
                      </span>
                      <span className={classNames('sub-content2 ct-p1')}>
                        {t('multiple units of same item')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : newItemStep === 2 ? (
              <div className="create_item_step1_wrapper">
                <h1 className="heading_new_item">{t('new_item')}</h1>
                <div>
                  <h3 className="label_golden">{t('what_are_you_offering')}</h3>
                  <Select
                    value={selectShopCategories.toString()}
                    onChange={handleChangeShopCategories}
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx={{
                      color: 'var(--primary-foreground-color)',
                      width: '300px',
                      borderRadius: '4px',
                      border: '1px solid',
                      // backgroundColor: 'var(--third-background-color)',
                    }}
                    style={{
                      color: 'var(--primary-foreground-color)',
                      width: '300px',
                      borderRadius: '4px',
                      border: '1px solid',
                      // backgroundColor: 'var(--third-background-color)',
                    }}
                  >
                    {itemCategoriesListData?.map((el, ind) => (
                      <MenuItem value={ind}>{el?.itemName}</MenuItem>
                    ))}
                  </Select>
                </div>
                <div>
                  <h3 className="label_golden">{t('description')}</h3>
                  <div className="textinput-wrapper shop_categories_desc">
                    {
                      itemCategoriesListData[selectShopCategories]
                        ?.itemDescription
                    }
                  </div>
                </div>
                <div>
                  {itemCategoriesListData[selectShopCategories]
                    ?.deliveryType === 1 ? (
                    <h3 className="label_green">{t('physical_delivery')}</h3>
                  ) : (
                    <h3 className="label_blue">{t('digital_delivery')}</h3>
                  )}
                  {itemCategoriesListData[selectShopCategories]
                    ?.deliveryType === 1 ? (
                    <div className="textinput-wrapper shop_categories_desc">
                      {t('this_item_physical_delivery')}
                    </div>
                  ) : (
                    <div className="textinput-wrapper shop_categories_desc">
                      {t('this_item_digital_delivery')}
                    </div>
                  )}
                </div>
                <div className="new_create_item_next_btn">
                  <SubmitButton
                    title={t('next')}
                    className="new_next_btn createnft-createbtn"
                    onPress={handleNewCreateNext}
                    isLoading={false}
                  />
                </div>
              </div>
            ) : (
              <CreateItem
                salesMethod={
                  editData && editData?.salesmethod
                    ? editData?.salesmethod.toString()
                    : salesMethod
                }
                nftImg={editData?.itempicturethumb || ''}
                onOpenGallery={() => console.log('')}
                onSuccess={() => setEditData(null)}
                customClass={
                  isMobile() ? 'create-kiosk-item-mob' : 'create-kiosk-item'
                }
                usageMode="kiosk"
                selectShopCategories={selectShopCategories}
                toEdit={editData}
                closePopup={closeCreateItemForm}
              />
            )}
          </div>
        </DialogBox>
      )}
      <div className="kiosk-container">
        <div className="kiosk-filter-wrapper">
          {selectedPlayer?.allowkioskitem ? (
            <div
              className="plus-icon create-new-items"
              onClick={handleNewCreate}
            >
              <AddCircleOutlinedIcon />
            </div>
          ) : null}
          <div className="players-list-label">
            <TabGroup
              defaultTab={'orders'}
              tabSet={['orders', 'items']}
              getSwitchedTab={tab => handleChangeStatus(tab)}
            />
          </div>
          <div className="my-shop-content-wrapper">
            {status === 0 ? (
              <>
                <div className="kiosk-wrapper">
                  <span className="kiosk-title-wrapper blog-title text-primary-color">
                    {t('pending')}
                  </span>
                  <div
                    className={classNames(
                      'kiosk-content',
                      isMobile() ? 'nft-list-grid-mob' : '',
                    )}
                  >
                    {pendingKioskList?.length > 0 ? (
                      <CircleCarousel
                        items={pendingKioskList?.map(
                          (item: any, index: number) => {
                            return isMobile() ? (
                              <KioskItem
                                kioskItem={item}
                                fullFilled={false}
                                key={index}
                                className={
                                  isMobile() ? 'kiosk-card-mobile' : ''
                                }
                              />
                            ) : (
                              <KioskItem
                                kioskItem={item}
                                fullFilled={false}
                                key={index}
                                className={
                                  isMobile() ? 'kiosk-card-mobile' : ''
                                }
                              />
                            )
                          },
                        )}
                        // isFinite={true}
                        activeIndex={itemIndex}
                        setActiveIndex={setItemIndex}
                        isKioskMobile={isMobile()}
                      />
                    ) : PendingKioskLoader ? (
                      <div className="nft-item no-data">
                        {new Array(
                          windowSize >= 1600
                            ? 5
                            : windowSize >= 1220
                            ? 4
                            : windowSize >= 912
                            ? 3
                            : windowSize >= 320
                            ? 2
                            : 1,
                        )
                          .fill(1)
                          .map((_: any, index: number) => {
                            return isMobile() ? (
                              <NftSkeletonMobile key={index} />
                            ) : (
                              <NftSkeleton key={index} />
                            )
                          })}
                      </div>
                    ) : (
                      <div className="alert-wrapper">
                        <div className="heading-title unverified-alert">
                          {t('no_pending_orders_found')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {fulfilledKioskList?.length ? (
                  <div className="kiosk-wrapper">
                    <div className="kiosk-title-wrapper">
                      <span className="blog-title text-primary-color">
                        {t('fulfilled')}
                      </span>
                      <div className="major-filter-wrapper flex-between">
                        <Stack
                          direction="row"
                          alignItems={'center'}
                          justifyContent={'flex-start'}
                          className="status-section"
                          gap={4.2}
                        >
                          <Select
                            value={months.toString()}
                            onChange={handleChangeMonths}
                            inputProps={{ 'aria-label': 'Without label' }}
                            sx={{
                              color: 'var(--primary-foreground-color)',
                              width: '200px',
                              '&:before': {
                                borderColor: 'orange',
                              },
                              '&:after': {
                                borderColor: 'green',
                              },
                            }}
                            style={{
                              color: 'white !important',
                              fontWeight: 'bold !important',
                            }}
                          >
                            <MenuItem value={3}>{t('last_3_months')}</MenuItem>
                            <MenuItem value={6}>{t('last_6_months')}</MenuItem>
                            <MenuItem value={12}>
                              {t('last_12_months')}
                            </MenuItem>
                          </Select>
                        </Stack>
                      </div>
                    </div>
                    <div
                      className={classNames(
                        'kiosk-content',
                        isMobile() ? 'nft-list-grid-mob' : '',
                      )}
                    >
                      {fulfilledKioskList?.length > 0 ? (
                        <InfiniteScroll
                          className="circle-carousel"
                          dataLength={fulfilledKioskList?.length}
                          next={() => handleJumpToPage('forth')}
                          hasMore={true}
                          scrollThreshold={0.5}
                          loader={
                            !isDeadEnd &&
                            FulfilledKioskLoader &&
                            !isMobile() ? (
                              <div className="nft-item no-data">
                                {new Array(
                                  windowSize >= 1600
                                    ? 5
                                    : windowSize >= 1220
                                    ? 4
                                    : windowSize >= 912
                                    ? 3
                                    : windowSize >= 320
                                    ? 2
                                    : 1,
                                )
                                  .fill(1)
                                  .map((_: any, index: number) => {
                                    return isMobile() ? (
                                      <NftSkeletonMobile key={index} />
                                    ) : (
                                      <NftSkeleton key={index} />
                                    )
                                  })}
                              </div>
                            ) : null
                          }
                          endMessage={
                            <p style={{ textAlign: 'center' }}>
                              <b>. . .</b>
                            </p>
                          }
                        >
                          <div className="player-list-wrapper">
                            {fulfilledKioskList?.map(
                              (item: any, index: number) => {
                                return isMobile() ? (
                                  <KioskItem
                                    kioskItem={item}
                                    fullFilled={true}
                                    key={index}
                                    className={
                                      isMobile() ? 'kiosk-card-mobile' : ''
                                    }
                                  />
                                ) : (
                                  <KioskItem
                                    kioskItem={item}
                                    fullFilled={true}
                                    key={index}
                                    className={
                                      isMobile() ? 'kiosk-card-mobile' : ''
                                    }
                                  />
                                )
                              },
                            )}
                          </div>
                        </InfiniteScroll>
                      ) : FulfilledKioskLoader ? (
                        <div className="nft-item no-data">
                          {new Array(
                            windowSize >= 1600
                              ? 5
                              : windowSize >= 1220
                              ? 4
                              : windowSize >= 912
                              ? 3
                              : windowSize >= 320
                              ? 2
                              : 1,
                          )
                            .fill(1)
                            .map((_: any, index: number) => {
                              return isMobile() ? (
                                <NftSkeletonMobile key={index} />
                              ) : (
                                <NftSkeleton key={index} />
                              )
                            })}
                        </div>
                      ) : (
                        <div className="alert-wrapper">
                          <div className="heading-title unverified-alert">
                            {t('no_fulfilled_orders_found')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="kiosk-wrapper">
                {/* All Items heading commented */}
                <span className="kiosk-title-wrapper blog-title text-primary-color">
                  {t('all_items')}
                </span>
                <div
                  className={classNames(
                    'kiosk-content',
                    isMobile() ? 'nft-list-grid-mob' : '',
                  )}
                >
                  {PlayerKioskList?.length > 0 ? (
                    <InfiniteScroll
                      className="circle-carousel"
                      dataLength={PlayerKioskList?.length}
                      next={() => handleJumpToPage('forth')}
                      hasMore={true}
                      scrollThreshold={0.5}
                      loader={
                        !isDeadEnd && PlayerKioskLoader && !isMobile() ? (
                          <div className="nft-item no-data">
                            {new Array(
                              windowSize >= 1600
                                ? 5
                                : windowSize >= 1220
                                ? 4
                                : windowSize >= 912
                                ? 3
                                : windowSize >= 320
                                ? 2
                                : 1,
                            )
                              .fill(1)
                              .map((_: any, index: number) => {
                                return isMobile() ? (
                                  <NftSkeletonMobile key={index} />
                                ) : (
                                  <NftSkeleton key={index} />
                                )
                              })}
                          </div>
                        ) : null
                      }
                      endMessage={
                        <p style={{ textAlign: 'center' }}>
                          <b>. . .</b>
                        </p>
                      }
                    >
                      <div className="player-list-wrapper">
                        {PlayerKioskList?.map((item: any, index: number) => {
                          return isMobile() ? (
                            <KioskItem
                              kioskItem={item}
                              fullFilled={false}
                              key={index}
                              buyItem={true}
                              isAdmin
                              onEditItem={(evt: any, flag: string) =>
                                handleEditItem(evt, flag, item)
                              }
                              className={isMobile() ? 'kiosk-card-mobile' : ''}
                            />
                          ) : (
                            <KioskItem
                              kioskItem={item}
                              fullFilled={false}
                              key={index}
                              buyItem={true}
                              isAdmin
                              onEditItem={(evt: any, flag: string) =>
                                handleEditItem(evt, flag, item)
                              }
                              className={isMobile() ? 'kiosk-card-mobile' : ''}
                            />
                          )
                        })}
                      </div>
                    </InfiniteScroll>
                  ) : PlayerKioskLoader ? (
                    <div className="nft-item no-data">
                      {new Array(
                        windowSize >= 1600
                          ? 5
                          : windowSize >= 1220
                          ? 4
                          : windowSize >= 912
                          ? 3
                          : windowSize >= 320
                          ? 2
                          : 1,
                      )
                        .fill(1)
                        .map((_: any, index: number) => {
                          return isMobile() ? (
                            <NftSkeletonMobile key={index} />
                          ) : (
                            <NftSkeleton key={index} />
                          )
                        })}
                    </div>
                  ) : (
                    <div className="alert-wrapper">
                      <div className="heading-title unverified-alert">
                        {t('no_items_found')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MyShop
