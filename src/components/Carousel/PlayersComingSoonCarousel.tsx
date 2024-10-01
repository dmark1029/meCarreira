import React, { useEffect, useRef, useState } from 'react'
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/alice-carousel.css'
import '@assets/css/components/Carousel.css'
import classNames from 'classnames'
import { isMobile } from '@utils/helpers'
import leftArrow from '@assets/images/left_angle_bracket.webp'
import rightArrow from '@assets/images/right_angle_bracket.webp'
import ImageComponent from '@components/ImageComponent'

const responsiveItemDefault = {
  0: {
    items: 1,
  },
  620: {
    items: 2,
  },
  912: {
    items: 3,
  },
  1220: {
    items: 4,
  },
  1600: {
    items: 5,
  },
}

const responsiveItemLandingDefault = {
  0: {
    items: 1,
  },
  620: {
    items: 2,
  },
  912: {
    items: 3,
  },
  1220: {
    items: 4,
  },
}

const responsiveItemEarlyAccessNfts = {
  0: {
    items: 1,
  },
  250: {
    items: 2,
  },
  300: {
    items: 3,
  },
}
interface Props {
  items: any
  carouselCallBack?: any
  setActiveIndex?: any
  minCardLength?: any
  activeIndex?: number
  isFinite?: boolean
  isEarlyAccess?: boolean
  isLanding?: boolean
}

const PlayersComingSoonCarousel: React.FC<Props> = ({
  items,
  carouselCallBack,
  setActiveIndex,
  activeIndex,
  isFinite,
  isEarlyAccess,
  minCardLength = 0,
  isLanding,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  let maxItems

  if (isLanding) {
    maxItems = Object.keys(responsiveItemLandingDefault).reduce(
      (max, breakpoint) => {
        if (windowWidth >= parseInt(breakpoint)) {
          return Math.max(max, responsiveItemLandingDefault[breakpoint].items)
        }
        return max
      },
      0,
    )
  } else {
    maxItems = Object.keys(responsiveItemDefault).reduce((max, breakpoint) => {
      if (windowWidth >= parseInt(breakpoint)) {
        return Math.max(max, responsiveItemDefault[breakpoint].items)
      }
      return max
    }, 0)
  }

  const minLength = minCardLength ? minCardLength : isMobile() ? 1 : maxItems
  const [hovered, setHovered] = useState(false)
  const prevItemRef = useRef<any>(null)
  const [changedItem, setChangedItem] = useState(1)

  const handleSlideChange = (evt: any) => {
    setActiveIndex && setActiveIndex(evt.item)
    if (carouselCallBack) {
      setChangedItem(evt.item)
      if (evt.item < prevItemRef.current) {
        if (isMobile()) {
          carouselCallBack(evt.item)
        } else {
          carouselCallBack(evt.item, 'back')
        }
      } else if (evt.item >= prevItemRef.current) {
        if (isMobile()) {
          carouselCallBack(evt.item)
        } else {
          carouselCallBack(evt.item, 'forth')
        }
      }
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    prevItemRef.current = changedItem
  }, [changedItem])

  return (
    <div
      className={classNames(
        'circle-carousel',
        items.length <= 3 ? 'center-carousel' : 'carousel',
      )}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AliceCarousel
        infinite={!isFinite && items.length > minLength}
        mouseTracking
        items={items}
        disableButtonsControls={false}
        keyboardNavigation={true}
        responsive={
          isLanding ? responsiveItemLandingDefault : responsiveItemDefault
        }
        autoPlayInterval={1000}
        // infinite
        autoPlay={false}
        activeIndex={activeIndex}
        renderPrevButton={() => {
          return items.length > minLength && (isMobile() || hovered) ? (
            <div style={{ opacity: 0.6, transition: '0.5s' }}>
              <ImageComponent
                src={leftArrow}
                alt=""
                className="img-radius carousel-arrow"
                style={{ margin: '2px 5px 2px 0' }}
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
                style={{ margin: '2px 3px 2px 2px' }}
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
        onSlideChanged={handleSlideChange}
      />
    </div>
  )
}

export default PlayersComingSoonCarousel
