import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Spinner from '@components/Spinner'
import { postRequestAuth } from '@root/apis/axiosClientAuth'
import ImageComponent from '@components/ImageComponent'
import wertIcon from '@assets/icons/icon/wert.svg'
import { isMobile } from '@utils/helpers'
interface Props {
  onAccept: () => any
  onClose: () => any
}
const WertBumper: React.FC<Props> = ({ onAccept, onClose }) => {
  const { t } = useTranslation()
  const [isProgress, setIsProgress] = useState<boolean>(false)
  const overflowStatus = document.body.style.overflow

  const handleAccept = async (evt: any) => {
    evt.preventDefault()
    setIsProgress(true)
    await postRequestAuth('accounts/wert_acknowledge/')
    setIsProgress(false)
    onAccept()
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflowStatus
    }
  }, [])

  return (
    <div className="wert-bumper-container">
      <div className="wert-bumper-logo">
        <ImageComponent src={wertIcon} alt="" />
      </div>
      <h2 className="wert-bumper-title">{t('our partner wert.io')}</h2>
      <p className="wert-bumper-text">{t('we_collaborate_with')}</p>
      {isProgress ? (
        <div className="button_wrapper">
          <Spinner title={''} spinnerStatus={true} />
        </div>
      ) : (
        <>
          <div className="button_wrapper">
            <button className="form-submit-btn m-0auto" onClick={handleAccept}>
              {t('i_understand')}
            </button>
          </div>
          {isMobile() ? (
            <div className="button_wrapper">
              <button
                className="form-submit-btn m-0auto btn-disabled"
                onClick={onClose}
              >
                {t('close')}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default WertBumper
