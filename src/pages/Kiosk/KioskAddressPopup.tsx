import React from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import classnames from 'classnames'
import SubmitButton from '@components/Button/SubmitButton'
import FormInput from '@components/Form/FormInput'
import { RootState } from '@root/store/rootReducers'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { getCountryCodeNew, getCountryId, isMobile } from '@utils/helpers'
import CountrySelect, { countries } from '@components/CountryDropdown'
import { setItemAddress } from '@root/apis/onboarding/authenticationSlice'

interface Props {
  onClose: () => void
  kioskItem: any
}

const KioskAddressPopup: React.FC<Props> = ({ onClose, kioskItem }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const submitForm = (values: any) => {
    if (kioskItem?.delivery_mode === 'postal') {
      dispatch(
        setItemAddress({
          recipientname: values.name,
          recipientaddress: values.address,
          recipientpostalcode: values.zip,
          recipientcity: values.city,
          recipientcountry: getCountryId(values.country.code),
          additional_info: values.additional_info,
        }),
      )
    } else {
      dispatch(
        setItemAddress({
          email: values.email,
        }),
      )
    }
    onClose()
  }

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { itemAddressData, getUserSettingsData, userAddressData } =
    authenticationData

  const initialValues = {
    name: itemAddressData?.recipientname ?? '',
    email: itemAddressData?.email ?? '',
    address: itemAddressData?.recipientaddress ?? '',
    zip: itemAddressData?.recipientpostalcode ?? '',
    city: itemAddressData?.recipientcity ?? '',
    country: itemAddressData?.recipientcountry
      ? countries.filter(
          country =>
            country.code ===
            getCountryCodeNew(itemAddressData?.recipientcountry),
        )[0]
      : null,
    additional_info: itemAddressData?.additional_info,
  }

  const getInitialErrors = () => {
    if (kioskItem?.delivery_mode === 'digital') {
      if (!itemAddressData?.email) {
        return {
          email: '',
        }
      }
    } else if (kioskItem?.delivery_mode === 'postal') {
      if (
        itemAddressData?.recipientaddress &&
        itemAddressData?.recipientpostalcode &&
        itemAddressData?.recipientcity &&
        itemAddressData?.recipientcountry
      ) {
        return null
      } else {
        return initialValues
      }
    }
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
        initialValues={initialValues}
        onSubmit={submitForm}
        initialErrors={getInitialErrors()}
        validationSchema={Yup.object().shape(
          kioskItem?.delivery_mode === 'postal'
            ? {
                name: Yup.string().required(t('field is required')),
                address: Yup.string().required(t('field is required')),
                zip: Yup.string().required(t('field is required')),
                city: Yup.string().required(t('field is required')),
                country: Yup.object()
                  .nullable()
                  .required(t('field is required')),
              }
            : {
                email: Yup.string()
                  .email(t('invalid email'))
                  .required(t('email Required')),
              },
        )}
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
            dirty,
          } = props
          return (
            <form className="pb-m-2" autoComplete="off" onSubmit={handleSubmit}>
              {console.log({
                values,
                errors,
                isValid,
                dirty,
              })}
              <div className="field-wrapper">
                <div className="bid-header-container mt-20 mb-20">
                  <div className="stake-bid-header">{t('delivery to')}</div>
                </div>
                {kioskItem?.delivery_mode === 'digital' ? (
                  <>
                    <FormInput
                      id="email"
                      type="email"
                      placeholder={t('enter_your_email')}
                      name="email"
                      value={values.email}
                      handleChange={handleChange}
                      onBlur={handleBlur}
                      disabled={false}
                    />
                    {errors.email && touched.email && (
                      <div className="input-feedback">
                        {errors.email.toString()}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {' '}
                    <FormInput
                      id="name"
                      type="text"
                      placeholder={t('enter_your_name')}
                      name="name"
                      value={values.name}
                      handleChange={handleChange}
                      onBlur={handleBlur}
                      disabled={false}
                    />
                    {errors.name && touched.city && (
                      <div className="input-feedback">
                        {errors.name.toString()}
                      </div>
                    )}
                    <FormInput
                      id="additional_info"
                      type="text"
                      placeholder={t('additional information')}
                      name="additional_info"
                      value={values.additional_info}
                      handleChange={handleChange}
                      onBlur={handleBlur}
                      disabled={false}
                      classNameWrapper="mt-20"
                    />
                    <FormInput
                      id="address"
                      type="text"
                      placeholder={t('enter_your_address')}
                      name="address"
                      value={values.address}
                      handleChange={handleChange}
                      onBlur={handleBlur}
                      disabled={false}
                      classNameWrapper="mt-20"
                    />
                    {errors.address && touched.city && (
                      <div className="input-feedback">
                        {errors.address.toString()}
                      </div>
                    )}
                    <div className="flexMode mt-10">
                      <FormInput
                        id="zip"
                        type="text"
                        placeholder={t('zip')}
                        name="zip"
                        value={values.zip}
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        disabled={false}
                        paymentFormZip={true}
                      />
                      <FormInput
                        id="city"
                        type="text"
                        placeholder={t('city')}
                        name="city"
                        value={values.city}
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        disabled={false}
                        paymentFormCity={true}
                      />
                    </div>
                    <div className="flexMode">
                      {errors.zip && touched.city && (
                        <div
                          className="input-feedback-pay"
                          style={{ textAlign: 'left' }}
                        >
                          {errors.zip.toString()}
                        </div>
                      )}
                      {errors.city && touched.city && (
                        <div
                          className="input-feedback-pay"
                          style={{ textAlign: 'right' }}
                        >
                          {errors.city.toString()}
                        </div>
                      )}
                    </div>
                    <div className="pay-select mt-20">
                      <CountrySelect
                        countryName={values.country}
                        setCountry={e => setFieldValue('country', e)}
                      />
                      {errors.country && touched.country && (
                        <div className="input-feedback">
                          {errors.country.toString()}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className={classnames('fullwidth mt-20')}>
                  <SubmitButton
                    isDisabled={!isValid}
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
    </section>
  )
}

export default KioskAddressPopup
