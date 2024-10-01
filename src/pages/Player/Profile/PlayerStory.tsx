import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import LockIcon from '@assets/icons/icon/lock.png'
import CheckedIcon from '@assets/icons/icon/checked.png'
import ComingIcon from '@assets/icons/icon/coming.png'
import { RootState } from '@root/store/rootReducers'
import { useDispatch, useSelector } from 'react-redux'
import ArrowDown from '@components/Svg/ArrowDown'
import ArrowUp from '@components/Svg/ArrowUp'
import { getPlayerStory } from '../../../apis/onboarding/authenticationSlice'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import Spinner from '@components/Spinner'

const STORIES = [
  {
    id: 10,
    title: '10',
    status: 'completed',
  },
  {
    id: 20,
    title: '20',
    status: 'completed',
  },
  {
    id: 30,
    title: '30',
    status: 'completed',
  },
  {
    id: 40,
    title: '40',
    status: 'completed',
  },
  {
    id: 50,
    title: '50',
    status: 'processing',
  },
  {
    id: 60,
    title: '60',
    status: 'lock',
  },
  {
    id: 70,
    title: '70',
    status: 'lock',
  },
  {
    id: 80,
    title: '80',
    status: 'lock',
  },
]

function calculateDaysFromTimestamp(pastTimestamp: number): number {
  const millisecondsInADay = 1000 * 60 * 60 * 24

  const pastDate = new Date(pastTimestamp * 1000)
  const currentDate = new Date()

  const timeDifference: number = currentDate.getTime() - pastDate.getTime()

  const daysDifference: number = Math.floor(timeDifference / millisecondsInADay)

  return daysDifference
}

const getHumanDate = (date: any) => {
  const unixDate: any = new Date(date * 1000)
  let day = unixDate.getDate()
  let month = unixDate.getMonth() + 1
  const year = unixDate.getFullYear()
  if (day < 10) day = '0' + day
  if (month < 10) month = '0' + month

  return day + '.' + month + '.' + year
}

const PlayerStory = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const location = useLocation()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const [percentage, setPercentage] = useState(0)
  const { playerStory, getPlayerStoryLoading } = authenticationData
  const [curItemId, setCurItemId] = useState(0)
  const [stories, setStories] = useState([])
  const [isOpen, setIsOpen] = useState(true)

  const isMobile = () => {
    return window.innerWidth <= 768
  }

  const [userName, setUserName] = useState('')

  useEffect(() => {
    setUserName(location?.pathname?.split('/')?.pop())
  }, [location?.pathname])

  useEffect(() => {
    if (userName) dispatch(getPlayerStory(userName))
    // if (userName) dispatch(getPlayerStory('lars-villiger'))
  }, [userName])

  useEffect(() => {
    stories?.map(item => {
      if (item?.status === 'processing') setCurItemId(item?.id)
    })
  }, [stories])

  const onChangeStories = () => {
    if (playerStory?.length > 0) {
      const newStories =
        playerStory?.map((item: any) => ({
          id: item?.storystatusid,
          update: item?.update,
          days: calculateDaysFromTimestamp(item?.insertedat),
          status: 'completed',
        })) || []

      setStories(newStories)
    }

    const restStories = STORIES.slice(playerStory?.length)?.map(
      (item: any, key: any) => ({
        id: item?.id,
        update: [],
        status: key === 0 ? 'processing' : 'lock',
        days: null,
      }),
    )

    if (restStories?.length > 0) {
      restStories?.map(item => setStories(prev => [...prev, item]))
    }
  }

  useEffect(() => {
    setPercentage((100 * playerStory?.length) / 8)

    onChangeStories()
  }, [playerStory?.length])

  useEffect(() => {
    if (isMobile()) {
      setIsOpen(false)
    }
  }, [])

  return (
    <section
      className="profile-kiosk-section player-story-section"
      style={{ paddingBottom: isOpen ? 10 : 0 }}
    >
      <div
        className="blog-title"
        style={{
          justifyContent: 'space-between',
          paddingRight: isMobile() ? 20 : 26,
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {t('story')}
        {isOpen ? (
          <RemoveIcon
            style={{
              width: isMobile() ? '30px' : '40px',
              height: isMobile() ? '30px' : '40px',
            }}
          />
        ) : (
          <AddIcon
            style={{
              width: isMobile() ? '30px' : '40px',
              height: isMobile() ? '30px' : '40px',
            }}
          />
        )}
      </div>
      {isOpen &&
        (getPlayerStoryLoading ? (
          <div
            className="flex-center"
            style={{ width: '100%', margin: 'auto' }}
          >
            <Spinner className="mb-30" spinnerStatus={true} />
          </div>
        ) : (
          <div
            className="flex-center"
            style={{ width: '100%', margin: 'auto' }}
          >
            <div
              style={{
                padding: '20px',
                width: isMobile() ? '100%' : '54%',
                display: 'flex',
                justifyContent: 'space-between',
              }}
              className="story-left-container"
            >
              <div className="story-list-container">
                {stories?.length > 0 &&
                  stories.map(item => (
                    <div key={item?.id}>
                      <div
                        className="story-card"
                        style={{
                          border:
                            item?.id === curItemId
                              ? '4px solid var(--primary-foreground-color)'
                              : '4px solid transparent',
                        }}
                        onClick={() => setCurItemId(item?.id)}
                      >
                        <div className="story-date">
                          {item?.days}{' '}
                          {item?.status === 'completed' && t('Days Ago')}
                        </div>
                        <div
                          style={{
                            height: '50px',
                            maxWidth: 50,
                            margin: 'auto',
                          }}
                        >
                          <img
                            width="100%"
                            height="100%"
                            src={
                              item?.status === 'completed'
                                ? CheckedIcon
                                : item?.status === 'lock'
                                ? LockIcon
                                : ComingIcon
                            }
                            alt="lock"
                          />
                        </div>
                        <div style={{ fontSize: 20 }}>{t(item?.id)}</div>
                        {item?.id === curItemId && (
                          <div
                            style={{
                              width: '100%',
                              display: isMobile() ? 'flex' : 'none',
                              alignItems: 'center',
                            }}
                          >
                            <div className="story-content-container">
                              {t(stories[curItemId / 10 - 1]?.id + '_content')}
                              {stories[curItemId / 10 - 1]?.update?.length >
                                0 && (
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 20,
                                    marginTop: 20,
                                    color: '#c879f9',
                                  }}
                                >
                                  {t('Updates')}
                                </div>
                              )}
                              {stories[curItemId / 10 - 1]?.update?.map(
                                (item: any, key: any) => (
                                  <div className="updated-container" key={key}>
                                    <div style={{ color: '#c879f9' }}>
                                      {getHumanDate(item?.insertedat)}
                                    </div>
                                    {item?.update}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="progressbar-container">
                <div
                  className="progressbar-tracker"
                  style={{ height: percentage + '%' }}
                ></div>
              </div>
            </div>
            <div
              style={{
                display: isMobile() ? 'none' : 'flex',
                width: '100%',
                paddingRight: 20,
                paddingTop: 20,
              }}
            >
              <div
                style={{
                  marginTop: `${(curItemId / 10 - 1) * 14}%`,
                }}
                className="story-content-container"
              >
                {t(stories[curItemId / 10 - 1]?.id + '_content')}
                {stories[curItemId / 10 - 1]?.update?.length > 0 && (
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 20,
                      marginTop: 20,
                      color: '#c879f9',
                    }}
                  >
                    {t('Updates')}
                  </div>
                )}
                {stories[curItemId / 10 - 1]?.update?.map(
                  (item: any, key: any) => (
                    <div className="updated-container" key={key}>
                      <div style={{ color: '#c879f9' }}>
                        {getHumanDate(item?.insertedat)}
                      </div>
                      {item?.update}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ))}
    </section>
  )
}

// export default React.memo(PlayerStory)
export default PlayerStory
