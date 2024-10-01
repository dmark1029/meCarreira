import { PLAYER_STATUS } from '@root/constants'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import VotingPolls from './voting'
import { useEffect, useState } from 'react'
import { RootState } from '@root/store/rootReducers'
import classNames from 'classnames'
import { padding } from '@mui/system'
import { getStakingBalance } from '@root/apis/playerCoins/playerCoinsSlice'

const Votes = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [disabledPlayer, setDisabledPlayer] = useState(true)

  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const { getPlayerDetailsSuccessData } = playerCoinData

  useEffect(() => {
    if (
      getPlayerDetailsSuccessData &&
      getPlayerDetailsSuccessData.playerstatusid?.id >= PLAYER_STATUS.COMINGSOON
    ) {
      setDisabledPlayer(false)
    }
    if (getPlayerDetailsSuccessData?.playercontract) {
      dispatch(getStakingBalance(getPlayerDetailsSuccessData?.playercontract))
    }
  }, [getPlayerDetailsSuccessData])

  return (
    <section
      className={classNames('fullwidth', disabledPlayer ? 'flex-middle' : '')}
      style={{ backgroundColor: 'unset', padding: '0px 20px' }}
    >
      {disabledPlayer && (
        <div className="fullwidth not-launched-section">
          <div className="alert-wrapper">
            <div className="heading-title unverified-alert">
              {t('player_not_verified')}
            </div>
          </div>
        </div>
      )}
      {!disabledPlayer && (
        <VotingPolls
          playercontract={getPlayerDetailsSuccessData.playercontract}
          ticker={getPlayerDetailsSuccessData?.ticker}
        />
      )}
    </section>
  )
}

export default Votes
