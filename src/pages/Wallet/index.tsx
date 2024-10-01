import React, { useEffect } from 'react'
import { AppLayout } from '@components/index'
import WalletForm from './WalletForm'
import '@assets/css/pages/Wallet.css'
import { isMobile } from '@utils/helpers'

const Wallet: React.FC = () => {
  useEffect(() => {
    window.history.replaceState(null, 'Buy', '/')
  }, [])

  useEffect(() => {
    if (!isMobile()) {
      document.body.style.overflow = 'hidden'
    }
  }, [isMobile()])

  return (
    <AppLayout className="p-0" footerStatus="footer-status" noPageFooter={true}>
      <WalletForm />
    </AppLayout>
  )
}

export default Wallet
