import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { getMyWalletPlayers } from '@root/apis/playerCoins/playerCoinsSlice'
import { isMobile } from '@utils/helpers'
import NewCarouselCard from '@components/Card/NewCarouselCard'
import BaseCardSkeleton from '@components/Card/BaseCardSkeleton'
import {
  showPurchaseForm,
  showSignupForm,
} from '@root/apis/onboarding/authenticationSlice'
import CircleCarousel from '@components/Carousel/CircleCarousel'
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp'
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown'
import classNames from 'classnames'
import CarouselShowCase from '@components/CarouselShowcase'
import { makeGetRequestAdvance } from '@root/apis/axiosClient'
import NftSkeletonMobile from '@components/Card/NftSkeletonMobile'
import NftSkeleton from '@components/Card/NftSkeleton'
import KioskItem from '@components/Card/KioskItem'
const MyOrders: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const {
    myWalletPlayers,
    loadingMyWalletPlayers,
    current_balance,
    wallet_balance_percentage_change,
    getTopItemsSuccess,
    getTopItemsLoading,
  } = playerCoinData
  const playerRef = useRef<any>([])
  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')
  const accessToken = localStorage.getItem('accessToken')
  const [itemIndex, setItemIndex] = useState(0)
  // cards
  const [isDeadEnd, setIsDeadEnd] = useState(false)
  const [windowSize, setWindowSize] = useState(0)

  const [cardsData, setCardsData] = useState([])

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [window.innerWidth])

  useEffect(() => {
    makeGetRequestAdvance('wallets/user_item_orders/?limit=100&offset=0').then(
      res => {
        setCardsData(res?.data.data)
      },
    )
  }, [])

  // handle jump page
  const handleJumpToPage2 = () => {
    console.log('')
  }

  const handlePurchaseOpen = (value: string, data?: any) => {
    if (!loginInfo && !loginId) {
      dispatch(showSignupForm())
      return
    }
    dispatch(
      showPurchaseForm({
        mode: value.toUpperCase(),
        playerData: data,
      }),
    )
  }

  useEffect(() => {
    if (accessToken) {
      dispatch(getMyWalletPlayers())
    }
  }, [accessToken])

  if (!cardsData?.length) {
    return null
  }

  return (
    <div
      className={`${
        loginInfo && cardsData?.length > 0 ? 'section-wrapper' : 'hidden'
      }`}
    >
      <div className="section-title">
        {t('My Orders')}
        {/* {wallet_balance_percentage_change >= 0 ? (
          <div className="title-more-info">
            <ArrowCircleUpIcon />
            <span>
              ${Math.abs(current_balance)?.toFixed(2)} /{' '}
              {Math.abs(wallet_balance_percentage_change)?.toFixed(2)}%
            </span>
          </div>
        ) : (
          <div className="title-more-info red-color">
            <ArrowCircleDownIcon />
            <span>
              ${Math.abs(current_balance)?.toFixed(2)} /{' '}
              {Math.abs(wallet_balance_percentage_change)?.toFixed(2)}%
            </span>
          </div>
        )} */}
      </div>
      <div
        className={classNames(
          'section-content player-carousel',
          isMobile() ? 'my_players_section_mobile' : '',
        )}
      >
        {cardsData?.length > 0 ? (
          <div
            className={classNames(
              'player-list-wrapper showCase',
              !isMobile() ? 'itemLists' : '',
            )}
          >
            <CarouselShowCase
              title=""
              data={cardsData}
              isLoading={false}
              isDeadEnd={isDeadEnd}
              onNext={handleJumpToPage2}
              windowSize={windowSize}
              renderHeader={() => null}
              displaySingleCardOnMobile={true}
            />

            {/* <CircleCarousel
              items={cardsData?.map((item: any, index: number) => {
                return isMobile() ? (
                  <KioskItem
                    kioskItem={item}
                    fullFilled={false}
                    buyItem={true}
                    key={index}
                    className={isMobile() ? 'kiosk-card-mobile' : ''}
                  />
                ) : (
                  <KioskItem
                    kioskItem={item}
                    fullFilled={false}
                    buyItem={true}
                    key={index}
                    className={isMobile() ? 'kiosk-card-mobile' : ''}
                  />
                )
              })}
              isFinite={true}
              activeIndex={itemIndex}
              setActiveIndex={setItemIndex}
              isKioskMobile={isMobile()}
              isLanding={true}
            /> */}
          </div>
        ) : getTopItemsLoading ? (
          <div className="d-flex-center">
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
                  <NftSkeleton customClass="mr-30" key={index} />
                )
              })}
          </div>
        ) : (
          <div className="alert-wrapper no-kiosk-data">
            <div className="heading-title unverified-alert">
              {t('no_items_found')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(MyOrders)
