import React from 'react'
import { useTranslation } from 'react-i18next'
import PlayerImage from '@components/PlayerImage'
import '@assets/css/components/UserCard.css'
import { useNavigate } from 'react-router-dom'
import {
  getFlooredNumber,
  getMarketValue,
  getFlooredFixed,
  getUsdFromMatic,
  getCircleColor,
  toNumberFormat,
  getPlayerLevelClassName,
  getCountryName,
  getCountryCodeNew,
} from '@utils/helpers'
import classNames from 'classnames'
import { toast } from 'react-hot-toast'
import ImageComponent from '@components/ImageComponent'
import levelIcon from '@assets/images/level.png'
import TooltipLabel from '@components/TooltipLabel'
import { countriesData } from '@root/constants'
import CloseIcon from '@mui/icons-material/Close'

interface Props {
  user: any
  index: number
  playerstats?: any
  usageArea?: string
  containerId?: string
  render?: () => void
  isRender?: boolean
  onDeleteDraftee?: () => void
  onClickAvatar?: () => void
  onClickPlayerName?: () => void
}
const PlayersCardSupporter: React.FC<Props> = ({
  user,
  index,
  playerstats,
  usageArea,
  isRender = false,
  render = null,
  containerId = null,
  onClickAvatar = null,
  onClickPlayerName = null,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getUsdPrice = (coinBalance: number) => {
    const totalValue = playerstats?.matic * coinBalance
    const totalUsd = totalValue * playerstats?.exchangeRateUSD?.rate
    return getFlooredFixed(totalUsd, 3)
  }

  const handleClickItem = () => {
    if (usageArea !== 'drafts') {
      navigate(`/app/player/${user?.detailpageurl}`)
    }
  }

  return (
    <div
      id={containerId}
      className="user-card user-scouts-card-supporter nft-item"
      onClick={handleClickItem}
    >
      <div className="user-content">
        <div className="user-info-wrapper nft-image-section">
          <div
            className={classNames(
              usageArea === 'drafts'
                ? 'draft-player-img-border'
                : 'image-border',
            )}
            style={{
              background: getCircleColor(user?.playerlevelid),
            }}
            onClick={() => onClickAvatar && onClickAvatar()}
          >
            <PlayerImage
              src={user.playerpicturethumb}
              className="nft-image"
              hasDefault={true}
            />
          </div>
        </div>
        <div
          className="user-name-wrapper"
          onClick={() => onClickPlayerName && onClickPlayerName()}
        >
          <div className="user-price-wrapper">
            <div
              className={`${getPlayerLevelClassName(
                user?.playerlevelid,
              )} user-name ${
                usageArea === 'drafts' ? 'd-flex draftee-players' : ''
              }`}
            >
              <span>
                {user.name} ${user?.ticker}
                {usageArea === 'drafts' && (
                  <TooltipLabel
                    title={getCountryName(
                      getCountryCodeNew(user.country_id),
                      countriesData,
                    )}
                  >
                    &nbsp;
                    <span
                      className={`nation_badge fi-${getCountryCodeNew(
                        user.country_id,
                      ).toLowerCase()}`}
                      style={{ marginBottom: -3 }}
                    ></span>
                  </TooltipLabel>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      {isRender ? (
        <>{render()}</>
      ) : (
        <div className="user-level-group">
          <div className="user-level-wrapper">
            <div className="nft-price">
              {getFlooredFixed(getUsdFromMatic(user)?.usdNow, 3)}
            </div>
            <div className="nft-price">
              $
              {getFlooredNumber(
                getMarketValue(
                  user?.matic ?? user?.matic_price,
                  user?.exchangeRateUSD?.rate,
                  user?.coin_issued,
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayersCardSupporter
