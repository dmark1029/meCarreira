import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import PhoneInput from 'react-phone-number-input'
import classNames from 'classnames'
import { getCountryCodeNew, isMobile } from '@utils/helpers'
import {
  postUserSettings,
  getUserSettings,
  getFiatCurrencyList,
  handleChangeSecret,
  getKioskOrderDetail,
  showKioskItemDetail,
  getUserProfile,
  getUserAddress,
  postUserAddress,
  resetPostUserAddressSuccess,
} from '@root/apis/onboarding/authenticationSlice'
import DialogBox from '@components/Dialog/DialogBox'
import UserWhatsAppOtp from './UserWhatsAppOtp'
import { useNavigate } from 'react-router'
import ArrowDown from '@components/Svg/ArrowDown'
import ArrowUp from '@components/Svg/ArrowUp'
import Select from '@components/Form/Select'
import { RootState } from '@root/store/rootReducers'
import ListItem from './Components/ListItem'
import CheckIcon from '@mui/icons-material/Check'
import { Grid } from '@mui/material'
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'
import FormInput from '@components/Form/FormInput'
import EditIcon from '@components/Svg/EditIcon'
import { toast } from 'react-hot-toast'
import XPProgressBar from '@components/XPProgressBar'
import { Formik } from 'formik'
import * as Yup from 'yup'
import CountrySelect, { countries } from '@components/CountryDropdown'
import SubmitButton from '@components/Button/SubmitButton'

const UserMySettings: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    userSettingsLoader,
    isUserSettingsError,
    getUserSettingsData,
    postUserSettingsData,
    getUserSettingsLoader,
    ipLocaleCurrency,
    fiatCurrencyList,
    userProfile,
    isLoadingUserAddress,
    userAddressData,
    postUserAddressLoader,
    isPostUserAddressSuccess,
  } = authenticationData

  const addressInitialValues = {
    name: userAddressData?.recipientname ?? '',
    email: userAddressData?.email ?? '',
    address: userAddressData?.recipientaddress ?? '',
    zip: userAddressData?.recipientpostalcode ?? '',
    city: userAddressData?.recipientcity ?? '',
    country_code: userAddressData?.recipientcountry
      ? countries.filter(
          country =>
            country.code ===
            getCountryCodeNew(userAddressData?.recipientcountry),
        )[0]
      : null,
    additional_info: userAddressData?.additional_info ?? '',
  }

  const [email, setEmail] = useState(getUserSettingsData?.email)
  const [currency, setCurrency] = useState(
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD',
  )
  const loginId = localStorage.getItem('loginId')
  const [whatsAppNumber, setWhatsAppNumber] = useState(
    getUserSettingsData?.whastapp_number,
  )
  const [whatsAppMobileValidationError, setWhatsAppMobileValidationError] =
    useState('')
  const [editable, setEditable] = useState(false)
  const [isEditUsername, setIsEditUsername] = useState(false)
  const [isImageDialogVisible, setIsImageDialogVisible] = useState(false)
  const [isPublic, setIsPublic] = useState(1)
  useEffect(() => {
    if (getUserSettingsData) {
      setIsPublic(getUserSettingsData?.profile_visibility)
    }
  }, [getUserSettingsData?.profile_visibility])
  const [username, setUsername] = useState(getUserSettingsData?.username)
  const formData = {
    whastapp_number: whatsAppNumber,
    currency: currency,
    email: email,
    language: localStorage.getItem('language'),
  }
  const formDataOriginal = {
    whastapp_number: getUserSettingsData?.whastapp_number,
    currency: getUserSettingsData?.currency,
    email: getUserSettingsData?.email,
    language: localStorage.getItem('language'),
  }
  useEffect(() => {
    const eq = JSON.stringify(formData) === JSON.stringify(formDataOriginal)
    if (eq === false) {
      setEditable(true)
    } else {
      setEditable(false)
    }
  }, [formData, formDataOriginal])

  useEffect(() => {
    setEmail(getUserSettingsData?.email)
    setWhatsAppNumber(getUserSettingsData?.whastapp_number)
    setCurrency(getUserSettingsData?.currency)
  }, [getUserSettingsData])

  useEffect(() => {
    window.scrollTo(0, 0)
    dispatch(getUserSettings())
    dispatch(getUserAddress())
    dispatch(getFiatCurrencyList())
  }, [])

  useEffect(() => {
    getUserSettingsData?.username && setUsername(getUserSettingsData?.username)
    // if (getUserSettingsData?.is_verified === false) {
    //   setWhatsAppOtp(true)
    // } else if (getUserSettingsData?.is_verified === true) {
    //   setWhatsAppOtp(false)
    // }
  }, [getUserSettingsData])

  useEffect(() => {
    if (
      postUserSettingsData === 'User Settings Saved' ||
      postUserSettingsData === 'User Settings Updated'
    ) {
      toast.success(t('successfully saved'))
      dispatch(getUserSettings())
    }
  }, [postUserSettingsData])

  const [isAddedPhone, setIsAddedPhone] = useState(false)
  const handlePostUser = () => {
    if (whatsAppNumber?.length < 6 || whatsAppNumber?.length > 16) {
      setWhatsAppMobileValidationError(t('phone number is not valid'))
    } else {
      const userSettings = { ...getUserSettingsData, ...formData }
      delete userSettings['username']
      if (localStorage.getItem('wallet') === 'Privy') {
        delete userSettings['email']
      }
      dispatch(postUserSettings(userSettings))
      if (!getUserSettingsData?.whastapp_number && whatsAppNumber) {
        setWhatsAppOtp(true)
        setIsAddedPhone(true)
      }
    }
  }

  const [whatsAppOtp, setWhatsAppOtp] = useState(false)
  const handleOpenWhatsAppPop = async () => {
    setWhatsAppOtp(true)
  }
  const [selected, setSelected] = useState(3)
  const toggle = (i: number) => {
    if (selected === i) {
      return setSelected(0)
    }
    setSelected(i)
  }

  const onMenuClick = () => {
    dispatch(handleChangeSecret(true))
  }
  useEffect(() => {
    dispatch(getUserProfile())
  }, [])

  const handleChangeUsername = () => {
    setIsEditUsername(false)
    dispatch(postUserSettings({ username }))
  }

  const handleChangeVisibility = e => {
    setIsPublic(e.target.value)
    dispatch(postUserSettings({ profile_visibility: e.target.value }))
  }

  const handleChoose = index => {
    setIsImageDialogVisible(false)
    dispatch(postUserSettings({ avatar: `group-${index}` }))
  }

  useEffect(() => {
    if (isImageDialogVisible || whatsAppOtp) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isImageDialogVisible, whatsAppOtp])

  useEffect(() => {
    if (isUserSettingsError) {
      toast.error(isUserSettingsError, {
        duration: 3000,
      })
      setUsername(getUserSettingsData?.username)
    }
  }, [isUserSettingsError])

  useEffect(() => {
    if (isPostUserAddressSuccess) {
      toast.success(t('successfully saved'))
      dispatch(resetPostUserAddressSuccess())
    }
  }, [isPostUserAddressSuccess])

  const maxNumber = 15
  const [currentNumber, setCurrentNumber] = useState(
    username ? maxNumber - username.length : maxNumber,
  )

  const handleSaveAddress = (values: any) => {
    console.log('tester handleSaveAddress', values)
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('address', values.address)
    formData.append('ZIP', values.zip)
    formData.append('city', values.city)
    formData.append('country_id', values.country_code.phone)
    formData.append('country_code', values.country_code.code)
    if (values.additional_info) {
      formData.append('additional_info', values.additional_info)
    }
    dispatch(postUserAddress(formData))
  }

  return (
    <div className="kiosk-wrapper my-settings">
      <div className="user-card-setting user-card my-settings">
        <DialogBox
          isOpen={isImageDialogVisible}
          onClose={() => setIsImageDialogVisible(false)}
          parentClass={isMobile() ? 'flex-dialog' : ''}
        >
          <div className="blog-title new-launches-title h-2">
            {t('choose avatar image')}
          </div>
          <div className="nft-gallery-grid">
            <Grid container>
              {Array.from({ length: 27 }, (_, k) => k + 1).map((_, index) => (
                <Grid
                  item
                  md={6}
                  xs={6}
                  className={
                    index % 2 === 0
                      ? 'nft-gallery-leftline'
                      : 'nft-gallery-rightline'
                  }
                  key={index}
                >
                  <div className="nft-gallery-card">
                    <div
                      className={classNames(
                        'nft-gallery-img',
                        'big-group-' + index,
                      )}
                      onClick={() => handleChoose(index)}
                    />
                  </div>
                </Grid>
              ))}
            </Grid>
          </div>
        </DialogBox>
        <div className="user-info-wrapper">
          <div className="user-image">
            <div className="image-border">
              <div
                className={classNames(
                  'nft-image',
                  `big-${getUserSettingsData?.avatar ?? 'group-0'}`,
                )}
              />
            </div>
            <div className="icon-pencil">
              <CreateOutlinedIcon
                className="icon-pencil-svg"
                onClick={() => setIsImageDialogVisible(true)}
              />
            </div>
          </div>
          <div className="user-name-wrapper">
            {isEditUsername ? (
              <div className="user-name">
                <FormInput
                  id="referral_code"
                  type="text"
                  placeholder={t('enter user name')}
                  value={username}
                  maxLength={maxNumber}
                  handleChange={(e: any) => {
                    const length = e.target.value.length
                    setCurrentNumber(maxNumber - length)
                    setUsername(e.target.value)
                  }}
                  onBlur={() => console.log('')}
                />
                <div className="icon-pencil icon-checked">
                  <CheckIcon
                    className="icon-pencil-svg"
                    onClick={handleChangeUsername}
                  />
                </div>
                {currentNumber < maxNumber && currentNumber >= 0 && (
                  <div className="characters_left">
                    {t('characters left')}: {currentNumber}
                  </div>
                )}
              </div>
            ) : (
              <div className="user-name">
                <div className="settingname">
                  {getUserSettingsData?.username ?? username}
                </div>
                <div className="icon-pencil">
                  <CreateOutlinedIcon
                    className="icon-pencil-svg"
                    onClick={() => setIsEditUsername(true)}
                  />
                </div>
              </div>
            )}
            {/* <div className="user-vip">{t('VIP')}</div> */}
            <select
              className="user-select"
              onChange={handleChangeVisibility}
              value={isPublic}
            >
              <option value="1">{t('public')}</option>
              <option value="0">{t('private')}</option>
            </select>
          </div>
        </div>
      </div>

      <XPProgressBar
        level={userProfile?.lifetimelevel}
        nextLevelXp={userProfile?.next_level_xp}
        currentXp={userProfile?.xp}
        levelIncrement={userProfile?.level_increment}
        index={2}
      />
      {/* change Secret */}
      {loginId ? (
        <div
          style={{
            // backgroundColor: '#1e2030',
            marginTop: '10px',
          }}
          key={1}
        >
          <div
            className="title"
            onClick={() => toggle(1)}
            style={{ padding: '0px 13px !important' }}
          >
            <h2>{t('security')}</h2>
            {selected === 1 ? <ArrowUp /> : <ArrowDown />}
          </div>
          <div className={selected === 1 ? 'content show' : 'content'}>
            <div style={{ marginTop: '20px', marginBottom: '-40px' }}>
              <ListItem title={t('change secret')} handleClick={onMenuClick} />
            </div>
          </div>
        </div>
      ) : null}

      {/* my settings */}
      <div className="title" onClick={() => toggle(3)}>
        <h2>{t('my Settings')}</h2>
        {selected === 3 ? <ArrowUp /> : <ArrowDown />}
      </div>
      <div className={selected === 3 ? 'content show' : 'content'}>
        {getUserSettingsLoader ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div className="loading-spinner" style={{ margin: '120px 0px' }}>
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          <div className="switch-container mt-40" style={{ padding: '0px' }}>
            {/* TODO: Currency USD Changes */}

            <div
              style={{
                display: 'none',
              }}
              className="my_user_settings_title plain"
            >
              <p>{t('currency')}</p>
              <Select
                disabled
                title={t('select')}
                defaultValue={currency}
                data={fiatCurrencyList.map((item: any) => ({
                  id: item.currency_code,
                  name: `${item.name} (${item.currency_code})`,
                }))}
                onChange={e => setCurrency(e.target.value)}
              />
            </div>
            <div className="my_user_settings_title plain">
              <p>{t('email')}</p>
              <input
                className={classNames(
                  'my_user_setting_input',
                  localStorage.getItem('wallet') === 'Privy'
                    ? 'grey-color'
                    : '',
                )}
                placeholder={t('enter email address')}
                type="type"
                value={email}
                disabled={localStorage.getItem('wallet') === 'Privy'}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="my_user_settings_title plain">
              <p>{t('whatsapp number')}</p>
              <PhoneInput
                international
                name="mobile_no"
                disabled={getUserSettingsData?.whastapp_number ? true : false}
                value={whatsAppNumber}
                placeholder={t('enter whatsapp number')}
                onChange={e => setWhatsAppNumber(e)}
              />
              {getUserSettingsData?.whastapp_number ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    height: '13px',
                    marginTop: '12px',
                  }}
                >
                  {' '}
                  <EditIcon
                    width="13px"
                    height="13px"
                    onClick={() => {
                      handleOpenWhatsAppPop()
                    }}
                  />
                  <p
                    style={{
                      textDecoration: 'underline',
                      color: 'var(--secondary-foreground-color)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      marginTop: isMobile() ? '15px' : '',
                    }}
                    onClick={() => {
                      handleOpenWhatsAppPop()
                    }}
                  >
                    {t('edit')}
                  </p>
                </div>
              ) : (
                ''
              )}
            </div>
            {postUserSettingsData && (
              <p className="successfully_saved">{postUserSettingsData}</p>
            )}
            {isUserSettingsError && (
              <p className="error_occured_left">{isUserSettingsError}</p>
            )}
            {whatsAppMobileValidationError && (
              <p className="error_occured_left">
                {whatsAppMobileValidationError}
              </p>
            )}
            {userSettingsLoader ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div className="loading-spinner" style={{ marginTop: '30px' }}>
                  <div className="spinner"></div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  className={classNames(
                    'social_handle_btn',
                    true ? '' : 'btn-disabled',
                    editable || isEditUsername ? '' : 'btn-disabled',
                  )}
                  style={
                    isMobile()
                      ? { width: '100%', height: '50px' }
                      : { width: '70%', height: '50px' }
                  }
                  // disabled={!editable && !isEditUsername}
                  disabled={false}
                  onClick={() => {
                    if (isEditUsername) {
                      handleChangeUsername()
                    }
                    if (editable) {
                      handlePostUser()
                    }
                  }}
                >
                  {t('save')}
                </button>
              </div>
            )}
          </div>
        )}
        {whatsAppOtp && isMobile() ? (
          <>{navigate('/app/user-otp-whatsapp')}</>
        ) : (
          <DialogBox
            isOpen={whatsAppOtp}
            onClose={() => {
              setWhatsAppOtp(false)
              dispatch(getUserSettings())
            }}
          >
            <UserWhatsAppOtp isAddedPhone={isAddedPhone} />
          </DialogBox>
        )}
      </div>
      {/* my address settings */}
      <div className="title" onClick={() => toggle(4)}>
        <h2>{t('my delivery address')}</h2>
        {selected === 4 ? <ArrowUp /> : <ArrowDown />}
      </div>
      <div className={selected === 4 ? 'content show' : 'content'}>
        {isLoadingUserAddress ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div className="loading-spinner" style={{ margin: '120px 0px' }}>
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          <Formik
            initialValues={addressInitialValues}
            onSubmit={(values: any) => {
              if (isEditUsername) {
                handleChangeUsername()
              }
              handleSaveAddress(values)
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required(t('field is required')),
              address: Yup.string().required(t('field is required')),
              zip: Yup.string().required(t('field is required')),
              city: Yup.string().required(t('field is required')),
              country_code: Yup.object()
                .nullable()
                .required(t('field is required')),
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
              } = props
              return (
                <form
                  className="mt-20 pb-m-2"
                  autoComplete="off"
                  onSubmit={handleSubmit}
                >
                  <div
                    className={classNames(
                      'createnft-fileload',
                      'no-border',
                      'createitem-fileload',
                    )}
                  >
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
                    {errors.name && touched.name && (
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
                    <div className="mt-20">
                      <FormInput
                        id="address"
                        type="text"
                        placeholder={t('enter_your_address')}
                        name="address"
                        value={values.address}
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        disabled={false}
                      />
                    </div>
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
                        countryName={values.country_code}
                        setCountry={e => setFieldValue('country_code', e)}
                      />
                      {errors.country_code && touched.country_code && (
                        <div className="input-feedback">
                          {errors.country_code.toString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-20">
                    <SubmitButton
                      title={t('save')}
                      onPress={handleSubmit}
                      isLoading={postUserAddressLoader}
                    />
                  </div>
                </form>
              )
            }}
          </Formik>
        )}
      </div>
    </div>
  )
}

export default UserMySettings
