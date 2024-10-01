import { useState, useEffect, useRef } from 'react'
import '@assets/css/components/SubmitButton.css'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import FormTextArea from '@components/Form/FormTextArea'
import classNames from 'classnames'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ReplyIcon from '@mui/icons-material/Reply'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import LoadingIcon from '@assets/icons/icon/loading.svg'
import { RootState } from '@root/store/rootReducers'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllPlayerChats,
  getChatDetail,
  postMessage,
  showSignupForm,
  getCredit,
  clearPostMessageError
} from '@root/apis/onboarding/authenticationSlice'
import { getStakingStatus } from '@root/apis/playerCoins/playerCoinsSlice'
import '@assets/css/pages/Landing.css'
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft'
import Image from '@assets/icons/icon/image.svg'
import { Close } from '@mui/icons-material'

const timeAgo = (oldTimestamp: number) => {
  const lastDate = new Date(oldTimestamp * 1000);
  const now = new Date();

  const differenceInSeconds = Math.floor((now.getTime() - lastDate.getTime()) / 1000);
  const differenceInMinutes = Math.floor(differenceInSeconds / 60);
  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInSeconds < 60) {
    return `${differenceInSeconds} Seconds Ago`;
  } else if (differenceInMinutes < 180) {
    return `${differenceInMinutes} Minutes Ago`;
  } else {
    return `${differenceInHours} Hours Ago`;
  }
}

interface Props {
  isOpenChatModal: boolean
  handleOpenChatModal: (data) => void
  card: any
}

function index({ isOpenChatModal, handleOpenChatModal, card }: Props) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)
  const loginInfo = localStorage.getItem('loginInfo')
  const authenticationData = useSelector(
    (state: RootState) => state.authentication,
  )
  const {
    allChats,
    chatDetail,
    getAllChatsLoading,
    getChatDetailLoading,
    postMessageError,
    credits,
    getCreditsLoading
  } = authenticationData

  const { stakingStatus, loadedStakingStatus } = useSelector((state: RootState) => state.playercoins)

  useEffect(() => {
    if(isOpenChatModal) dispatch(getStakingStatus(card?.detailpageurl))
  }, [isOpenChatModal])

  const [taggedInfo, setTaggedInfo] = useState('')
  const [messageType, setMessageType] = useState('3')
  const [newMessage, setNewMessage] = useState('')
  const [newMsgLength, setNewMsgLength] = useState(500)
  const [isReply, setIsReply] = useState(false)
  const [isReplyToReply, setIsReplyToReply] = useState(false)
  const [file, setFile] = useState<any>()
  const [selectedImage, setSelectedImage] = useState("");

  const handleBlur = () => {
    console.log('')
  }

  const handleShowLogin = () => {
    handleOpenChatModal(false)
    dispatch(showSignupForm())
  }

  const handleChange = e => {
    if (e.target?.value?.length < 501 + taggedInfo.length) {
      let newMessage = e.target.value.substring(taggedInfo.length)
      setNewMessage(newMessage)
      setNewMsgLength(500 - newMessage.length)
    }
  }

  console.log("card: ", card)

  const handleImageChange = event => {
    const file = event.currentTarget.files[0]
    setFile(file)
  }
  
  useEffect(() => {
    dispatch(getAllPlayerChats(card?.playercontract))
    dispatch(getCredit())
  }, [isReply, isReplyToReply])

  useEffect(() => {
    if (postMessageError)
      toast.error(t('An error occured!'))
    dispatch(clearPostMessageError())
  }, [postMessageError])

  const handleSubmitMessage = async () => {
    const formData = new FormData()
    formData.append('text', newMessage)
    formData.append('messagetype', messageType)
    formData.append('file', file)
    formData.append('playercontract', card?.playercontract)

    const replyFormData = new FormData()
    replyFormData.append('text', newMessage)
    replyFormData.append('messagetype', messageType)
    replyFormData.append('file', file)
    replyFormData.append('tagged_msg', chatDetail?.id)
    replyFormData.append('playercontract', card?.playercontract)

    console.log('isReplyToReply: ', isReplyToReply, '\nformData: ', formData)

    dispatch(postMessage(isReplyToReply ? replyFormData : formData))
    setTimeout(() => {
      dispatch(getAllPlayerChats(card?.playercontract));
      dispatch(getCredit())
      setIsReply(false)
      setIsReplyToReply(false)
      setFile(null)
      setTaggedInfo('')
      setNewMessage('')
      setNewMsgLength(500)
    }, 1500);
  }

  const handleUploadFile = () => {
    fileInputRef.current.click()
  }

  const handleClickChat = (data: any) => {
    dispatch(getChatDetail(data?.id))
  }

  return (
    <div className="chat-container">
      {isOpenChatModal && (
      <>
        <div
          className="chat-button form-submit-btn"
          onClick={() => {
            handleOpenChatModal(!isOpenChatModal);
            setSelectedImage("")
            setFile(null)
          }}
        >
          {t('chat 24h')}
            <div style={{fontSize: 30}}>&times;</div>
        </div>
        <div className={`chat-content-contianer ${selectedImage ? " overflow-hidden" : ''}`}>
            {loadedStakingStatus ?
            (stakingStatus ? (
            <>
              <div className="chat-btn-container">
                <div className='active-btn'>
                  {`$${card?.ticker} `+ t('chat')}
                </div>
              </div>
              <div className="post-container">
                  {!Boolean(loginInfo) ? (
                    <>
                      <div className="button-box sign-btn" onClick={handleShowLogin}>
                        {t('Login')}
                      </div>
                      <div className="typing-indicator-container">
                        <img src={LoadingIcon} alt="loading" width="60px" />
                      </div>
                    </>
                  ) : !isReply ? (
                    <>
                      <div className="flex-container justify-between">
                        <div
                          className={
                            `${credits?.credits === 0
                              ? "error-credit"
                              : "normal-credit"
                            } flex-container`
                          }
                        >
                          {getCreditsLoading
                            ? <div className="credit-skeleton"></div>
                            : credits?.credits
                          } {t('Message Credits')}
                        </div>
                        <div>{newMsgLength}</div>
                      </div>
                      <FormTextArea
                        id="itemdescripition"
                        type="text"
                        placeholder={t('Enter your message')}
                        name="item_description"
                        value={taggedInfo + newMessage}
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        className="bg-chat"
                        containerClass={classNames('description-box w-full bg-chat')}
                      />
                      <div className="flex-container justify-between msg-post-container">
                        <input
                          type="file"
                          name="nftMedia"
                          accept=".png, .gif, .jpeg, .webp"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={event => {
                            handleImageChange(event)
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            gap: 20,
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                          onClick={handleUploadFile}
                        >
                          <AttachFileIcon />
                          {file ? file?.name : t('File Upload')}
                        </div>
                        <div onClick={handleSubmitMessage} className={classNames("post-btn", (getAllChatsLoading || getChatDetailLoading || getCreditsLoading || credits?.credits === 0) ? 'disabled' : '')}>
                          {t('post')}
                        </div>
                      </div>
                      <div className="typing-indicator-container">
                        <img src={LoadingIcon} alt="loading" width="60px" />
                      </div>
                    </>
                  ) : <></>}

                  {(isReplyToReply || isReply) ? (
                    <div className="player-message-container">
                      {getChatDetailLoading ? (
                        <>
                          <div className="message-skeleton" />
                          <div className="message-skeleton" />
                          <div className="message-skeleton" />
                        </>
                      ) : (
                        <>
                          <div className="message-div">
                            <div className="flex-container justify-between">
                              <div className='flex-container'>
                                <div className={classNames('avatar-container', chatDetail?.avatar ?? 'anonymous-chat-avatar')}></div>
                                <div className="chat-username">
                                  {chatDetail?.username ?? t('anonymous')}
                                </div>
                              </div>
                              <div className="chat-date">
                                {timeAgo(chatDetail?.insertedat)} #
                                {chatDetail?.id}
                              </div>
                            </div>
                            <div className="message">{chatDetail?.text}</div>
                            {
                              chatDetail?.file && (
                                <div className='show-graphic' onClick={() => setSelectedImage(chatDetail?.file)}>
                                  <img src={Image} width={24} height={24} />
                                  {t('show graphic')}
                                </div>
                              )
                            }
                            <div
                              onClick={() => {
                                setTaggedInfo(`@${chatDetail?.username} #${chatDetail?.id} `)
                                setIsReplyToReply(true)
                                setIsReply(false)
                              }}
                              className="flex-container"
                              style={{ gap: 10, cursor: 'pointer' }}
                            >
                              <ReplyIcon />
                              {t('reply')}
                              <MoreHorizIcon />
                            </div>
                          </div>

                          {chatDetail?.replies?.length > 0 &&
                            chatDetail?.replies?.map((item: any) => (
                              <div className="reply-message-div">
                                <div className="flex-container justify-between">
                                  <div className='flex-container'>
                                    <div className={classNames('avatar-container', item?.avatar ?? 'anonymous-chat-avatar')}></div>
                                    <div className="chat-username">
                                      {item?.username ?? t('anonymous')}
                                    </div>
                                  </div>
                                  <div className="chat-date">
                                    {timeAgo(item?.insertedat)} #
                                    {item?.id}
                                  </div>
                                </div>
                                <div className="message">{`@${chatDetail?.username} #${chatDetail?.id} ${item?.text}`}</div>
                                {
                                  item?.file && (
                                    <div className='show-graphic' onClick={() => setSelectedImage(item?.file)}>
                                      <img src={Image} width={24} height={24} />
                                      {t('show graphic')}
                                    </div>
                                  )
                                }
                                <div
                                  onClick={() => {
                                    setTaggedInfo(`@${item?.username} #${item?.id} `)
                                    handleClickChat(item)
                                    setIsReplyToReply(true)
                                    setIsReply(false)
                                  }}
                                  className="flex-container"
                                  style={{ gap: 10, cursor: 'pointer' }}
                                >
                                  <ReplyIcon />
                                  {t('reply')}
                                  <MoreHorizIcon />
                                </div>
                                {Number(item?.reply_count) > 0 && (
                                  <div>
                                    <div
                                      onClick={() => {
                                        handleClickChat(item)
                                        setIsReplyToReply(false)
                                        setIsReply(true)
                                      }}
                                      className="reply-btn"
                                    >
                                      {t('replies') + ' ' + item?.reply_count}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}

                          <div
                            className="back-to-chat-btn"
                            onClick={() => {
                              setIsReply(false)
                              setIsReplyToReply(false)
                              setTaggedInfo('')
                            }}
                          >
                            <ArrowCircleLeftIcon />
                            {t('Back To Chat')}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="player-message-container">
                      {getAllChatsLoading ? (
                        <>
                          <div className="message-skeleton" />
                          <div className="message-skeleton" />
                          <div className="message-skeleton" />
                        </>
                      ) : (
                        <>
                          {allChats?.results?.map((item: any, key: any) => (
                            <div key={key} className="message-div">
                              <div className="flex-container justify-between">
                                <div className='flex-container'>
                                  <div className={classNames('avatar-container', item?.avatar ?? 'anonymous-chat-avatar')}></div>
                                  <div className="chat-username">
                                    {item?.username ?? t('anonymous')}
                                  </div>
                                </div>
                                <div className="chat-date">
                                  {timeAgo(item?.insertedat)} #
                                  {item?.id}
                                </div>
                              </div>
                              <div className="message">{item?.text}</div>
                              {
                                item?.file && (
                                  <div className='show-graphic' onClick={() => setSelectedImage(item?.file)}>
                                    <img src={Image} width={24} height={24} />
                                    {t('show graphic')}
                                  </div>
                                )
                              }
                              <div
                                onClick={() => {
                                  setTaggedInfo(`@${item?.username} #${item?.id} `)
                                  handleClickChat(item)
                                  setIsReplyToReply(true)
                                }}
                                className="flex-container"
                                style={{ gap: 10, cursor: 'pointer' }}
                              >
                                <ReplyIcon />
                                {t('reply')}
                                <MoreHorizIcon />
                              </div>
                              {Number(item?.reply_count) > 0 && (
                                <div>
                                  <div
                                    onClick={() => {
                                      handleClickChat(item)
                                      setIsReply(true)
                                    }}
                                    className="reply-btn"
                                  >
                                    {t('replies') + ' ' + item?.reply_count}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
              </div>
            </>) : (
              <div className="chat-alert">
                {`You must have at least 1 $${card?.ticker} share to enter this chat`}
              </div>
              )) : (
            <div className="chat-loading-spinner">
              <div className="spinner"></div>
              {`Login to $${card?.ticker} chat`}
            </div>
            )
          }
        </div>
        {
          selectedImage &&
          <div className='message-image-root'>
            <img src={selectedImage} width="80%" />
            <div className='flex-container' onClick={() => setSelectedImage('')} style={{marginTop: 20, cursor: "pointer"}}><Close /> {t('close')} </div>
          </div>
        }
      </>
      )}
    </div>
  )
}

export default index
