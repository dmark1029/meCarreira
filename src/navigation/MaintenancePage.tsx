import React from 'react'
import { useTranslation } from 'react-i18next'
import Logo from '@assets/images/logo-min.webp'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import classNames from 'classnames'
import { isMobile } from '@utils/helpers'

interface Props {
  onBack: () => void
}

const MaintenancePage: React.FC<Props> = ({ onBack }) => {
  const { t } = useTranslation()

  return (
    <div id="maintenancePage" className="main_content_wrapper">
      <div className="denied_header">
        <ArrowBackIcon onClick={onBack} className="icon-color" />
        <img src={Logo} style={{ width: '120px' }} alt="" />
        <div className="icon-color" style={{ margin: '32px' }}>
          {' '}
        </div>
      </div>
      <div
        className={classNames(
          'main_content',
          isMobile() ? 'main_content_mobile' : 'main_content_desktop',
        )}
      >
        <div>
          <img src={Logo} style={{ width: '120px' }} alt="" />
        </div>
        <div className="access_denied_heading m-0">
          {t('site_under_maintenance')}
        </div>
        <div className="bottom-caption-wrapper">
          <span
            className="blog-content bottom-content pg-lg text-left"
            style={{ fontSize: '20px' }}
          >
            {t('site_undergoing_scheduled_maintenance')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MaintenancePage)
