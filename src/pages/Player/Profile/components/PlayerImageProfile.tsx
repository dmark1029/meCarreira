import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import ImageComponent from '@components/ImageComponent'

interface Props {
  src: string
  className?: string
  footerPlayerImgCallback?: (loading: boolean) => void
}

const PlayerImageProfile: React.FC<Props> = props => {
  const { src, className = '', footerPlayerImgCallback = null } = props
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const { selectedThemeRedux } = authenticationData

  const urls = [src]
  const [loading, setLoading] = useState(true)
  const counter = useRef(0)

  const imageLoaded = () => {
    counter.current += 1
    if (counter.current >= urls.length) {
      setLoading(false)
    }
  }

  useEffect(() => {
    footerPlayerImgCallback && footerPlayerImgCallback(loading)
  }, [loading])

  return (
    <>
      <div
        className="profile-img-loader"
        style={{ display: loading ? 'flex' : 'none' }}
      >
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
      <div style={{ display: loading ? 'none' : 'block' }}>
        {urls.map((url, ind) => (
          <ImageComponent
            key={ind}
            src={url}
            alt="player-profile-img"
            className={className}
            onLoad={imageLoaded}
          />
        ))}
      </div>
    </>
  )
}

export default PlayerImageProfile
