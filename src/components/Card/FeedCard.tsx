import React from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/UserCard.css'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { isMobile, toNumberFormat, truncateFloat } from '@utils/helpers'
import levelIcon from '@assets/images/level.png'
import ImageComponent from '@components/ImageComponent'

interface Props {
  user: any
  index: number
  paidCount?: number
}
const FeedCard: React.FC<Props> = ({ user, index, paidCount = 0 }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      className="user-card"
      onClick={() =>
        user?.username !== null && navigate(`/app/user/${user?.username}`)
      }
    >
      {
        <>
          <div className="user-content">
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
            <div className="user-card-feed-content">
              <div className="user-card-feed-name-info">
                <div className="user-name-wrapper">
                  <div className="user-name">
                    <div className="user-name-text">
                      {user?.username ?? t('anonymous')}
                    </div>
                    <div
                      className="user-feed-level-wrapper"
                      style={isMobile() ? { marginBottom: '6px' } : {}}
                    >
                      {user?.username && (
                        <div className="user-feed-level">
                          {user?.lifetimelevel ?? 'None'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={classNames(
                  'user-feedinfo',
                  user?.direction > 0 && (user?.amt ?? user?.amountcoins) > 0
                    ? 'green-color '
                    : 'red-color ',
                )}
              >
                <span className="user-feed-desc">has&nbsp;</span>
                {user?.direction > 0 && (user?.amt ?? user?.amountcoins) > 0
                  ? 'bought '
                  : 'sold '}
                {truncateFloat(user?.amt ?? user?.amountcoins ?? 'None', 5)}
                &nbsp;
                <b
                  onClick={evt => {
                    evt.stopPropagation()
                    navigate(`/app/player/${user?.detailpageurl}`)
                  }}
                >
                  {!isMobile() ? user?.name ?? '' : null} ${user?.ticker ?? ''}
                </b>
                <span className="user-feed-desc">&nbsp;{t('Shares')}</span>
              </div>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default FeedCard
