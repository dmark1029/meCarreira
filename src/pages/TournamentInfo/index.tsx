/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect } from 'react'
import { AppLayout } from '@components/index'
import { useDispatch, useSelector } from 'react-redux'
import { initTagManager } from '@utils/helpers'
import {
  getTopTrades,
  resetTopTrades,
} from '@root/apis/playerCoins/playerCoinsSlice'
import { useParams } from 'react-router-dom'
import { getTournamentDetails } from '@root/apis/tournament/tournamentSlice'
import { RootState } from '@root/store/rootReducers'
import Spinner from '@components/Spinner'

const TournamentInfo: React.FC = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    initTagManager()
    // document.querySelector('title')!.innerText =
    //   urlPlayer[urlPlayer.length - 1] + ' Player Fanclub & Community'
    // document
    //   .querySelector("meta[name='description']")!
    //   .setAttribute('content', t('exclusive access with player coin'))
    window.scrollTo(0, 0)
  }, [])

  const { id } = useParams()

  useEffect(() => {
    const request = {
      limit: 10,
      offset: 0,
      search: '',
      id,
    }

    dispatch(
      getTournamentDetails({
        id,
      }),
    )
  }, [])

  const { tournamentDetailData, tournamentDetailLoading } = useSelector(
    (state: RootState) => state.tournament,
  )

  console.log(tournamentDetailData)

  return (
    <AppLayout headerStatus="header-status" headerClass="home" hasShadow={true}>
      {tournamentDetailLoading ? (
        <div
          style={{
            height: '90vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className=""
        >
          <div className="spinner mt-10"></div>
        </div>
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: tournamentDetailData?.text,
          }}
          className="top-trades-container"
        ></div>
      )}
    </AppLayout>
  )
}

export default TournamentInfo
