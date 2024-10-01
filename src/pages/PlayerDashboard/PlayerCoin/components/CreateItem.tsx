import SubmitButton from '@components/Button/SubmitButton'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import {
  MIN_MATIC_BALANCE,
  monthSet,
  NON_EMPTY_REGEX,
  SALES_OPTION,
} from '@root/constants'
import {
  getCircleColor,
  getDeliveryMode,
  isMobile,
  toKPIIntegerFormat,
  toKPINumberFormat,
} from '@utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Web3BottomPopup from '@components/Dialog/Web3BottomPopup'
import DialogBox from '@components/Dialog/DialogBox'
import { fetchNFTData } from '@root/apis/gallery/gallerySlice'
import classNames from 'classnames'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import {
  createAuction,
  createKioskItem,
  editKioskItem,
  createRaffle,
  getBlockdeadline,
  mintNft,
  resetBlockdeadline,
  switchItemToEdit,
  showCreteKioskItemForm,
} from '@root/apis/playerCoins/playerCoinsSlice'
import ApiBottomPopup from '@components/Dialog/ApiBottomPopup'
import FormInput from '@components/Form/FormInput'
import FormTextArea from '@components/Form/FormTextArea'
import ObjectPlaceHolder from '@assets/images/option.webp'
import {
  deleteKioskImage,
  getKioskItemDetail,
  getMyPlayerKioskList,
  resetDeleteKioskImage,
} from '@root/apis/onboarding/authenticationSlice'
import PlayerImage from '@components/PlayerImage'
import { Radio } from '@mui/material'
import ImageComponent from '@components/ImageComponent'
import { useWalletHelper } from '@utils/WalletHelper'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AliceCarousel from 'react-alice-carousel'
import leftArrow from '@assets/images/left_angle_bracket.webp'
import rightArrow from '@assets/images/right_angle_bracket.webp'
import 'react-alice-carousel/lib/alice-carousel.css'
import '@assets/css/components/Carousel.css'
import { ethers } from 'ethers'
import Web3 from 'web3'
import { BigNumber } from 'ethers'
import { postRequestAuth } from '@root/apis/axiosClientAuth'

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const today = new Date()
const targetDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
)
interface Years {
  id: number
  value: number
  title: number
}

interface Props {
  salesMethod?: string
  nftImg: any
  onOpenGallery: () => any
  onSuccess: () => any
  customClass?: string
  usageMode?: string
  toEdit?: any
  selectShopCategories?: any
  closePopup: () => any
}

const maxNumber = 250

const CreateItem: React.FC<Props> = ({
  salesMethod,
  nftImg,
  onOpenGallery,
  onSuccess,
  customClass = '',
  usageMode = '',
  selectShopCategories,
  toEdit = null,
  closePopup = () => null,
}) => {
  const kioskItemInitialValues = {
    nftMedia: null,
    price: 1,
    item_name: '  ',
    additionalDescription: '',
    available_qty:
      salesMethod === SALES_OPTION.AUCTION ||
      salesMethod === SALES_OPTION.RAFFLE
        ? '1'
        : '0',
  }

  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [nftMedia, setNFTMedia] = useState<any>()

  const [noLimitSelected, toggleNoLimitSelected] = useState<any>(false)
  const [remainingUploads, setRemainingUploads] = useState<number>(5)
  const [pictureFile, setPictureFile] = useState<any>()
  const [errMsg, setErrMsg] = useState<string>('')
  const [daysSet, setDaysSet] = useState<Years[]>([])
  const [txnError, setTxnError] = useState('')
  const [txnHash, setTxnHash] = useState('')
  const [minBid, setMinBid] = useState(0)
  const [showBottomPopup, setShowBottomPopup] = useState(false)
  const [lowBalancePrompt, setLowBalancePrompt] = useState(false)

  const [selectedImages, setSelectedImages] = useState<any>([])
  const fileInputRef = useRef(null)

  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )

  const {
    apiTxnHash = txnHash,
    itemCategoriesListData,
    KioskItemDetail,
    isGetKioskItemDetailSuccess,
    deleteKioskImageData,
    getUserSettingsData,
    ipLocaleCurrency,
    currencyRate,
  } = authenticationData

  const currencySymbol =
    getUserSettingsData?.currency ?? ipLocaleCurrency ?? 'USD'

  const nativeAmount = toEdit?.itemprice
    ? toEdit?.itemprice *
      (toEdit?.coinprice ?? 1) *
      toEdit?.exchangeRateUSD?.rate *
      currencyRate
    : 0

  const playerCoinData: any = useSelector(
    (state: RootState) => state.playercoins,
  )

  const {
    selectedPlayer,
    stakingcontract,
    stakingcontractabi,
    isGetBlockdeadlineSuccess,
    blockdeadline,
    createKioskLoading,
    createKioskSuccess,
    createdKioskItem,
    allPlayersData,
    getPlayerDetailsSuccessData,
    isCreateKioskItemFormVisible,
    createKioskError,
    txnConfirmResp,
    player1contract,
  } = playerCoinData

  const [items, setItems] = useState([])
  const [formValues, setFormValues] = useState(null)

  useEffect(() => {
    if (isCreateKioskItemFormVisible === false) {
      setItems([])
      selectedImages([])
      dispatch(resetDeleteKioskImage())
    }
  }, [isCreateKioskItemFormVisible])

  const responsiveItemDefault = {
    0: {
      items: 1,
    },
  }

  const minLength = 1
  const [hovered, setHovered] = useState(false)

  const { callWeb3Method, getLoggedWalletBalance } = useWalletHelper()

  useEffect(() => {
    window.scrollTo(0, 0)
    setDate(targetDate)

    return () => {
      dispatch(resetBlockdeadline())
    }
  }, [])

  useEffect(() => {
    if (showBottomPopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [showBottomPopup])

  useEffect(() => {
    setPictureFile(nftImg)
  }, [nftImg])

  useEffect(() => {
    if (deleteKioskImageData?.additionalImages?.length > -1) {
      toast.success(t('image deleted'))
      dispatch(getKioskItemDetail(KioskItemDetail?.itemId))
    }
  }, [deleteKioskImageData])

  function setDate(date: any) {
    setDays()
  }

  function setDays() {
    const remainingDays = 30
    const arrayData = Array.from({ length: remainingDays }, (_, index) => ({
      id: index + 1,
      value: index + 1,
      title: index + 1,
    }))
    setDaysSet(arrayData)
  }

  const validate = (values: any) => {
    const errors: any = {}
    if (toEdit) {
      return errors
    }
    if (
      Number(values.daySelected) < 1 ||
      values.daySelected === 'Select days remaining'
    ) {
      errors.daySelected = t(
        salesMethod === SALES_OPTION.FAN
          ? 'the cutoff date'
          : 'the closing bidding date',
      )
    }
    if (Number(values.daySelected) < 1) {
      errors.daySelected = t('end date must be less')
    }
    Object.keys(values).forEach(key => {
      if (key === 'additionalDescription') {
        const value = values[key]
        if (typeof value === 'string' && value !== '' && value.trim() === '') {
          errors[key] = 'Required'
        }
      }
    })
    return errors
  }

  const onSetNFTFile = ({
    currentTarget: { files, name },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (files && files.length && name === 'nftMedia') setNFTMedia(files[0])
  }

  const handleClose = () => {
    setShowBottomPopup(false)
    setTxnError('')
    setTxnHash('')
    closePopup()
  }

  useEffect(() => {
    if (nftMedia) {
      const objectUrl = URL.createObjectURL(nftMedia)
      setPictureFile(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [nftMedia])

  useEffect(() => {
    if (isGetBlockdeadlineSuccess) {
      handleCreateItem(formValues)
    }
  }, [isGetBlockdeadlineSuccess])

  const callWeb3Methods = async () => {
    if (createKioskSuccess === 'success') {
      if (
        !toEdit &&
        (salesMethod === SALES_OPTION.AUCTION ||
          salesMethod === SALES_OPTION.RAFFLE)
      ) {
        console.log(
          'for test payload for web3 call',
          salesMethod === SALES_OPTION.AUCTION
            ? [minBid, blockdeadline, createdKioskItem?.itemhash]
            : [blockdeadline, createdKioskItem?.itemhash],
        )

        // on creation of item
        // alert('Hello')

        const balanceResult = await getLoggedWalletBalance()

        if (balanceResult > MIN_MATIC_BALANCE) {
          const promise = callWeb3Method(
            salesMethod === SALES_OPTION.AUCTION
              ? 'createAuction'
              : 'createRaffle',
            stakingcontract,
            stakingcontractabi,
            salesMethod === SALES_OPTION.AUCTION
              ? [
                  // ethers.utils.parseEther(minBid.toString()),
                  minBid,
                  blockdeadline,
                  createdKioskItem?.itemhash,
                ]
              : [blockdeadline, createdKioskItem?.itemhash],
          )
          promise
            .then((txn: any) => {
              setTxnHash(txn.hash)
            })
            .catch((err: any) => {
              const isErrorGasEstimation = `${err}`.includes(
                'cannot estimate gas',
              )
              if (err.message === '406') {
                setTxnError(
                  t('this functionality unavailable for internal users'),
                )
              }
              if (isErrorGasEstimation) {
                setTxnError(
                  t('not enough funds to pay for blockchain transaction'),
                )
              } else {
                setTxnError(err.reason || err.message)
              }
            })
        } else {
          setShowBottomPopup(true)
          setLowBalancePrompt(true)
        }
      } else {
        handleCreateItemSuccess()
      }
    }
  }

  useEffect(() => {
    callWeb3Methods()
  }, [createKioskSuccess])

  useEffect(() => {
    if (txnHash) {
      handleConfirmKioskItem()
    }
  }, [txnHash])

  useEffect(() => {
    if (
      formValues &&
      txnHash &&
      txnConfirmResp.length > 0 && // Ishaan asked to call api as soon as get tx
      txnConfirmResp[0]?.haserror === 0
    ) {
      handleCreateItemSuccess()
    }
  }, [txnHash, txnConfirmResp.length])

  const handleConfirmKioskItem = async () => {
    const result = await postRequestAuth('players/kioskItemConfirm/', {
      transaction_hash: txnHash,
      itemId: createdKioskItem?.itemId,
    })
  }

  const handleCreateItemSuccess = async () => {
    toast.success(t('saved'))
    dispatch(getMyPlayerKioskList(player1contract))

    setSelectedImages([])
    dispatch(showCreteKioskItemForm({ show: false }))
    onSuccess()
  }

  const [requiresBuyerInformation, setRequiresBuyerInformation] = useState(
    !!toEdit?.buyerinstructions,
  )

  const handleDeleteItem = () => {
    try {
      console.log('hdi_caled', toEdit)
      const formData = new FormData()
      formData.append('itemId', toEdit?.itemid)
      formData.append('isDeleted', 'True')
      dispatch(editKioskItem(formData))
    } catch (err) {
      console.error('err', err)
    }
  }

  const handleCreateItem = (values: any) => {
    setErrMsg('')
    try {
      if (!toEdit?.isOpenOnly) {
        const formData = new FormData()
        const selectedImagesTemp = []
        if (selectedImages.length > 0) {
          console.log('selectedImagesupload', selectedImages)
          console.log({ selectedImagesTemp })
          for (let i = 0; i < selectedImages.length; i++) {
            if (selectedImages[i] instanceof File) {
              selectedImagesTemp.push(selectedImages[i])
            }
          }
          console.log({ selectedImagesTemp })
          for (let i = 0; i < selectedImagesTemp.length; i++) {
            formData.append(`itemPicture${i}`, selectedImagesTemp[i])
          }
        }

        if (toEdit) {
          formData.append('itemId', toEdit?.itemid)
          formData.append('additionalDescription', values.additionalDescription)
          if (values.buyerInstructions && requiresBuyerInformation) {
            formData.append('buyerInstructions', values.buyerInstructions)
          }
          dispatch(editKioskItem(formData))
        } else {
          if (
            (salesMethod === SALES_OPTION.AUCTION ||
              salesMethod === SALES_OPTION.RAFFLE ||
              salesMethod === SALES_OPTION.FAN) &&
            !isGetBlockdeadlineSuccess
          ) {
            if (!stakingcontract) {
              return
            }
            if (salesMethod === SALES_OPTION.AUCTION) {
              console.log({ values })
              const auctionPrice = Web3.utils.toWei(
                values.price.toString(),
                'ether',
              )
              setMinBid(auctionPrice)
            }
            if (salesMethod !== SALES_OPTION.FAN) {
              setShowBottomPopup(true)
            }

            const ONE_DAY_TIMESTAMP = 1000 * 60 * 60 * 24
            const year = new Date(
              new Date().getTime() + ONE_DAY_TIMESTAMP * values.daySelected,
            ).getFullYear()
            const month =
              new Date(
                new Date().getTime() + ONE_DAY_TIMESTAMP * values.daySelected,
              ).getMonth() + 1
            const day = new Date(
              new Date().getTime() + ONE_DAY_TIMESTAMP * values.daySelected,
            ).getDate()

            dispatch(getBlockdeadline(year + '-' + month + '-' + day))

            setFormValues(values)
            return
          }

          formData.append(
            'kioskItemCategoryId',
            itemCategoriesListData[selectShopCategories]?.id,
          )
          if (
            salesMethod === SALES_OPTION.AUCTION ||
            salesMethod === SALES_OPTION.RAFFLE ||
            salesMethod === SALES_OPTION.FAN
          ) {
            formData.append('endblock', blockdeadline)
          }
          if (
            salesMethod === SALES_OPTION.AUCTION ||
            salesMethod === SALES_OPTION.RAFFLE
          ) {
            formData.append('transaction_hash', txnHash)
          }
          formData.append('additionalDescription', values.additionalDescription)
          formData.append('player_contract', selectedPlayer?.playercontract)
          formData.append('itemPrice', values.price)

          if (salesMethod === SALES_OPTION.FAN) {
            formData.append('itemInventory', values.available_qty)
          } else {
            if (noLimitSelected) {
              formData.append('unlimitedInventory', 'True')
            } else {
              formData.append('itemInventory', values.available_qty)
            }
          }

          // salesMethod 1 : fix price, 2:auction, 3: random draw, 4: best fans
          formData.append('salesMethod', salesMethod)
          // formData.append('delivery_mode', deliveryMode)
          if (values.buyerInstructions && requiresBuyerInformation) {
            formData.append('buyerInstructions', values.buyerInstructions)
          }
          dispatch(createKioskItem(formData))
        }
      } else {
        const formData = new FormData()
        formData.append('itemId', toEdit?.itemid)
        formData.append('isDeleted', 'True')
        dispatch(editKioskItem(formData))
      }
    } catch (err) {
      console.log({ err })
    }
  }

  const getInitialValues = () => {
    if (toEdit) {
      return {
        ...kioskItemInitialValues,
        price: toEdit?.itemprice || '',
        item_name: toEdit?.itemname || '',
        additionalDescription:
          KioskItemDetail?.additionalDescription ||
          toEdit?.additionalDescription ||
          toEdit?.additionaldescription ||
          '',
        available_qty: toEdit?.actualinventory || '',
        buyerInstructions: toEdit?.buyerinstructions || '',
      }
    }
    return kioskItemInitialValues
  }

  const MAX_FILE_SIZE = 102400 //100KB

  const validFileExtensions = {
    image: ['jpg', 'gif', 'png', 'jpeg', 'svg', 'webp'],
  }

  function isValidFileType(fileName, fileType) {
    return (
      fileName &&
      validFileExtensions[fileType].indexOf(fileName.split('.').pop()) > -1
    )
  }

  const handleCloseForm = async () => {
    dispatch(showCreteKioskItemForm({ show: false }))
  }

  const handleImageChange = event => {
    const imgSet = selectedImages || KioskItemDetail?.additionalImages || []
    const imgSetTemp = [...imgSet]
    imgSetTemp.shift()
    console.log({ imgSetTemp, imgSet, selectedImages })
    ////
    const files = event.target.files
    const newImages = Array.from(files)
    if (newImages.length > 0) {
      // Check if adding the new images exceeds the limit (5)
      const previousImages = KioskItemDetail?.additionalImages
        ? KioskItemDetail?.additionalImages?.length - 1
        : 0
      // const remainingUploads = 5 - previousImages
      // if (selectedImages.length + newImages.length <= 6 - previousImages) {
      if (newImages.length <= remainingUploads) {
        // if (selectedImages.length <= 6) {
        setSelectedImages([...selectedImages, ...newImages])
        setRemainingUploads(remainingUploads - newImages.length)
      } else {
        // Display an error message or take appropriate action
        const msg = `${t('cannot add more than')} ${remainingUploads} images`
        toast.error(msg)
      }
    }
  }

  const handleImageRemove = indexToRemove => {
    const updatedImages = selectedImages.filter(
      (_, index) => index !== indexToRemove,
    )
    console.log('updateImage', updatedImages)
    setSelectedImages(updatedImages)
  }

  const handleCustomButtonClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click()
  }

  useEffect(() => {
    if (itemCategoriesListData.length > 0) {
      const temp = [...selectedImages]
      // itemCategoriesListData.forEach(element => {
      //   temp.push(element.defaultImage)
      // })
      temp.push(itemCategoriesListData[selectShopCategories]?.defaultImage)
      console.log({ temp })
      setSelectedImages(temp)
    }
  }, [itemCategoriesListData])

  useEffect(() => {
    if (selectedImages.length > 0) {
      // return
      setItems(
        selectedImages.map((image, index) => (
          <div
            key={index}
            className="nft-image-cover"
            style={{ position: 'relative' }}
          >
            <img
              src={
                typeof selectedImages[index] === 'string'
                  ? image
                  : URL.createObjectURL(image)
              }
              // src={
              //   'https://playerkiosks.s3.amazonaws.com/default_kiosk/email_thumb_art.png'
              // }
              alt={`Selected ${index + 1}`}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
              }}
            />
            {index > 0 && !toEdit?.isOpenOnly && (
              <div className="image_remove_btn_wrapper">
                <DeleteForeverIcon
                  // onClick={() => handleImageRemove(index)}
                  onClick={() => handleImageDelete(image)}
                  style={{
                    color: '#f54f4f',
                    cursor: 'pointer',
                    width: '60px',
                    height: '60px',
                  }}
                />
              </div>
            )}
          </div>
        )),
      )
    }
  }, [selectedImages])

  const handleImageDelete = image => {
    // const imgSet = selectedImages || KioskItemDetail?.additionalImages || []
    // const imgSetTemp = [...imgSet]
    // imgSetTemp.shift()
    // console.log({ imgSetTemp, imgSet, selectedImages })
    // ////
    // const files = event.target.files
    // const newImages = [] //Array.from(files)
    // // Check if adding the new images exceeds the limit (5)
    // const previousImages = KioskItemDetail?.additionalImages
    //   ? KioskItemDetail?.additionalImages?.length - 1
    //   : 0
    // // const remainingUploads = 5 - previousImages
    // console.log({
    //   selectedImages,
    //   newImages,
    //   previousImages,
    //   remainingUploads,
    // })
    // return
    if (KioskItemDetail?.length < 1 || !KioskItemDetail) {
      const deleteeIndex = selectedImages.findIndex(
        item => item.name === image.name,
      )
      const temps = [...selectedImages]
      temps.splice(deleteeIndex, 1)
      setSelectedImages(temps)
      setRemainingUploads(remainingUploads + 1)
    } else {
      const formData = new FormData()
      formData.append('itemId', KioskItemDetail?.itemId)
      formData.append('deletedPictures', [image])
      dispatch(deleteKioskImage(formData))
    }
  }

  useEffect(() => {
    if (
      KioskItemDetail?.additionalImages?.length > 0 &&
      isGetKioskItemDetailSuccess
    ) {
      // setItems(
      //   KioskItemDetail?.additionalImages.map((image, index) => (
      //     <div
      //       key={index}
      //       className="nft-image-cover"
      //       style={{ position: 'relative' }}
      //     >
      //       <img
      //         src={image}
      //         alt={`Selected ${index + 1}`}
      //         style={{
      //           width: '100%',
      //           height: '400px',
      //           objectFit: 'cover',
      //         }}
      //       />
      //       {!toEdit?.isOpenOnly && index !== 0 && (
      //         <div className="image_remove_btn_wrapper">
      //           <DeleteForeverIcon
      //             onClick={() => handleImageDelete(image)}
      //             style={{
      //               color: '#f54f4f',
      //               cursor: 'pointer',
      //               width: '60px',
      //               height: '60px',
      //             }}
      //           />
      //         </div>
      //       )}
      //     </div>
      //   )),
      // )
      const tempusSans = [...KioskItemDetail?.additionalImages]
      tempusSans.shift()
      console.log('KIDA', tempusSans)
      setSelectedImages(KioskItemDetail?.additionalImages)
      setRemainingUploads(remainingUploads - tempusSans?.length)
    }
  }, [KioskItemDetail?.additionalImages, isGetKioskItemDetailSuccess])

  const checkDate = obj => {
    Object.keys(obj).forEach(key => {
      if (key !== 'daySelected') {
        return false
      }
    })
    return true
  }

  const validateFileSize = fileData => {
    const fileInfo = fileData.target.files[0] // Get the first file selected
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

  useEffect(() => {
    document.body.style.overflow = 'hidden'
  }, [])

  return (
    <>
      {showBottomPopup && (
        <DialogBox
          isOpen={showBottomPopup}
          onClose={handleClose}
          contentClass="onboarding-popup"
        >
          <div className="nft-tab-title pt-50">{t('please wait')}...</div>
          {localStorage.getItem('loginInfo') ? (
            <Web3BottomPopup
              showPopup={showBottomPopup}
              txnHash={txnHash}
              txnErr={txnError}
              onClose={handleClose}
              // isLowBalance={lowBalancePrompt}
            />
          ) : null}
        </DialogBox>
      )}

      <Formik
        initialValues={getInitialValues()}
        onSubmit={(values: any) => handleCreateItem(values)}
        validate={validate}
        validationSchema={Yup.object().shape(
          toEdit
            ? {
                price:
                  salesMethod !== SALES_OPTION.RAFFLE &&
                  salesMethod !== SALES_OPTION.FAN
                    ? Yup.number()
                        .required(
                          t('field is required and only non-decimal number'),
                        )
                        .min(0.01, `${t('price must be at least')} 0.01`)
                    : null,
                additionalDescription: Yup.string().required(
                  t('field is required'),
                ),
                // available_qty: Yup.number()
                //   .min(1, `${t('available quantity min')} 1`)
                //   .required(t('field is required')),
                buyerInstructions:
                  requiresBuyerInformation && salesMethod !== SALES_OPTION.FAN
                    ? Yup.string().required(t('field is required'))
                    : null,
              }
            : salesMethod === SALES_OPTION.AUCTION
            ? {
                price: Yup.number()
                  .required(t('field is required and only non-decimal number'))
                  .min(0.01, `${t('price must be at least')} 0.01`),
                additionalDescription: Yup.string().required(
                  t('field is required'),
                ),
                available_qty: Yup.number()
                  .min(1, `${t('available quantity min')} 1`)
                  .required(t('field is required')),
                buyerInstructions: requiresBuyerInformation
                  ? Yup.string().required(t('field is required'))
                  : null,
                daySelected: Yup.string().required(t('date is required')),
              }
            : salesMethod === SALES_OPTION.RAFFLE
            ? {
                additionalDescription: Yup.string().required(
                  t('field is required'),
                ),
                available_qty: Yup.number()
                  .min(1, `${t('available quantity min')} 1`)
                  .required(t('field is required')),
                buyerInstructions: requiresBuyerInformation
                  ? Yup.string().required(t('field is required'))
                  : null,
                daySelected: Yup.string().required(t('date is required')),
              }
            : salesMethod === SALES_OPTION.FAN
            ? {
                additionalDescription: Yup.string().required(
                  t('field is required'),
                ),
                available_qty: Yup.number()
                  .min(1, `${t('winners count min')} 1`)
                  .required(t('field is required')),
                daySelected: Yup.string().required(t('It must be 1 ~ 30 days')),
              }
            : {
                price: Yup.number()
                  .min(0.01, `${t('price must be at least')} 0.01`)
                  .required(t('field is required and only non-decimal number')),
                additionalDescription: Yup.string().required(
                  t('field is required'),
                ),
                available_qty:
                  noLimitSelected === true
                    ? Yup.string()
                    : Yup.number()
                        .min(1, `${t('available quantity min')} 1ps`)
                        .required(t('field is required')),
                buyerInstructions: requiresBuyerInformation
                  ? Yup.string().required(t('field is required'))
                  : Yup.string(),
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
          } = props
          const [currentNumber, setCurrentNumber] = useState(
            values.detail ? maxNumber - values.detail.length : maxNumber,
          )
          return (
            <form
              autoComplete="off"
              onSubmit={handleSubmit}
              className={customClass + ' pb-m-2'}
            >
              <div
                className={classNames(
                  'createnft-fileload',
                  nftMedia || pictureFile ? 'no-border' : '',
                  'createnft-fileload',
                  isMobile() ? 'createnft-fileload-kiosk' : '',
                  toEdit?.isOpenOnly ? 'w-none' : '',
                )}
              >
                <input
                  type="file"
                  name="nftMedia"
                  accept="image/* video/*"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={event => {
                    if (validateFileSize(event)) {
                      setFieldValue('nftMedia', event.currentTarget.files[0])
                      onSetNFTFile(event)
                      handleImageChange(event)
                    }
                  }}
                  // onChange={handleImageChange}
                />

                <div
                  className={classNames(
                    'player-avatar-root item-avatar',
                    !nftMedia && !toEdit?.itempicturethumb
                      ? 'kiosk-item-default-avatar'
                      : '',
                  )}
                >
                  {selectedImages.length > 0 || items?.length > 0 ? (
                    <div
                      className={classNames(
                        isMobile()
                          ? 'circle-carousel-mob'
                          : 'circle-carousel kiosk',
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
                        // autoPlayInterval={5000}
                        // infinite
                        // autoPlay={items.length > minLength}
                        // activeIndex={activeIndex}
                        renderPrevButton={() => {
                          return items.length > minLength &&
                            (isMobile() || hovered) ? (
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
                          return items.length > minLength &&
                            (isMobile() || hovered) ? (
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
                        // onSlideChanged={handleSlideChange}
                      />
                    </div>
                  ) : (
                    // <ImageComponent
                    //   src={
                    //     itemCategoriesListData[selectShopCategories]
                    //       ?.defaultImage
                    //   }
                    //   alt="image"
                    //   // className="player-avatar-picture"
                    // />
                    <div
                      className="nft-image-cover"
                      style={{ position: 'relative' }}
                    >
                      <img
                        src={
                          itemCategoriesListData[selectShopCategories]
                            ?.defaultImage
                        }
                        alt={`SelectedDefault`}
                        style={{
                          width: '100%',
                          height: '400px',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="upload-kioskitem-wrapper">
                  <div
                    className={classNames(
                      'change-secret-otp-wrapper',
                      toEdit?.isOpenOnly ? 'item-admin-open' : '',
                    )}
                  >
                    <div className="percentage_value_wrapper">
                      {toEdit?.isOpenOnly &&
                      salesMethod !== SALES_OPTION.RAFFLE ? (
                        <div className="currency_mark_wrapper kiosk-item-flag-buyItem kiosk-item-img">
                          <div
                            className="currency_mark_img"
                            style={{
                              background: getCircleColor(
                                getPlayerDetailsSuccessData?.playerlevelid,
                              ),
                            }}
                          >
                            <PlayerImage
                              src={
                                toEdit?.playerpicturethumb ||
                                allPlayersData[0]?.playerpicturethumb
                              }
                              className="img-radius_kiosk currency_mark"
                            />
                          </div>
                          <div>
                            {toKPIIntegerFormat(toEdit?.itemprice)}
                            <span>
                              {' '}
                              {toEdit?.ticker ||
                                getPlayerDetailsSuccessData?.ticker ||
                                allPlayersData[0]?.ticker}
                            </span>
                            &nbsp;/&nbsp;{toKPINumberFormat(nativeAmount)}&nbsp;
                            {currencySymbol}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    {!toEdit?.isOpenOnly && selectedImages.length < 6 ? (
                      <div
                        className="form-submit-btn m-0"
                        style={{
                          width: isMobile() ? '' : '200px',
                          // display:
                          //   KioskItemDetail?.additionalImages?.length === 6
                          //     ? 'none'
                          //     : '',
                        }}
                        onClick={handleCustomButtonClick}
                      >
                        {/* {toEdit ? t('change image') : t('upload image')} */}
                        {t('upload more images')}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                  {/* {errors.nftMedia && touched.nftMedia && (
                    <div className="input-feedback">
                      {errors.nftMedia.toString()}dfklsdf
                    </div>
                  )} */}
                </div>
              </div>
              {errors.nftMedia && touched.nftMedia && (
                <div
                  className="input-feedback"
                  style={{
                    margin: `-30px 0 10px ${isMobile() ? 37 : 20}px`,
                  }}
                >
                  {errors.nftMedia.toString()}
                </div>
              )}
              <div className="wrapper_flex_col_center">
                <Select
                  className="match-worn-shirt"
                  value={
                    KioskItemDetail?.kioskItemCategoryId
                      ? itemCategoriesListData?.findIndex(
                          item =>
                            item?.id === KioskItemDetail?.kioskItemCategoryId,
                        )
                      : selectShopCategories.toString()
                  }
                  onChange={() => {
                    console.log('')
                  }}
                  disabled
                  inputProps={{ 'aria-label': 'Without label' }}
                  sx={{
                    color: 'var(--primary-foreground-color)',
                    borderRadius: '4px',
                    border: '1px solid',
                    // backgroundColor: 'var(--third-background-color)',
                  }}
                  style={{
                    color: 'var(--primary-foreground-color)',
                    borderRadius: '4px',
                    border: '1px solid',
                    // backgroundColor: 'var(--third-background-color)',
                  }}
                >
                  {itemCategoriesListData?.map((el, ind) => (
                    <MenuItem key={ind} value={ind}>
                      {el?.itemName}
                    </MenuItem>
                  ))}
                </Select>
                <div className="radio_delivery_wrapper">
                  <div className="radio_label_wrapper">
                    <Radio
                      sx={{
                        color: 'var(--primary-foreground-color)',
                        '&.Mui-checked': {
                          color: toEdit?.isOpenOnly
                            ? 'grey'
                            : 'var(--primary-foreground-color)',
                        },
                        width: '25px',
                        height: '25px',
                      }}
                      checked={
                        itemCategoriesListData[selectShopCategories]
                          ?.deliveryType === 1
                          ? true
                          : false
                      }
                      disabled={true}
                    />
                    <p>{t('postal_delivery')}</p>
                  </div>
                  <div className="radio_label_wrapper">
                    <Radio
                      sx={{
                        color: 'var(--primary-foreground-color)',
                        '&.Mui-checked': {
                          color: toEdit?.isOpenOnly
                            ? 'grey'
                            : 'var(--primary-foreground-color)',
                        },
                        width: '25px',
                        height: '25px',
                      }}
                      checked={
                        itemCategoriesListData[selectShopCategories]
                          ?.deliveryType === 2
                          ? true
                          : false
                      }
                      disabled={true}
                    />
                    <p>{t('digital_delivery')}</p>
                  </div>
                </div>
              </div>

              <div className="createnft-input-container edit-item-form">
                {toEdit?.isOpenOnly || toEdit ? (
                  <>
                    <div className="createnft-input-item"></div>
                    <div className="createnft-input-item">
                      <div className="input-label mb-10">
                        {t('general_description')}
                      </div>
                      <div className="textinput-wrapper shop_categories_desc_unset">
                        {toEdit?.itemdescription}
                      </div>
                    </div>
                    <div className="createnft-input-item">
                      <div className="input-label mb-10">
                        {t('additional_description') +
                          ' ' +
                          (values.additionalDescription?.length || 0) +
                          '/500'}
                      </div>
                      <div className="player-dashboard-select">
                        <FormTextArea
                          id="additionalDescription"
                          type="text"
                          placeholder={t('enter additional description')}
                          name="additionalDescription"
                          value={values.additionalDescription}
                          // handleChange={handleChange}
                          handleChange={e =>
                            e.target.value?.length > 500
                              ? null
                              : handleChange(e)
                          }
                          disabled={toEdit?.isOpenOnly}
                          onBlur={handleBlur}
                          containerClass={classNames('description-box')}
                        />
                      </div>
                    </div>
                    {/* <div className="createnft-input-item">
                        <div className="player-dashboard-select">
                          <div
                            className={classNames('textinput-wrapper')}
                            style={{
                              height: '150px',
                              overflowY: 'auto',
                              padding: '10px',
                              justifyContent: 'flex-start',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                            }}
                          >
                            <div className={classNames('item-description')}>
                              {toEdit?.itemdescription}
                            </div>
                          </div>
                        </div>
                      </div> */}

                    {salesMethod !== SALES_OPTION.FAN ? (
                      <>
                        <div className="createnft-input-item mb-0">
                          <div className="input-label mb-10">
                            {t('extra information from buyer required')}
                          </div>
                        </div>
                        <div className="radio_delivery_wrapper">
                          <div className="radio_label_wrapper">
                            <Radio
                              sx={{
                                color: 'var(--primary-foreground-color)',
                                '&.Mui-checked': {
                                  color: toEdit?.isOpenOnly
                                    ? 'grey'
                                    : 'var(--primary-foreground-color)',
                                },
                                width: '25px',
                                height: '25px',
                              }}
                              checked={requiresBuyerInformation}
                              disabled={
                                toEdit?.isOpenOnly ||
                                salesMethod !== SALES_OPTION.FIX
                              }
                              onChange={() => setRequiresBuyerInformation(true)}
                            />
                            <p>{t('yes')}</p>
                          </div>
                          <div className="radio_label_wrapper">
                            <Radio
                              sx={{
                                color: 'var(--primary-foreground-color)',
                                '&.Mui-checked': {
                                  color: toEdit?.isOpenOnly
                                    ? 'grey'
                                    : 'var(--primary-foreground-color)',
                                },
                                width: '25px',
                                height: '25px',
                              }}
                              checked={!requiresBuyerInformation}
                              disabled={toEdit?.isOpenOnly}
                              onChange={() =>
                                setRequiresBuyerInformation(false)
                              }
                            />
                            <p>{t('no')}</p>
                          </div>
                        </div>
                        {requiresBuyerInformation && (
                          <div className="createnft-input-item">
                            <div className="input-label mb-10">
                              {t(
                                'describe what information you need from buyer',
                              )}
                            </div>
                            <div className="player-dashboard-select">
                              <FormTextArea
                                id="buyerInstructions"
                                type="text"
                                placeholder={t('enter item buyer instructions')}
                                name="buyerInstructions"
                                value={values.buyerInstructions}
                                handleChange={(e: any) => {
                                  const length = e.target.value.length
                                  setCurrentNumber(maxNumber - length)
                                  handleChange(e)
                                }}
                                disabled={
                                  toEdit?.isOpenOnly ||
                                  salesMethod !== SALES_OPTION.FIX
                                }
                                onBlur={handleBlur}
                                containerClass={classNames('description-box')}
                              />
                            </div>
                            {(errors.buyerInstructions ||
                              values?.buyerInstructions?.length === 0) && (
                              <div className="input-feedback">
                                {errors?.buyerInstructions?.toString()}
                              </div>
                            )}
                            {currentNumber < 251 && currentNumber >= 0 && (
                              <div className="characters_left">
                                {t('characters left')}: {currentNumber}
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          {!toEdit?.unlimitedinventory && (
                            <div className="player_reward_percentage_wrapper">
                              <div className="input-label">
                                {t('available')}:
                              </div>
                              <div className="percentage_value_wrapper">
                                {toEdit?.actualinventory}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          {!toEdit?.unlimitedinventory && (
                            <div className="player_reward_percentage_wrapper">
                              <div className="input-label">
                                {t('Cutoff Date')}:
                              </div>
                              <div className="percentage_value_wrapper">
                                {toEdit?.blockdeadline?.split('T')[0]}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          {!toEdit?.unlimitedinventory && (
                            <div className="player_reward_percentage_wrapper">
                              <div className="input-label">
                                {t('How many winners?')}:
                              </div>
                              <div className="percentage_value_wrapper">
                                {toEdit?.actualinventory}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="createnft-input-item">
                      <div className="input-label mb-10">
                        {t('general_description')}
                      </div>
                      <div className="textinput-wrapper shop_categories_desc_unset">
                        {
                          itemCategoriesListData[selectShopCategories]
                            ?.itemDescription
                        }
                      </div>
                    </div>
                    <div className="createnft-input-item">
                      <div className="input-label mb-10">
                        {t('additional_description') +
                          ' ' +
                          (values.additionalDescription?.length || 0) +
                          '/500'}
                      </div>
                      <div className="player-dashboard-select">
                        <FormTextArea
                          id="additionalDescription"
                          type="text"
                          placeholder={t('enter additional description')}
                          name="additionalDescription"
                          value={values.additionalDescription}
                          handleChange={e =>
                            e.target.value?.length > 500
                              ? null
                              : handleChange(e)
                          }
                          onBlur={handleBlur}
                          containerClass={classNames('description-box')}
                        />
                      </div>
                      {errors.additionalDescription &&
                        touched.additionalDescription && (
                          <div className="input-feedback">
                            {errors.additionalDescription.toString()}
                          </div>
                        )}
                    </div>
                    {!toEdit &&
                      (salesMethod === SALES_OPTION.AUCTION ||
                        salesMethod === SALES_OPTION.RAFFLE ||
                        salesMethod === SALES_OPTION.FAN) && (
                        <div className="createpoll-input-item">
                          <div className="input-label">
                            {salesMethod === SALES_OPTION.AUCTION ? (
                              <span>
                                {t('Auction finishes on (max 0 days from now)')}
                              </span>
                            ) : salesMethod === SALES_OPTION.FAN ? (
                              <span>{t('Cutoff Date')}</span>
                            ) : (
                              <span>
                                {t('Open until (max 30 days from now)')}
                              </span>
                            )}
                          </div>
                          <div
                            className="birthday"
                            style={{ marginTop: '6px' }}
                          >
                            <select
                              id="select-day"
                              className="dob-select"
                              value={values.daySelected}
                              name="daySelected"
                              onChange={handleChange}
                              onBlur={handleBlur}
                            >
                              <option>{t('Select days remaining')}</option>
                              {daysSet.map(({ value, title }, index) => (
                                <option key={index} value={value}>
                                  {title} days
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.daySelected &&
                            (touched.daySelected || checkDate(errors)) && (
                              <div className="input-feedback">
                                {errors.daySelected.toString()}
                              </div>
                            )}
                        </div>
                      )}
                    {salesMethod !== SALES_OPTION.RAFFLE &&
                      salesMethod !== SALES_OPTION.FAN && (
                        <div className="createnft-input-item">
                          <div className="input-label mb-10">
                            {t(
                              salesMethod === SALES_OPTION.AUCTION
                                ? 'Minimum Bid'
                                : 'price',
                            )}
                          </div>
                          <div className="player-dashboard-select">
                            <div className="price-ticker-wrapper">
                              <input
                                className="new_percentage_value"
                                style={{ width: '95px' }}
                                name="price"
                                id="price"
                                type="number"
                                value={values.price}
                                placeholder={t('price')}
                                // onChange={e => {
                                //   if (Number(e.target.value) < 1) {
                                //     handleChange(e)
                                //     errors.price = 'Price must be at least 1'
                                //   } else {
                                //     handleChange(e)
                                //   }
                                // }}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              <span>{selectedPlayer?.ticker}</span>
                            </div>
                          </div>
                          {errors.price && touched.price && (
                            <div className="input-feedback">
                              {errors.price.toString()}
                            </div>
                          )}
                        </div>
                      )}
                    {salesMethod === SALES_OPTION.FAN && (
                      <>
                        <div className="input-label">
                          {t('How many winners?')}
                        </div>
                        <div className="percentage_value_wrapper">
                          <input
                            style={{
                              width: '120px',
                            }}
                            className="new_percentage_value"
                            type="number"
                            name="available_qty"
                            id="available_qty"
                            value={values.available_qty}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {errors.available_qty && touched.available_qty && (
                          <div className="input-feedback">
                            {errors.available_qty.toString()}
                          </div>
                        )}
                      </>
                    )}
                    {salesMethod !== SALES_OPTION.FAN && (
                      <>
                        <div className="createnft-input-item mb-0">
                          <div className="input-label mb-10">
                            {t('extra information from buyer required')}
                          </div>
                        </div>
                        <div className="radio_delivery_wrapper">
                          <div className="radio_label_wrapper">
                            <Radio
                              sx={{
                                color: 'var(--primary-foreground-color)',
                                '&.Mui-checked': {
                                  color: toEdit?.isOpenOnly
                                    ? 'grey'
                                    : 'var(--primary-foreground-color)',
                                },
                                width: '25px',
                                height: '25px',
                              }}
                              checked={requiresBuyerInformation}
                              disabled={toEdit?.isOpenOnly}
                              onChange={() => setRequiresBuyerInformation(true)}
                            />
                            <p>{t('yes')}</p>
                          </div>
                          <div className="radio_label_wrapper">
                            <Radio
                              sx={{
                                color: 'var(--primary-foreground-color)',
                                '&.Mui-checked': {
                                  color: toEdit?.isOpenOnly
                                    ? 'grey'
                                    : 'var(--primary-foreground-color)',
                                },
                                width: '25px',
                                height: '25px',
                              }}
                              checked={!requiresBuyerInformation}
                              disabled={toEdit?.isOpenOnly}
                              onChange={() =>
                                setRequiresBuyerInformation(false)
                              }
                            />
                            <p>{t('no')}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {requiresBuyerInformation && (
                      <div className="createnft-input-item">
                        <div className="input-label mb-10">
                          {t('describe what information you need from buyer')}
                        </div>
                        <div className="player-dashboard-select">
                          <FormTextArea
                            id="buyerInstructions"
                            type="text"
                            placeholder={t('enter item buyer instructions')}
                            name="buyerInstructions"
                            value={values.buyerInstructions}
                            handleChange={(e: any) => {
                              const length = e.target.value.length
                              setCurrentNumber(maxNumber - length)
                              handleChange(e)
                            }}
                            onBlur={handleBlur}
                            containerClass={classNames('description-box')}
                          />
                        </div>
                        {(errors.buyerInstructions ||
                          values?.buyerInstructions?.length === 0) && (
                          <div className="input-feedback">
                            {errors?.buyerInstructions?.toString()}
                          </div>
                        )}
                        {currentNumber < 251 && currentNumber >= 0 && (
                          <div className="characters_left">
                            {t('characters left')}: {currentNumber}
                          </div>
                        )}
                      </div>
                    )}

                    {salesMethod !== SALES_OPTION.FAN && (
                      <div>
                        <div
                          className={classNames(
                            'player_reward_percentage_wrapper',
                            noLimitSelected ? 'qty-disabled' : '',
                          )}
                        >
                          <div className="input-label">{t('available')}:</div>
                          <div className="percentage_value_wrapper">
                            <input
                              style={{ width: '70px' }}
                              className="new_percentage_value"
                              type="number"
                              name="available_qty"
                              id="available_qty"
                              value={values.available_qty}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled={
                                salesMethod === SALES_OPTION.AUCTION ||
                                salesMethod === SALES_OPTION.RAFFLE
                              }
                            />
                          </div>
                          {salesMethod === SALES_OPTION.FIX && (
                            <div className="radio_label_wrapper">
                              <Radio
                                sx={{
                                  color: 'var(--primary-foreground-color)',
                                  '&.Mui-checked': {
                                    color: toEdit?.isOpenOnly
                                      ? 'grey'
                                      : 'var(--primary-foreground-color)',
                                  },
                                  width: '25px',
                                  height: '25px',
                                }}
                                onClick={() =>
                                  toggleNoLimitSelected(prevState => !prevState)
                                }
                                checked={noLimitSelected}
                                // disabled={true}
                              />
                              <p>{t('no_limit')}</p>
                            </div>
                          )}
                        </div>
                        {errors.available_qty &&
                          touched.available_qty &&
                          !noLimitSelected && (
                            <div className="input-feedback">
                              {errors.available_qty.toString()}
                            </div>
                          )}
                      </div>
                    )}
                  </>
                )}
              </div>
              {errMsg ? (
                <div
                  className="input-feedback"
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  {errMsg}
                </div>
              ) : null}
              {!toEdit?.isOpenOnly ? (
                <>
                  {createKioskSuccess ? (
                    <div
                      className="close-button-draftee m-0 text-center mt-40"
                      style={{ marginLeft: '120px' }}
                      onClick={() => handleCloseForm()}
                    >
                      {t('close')}
                    </div>
                  ) : (
                    <SubmitButton
                      isDisabled={false}
                      title={
                        toEdit
                          ? t('save')
                          : salesMethod === SALES_OPTION.AUCTION
                          ? t('start auction')
                          : salesMethod === SALES_OPTION.RAFFLE
                          ? t('start draw')
                          : salesMethod === SALES_OPTION.FAN
                          ? t('Launch')
                          : t('save')
                      }
                      className="createnft-createbtn"
                      onPress={handleSubmit}
                      isLoading={createKioskLoading}
                    />
                  )}
                  <div style={{ height: '30px' }}></div>
                </>
              ) : (
                salesMethod !== SALES_OPTION.AUCTION &&
                salesMethod !== SALES_OPTION.RAFFLE && (
                  <SubmitButton
                    isDisabled={false}
                    title={t('delete')}
                    className="createnft-createbtn delete-btn"
                    onPress={handleDeleteItem}
                    isLoading={createKioskLoading}
                  />
                )
              )}
              {createKioskError && (
                <div className="input-feedback">{createKioskError}</div>
              )}
            </form>
          )
        }}
      </Formik>
    </>
  )
}

export default CreateItem
