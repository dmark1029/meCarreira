import FormInput from '@components/Form/FormInput'
import SubmitButton from '@components/Button/SubmitButton'
import { useEffect, useState } from 'react'
import { MIN_MATIC_BALANCE, monthSet } from '@root/constants'
import { useTranslation } from 'react-i18next'
import { FieldArray, Formik, ErrorMessage } from 'formik'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import * as Yup from 'yup'
import { isMobile } from '@utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store/rootReducers'
import Web3BottomPopup from '@components/Dialog/Web3BottomPopup'
import {
  getBlockdeadline,
  getOpenVoteList,
  resetBlockdeadline,
  createVote,
} from '@root/apis/playerCoins/playerCoinsSlice'
import ApiBottomPopup from '@components/Dialog/ApiBottomPopup'
import { useWalletHelper } from '@utils/WalletHelper'

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

const initialValues = {
  daySelected: '',
  question: '',
  answer: ['', ''],
}

interface Props {
  onClose: any
}
const CreatePoll: React.FC<Props> = ({ onClose }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [daysSet, setDaysSet] = useState<Years[]>([])
  const [lowBalancePrompt, setLowBalancePrompt] = useState(false)
  const [showBottomPopup, setShowBottomPopup] = useState<boolean>(false)
  const [txnHash, setTxnHash] = useState<string>('')
  const [txnErr, setTxnErr] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const playerCoinData = useSelector((state: RootState) => state.playercoins)

  const {
    selectedPlayer,
    player1contract,
    stakingcontract,
    stakingcontractabi,
    staking2contract,
    staking2contractabi,
    isGetBlockdeadlineSuccess,
    blockdeadline,
  } = playerCoinData

  const { getStakingContract, getLoggedWalletBalance } = useWalletHelper()

  useEffect(() => {
    console.log('CP_MOUNT')
    window.scrollTo(0, 0)
    setDate()
    return () => {
      console.log('CP_UMOUNT')
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

  function setDate() {
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
    if (
      Number(values.daySelected) < 1 ||
      values.daySelected === 'Select days remaining'
    ) {
      errors.daySelected = t('the closing voting date')
    }
  }

  const handleClose = () => {
    setShowBottomPopup(false)
    setTxnErr('')
    setTxnHash('')
    dispatch(getOpenVoteList(player1contract))
    onClose()
  }

  const handleCreatePoll = (values: any) => {
    if (!stakingcontract) {
      console.log('staking Contract not there')
      return
    }
    setQuestion(values.question)
    setAnswer(values.answer)

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
  }

  const handleCreatePollUsingContract = async () => {
    const balanceResult = await getLoggedWalletBalance()
    console.log({ balanceResult })
    if (balanceResult > MIN_MATIC_BALANCE) {
      if (isGetBlockdeadlineSuccess) {
        setShowBottomPopup(true)
        dispatch(resetBlockdeadline())
        if (localStorage.getItem('loginId')) {
          return
        }
        const stakingContract = await getStakingContract(
          stakingcontract,
          stakingcontractabi,
        )
        console.log({ stakingContract })
        stakingContract
          ?.createPoll(question, answer, blockdeadline)
          .then(async (txn: any) => {
            setTxnHash(txn.hash)
          })
          .catch((err: any) => {
            const isErrorGasEstimation = `${err}`.includes(
              'cannot estimate gas',
            )
            if (err.message === '406') {
              setTxnErr(t('this functionality unavailable for internal users'))
            }
            if (isErrorGasEstimation) {
              setTxnErr(t('not enough funds to pay for blockchain transaction'))
            } else {
              console.log(err.reason || err.message)
              setTxnErr(t('transaction failed'))
            }
          })
      }
    } else {
      setShowBottomPopup(true)
      setLowBalancePrompt(true)
    }
  }

  useEffect(() => {
    if (isGetBlockdeadlineSuccess) {
      handleCreatePollUsingContract()
    }
  }, [isGetBlockdeadlineSuccess])

  const handleCreatePollApi = (user_secret: any) => {
    const formData = new FormData()
    formData.append('text', question)
    formData.append('options', answer)
    formData.append('end_block', blockdeadline)
    formData.append('user_secret', user_secret)
    formData.append('contract', selectedPlayer?.playercontract)
    dispatch(createVote(formData))
  }

  return (
    <>
      {showBottomPopup &&
        (localStorage.getItem('loginInfo') ? (
          <Web3BottomPopup
            showPopup={showBottomPopup}
            txnHash={txnHash}
            txnErr={txnErr}
            onClose={handleClose}
            isLowBalance={lowBalancePrompt}
            customClass={isMobile() ? 'exwallet-bottomwrapper' : ''}
          />
        ) : (
          <ApiBottomPopup
            showPopup={showBottomPopup}
            onSubmit={handleCreatePollApi}
            onClose={handleClose}
            customClass="purchase-pc-bottomwrapper"
          />
        ))}
      <div className="createpoll-input-container">
        <div className="nft-tab-title">{t('create a new voting poll')}</div>
        <Formik
          initialValues={initialValues}
          onSubmit={handleCreatePoll}
          validate={validate}
          validationSchema={Yup.object().shape({
            daySelected: Yup.string().required(t('date is required')),
            question: Yup.string().required(t('question is required')),
            answer: Yup.array().of(
              Yup.string().required(t('answer is required')),
            ),
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
            } = props
            const [questionLen, setQuestionLen] = useState(
              values.question ? 80 - values.question.length : 80,
            )
            const [answersLen, setAnswersLen] = useState<any[]>(
              Array(6).fill(25),
            )
            return (
              <form
                className="pb-m-2"
                autoComplete="off"
                onSubmit={handleSubmit}
              >
                <div id="createpoll-input-item-wrapper">
                  <div className="createpoll-input-item">
                    <div className="input-label">{t('vote closes in')}</div>
                    <div className="birthday" style={{ marginTop: '6px' }}>
                      <select
                        id="select-day"
                        className="dob-select"
                        value={values.daySelected}
                        name="daySelected"
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option>Select days remaining</option>
                        {daysSet.map(({ value, title }, index) => (
                          <option key={index} value={value}>
                            {title} days
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.daySelected && touched.daySelected && (
                      <div className="input-feedback">{errors.daySelected}</div>
                    )}
                  </div>
                  <div className="createpoll-input-item">
                    <div className="input-label">{t('voting question')}</div>
                    <textarea
                      className="createpoll-textarea"
                      placeholder={t('enter voting question')}
                      name="question"
                      maxLength={80}
                      value={values.question}
                      onChange={(e: any) => {
                        const length = e.target.value.length
                        setQuestionLen(80 - length)
                        handleChange(e)
                      }}
                      onBlur={handleBlur}
                    ></textarea>
                  </div>
                  {questionLen < 80 && questionLen >= 0 && (
                    <div className="gallery-current-number">
                      {t('characters left')}: {questionLen}
                    </div>
                  )}
                  {errors.question && touched.question && (
                    <div className="input-feedback">{errors.question}</div>
                  )}
                  <FieldArray
                    name="answer"
                    render={arrayHelpers => (
                      <div>
                        {values.answer.map((item, index) => (
                          <div key={index}>
                            <div className="createpoll-input-item">
                              <div className="input-label">
                                {t('answer')}
                                {index + 1}
                              </div>
                              <FormInput
                                type="text"
                                placeholder={t('enter answer')}
                                name={`answer.${index}`}
                                maxLength={25}
                                value={values.answer[index]}
                                handleChange={(e: any) => {
                                  setAnswersLen(
                                    answersLen.map((item, i) =>
                                      i === index
                                        ? 25 - e.target.value.length
                                        : item,
                                    ),
                                  )
                                  handleChange(e)
                                }}
                                onBlur={handleBlur}
                              />
                              {index > 0 && (
                                <DeleteForeverOutlinedIcon
                                  onClick={() => arrayHelpers.remove(index)}
                                />
                              )}
                            </div>
                            {answersLen[index] < 25 &&
                              answersLen[index] >= 0 && (
                                <div className="gallery-current-number">
                                  {t('characters left')}: {answersLen[index]}
                                </div>
                              )}
                            <ErrorMessage
                              name={`answer.${index}`}
                              component="div"
                              className="input-feedback"
                            />
                            {index === values.answer.length - 1 &&
                              index <= 4 && (
                                <div
                                  className="createpoll-answer-addbtn"
                                  onClick={() =>
                                    arrayHelpers.insert(index + 1, '')
                                  }
                                >
                                  {t('add more answers')}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  <SubmitButton
                    isDisabled={false}
                    title={t('create voting poll')}
                    className="createpoll-createbtn"
                    onPress={handleSubmit}
                  />
                </div>
              </form>
            )
          }}
        </Formik>
      </div>
    </>
  )
}

export default CreatePoll
