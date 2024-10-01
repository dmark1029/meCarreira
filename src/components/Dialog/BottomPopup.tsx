/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import Modal from 'react-modal'
import classnames from 'classnames'
import '@assets/css/components/BottomPopup.css'
import { isMobile } from '@utils/helpers'
import CloseAbsolute from '@components/Form/CloseAbsolute'
interface Props {
  formActive?: string
  isOpen: boolean
  children: React.ReactNode
  contentClass?: string
  mode?: string
  noAnimation?: boolean
  onClose?: () => any
}

Modal.setAppElement('#root')

const BottomPopup: React.FC<Props> = ({
  isOpen,
  children,
  contentClass,
  mode,
  noAnimation,
  onClose = () => {},
}) => {
  useEffect(() => {
    if (isMobile()) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  return (
    <div
      id="myBottomPopup"
      className={classnames('bottom-popup', mode, isOpen ? 'show' : '')}
    >
      <div
        style={{
          position: 'relative',
        }}
      >
        <CloseAbsolute visible onClose={onClose} />
        <div
          className={classnames(
            'bottom-popup-content pb-m-2',
            noAnimation ||
              (localStorage.getItem('wallet') === 'Privy' && !isMobile())
              ? 'no-animation'
              : '',
            mode,
            contentClass,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default BottomPopup
