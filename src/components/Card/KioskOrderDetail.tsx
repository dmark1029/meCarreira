/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import '@assets/css/components/NftCard.css'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import {
  postFulfillKioskOrder,
  getFulfilledKioskList,
  postUploadFile,
  resetPostUploadFile,
  resetKioskOrderDetail,
  showKioskItemDetail,
  resetPostFulfillKioskOrder,
  getPendingKioskList,
  postFulfillKioskWinnerOrder,
  getKioskOrderDetail,
  postUploadFileSuccess,
  getFileCompressingStatus,
} from '@root/apis/onboarding/authenticationSlice'
import { useDispatch, useSelector } from 'react-redux'
import BidButton from '@components/Button/BidButton'
import classNames from 'classnames'
import {
  getCountryNameNew,
  getDeliveryMode,
  isMobile,
  startAndEnd,
} from '@utils/helpers'
import { RootState } from '@root/store/rootReducers'
import FormInput from '@components/Form/FormInput'
import FormTextArea from '@components/Form/FormTextArea'
import ImageComponent from '@components/ImageComponent'
import { Radio } from '@mui/material'
import CopyIcon from '@components/Svg/CopyIcon'
import { SALES_OPTION } from '@root/constants'
import toast from 'react-hot-toast'
import {
  getRequest,
  postRequestAuthWithProgress,
} from '@root/apis/axiosClientAuth'

const KioskOrderDetail: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    KioskOrderDetailLoader,
    KioskOrderDetail,
    KioskOrderDetailLink,
    isGetKioskOrderDetailSuccess,
    postFulfillKioskOrderLoader,
    postFulfillKioskOrderData,
    postFulfillKioskOrderError,
    postFulfillKioskOrderSuccess,
    // postUploadFileSuccessData,
    postUploadFileSuccessDataLink,
    showKioskItemDetails,
    showKioskItemDetailsBuy,
    fileUploadPercentage,
    player1contract,
    isCompressingFile,
  } = authenticationData

  const [postUploadFileSuccessData, setPostUploadFileSuccessData] =
    useState(false)
  const [compressionState, setCompressionState] = useState(0)

  useEffect(() => {
    if (compressionState === 2) {
      setPostUploadFileSuccessData(true)

      dispatch(
        getKioskOrderDetail({
          hash: KioskOrderDetail?.hash,
          reload: false,
        }),
      )
      setIsUploading(false)
    }
  }, [compressionState])

  const [isAddressCopied, setAddressCopied] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const [isChangeClicked, setChangeClicked] = useState(false)

  const pathname = window.location.pathname

  const handleFulfill = () => {
    const formData = new FormData()
    formData.append('hash', KioskOrderDetail?.hash)
    dispatch(postFulfillKioskOrder(formData))
  }

  useEffect(() => {
    if (postFulfillKioskOrderSuccess && player1contract) {
      dispatch(
        getFulfilledKioskList({
          player_contract: player1contract,
          last_month: 3,
        }),
      )
    }
  }, [postFulfillKioskOrderSuccess])

  const handleCopy = () => {
    setAddressCopied(!isAddressCopied)
    navigator.clipboard.writeText(
      `${KioskOrderDetail?.recipientname} ${KioskOrderDetail?.recipientaddress} ${KioskOrderDetail?.recipientcity}
       ${KioskOrderDetail?.recipientpostalcode} ${KioskOrderDetail?.recipientcountry}` ??
        's',
    )
  }
  const [changeFile, setChangeFile] = useState(false)
  const [downloadLink, setDownloadLink] = useState(false)
  const uploadRef = React.useRef<any>()
  const statusRef = React.useRef<any>()
  const progressRef = React.useRef<any>()
  const fileName: string = startAndEnd(
    KioskOrderDetail?.filename ? KioskOrderDetail?.filename : '',
  )

  const isImage = data => {
    if (
      typeof data === 'string' &&
      data?.split('.').pop().toLowerCase() === 'webp'
    ) {
      return true
    } else if (data?.type?.startsWith('image')) {
      return true
    } else {
      return false
    }
  }

  const ffmpegRef = useRef(new FFmpeg())

  const loadFfmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    const ffmpeg = ffmpegRef.current

    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    })
  }

  const transcode = async file => {
    const fileName = file.name
    const fileExtension = fileName.split('.').pop().toLowerCase()
    const ffmpeg = ffmpegRef.current
    await ffmpeg.writeFile(`input.${fileExtension}`, await fetchFile(file))
    await ffmpeg.exec([
      '-i',
      `input.${fileExtension}`,
      // '-vf',
      // 'scale=-2:1080',
      '-vcodec',
      'libx264',
      '-preset',
      'fast',
      '-tune',
      'fastdecode',
      '-crf',
      '30', // Adjust the CRF value as needed for your desired balance of quality and speed
      'output.mp4',
    ])

    // Read the transcoded output.mp4 file
    const fileData = await ffmpeg.readFile('output.mp4')

    // Convert FileData to ArrayBufferLike
    const arrayBuffer = fileData as ArrayBuffer

    // Convert ArrayBufferLike to Uint8Array
    const data = new Uint8Array(arrayBuffer)
    const blob = new Blob([data.buffer], { type: 'video/mp4' })
    const result = new File([blob], 'output.mp4', { type: 'video/mp4' })

    console.log('2222', result)

    return result
  }

  const [isCompressing, setIsCompressing] = useState(false)
  const UploadFile = async (e: any) => {
    e.preventDefault()
    console.log('progressHandleFile', uploadRef.current?.files)
    const file = uploadRef.current?.files[0]
    console.log({ file: uploadRef.current?.files[0]?.name })
    const fileName: string = startAndEnd(uploadRef.current?.files[0]?.name)
    setUploadedFile(fileName)
    setErrors({
      ...errors,
      uploadedFile: '',
    })
    setDownloadLink(false)
    dispatch(resetPostUploadFile())
    if (!isChangeClicked) {
      dispatch(resetKioskOrderDetail())
    } else {
      setChangeClicked(false)
    }

    const formData = new FormData()
    formData.append('hash', KioskOrderDetail?.hash)

    setIsUploading(true)
    if (uploadRef.current?.files[0].type.startsWith('video')) {
      // setIsCompressing(true)
      // await loadFfmpeg()
      // const compressedVideo = await transcode(uploadRef.current?.files[0])
      // setIsCompressing(false)
      const compressedVideo = uploadRef.current?.files[0]
      const CHUNK_SIZE = 10 * 1024 * 1024
      const fileSize = compressedVideo.size // Corrected
      const totalChunks = Math.ceil(fileSize / CHUNK_SIZE)

      // Function to dispatch getFileCompressingStatus action
      const dispatchFileCompressingStatus = () => {
        dispatch(
          getFileCompressingStatus({
            hash: KioskOrderDetail?.hash,
          }),
        )
      }

      // Call the function initially
      dispatchFileCompressingStatus()

      // Set up an interval to call the function every 5 seconds
      const intervalId = setInterval(dispatchFileCompressingStatus, 3000)

      // Clean up the interval when the upload process is completed or when the component unmounts
      const cleanupInterval = () => clearInterval(intervalId)

      for (let i = 0; i < totalChunks; i++) {
        const videoFormData = new FormData()

        const start = i * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, fileSize)

        videoFormData.append('hash', KioskOrderDetail?.hash)
        videoFormData.append('file', compressedVideo.slice(start, end))
        videoFormData.append('chunk', (i + 1).toString())
        videoFormData.append('total_chunks', totalChunks.toString())
        videoFormData.append('file_name', file?.name)

        // await dispatch(postUploadFile(videoFormData))
        const response = await postRequestAuthWithProgress(
          'players/uploadKioskDigitalItem/',
          videoFormData,
        )

        if (response?.data?.link) {
          cleanupInterval()
          dispatch(postUploadFileSuccess({ link: response?.data?.link }))
          dispatch(
            getKioskOrderDetail({
              hash: KioskOrderDetail?.hash,
              reload: false,
            }),
          )
          setIsUploading(false)
        }
      }
    } else {
      formData.append('file_name', uploadRef.current?.files[0]?.name)
      formData.append('chunk', '1')
      formData.append('total_chunks', '1')
      formData.append('file', file)
      dispatch(postUploadFile(formData))
    }
    // const xhr = new XMLHttpRequest()
    // xhr.upload.addEventListener('progress', ProgressHandler, false)
    // xhr.addEventListener('error', ErrorHandler, false)
    // xhr.addEventListener('abort', AbortHandler, false)
    // xhr.open('POST', 'fileupload.php')
    // xhr.send(formData)
  }

  useEffect(() => {
    console.log({ fileUploadPercentage })
    console.log(postUploadFileSuccessData)

    if (fileUploadPercentage && fileUploadPercentage > 0) {
      progressRef.current.value = fileUploadPercentage
      if (fileUploadPercentage < 99) {
        statusRef.current.innerHTML = fileUploadPercentage + '% uploaded...'
      } else {
        if (postUploadFileSuccessData) {
          statusRef.current.innerHTML = '100% uploaded...'
        } else {
          statusRef.current.innerHTML = '99% uploaded...'
        }
      }
    }
  }, [fileUploadPercentage, postUploadFileSuccessData])

  // compression
  useEffect(() => {
    if (fileUploadPercentage === 100) {
      statusRef.current.innerHTML = 'Compression Inprogress'
      console.log(KioskOrderDetail?.hash)

      const apiIntervalRef = setInterval(() => {
        getRequest(
          'players/uploadKioskDigitalItem/?hash=' + KioskOrderDetail?.hash,
        )
          .then(res => {
            console.log(res)

            if (res?.data?.filestatusid === 3) {
              clearInterval(apiIntervalRef)
              statusRef.current.innerHTML = 'Successfully Uploaded'
              setCompressionState(2)
            }
          })
          .catch(err => {
            console.log(err)
            clearInterval(apiIntervalRef)
          })
      }, 2000)
    }
  }, [postUploadFileSuccessData, fileUploadPercentage])

  const ProgressHandler = e => {
    console.log('progressHandle', e)
    const percent = (e.loaded / e.total) * 100
    console.log({ percent })
    progressRef.current.value = Math.round(percent)
    statusRef.current.innerHTML = Math.round(percent) + '% uploaded...'
    if (percent === 100) {
      setTimeout(() => {
        progressRef.current.value = 0
        statusRef.current.innerHTML = ''
        setChangeFile(true)
        setDownloadLink(true)
        setIsUploading(false)
      }, 2000)
    }
  }
  const ErrorHandler = () => {
    statusRef.current.innerHTML = 'upload failed!!'
  }
  const AbortHandler = () => {
    statusRef.current.innerHTML = 'upload aborted!!'
  }

  const handleChangeFile = async () => {
    await setChangeClicked(true)
    handleUploadFile()
  }

  const validateFileSize = fileData => {
    const fileInfo = fileData.files[0] // Get the first file selected
    if (fileInfo) {
      const fileSizeInBytes = fileInfo.size
      if (fileSizeInBytes > 95 * 1024 * 1024) {
        toast.error(t('It must be less than 95MB'), {
          duration: 4000,
        })
        return false
      } else {
        return true
      }
    }
  }

  const handleUploadFile = () => {
    if (!isUploading) {
      if (uploadRef.current) {
        setDownloadLink(false)
        uploadRef.current.click()
      }
    }
  }

  const handleBlur = () => {
    console.log('')
  }

  const onClose = () => {
    if (showKioskItemDetails || showKioskItemDetailsBuy) {
      dispatch(
        showKioskItemDetail({
          showKioskItemDetails: false,
          showKioskItemDetailsBuy: false,
        }),
      )
      dispatch(resetPostFulfillKioskOrder())
      dispatch(resetPostUploadFile())
      if (player1contract) {
        dispatch(
          getFulfilledKioskList({
            player_contract: player1contract,
            last_month: 3,
          }),
        )

        dispatch(getPendingKioskList(player1contract))
      }
      return
    }
  }
  const getIsBtnDisabled = () => {
    console.log({
      isUploading,
      isGetKioskOrderDetailSuccess,
      postUploadFileSuccessData,
      pos: KioskOrderDetail?.fileuploaded,
    })
    // if (isUploading) {
    //   if (!postUploadFileSuccessData) {
    //     return true
    //   } else if (postUploadFileSuccessData) {
    //     return false
    //   }
    // } else if (
    //   postUploadFileSuccessData === true ||
    //   KioskOrderDetail?.fileuploaded
    // ) {
    //   return false
    // } else {
    //   return true
    // }

    if (isUploading) {
      if (compressionState !== 2) {
        return true
      } else if (compressionState === 2) {
        return false
      }
    } else if (compressionState === 2 || KioskOrderDetail?.fileuploaded) {
      return false
    } else {
      return true
    }
  }
  const fullAddress =
    KioskOrderDetail?.recipientname +
    ' ' +
    KioskOrderDetail?.recipientaddress +
    ' ' +
    KioskOrderDetail?.recipientcity +
    ' ' +
    KioskOrderDetail?.recipientpostalcode +
    ' ' +
    getCountryNameNew(KioskOrderDetail?.recipientcountry)
  return (
    <>
      <div
        id="kioskOrder"
        className="main_kiosk_wrapper"
        style={
          isMobile()
            ? {
                height: 'calc(100vh - 60px)',
                // borderRadius: '20px 20px 0px 0px',
              }
            : { height: '768px', borderRadius: '20px 20px 0px 0px' }
        }
      >
        {KioskOrderDetailLoader ? (
          <div
            className="loading-spinner"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 'auto',
              height: '100%',
            }}
          >
            <div className="spinner">
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          <>
            <div className={classNames('kiosk_item_img mt-0')}>
              <ImageComponent
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: !isMobile() ? '10px 10px 0 0' : '',
                }}
                src={KioskOrderDetail?.itempicture}
                alt=""
              />
            </div>
            <div className="kiosk-form-container" style={{ padding: '0 40px' }}>
              <div className={classNames('kiosk_name_wrapper')}>
                <div className="kiosk_sub_title text-center">
                  {KioskOrderDetail?.hash.substring(0, 5)}
                </div>
                <h2 className="kiosk_sub_title">{t('name')}</h2>
                {/* <p className="kiosk_sub_desc">{KioskOrderDetail?.itemname}</p> */}
                <FormInput
                  id="item_name"
                  type="text"
                  placeholder={t('name of the item')}
                  name="item_name"
                  value={KioskOrderDetail?.itemname}
                  className={'disabled_input_field'}
                  // handleChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <div className={classNames('kiosk_name_wrapper')}>
                <h2 className="kiosk_sub_title">{t('item_id')}</h2>
                {/* <p className="kiosk_sub_desc">
                  {KioskOrderDetail?.playeritemid}
                </p> */}
                <FormInput
                  id="item_name"
                  type="text"
                  placeholder={t('name of the item')}
                  name="item_name"
                  value={KioskOrderDetail?.playeritemid}
                  className={'disabled_input_field'}
                  // handleChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <div className={classNames('kiosk_name_wrapper')}>
                <h2 className="kiosk_sub_title">{t('item description')}</h2>
                {/* <p className="kiosk_sub_desc">
                  {KioskOrderDetail?.itemdescription}
                </p> */}
                <FormTextArea
                  id="itemdescripition"
                  type="text"
                  placeholder={t('enter item description')}
                  name="item_description"
                  value={KioskOrderDetail?.itemdescription}
                  // handleChange={handleChange}
                  onBlur={handleBlur}
                  containerClass={classNames(
                    'description-box disabled_input_field',
                  )}
                />
              </div>
              {KioskOrderDetail?.sharedetails ? (
                <div className={classNames('kiosk_name_wrapper')}>
                  <h2 className="kiosk_sub_title">
                    {t('requested information')}
                  </h2>
                  <FormTextArea
                    id="item_sharedetails"
                    type="text"
                    placeholder={t('enter token details')}
                    name="item_description"
                    value={KioskOrderDetail?.sharedetails}
                    // handleChange={handleChange}
                    // onBlur={handleBlur}
                    containerClass={classNames(
                      'description-box disabled_input_field',
                    )}
                  />
                </div>
              ) : null}

              {/* <div
                className="radio_delivery_wrapper"
                style={{ padding: '0px' }}
              >
                <div className="radio_label_wrapper">
                  <Radio
                    sx={{
                      color: 'var(--primary-foreground-color)',
                      '&.Mui-checked': {
                        color: 'grey',
                      },
                      width: '25px',
                      height: '25px',
                    }}
                    checked={
                      KioskOrderDetail?.delivery_mode === 1 ? true : false
                    }
                    disabled={true}
                    onChange={() => {
                      // handleDeliveryMode('postal')
                      console.log('postal')
                    }}
                  />
                  <p>{t('postal_delivery')}</p>
                </div>
                <div className="radio_label_wrapper">
                  <Radio
                    sx={{
                      color: 'var(--primary-foreground-color)',
                      '&.Mui-checked': {
                        color: 'grey',
                      },
                      width: '25px',
                      height: '25px',
                    }}
                    checked={
                      KioskOrderDetail?.delivery_mode === 2 ? true : false
                    }
                    disabled={true}
                    onChange={() => {
                      // handleDeliveryMode('digital')
                      console.log('digital')
                    }}
                  />
                  <p>{t('digital_delivery')}</p>
                </div>
              </div> */}

              {getDeliveryMode(KioskOrderDetail?.delivery_mode) ===
                'digital' && (
                <>
                  {KioskOrderDetail?.email ? (
                    <div className={classNames('kiosk_name_wrapper')}>
                      <h2 className="kiosk_sub_title">{t('delivery to')}</h2>
                      <FormInput
                        id="item_email"
                        type="text"
                        placeholder={t('enter_your_email')}
                        name="item_description"
                        value={KioskOrderDetail?.email}
                        className={'disabled_input_field'}
                        // handleChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                  ) : null}
                </>
              )}
              {getDeliveryMode(KioskOrderDetail?.delivery_mode) === 'digital' &&
              !pathname.includes('/my_items') ? (
                <div>
                  {KioskOrderDetail?.shippedat === null ? (
                    <>
                      <input
                        type="file"
                        name="file"
                        ref={uploadRef}
                        onChange={UploadFile}
                        style={{
                          display: 'none',
                        }}
                      />
                      {changeFile || KioskOrderDetailLink ? (
                        <div className="change_file_wrapper">
                          {KioskOrderDetailLink && (
                            <h2 className="kiosk_sub_title">{t('filename')}</h2>
                          )}
                          <p
                            className="change_file_wrapper"
                            style={{ width: '297px !important' }}
                          >
                            {fileName}
                          </p>
                          <p
                            style={{
                              wordBreak: 'break-word',
                              color: isUploading
                                ? 'gray'
                                : 'var(--primary-foreground-color)',
                              marginLeft: '5px',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleChangeFile()}
                          >
                            {t('change_file')}
                          </p>
                        </div>
                      ) : (
                        !pathname.includes('/my_items') && (
                          <div
                            className={classNames(
                              'form-submit-btn m-0',
                              isUploading ? 'btn-disabled' : '',
                            )}
                            style={{
                              // width: '120px',
                              padding: '12px 20px',
                              margin: '20px 0px',
                              opacity: isUploading ? '80%' : '100%',
                            }}
                            onClick={handleUploadFile}
                          >
                            {t('upload_file')}
                          </div>
                        )
                      )}

                      {(downloadLink || KioskOrderDetailLink) &&
                      KioskOrderDetail?.status === 'FULLFILLED' ? (
                        <div style={{ margin: '15px 0px' }}>
                          <a
                            className="input-label"
                            href={
                              KioskOrderDetailLink ||
                              postUploadFileSuccessDataLink
                            }
                            target="_blank"
                            style={{
                              wordBreak: 'break-word',
                              color: 'var(--primary-foreground-color)',
                              marginLeft: '5px',
                            }}
                          >
                            {t('link_to_content')}
                          </a>
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              margin: '15px 0px',
                              display: isCompressing ? 'block' : 'none',
                            }}
                          >
                            <span className="kiosk_sub_title blinking">
                              {t('compressing')}
                            </span>
                          </div>
                          <div
                            style={{
                              margin: '15px 0px',
                              display: isUploading ? 'block' : 'none',
                            }}
                          >
                            <label>
                              <span className="kiosk_sub_title">
                                {t('file_progress')}
                              </span>
                              <progress
                                className="progress_bar"
                                ref={progressRef}
                                value="0"
                                max="100"
                              />
                            </label>
                          </div>
                        </>
                      )}
                      <p ref={statusRef}></p>
                    </>
                  ) : (
                    <>
                      <div style={{ margin: '15px 0px' }}>
                        <a
                          className="input-label"
                          href={
                            KioskOrderDetailLink ||
                            postUploadFileSuccessDataLink
                          }
                          target="_blank"
                          style={{
                            wordBreak: 'break-word',
                            color: 'var(--primary-foreground-color)',
                            marginLeft: '1px',
                          }}
                        >
                          {t('link_to_content')}
                        </a>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                KioskOrderDetail?.recipientname !== null && (
                  <>
                    <div
                      className={classNames(
                        'kiosk_name_wrapper_shipping tooltip-seed',
                      )}
                    >
                      <h2 className="kiosk_sub_title">
                        {t('shipping_address')}
                      </h2>
                      <p className="kiosk_sub_desc">
                        <CopyIcon
                          width="15px"
                          height="15px"
                          onClick={() => {
                            handleCopy()
                          }}
                          onMouseLeave={() => setAddressCopied(false)}
                        />
                        <span
                          className={
                            isAddressCopied
                              ? 'tooltiptext tooltip-visible'
                              : 'tooltiptext'
                          }
                          style={{ marginLeft: '200px', marginTop: '50px' }}
                        >
                          {t('copied')}
                        </span>
                      </p>
                    </div>
                    <div className={classNames('kiosk_name_wrapper')}>
                      {/* <p
                      className="kiosk_sub_desc_box"
                      style={isMobile() ? { background: '#222435' } : {}}
                    >
                      {KioskOrderDetail?.recipientname}{' '}
                      {KioskOrderDetail?.recipientaddress}{' '}
                      {KioskOrderDetail?.recipientcity}{' '}
                      {KioskOrderDetail?.recipientpostalcode}{' '}
                      {KioskOrderDetail?.recipientcountry}
                    </p> */}
                      <FormTextArea
                        id="itemdescripition"
                        type="text"
                        placeholder={t('enter item description')}
                        name="item_description"
                        value={fullAddress}
                        // handleChange={handleChange}
                        // onBlur={handleBlur}
                        containerClass={classNames(
                          'description-box disabled_input_field',
                        )}
                      />
                    </div>
                    {KioskOrderDetail?.additional_information ? (
                      <div className={classNames('kiosk_name_wrapper')}>
                        <h2 className="kiosk_sub_title">
                          {t('additional information')}
                        </h2>
                        <FormInput
                          id="item_additional_information"
                          type="text"
                          placeholder={t('additional information')}
                          name="item_description"
                          value={KioskOrderDetail?.additional_information}
                          className={'disabled_input_field'}
                          // handleChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                    ) : null}
                  </>
                )
              )}
              {errors.uploadedFile && (
                <div className="input-feedback text-center w-none mt-10 mb-10">
                  {errors.uploadedFile}
                </div>
              )}

              <div className={classNames('kiosk_name_wrapper')}>
                <h2 className="kiosk_sub_title">{t('quantity')}</h2>
                {/* <p className="kiosk_sub_desc">{KioskOrderDetail?.quantity}</p> */}
                <FormInput
                  id="item_name"
                  type="text"
                  placeholder={t('name of the item')}
                  name="item_name"
                  value={KioskOrderDetail?.quantity}
                  className={'disabled_input_field'}
                  // handleChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              {KioskOrderDetail?.salesmethod?.toString() !==
                SALES_OPTION.AUCTION &&
                KioskOrderDetail?.salesmethod?.toString() !==
                  SALES_OPTION.RAFFLE && (
                  <div className={classNames('kiosk_name_wrapper')}>
                    <h2 className="kiosk_sub_title">{t('price')}</h2>
                    {/* <p className="kiosk_sub_desc">
                    {KioskOrderDetail?.itemprice} {KioskOrderDetail?.ticker}
                  </p> */}
                    <div className="player-dashboard-select">
                      <div className="price-ticker-wrapper">
                        <input
                          className="new_percentage_value disabled_input_field"
                          style={{ width: '95px' }}
                          name="price"
                          id="price"
                          type="number"
                          value={KioskOrderDetail?.itemprice}
                          placeholder={t('price')}
                          // onChange={handleChange}
                          // onBlur={handleBlur}
                        />
                        <span>{KioskOrderDetail?.ticker}</span>
                      </div>
                    </div>
                  </div>
                )}
              {KioskOrderDetail?.shippedat === null &&
              !pathname.includes('/my_items') ? (
                <>
                  {!postFulfillKioskOrderSuccess && (
                    <>
                      {KioskOrderDetail?.delivery_mode === 2 ? (
                        <BidButton
                          // isDisabled={
                          //   postUploadFileSuccessData === true ||
                          //   KioskOrderDetail?.fileuploaded
                          //     ? false
                          //     : true
                          // }
                          isDisabled={getIsBtnDisabled()}
                          isLoading={postFulfillKioskOrderLoader}
                          title={t('fulfill')}
                          className={classNames('kiosk_close_button')}
                          onPress={() => handleFulfill()}
                        />
                      ) : (
                        <BidButton
                          isDisabled={false}
                          isLoading={postFulfillKioskOrderLoader}
                          title={t('item_shipped_close')}
                          className={classNames('kiosk_close_button')}
                          onPress={() => handleFulfill()}
                        />
                      )}
                    </>
                  )}
                  {postFulfillKioskOrderData && (
                    <>
                      <p className="page-text resend-link text-center fullwidth mt-40">
                        {postFulfillKioskOrderData}
                      </p>
                      <div
                        className="close-button-draftee m-0 text-center"
                        style={{ marginLeft: '120px' }}
                        onClick={onClose}
                      >
                        {t('close')}
                      </div>
                    </>
                  )}
                  {postFulfillKioskOrderError && (
                    <div className="input-feedback text-center width-unset">
                      {postFulfillKioskOrderError}
                    </div>
                  )}
                </>
              ) : KioskOrderDetail?.shippedat !== null ? (
                <>
                  <div
                    className={classNames('kiosk_name_wrapper')}
                    style={{ margin: 'auto' }}
                  >
                    <h2 className="kiosk_sub_title">{t('order_shipped_on')}</h2>
                    {/* <p className="kiosk_sub_desc">
                      {KioskOrderDetail?.shippedat}
                    </p> */}
                    <FormInput
                      id="item_name"
                      type="text"
                      placeholder={t('name of the item')}
                      name="item_name"
                      value={KioskOrderDetail?.shippedat}
                      className={'disabled_input_field'}
                      // handleChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {!pathname.includes('/my_items') && (
                    <div
                      className="close-button-draftee m-0 text-center mt-40 mb-20"
                      onClick={onClose}
                    >
                      {t('close')}
                    </div>
                  )}
                </>
              ) : null}
              {pathname.includes('/my_items') ? (
                <>
                  {KioskOrderDetail?.link &&
                    KioskOrderDetail?.delivery_mode === 2 && (
                      <div className="mt-30">
                        <a
                          className="input-label"
                          href={KioskOrderDetail?.link}
                          target="_blank"
                          style={{
                            wordBreak: 'break-word',
                            color: 'var(--primary-foreground-color)',
                            marginLeft: '5px',
                          }}
                        >
                          {t('link_to_content')}
                        </a>
                      </div>
                    )}
                  <div className="kiosk_name_wrapper mt-10">
                    <h2 className="kiosk_sub_title">{t('status')}</h2>

                    <div className="kiosk-sub-title-wrapper">
                      {KioskOrderDetail?.status === 'PAID' ? (
                        <span id="kiosk_open_text" className="kiosk_sub_title">
                          {t('Open')}
                        </span>
                      ) : (
                        <span
                          id="kiosk_fullfill_text"
                          className="kiosk_sub_title"
                        >
                          {t('fulfilled')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="close-button-draftee m-0 text-center mt-20 mb-20"
                    onClick={onClose}
                  >
                    {t('close')}
                  </div>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default KioskOrderDetail
