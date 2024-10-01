import React, { useEffect, useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import classnames from 'classnames'
import SubmitButton from '@components/Button/SubmitButton'
import FormInput from '@components/Form/FormInput'
import { RootState } from '@root/store/rootReducers'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  getBtnDisabledStatusForAddress,
  getCountryCodeNew,
  getFlooredFixed,
  isMobile,
  limitDecimalPlaces,
  toFixed,
} from '@utils/helpers'
import EditIcon from '@mui/icons-material/Edit'
import BottomPopup from '@components/Dialog/BottomPopup'
import KioskAddressPopup from './KioskAddressPopup'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import CloseAbsolute from '@components/Form/CloseAbsolute'

interface Props {
  onSubmit: (v: any) => void
  onClose: () => void
  kioskItem: any
}

const KioskBidPopup: React.FC<Props> = ({ onSubmit, onClose, kioskItem }) => {
  const { t } = useTranslation()

  const submitForm = (values: any) => {
    onSubmit(values)
  }

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    getUserSettingsData,
    itemAddressData,
    ipLocaleCurrency,
    currencyRate,
    KioskItemDetail,
  } = authenticationData

  const currencySymbol =
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD'

  const kioskInitialValues = {
    amount: 0,
  }

  const { maxbids, bidList, stakingBalance } = useSelector(
    (state: RootState) => state.playercoins,
  )

  const [showAddressPopup, setShowAddressPopup] = useState(false)
  const [minimumCurrentBid, setMinimumCurrentBid] = useState(0.0)

  useEffect(() => {
    console.log({
      itemPrice: KioskItemDetail?.itemPrice,
      maxbid: KioskItemDetail?.maxbid,
    })
    if (KioskItemDetail?.itemPrice) {
      const bid = KioskItemDetail?.itemPrice + KioskItemDetail?.maxbid
      setMinimumCurrentBid(bid)
    }
  }, [KioskItemDetail])

  const getBtnDisabledStatus = (
    itemAddressData,
    kioskItem,
    isValid,
    errors,
  ) => {
    console.log('formValid', { isValid, errors })
    if (kioskItem?.delivery_mode === 'digital') {
      if (
        !itemAddressData?.email ||
        itemAddressData?.email === 'null' ||
        !isValid
      ) {
        return true
      }
      console.log('')
    } else if (kioskItem?.delivery_mode === 'postal') {
      if (
        !itemAddressData?.recipientaddress ||
        itemAddressData?.recipientaddress === 'null' ||
        !itemAddressData?.recipientcity ||
        itemAddressData?.recipientcity === 'null' ||
        !itemAddressData?.recipientpostalcode ||
        itemAddressData?.recipientpostalcode === 'null' ||
        !isValid
      ) {
        return true
      }
    }
    return false
  }

  return (
    <section
      className={classnames(
        'wallet-container stake-bid-container',
        isMobile() ? 'stake-bid-mobile' : '',
      )}
    >
      <Formik
        enableReinitialize={true}
        initialValues={kioskInitialValues}
        initialErrors={{
          amount: '0',
        }}
        // initialValues={{
        //   amount: KioskItemDetail?.itemPrice
        //     ? KioskItemDetail?.itemPrice + 0.1
        //     : 0,
        // }}
        onSubmit={submitForm}
        validationSchema={Yup.object().shape({
          amount: Yup.number()
            .max(
              parseFloat(maxbids),
              t('bid amount should be less than balance'),
            )
            // .moreThan(
            //   bidList.length > 0 ? bidList[0]?.bid : 0,
            //   t('bid amount should be greater than current bid'),
            // )
            // .moreThan(
            //   KioskItemDetail?.itemPrice,
            //   t('bid amount should be greater than current bid'),
            // )
            .min(minimumCurrentBid, t('bid amount too low'))
            .required(t('bid amount required')),
        })}
      >
        {props => {
          const {
            values,
            touched,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            isValid,
          } = props
          return (
            <form className="pb-m-2" autoComplete="off" onSubmit={handleSubmit}>
              <div className="field-wrapper">
                <div className="bid-header-container mt-20 mb-20">
                  <div className="stake-bid-header">{t('place bid')}</div>
                </div>
                <div className="bid-desc mb-20">
                  {t('you must place a bid')}
                </div>
                {/* <label>
                  <b>{t('enter bid')}:</b>
                </label> */}
                <div
                  className="form-label-wrapper align-end fullwidth"
                  style={{
                    justifyContent: 'flex-start',
                  }}
                >
                  <label>{t('minimum bid')}:</label>
                  <label
                    className="form-label-active"
                    onClick={() => setFieldValue('amount', minimumCurrentBid)}
                  >
                    {minimumCurrentBid ? toFixed(minimumCurrentBid, 3) : 0.0}
                  </label>
                </div>
                <div className="bid-textinput-wrapper">
                  <FormInput
                    id="amount"
                    type="number"
                    placeholder={t('amount')}
                    value={values.amount}
                    name="amount"
                    handleChange={evt => {
                      handleChange(evt)
                    }}
                    onBlur={handleBlur}
                  />
                  <div className="bid-value-wrapper">
                    <b>
                      {getFlooredFixed(
                        values.amount > 0
                          ? parseFloat(values.amount) *
                              (kioskItem?.coinprice ?? 1) *
                              kioskItem?.exchangeRateUSD?.rate *
                              currencyRate
                          : 0,
                        2,
                      )}
                      &nbsp;
                      {currencySymbol}
                    </b>
                  </div>
                </div>
                {errors.amount && touched.amount && (
                  <div className="input-feedback">
                    {errors.amount.toString()}
                  </div>
                )}
                <div className="form-label-wrapper align-end fullwidth">
                  <label>{t('maximum coins to bid')}:</label>
                  <label
                    className="form-label-active"
                    onClick={() => setFieldValue('amount', maxbids)}
                  >
                    {maxbids
                      ? maxbids.length > 1
                        ? maxbids
                        : parseFloat(maxbids).toFixed(5)
                      : '0.00'}
                  </label>
                </div>
                <div className="item-address-wrapper mt-40 mb-20">
                  {itemAddressData?.recipientcountry ? (
                    KioskItemDetail?.delivery_mode === 'digital' ? (
                      <div style={{ width: '40px' }}></div>
                    ) : (
                      <span
                        className={`fi fis fi-${getCountryCodeNew(
                          itemAddressData?.recipientcountry,
                        )?.toLowerCase()}`}
                      ></span>
                    )
                  ) : (
                    <div
                      className="item-address-addicon"
                      onClick={() => setShowAddressPopup(true)}
                    >
                      <AddCircleOutlinedIcon />
                    </div>
                  )}
                  <b>
                    {kioskItem?.delivery_mode === 'digital'
                      ? itemAddressData?.email ?? t('please add email')
                      : itemAddressData?.recipientaddress
                      ? `${itemAddressData?.recipientaddress}, ${itemAddressData?.recipientcity}`
                      : t('please add delivery address')}
                  </b>
                  <div onClick={() => setShowAddressPopup(true)}>
                    <EditIcon />
                  </div>
                </div>
                <div className={classnames('fullwidth mt-20')}>
                  <SubmitButton
                    // isDisabled={false}
                    isDisabled={getBtnDisabledStatus(
                      itemAddressData,
                      kioskItem,
                      isValid,
                      errors,
                    )}
                    title={t('confirm')}
                    className="m-0auto"
                    onPress={handleSubmit}
                  />
                  <div
                    className={classnames(
                      'form-submit-btn btn-disabled mt-20 m-0auto',
                    )}
                    onClick={onClose}
                  >
                    {t('cancel')}
                  </div>
                </div>
              </div>
            </form>
          )
        }}
      </Formik>
      <BottomPopup
        mode={
          kioskItem?.delivery_mode === 'digital' || stakingBalance === 0
            ? 'stake'
            : 'nft'
        }
        isOpen={showAddressPopup}
        onClose={() => {
          setShowAddressPopup(false)
        }}
      >
        {/* <CloseAbsolute
          onClose={() => {
            setShowAddressPopup(false)
          }}
        /> */}
        <KioskAddressPopup
          kioskItem={kioskItem}
          onClose={() => {
            setShowAddressPopup(false)
          }}
        />
      </BottomPopup>
    </section>
  )
}

export default KioskBidPopup
