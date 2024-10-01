import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { RootState } from '@root/store/rootReducers'
import { useDispatch, useSelector } from 'react-redux'
import {
  getWatchListPlayer,
  showPurchaseForm,
  showSignupForm,
} from '@root/apis/onboarding/authenticationSlice'
import NewPlayerCard from '@components/Card/NewPlayerCard'
import { isMobile } from '@utils/helpers'
import { AppLayout } from '@components/index'
import BaseCardSkeleton from '@components/Card/BaseCardSkeleton'

const MyWatchList: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const { watchListData, watchListLoading } = authenticationData
  const loginInfo = localStorage.getItem('loginInfo')
  const loginId = localStorage.getItem('loginId')
  useEffect(() => {
    dispatch(getWatchListPlayer())
  }, [])
  const handlePurchaseOpen = useCallback((value: string, data: any) => {
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
  }, [])

  return (
    <AppLayout headerClass="home" hasShadow={true}>
      <div className="watch-list-container top-trades-container">
        <div
          className={classNames(
            'nft-list-container section-wrapper box-wrapper',
          )}
        >
          <div className="section-title-container">
            <div className="section-title">{t('my_watchlist')} </div>
          </div>
          <div className="list-wrapper">
            {watchListData.length === 0 ? (
              !watchListLoading ? (
                <div className="no-data-msg">{t('no data found')}</div>
              ) : (
                <div
                  className="player-list-wrapper"
                  style={{
                    justifyContent: !isMobile() ? 'flex-start' : 'center',
                    margin: '0px auto 60px auto',
                  }}
                >
                  {new Array(3).fill(1).map((_: any, index: number) => (
                    <BaseCardSkeleton key={index} />
                  ))}
                </div>
              )
            ) : (
              <div
                className="player-list-wrapper"
                style={{
                  justifyContent:
                    watchListData.length > 6 && !isMobile()
                      ? 'flex-start'
                      : 'center',
                  margin: '0px auto 60px auto',
                }}
              >
                {watchListData.map((item: any, index: number) => (
                  <div
                    style={{
                      lineHeight: '16px',
                    }}
                    key={index}
                  >
                    <NewPlayerCard
                      card={item}
                      key={index + 2}
                      onBuy={() => handlePurchaseOpen('buy', item)}
                      onSell={() => handlePurchaseOpen('sell', item)}
                      playercardjson={item?.playercardjson}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default MyWatchList
