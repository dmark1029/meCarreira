/* eslint-disable @typescript-eslint/no-empty-function */

import React, { useEffect, useRef, useState } from 'react'
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/alice-carousel.css'
import '@assets/css/components/Carousel.css'
import classNames from 'classnames'
import { isMobile } from '@utils/helpers'
import leftArrow from '@assets/images/left_angle_bracket.webp'
import rightArrow from '@assets/images/right_angle_bracket.webp'
import ImageComponent from '@components/ImageComponent'
import { useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { useNavigate, Link } from 'react-router-dom'
import { getRequest, makeGetRequest } from '@root/apis/axiosClient'

const responsiveItemDefault = {
  0: {
    items: 1,
  },
}

const AllPlayersCarousel: React.FC = () => {
  //   const playerCoinData = useSelector((state: RootState) => state.playercoins)
  //   const navigate = useNavigate()
  //   const { mainBanner } = playerCoinData

  const [isLoading, setIsLoading] = useState(true)

  const getBannerData = () => {
    setIsLoading(true)
    makeGetRequest('players/banner/?page=player')
      .then(res => {
        setmainBanner(res?.data?.main_banner)
      })
      .catch(err => {})
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    getBannerData()
  }, [])

  const [mainBanner, setmainBanner] = useState([])

  const [items, setItems] = useState([])

  const minLength = 1
  const [hovered, setHovered] = useState(false)

  // const handleGotoSeason = (url: string) => {
  //   if (url) {
  //     const match = url.match(/\/season\/\d+/)
  //     const match_blog = url.match(/\/blog\/([^\/]+)\/?$/)

  //     if (match) {
  //       const extractedUrl = match[0]
  //       navigate('/app' + extractedUrl)
  //     } else if (match_blog) {
  //       const extractedUrl = match_blog[0]
  //       navigate(extractedUrl)
  //     } else {
  //       window.open(url, '_blank')
  //     }
  //   }
  // }

  useEffect(() => {
    if (mainBanner.length > 0) {
      setItems(
        mainBanner.map((item: any, index: number) => (
          <div className="seasons-rewards-section-banner-carousel" key={index}>
            <Link
              className={classNames(
                'seasons-rewards-wrapper',
                // hoverClass,
              )}
              to={item.banner_link}
              // onClick={() => handleGotoSeason(item.banner_link)}
              target={index === 0 ? '' : '_blank'}
              style={{
                backgroundImage: `url('${
                  isMobile() ? item.banner_mobile : item.banner
                }')`,
              }}
            ></Link>
          </div>
        )),
      )
    }
  }, [mainBanner])

  return isLoading ? (
    <div className="seasons-rewards-skeleton" />
  ) : (
    <div
      className={classNames(
        'circle-carousel',
        items.length <= 3 ? 'center-carousel' : 'carousel',
      )}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AliceCarousel
        infinite={items.length > minLength}
        mouseTracking
        items={items}
        disableButtonsControls={false}
        keyboardNavigation={true}
        responsive={responsiveItemDefault}
        autoPlayInterval={5000}
        // infinite
        autoPlay={items.length > minLength}
        // activeIndex={activeIndex}
        renderPrevButton={() => {
          return items.length > minLength && (isMobile() || hovered) ? (
            <div style={{ opacity: 0.6, transition: '0.5s' }}>
              <ImageComponent
                src={leftArrow}
                alt=""
                className="img-radius carousel-arrow"
                // style={{ margin: '0px 5px 2px 0' }}
                style={
                  isMobile()
                    ? { margin: '0px 5px 2px 0' }
                    : { margin: '2px 5px 2px 0' }
                }
              />
            </div>
          ) : (
            <div style={{ opacity: 0, transition: '0.5s' }}>
              <ImageComponent
                src={leftArrow}
                alt=""
                className="img-radius carousel-arrow"
                style={{ margin: '2px 5px 2px 0' }}
              />
            </div>
          )
        }}
        renderNextButton={() => {
          return items.length > minLength && (isMobile() || hovered) ? (
            <div style={{ opacity: 0.6, transition: '0.5s' }}>
              <ImageComponent
                src={rightArrow}
                alt=""
                className="img-radius carousel-arrow"
                style={
                  isMobile()
                    ? { margin: '0px 3px 2px 2px' }
                    : { margin: '2px 3px 2px 2px' }
                }
              />
            </div>
          ) : (
            <div style={{ opacity: 0, transition: '0.5s' }}>
              <ImageComponent
                src={rightArrow}
                alt=""
                className="img-radius carousel-arrow"
                style={{ margin: '2px 3px 2px 2px' }}
              />
            </div>
          )
        }}
        // onSlideChanged={handleSlideChange}
      />
    </div>
  )
}

export default AllPlayersCarousel
