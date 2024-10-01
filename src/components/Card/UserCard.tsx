import React from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/UserCard.css'
import { useLocation, useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { toKPIIntegerFormat, toNumberFormat } from '@utils/helpers'
import levelIcon from '@assets/images/level.png'
import ImageComponent from '@components/ImageComponent'
import { useDispatch, useSelector } from 'react-redux'
import { setTourStep } from '@root/apis/onboarding/authenticationSlice'
import { RootState } from '@root/store/rootReducers'

interface Props {
  user: any
  index: number
  paidCount?: number
  hasTour?: boolean
}
const UserCard: React.FC<Props> = ({ user, index, paidCount = 0, hasTour }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const { pathname } = location

  const playerCoinData = useSelector((state: RootState) => state.playercoins)

  const { season } = playerCoinData

  const handleClick = () => {
    if (hasTour) {
      dispatch(setTourStep('user'))
      navigate(`/app/user/tour-user`)
    } else if (pathname.includes('app/user/')) {
      navigate('/app/' + 'season' + '/' + season?.season, {
        state: { from: '/' },
      })
    } else {
      user?.username !== null && navigate(`/app/user/${user?.username}`)
    }
  }

  return (
    <div className="user-card" onClick={handleClick}>
      {window.innerWidth >= 700 ? (
        <>
          {index ? (
            <div
              className={
                paidCount >= index ? 'user-index user-gold-text' : 'user-index'
              }
            >
              {index}
            </div>
          ) : null}
          <div className="user-content">
            <div className="user-info-wrapper">
              <div className="user-image">
                <div className="image-border">
                  <div
                    className={classNames(
                      'nft-image',
                      user?.avatar ?? 'anonymous',
                    )}
                  />
                </div>
              </div>
              <div
                style={{
                  gap: '10px',
                }}
                className="user-name-wrapper"
              >
                <div className="user-name">
                  <div className="user-name-text">
                    {user?.username ?? t('anonymous')}
                    <span
                      style={{
                        marginLeft: '0.8rem',
                      }}
                      className="user-feed-level-wrapper"
                    >
                      {user?.username && (
                        <div className="user-feed-level">
                          {user?.lifetimelevel ?? t('none')}
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="user-level-box">
              <div className="user-level-label green-color">{t('season')}</div>
              <div className="user-level green-color">
                {user?.xp?.toLocaleString() ?? 0}&nbsp;<i>XP</i>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {index ? <div className="user-index">{index}</div> : null}
          <div className="user-info-wrapper">
            <div className="user-image">
              <div className="image-border">
                <div
                  className={classNames(
                    'nft-image',
                    user?.avatar ?? 'anonymous',
                  )}
                />
              </div>
            </div>
            <div
              style={{
                gap: '10px',
              }}
              className="user-name-wrapper"
            >
              <div className="user-name">
                <div className="user-name-text">
                  {user?.username ?? t('anonymous')}
                  <span
                    style={{
                      marginLeft: '0.8rem',
                    }}
                    className="user-feed-level-wrapper"
                  >
                    {user?.username && (
                      <div className="user-feed-level">
                        {user?.lifetimelevel ?? t('none')}
                      </div>
                    )}
                  </span>
                </div>
              </div>
              <div className="user-vip-wrapper">
                {/* <div></div> */}
                <div className="user-level">
                  <div className="user-level-label green-color">
                    {t('season')}
                  </div>
                  <div className="primary-text-color">
                    {toKPIIntegerFormat(user?.xp).toLocaleString()}
                    &nbsp;XP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserCard
