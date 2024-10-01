/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect } from 'react'
import NftForm from './NftForm'
import NftDetail from './NftDetail'
import '@assets/css/pages/PlayerNft.css'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { fetchNFTData, resetNftData } from '@root/apis/gallery/gallerySlice'
import classNames from 'classnames'

interface Props {
  nft: any
  isBid?: boolean
  isEndable?: boolean
}

const nftDataX = {
  accountbalance: 1,
  address: '0x29ab0eef9770b58cd3445706f00abd764f5cf204',
  artwork_thumb:
    'https://restapi.mecarreira.com/meCarreira_backend/media/genesis_nfts/genesis_nft_4.webp',
  description:
    'Genesis by meCarreira is a series of NFTs that contain unlocks to access player drops right after their launch. Some players require genesis NFTs within an initial time period in order to be able to buy shares from them. The genesis NFT then uses up an unlock until it has none or is upgraded due to XP gathered on it',
  isperpetual: 0,
  level: 4,
  nameg: 'Genesis Diamond',
  nfttype: 'minted',
  remainingunlocks: 30,
  statusid: 5,
  tokenid: 23,
  tokenurl: 'https://restapi.mecarreira.com/nft/genesis/15',
  totalunlocks: 30,
  isGenesisNFT: true,
}

const NftView: React.FC<Props> = ({ nft, isBid, isEndable }) => {
  const dispatch = useDispatch()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { userWalletData, selectedThemeRedux } = authenticationData
  const loginInfo = localStorage.getItem('loginInfo')
  const { isLoading, nftData } = useSelector(
    (state: RootState) => state.gallery,
  )
  const loginId = localStorage.getItem('loginId')

  useEffect(() => {
    if (nft?.nfttype === 'raffle') {
      if (loginInfo || userWalletData?.address) {
        if (loginInfo) {
          dispatch(
            fetchNFTData({ id: nft.id || nft?.address, wallet: loginInfo }),
          )
        } else if (loginId) {
          dispatch(
            fetchNFTData({
              id: nft.id || nft?.address,
              wallet: userWalletData?.address,
            }),
          )
        }
      } else {
        dispatch(fetchNFTData({ id: nft.id || nft?.address }))
      }
    } else {
      dispatch(fetchNFTData({ id: nft.id || nft?.address }))
    }
    return () => {
      dispatch(resetNftData())
    }
  }, [])

  return (
    <section className="nft-view-container">
      {isLoading ? (
        <div className="loading-spinner m-auto flex-center">
          <div className="spinner"></div>
        </div>
      ) : nftData ? (
        <div>
          <div className={classNames('tab-bar-container')}></div>
          <NftForm nft={nftData} isBid={isBid} isEndable={isEndable} />
          <NftDetail nft={nftData} />
        </div>
      ) : (
        ''
      )}
    </section>
  )
}

export default NftView
