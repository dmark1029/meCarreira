import React from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/TradeCard.css'
import { useNavigate } from 'react-router-dom'
import { getFlooredFixed, getPlayerLevelClassName } from '@utils/helpers'
import classnames from 'classnames'

interface Props {
  item: any
  index: number
}
const TournamentCard: React.FC<Props> = ({ item, index }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      onClick={() => {
        navigate('/app/tournament/' + item?.id)
      }}
      className="box-item trade-card"
    >
      {index ? <div className="trade-index">{index}</div> : null}
      <div className="trade-info-wrapper">
        <div className="trade-name-wrapper">
          <div
            className={classnames(
              'trade-player-name',
              getPlayerLevelClassName(item?.playerlevelid),
            )}
            onClick={() => navigate(`/app/player/${item?.detailpageurl}`)}
          >
            {item?.name}
            {/* ${item?.ticker ?? 'None'} */}
          </div>
          <div className="trade-user-name">
            <b>{item?.stagename ?? t('anonymous')}</b>
          </div>
        </div>
        <div className="trade-value-group">
          <div className="trade-value-box">
            {/* <p className="green-color">{t('participants')}</p>
            <div className="primary-text-color">{item?.participants}</div> */}
          </div>
          <div className="trade-value-box">
            <p className="green-color">{t('participants')}</p>
            <div className="primary-text-color">{item?.participants}</div>
          </div>
          {/* <div
            className={classnames(
              'trade-profit number-color',
              item?.profitusd > 0 ? 'profit' : 'loss',
            )}
          >
            Active
          </div> */}

          <div className="trade-value-box">
            <p className="green-color">{t('status')}</p>
            <div
              className={classnames(
                'primary-text-color capitalize',
                item?.isended ? 'text-loss' : 'text-green',
              )}
            >
              {item?.isended ? 'Over' : 'Active'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentCard
