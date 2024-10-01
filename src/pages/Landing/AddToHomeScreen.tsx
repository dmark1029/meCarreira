import React from 'react'
import { useTranslation } from 'react-i18next'
import classnames from 'classnames'
import DownloadDesktopApp from '@assets/images/desktop_min.webp'
import DownloadMobileApp from '@assets/images/mobile_min.webp'
import ImageComponent from '@components/ImageComponent'
import { isMobile, getBrowserName } from '@utils/helpers'

interface Props {
  onCancel: () => void
  onAccept: () => void
  promptEvt: any
}
const AddToHomeScreen: React.FC<Props> = ({ onCancel, onAccept }) => {
  const { t } = useTranslation()
  const currentBrowser = getBrowserName()

  const getTranslation = (text: string) => {
    const translation = t(text)
    if (translation === text) {
      return text
    } else {
      return translation
    }
  }

  return (
    <div className="newsletter-wrapper">
      <div className="newsletter-wrapper">
        <ImageComponent
          loading="lazy"
          src={isMobile() ? DownloadMobileApp : DownloadDesktopApp}
          alt=""
          className="homescreen-logo"
        />
        <span
          className={classnames('blog-title ct-h2', !isMobile() ? 'mt-20' : '')}
        >
          {t('add to homescreen')}
        </span>
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            margin: '1rem 0rem',
          }}
          className="bottom-caption-wrapper"
        >
          <span
            className={classnames(
              'blog-content mt-20',
              !isMobile() ? 'installation-msg' : '',
            )}
          >
            {getTranslation('add this app to homescreen')}
            {currentBrowser === 'Safari' && (
              <>
                {' '}
                <br />
                <br />
                {t('tap on share option safari') + ' ' + t('add to home')}
              </>
            )}
          </span>
        </div>

        {currentBrowser === 'Safari' ? (
          <div
            style={{
              position: 'relative',
            }}
            className="addhome-btn-wrapper"
          >
            <div className="bottom-caption-wrapper">
              {/* <span
              className={classnames(
                'blog-content mt-20',
                !isMobile() ? 'installation-msg' : '',
              )}
            >
              {t('tap on share option safari') + ' ' + t('add to home')}
            </span> */}
            </div>
            <span className={classnames('newsletter-submit')}>
              <div
                onClick={() => onCancel()}
                className="button-box submit-btn-box"
              >
                {t('not now')}
              </div>
            </span>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
            }}
            className="addhome-btn-wrapper"
          >
            <span className={classnames('newsletter-submit')}>
              <div
                className="button-box submit-btn-box active-btn-launch"
                onClick={onAccept}
              >
                {t('yes')}
              </div>
            </span>
            <span className={classnames('newsletter-submit')}>
              <div
                onClick={() => onCancel()}
                className="button-box submit-btn-box"
              >
                {t('not now')}
              </div>
            </span>
          </div>
        )}
      </div>
    </div>
  )

  // OLD CODE
  // return (
  //   <div className="newsletter-wrapper">
  //     <ImageComponent
  //       loading="lazy"
  //       src={isMobile() ? DownloadMobileApp : DownloadDesktopApp}
  //       alt=""
  //       className="homescreen-logo"
  //     />
  //     <span
  //       className={classnames('blog-title ct-h2', !isMobile() ? 'mt-20' : '')}
  //     >
  //       {t('add to homescreen')}
  //     </span>
  //     <div className="bottom-caption-wrapper">
  //       <span
  //         className={classnames(
  //           'blog-content mt-20',
  //           !isMobile() ? 'installation-msg' : '',
  //         )}
  //       >
  //         {getTranslation('add this app to homescreen')}
  //       </span>
  //     </div>
  //     {currentBrowser === 'Safari' ? (
  //       <div className="addhome-btn-wrapper">
  //         <div className="bottom-caption-wrapper">
  //           <span
  //             className={classnames(
  //               'blog-content mt-20',
  //               !isMobile() ? 'installation-msg' : '',
  //             )}
  //           >
  //             {t('tap on share option safari') + ' ' + t('add to home')}
  //           </span>
  //         </div>
  //         <span className={classnames('newsletter-submit')}>
  //           <div
  //             onClick={() => onCancel()}
  //             className="button-box submit-btn-box"
  //           >
  //             {t('not now')}
  //           </div>
  //         </span>
  //       </div>
  //     ) : (
  //       <div className="addhome-btn-wrapper">
  //         <span className={classnames('newsletter-submit')}>
  //           <div
  //             className="button-box submit-btn-box active-btn-launch"
  //             onClick={onAccept}
  //           >
  //             {t('yes')}
  //           </div>
  //         </span>
  //         <span className={classnames('newsletter-submit')}>
  //           <div
  //             onClick={() => onCancel()}
  //             className="button-box submit-btn-box"
  //           >
  //             {t('not now')}
  //           </div>
  //         </span>
  //       </div>
  //     )}
  //   </div>
  // )
}

export default AddToHomeScreen
