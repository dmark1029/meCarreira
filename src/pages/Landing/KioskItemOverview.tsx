import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/NftCard.css'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  showSignupForm,
  showKioskItemDetail,
  getKioskOrderDetail,
  getCheckPlayerCoinBal,
  togglePayForItem,
  getKioskItemDetail,
  getKioskCategoriesDetail,
} from '@root/apis/onboarding/authenticationSlice'
import { useDispatch, useSelector } from 'react-redux'
import BidButton from '@components/Button/BidButton'
import classNames from 'classnames'
import { getCircleColor, isMobile } from '@utils/helpers'
import { RootState } from '@root/store/rootReducers'
import PlayerImage from '@components/PlayerImage'
import EditIcon from '@assets/images/edit.webp'
import ImageComponent from '@components/ImageComponent'

interface Props {
  kioskItem?: any
  fullFilled?: boolean | null
  buyItem?: boolean | null
  className?: string
  isAdmin?: boolean
  disableBuy?: boolean
  onEditItem?: any
}

const KioskItemOverview: React.FC<Props> = ({
  kioskItem,
  fullFilled,
  buyItem,
  className = '',
  onEditItem = () => console.log(),
  isAdmin = false,
  disableBuy = false,
}) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const myPlayerContract = localStorage.getItem('playercontract')
  const playerCoinData = useSelector((state: RootState) => state.playercoins)
  const { getPlayerDetailsSuccessData, allPlayersData } = playerCoinData
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { selectedThemeRedux, CheckPlayerCoinBal } = authenticationData

  const location = useLocation()
  const [buyBalance, setBuyBalance] = useState(false)

  const handleClick = id => {
    dispatch(getKioskCategoriesDetail(id))
  }

  const loginId = localStorage.getItem('loginId')
  const loginInfo = localStorage.getItem('loginInfo')

  return (
    <div
      className={classNames(
        'nft-card',
        className,
        isMobile() ? 'kiosk-card-mobile' : '',
      )}
      style={{ backgroundColor: 'unset' }}
      onClick={(event: any) => {
        handleClick(kioskItem?.id)
        navigate(`/app/kiosk_category_items/${kioskItem?.id}`)
      }}
    >
      <div className="nft">
        <div className="nft-image-cover" style={{ position: 'relative' }}>
          <ImageComponent
            loading="lazy"
            src={kioskItem?.defaultImageThumbnail}
            alt=""
            className="nft-image"
          />
          <div className="coins_issued_over_nft">
            <span className="fg-primary-color">{kioskItem?.item_count}</span>
          </div>
        </div>
      </div>
      <div className={classNames('second-part', 'kiosk-item-details-wrapper')}>
        <div>
          <div
            className={classNames(
              'nft-title',
              isMobile() ? '' : 'clamped-text',
            )}
            // style={{ color: '#fff', height: '50px', whiteSpace: 'nowrap' }}
          >
            {kioskItem?.itemName}
          </div>
          <div
            className={classNames('nft-description')}
            style={{
              maxHeight: '74px',
              height: '74px',
              whiteSpace: 'normal',
            }}
          >
            <p style={{ fontSize: '16px' }}>{kioskItem?.itemDescription}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KioskItemOverview
