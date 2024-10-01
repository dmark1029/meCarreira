import React, { useEffect, useState } from 'react'

import { AppLayout } from '@components/index'
import NotificationSettingItem from '@pages/NotificationSettings/NotificationSettingItem'
import '@assets/css/pages/NotificationSettings.css'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import {
  getNotificationsSettings,
  resetAllNotificationsList,
} from '@root/apis/onboarding/authenticationSlice'
import NotificationSettingsSkeleton from '@components/Card/NotificationSettingsSkeleton'
import classNames from 'classnames'

const NotificationSettings: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const { getNotificationSettingsData, notificationSettingsLoader } =
    authenticationData

  useEffect(() => {
    console.log('mounted_settings')
    dispatch(resetAllNotificationsList())
    dispatch(getNotificationsSettings())
  }, [])

  const [notificationSettings, setNotificationSettings] = useState([])
  const [playerSettings, setPlayerSettings] = useState([])
  const [accountSettings, setAccountSettings] = useState([])

  useEffect(() => {
    for (let i = 0; i < getNotificationSettingsData?.length; i++) {
      if (
        getNotificationSettingsData[i]?.notificationtype ===
          'Enable Notifications' ||
        getNotificationSettingsData[i]?.notificationtype ===
          'Notify by eMail' ||
        getNotificationSettingsData[i]?.notificationtype === 'whatsapp'
      ) {
        setNotificationSettings(prevState => [
          ...prevState,
          getNotificationSettingsData[i],
        ])
      } else if (
        getNotificationSettingsData[i]?.notificationtype ===
          'player_price_change' ||
        getNotificationSettingsData[i]?.notificationtype === 'levelup' ||
        getNotificationSettingsData[i]?.notificationtype === 'new_kiosk_item' ||
        getNotificationSettingsData[i]?.notificationtype === 'new_vote' ||
        getNotificationSettingsData[i]?.notificationtype ===
          'item_order_placed' ||
        getNotificationSettingsData[i]?.notificationtype ===
          'item_order_receipt'
      ) {
        setPlayerSettings(prevState => [
          ...prevState,
          getNotificationSettingsData[i],
        ])
      } else {
        setAccountSettings(prevState => [
          ...prevState,
          getNotificationSettingsData[i],
        ])
      }
    }
  }, [getNotificationSettingsData?.length])
  console.log('2222', getNotificationSettingsData)
  return (
    <AppLayout className="notifications settings" footerStatus="footer-status">
      {notificationSettingsLoader ? (
        <div className="black-box">
          <div className="new-nft-title settings-title">
            {t('notification Settings')}
          </div>
          <div className="switch-container">
            {new Array(16).fill(1).map(() => {
              return <NotificationSettingsSkeleton />
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="black-box">
            <div className="new-nft-title settings-title">
              {t('notification Settings')}
            </div>
            <div className="switch-container">
              {notificationSettings?.map((item, index, array) => (
                <NotificationSettingItem
                  item={item}
                  key={index}
                  index={index}
                  isMenu={false}
                  className="notification-title-color"
                  isDisabled={item.notificationtype === 'whatsapp'}
                />
              ))}
            </div>
          </div>
          <div className="black-box">
            <div className="new-nft-title settings-title">
              {t('player_settings')}
            </div>
            <div className="switch-container">
              {playerSettings?.map((item, index, array) => (
                <NotificationSettingItem
                  item={item}
                  key={index}
                  index={index}
                  isMenu={false}
                  className="notification-title-color"
                />
              ))}
            </div>
          </div>
          <div className="black-box">
            <div className="new-nft-title settings-title">
              {t('account_settings')}
            </div>
            <div className="switch-container">
              {accountSettings?.map((item, index, array) => (
                <NotificationSettingItem
                  item={item}
                  key={index}
                  index={index}
                  isMenu={false}
                  className="notification-title-color"
                />
              ))}
            </div>
          </div>
          {/* <div className="black-box">
            <div className="new-nft-title settings-title">
              {t('notification Settings')}
            </div>
            <div className="switch-container mt-40">
              {getNotificationSettingsData.map(
                (item, index, array) =>
                  item.notificationtype === 'whatsapp' && (
                    <>
                      <NotificationSettingItem
                        item={item}
                        key={index}
                        index={index}
                        isMenu={false}
                        className="notification-title-color"
                        isDisabled
                      />
                    </>
                  ),
              )}
            </div>
          </div>
          <div className="black-box">
            <div
              className="new-nft-title settings-title"
              style={{ marginLeft: '-14px', marginBottom: '30px' }}
            >
              {t('player_settings')}
            </div>
            <div className="switch-container mt-40">
              {getNotificationSettingsData.map(
                (item, index, array) =>
                  item.notificationtype === 'new_vote' && (
                    <>
                      <NotificationSettingItem
                        item={item}
                        key={index}
                        index={index}
                        isMenu={false}
                        className="notification-title-color"
                      />
                    </>
                  ),
              )}
            </div>
          </div>
          <div className="black-box">
            <div
              className="new-nft-title settings-title"
              style={{ marginLeft: '-14px', marginBottom: '30px' }}
            >
              {t('account_settings')}
            </div>
            <div className="switch-container mt-40">
              {getNotificationSettingsData.map(
                (item, index, array) =>
                  item.notificationtype !== 'whatsapp' &&
                  item.notificationtype !== 'new_vote' && (
                    <NotificationSettingItem
                      item={item}
                      key={index}
                      index={index}
                      isMenu={false}
                      marginBottom={index === array.length - 1 ? true : false}
                      className="notification-title-color"
                    />
                  ),
              )}
            </div>
          </div> */}
        </>
      )}
    </AppLayout>
  )
}

export default NotificationSettings
