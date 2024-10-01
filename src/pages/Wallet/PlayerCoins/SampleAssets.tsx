import React, { useState } from 'react'
import { isMobile } from '@utils/helpers'
import ArrowUpFilled from '@components/Svg/ArrowUpFilled'
import ImageComponent from '@components/ImageComponent'
import sampleAvatar from '@assets/images/players/dummy.webp'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useTranslation } from 'react-i18next'
import BottomPopup from '@components/Dialog/BottomPopup'

const SampleAssets: React.FC = () => {
  const [infoPop, setInfoPop] = useState(false)
  const { t } = useTranslation()

  const handleClosePop = () => {
    setInfoPop(false)
  }

  return (
    <>
      <BottomPopup
        mode={`wallet ${isMobile() ? 'exwallet-bottomwrapper' : ''}`}
        isOpen={infoPop}
        contentClass="currency_drop_container-send"
        onClose={() => handleClosePop()}
      >
        <section className="wallet-container custom-scroll overflow-auto">
          <p className="info_item_p">{t('sample_assets_desc_1')}</p>
          <p className="info_item_p">{t('sample_assets_desc_2')}</p>
          <p className="info_item_p">{t('sample_assets_desc_3')}</p>
          <p className="info_item_p">{t('sample_assets_desc_4')}</p>
        </section>
      </BottomPopup>
      <div className="assets-container">
        <div className="nft-item sample-assets-container">
          <div className="nft-image-section">
            <div className="input-label">
              <div className="info_icon_container">
                <div
                  className="info_icon_playerCoinRequest"
                  style={{ height: '22px' }}
                  onClick={() => {
                    setInfoPop(true)
                  }}
                >
                  <InfoOutlinedIcon
                    sx={{
                      color: 'var(--secondary-foreground-color)',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="image-border pc-avatar-container">
              <ImageComponent
                loading="lazy"
                src={sampleAvatar}
                alt="default player"
                className="nft-image"
              />
            </div>
          </div>
          <div className="nft-name-section pc-name-section">
            <div className="nft-name">{t('player name')}</div>
            <div className="balance-wrapper">
              <div>{t('number of shares')}</div>
              <div className="percentage_change_wrapper">
                <div className="nft-price">{t('$usd value')}</div>
                <div className="percentage_container">
                  <ArrowUpFilled />
                  <div className="number-color profit">{t('24H Change')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SampleAssets
