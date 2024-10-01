/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react'
import { AppLayout } from '@components/index'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { RootState } from '@root/store/rootReducers'
import '@assets/css/pages/Blog.css'
import { useTranslation } from 'react-i18next'
import NewsImg from '@root/assets/images/blog/news.png'
import HowToImg from '@root/assets/images/blog/how_to.png'
import MediaImg from '@root/assets/images/blog/media.png'
import AboutUsImg from '@root/assets/images/blog/about_us.png'
import BlogCard from '@components/Card/BlogCard'
import { blogCategories } from '@root/constants'
import { getBlogs } from '@root/apis/blog/blogSlice'
import Spinner from '@components/Spinner'
import TagManager from 'react-gtm-module'
import { tagManagerArgs } from '@root/constants'
import { initTagManager } from '@utils/helpers'
import { selectedTheme } from '@root/apis/onboarding/authenticationSlice'
import { makeGetRequest } from '@root/apis/axiosClient'

const Join: React.FC = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const { label } = useParams()
  console.log(label)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TagManager.initialize(tagManagerArgs)
    document.querySelector('title')!.innerText = 'Join meCarreira'
    window.scrollTo({ top: 0, behavior: 'smooth' })
    ;['Light', 'Dark', 'Gold', 'Ladies', 'Black'].forEach(theme =>
      document.body.classList.remove(theme),
    )
    dispatch(
      selectedTheme({
        selectedThemeRedux: 'Dark',
      }),
    )
  }, [])

  useEffect(() => {
    setIsLoading(true)

    makeGetRequest('accounts/custom_links/?label=' + label)
      .then(res => {
        // navigate(res?.data?.targeturl ?? "/")
        window.location.href = res?.data?.targeturl
      })
      .catch(err => {
        setError(err?.response?.data?.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <AppLayout headerClass="home" footerStatus="footer-status">
      <div className="blog-container">
        <div className="blog-box">
          {isLoading ? (
            <div className="blog-card-content">
              <Spinner title={''} spinnerStatus={true} />
            </div>
          ) : (
            <div className="blog-card-content">
              <h2 className="text-error">{error}</h2>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default Join
