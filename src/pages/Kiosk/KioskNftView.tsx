/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect } from 'react'
import '@assets/css/pages/PlayerNft.css'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import classNames from 'classnames'
import KioskNftForm from '@pages/Kiosk/KioskNftForm'
import {
  getItemAddress,
  getKioskItemDetail,
  resetKioskItemDetail,
} from '@root/apis/onboarding/authenticationSlice'

interface Props {
  nft: any
  isBid?: boolean
  isEndable?: boolean
}

const KioskNftView: React.FC<Props> = ({ nft, isBid, isEndable }) => {
  const dispatch = useDispatch()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { KioskItemDetailLoader, KioskItemDetail } = authenticationData

  useEffect(() => {
    if (!KioskItemDetail) {
      dispatch(getKioskItemDetail(nft?.itemid))
    }
    // call this below api on item dialog open
    if (localStorage.getItem('loginInfo') && nft?.itemid) {
      dispatch(getItemAddress(nft?.itemid)) // get add details /default_order_address
    }
    // onlyforunlimiteditems
    // order place -> /kioskItemOrder to place order => get hash in response
    // call pay contract with above hash
    // kioskItemOrderConfirm call with txn hash // runs generally
    return () => {
      dispatch(resetKioskItemDetail())
    }
  }, [])

  return (
    <section className="nft-view-container">
      {KioskItemDetailLoader ? (
        <div className="loading-spinner m-auto flex-center">
          <div className="spinner"></div>
        </div>
      ) : KioskItemDetail?.detailpageurl ? (
        <div>
          <div className={classNames('tab-bar-container')}></div>
          <KioskNftForm
            kioskItem={KioskItemDetail}
            isBid={isBid}
            isEndable={isEndable}
          />
        </div>
      ) : (
        ''
      )}
    </section>
  )
}

export default KioskNftView
