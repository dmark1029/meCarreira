import { postRequestAuth } from '@root/apis/axiosClientAuth'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
// const firebaseConfig = {
//   apiKey: 'AIzaSyCzF73-rRYVUPdjPcGbST4QInf-9PZ5azM',
//   authDomain: 'test-mecarreira.firebaseapp.com',
//   projectId: 'test-mecarreira',
//   storageBucket: 'test-mecarreira.appspot.com',
//   messagingSenderId: '790616582570',
//   appId: '1:790616582570:web:f7ba289f441b3002c423d3',
// }

const firebaseConfig = {
  apiKey: 'AIzaSyDDnsYKFt3aguSG-en2X-h8wLafAqNH1zU',
  authDomain: 'mecarreira-935be.firebaseapp.com',
  projectId: 'mecarreira-935be',
  storageBucket: 'mecarreira-935be.appspot.com',
  messagingSenderId: '862653322428',
  appId: '1:862653322428:web:c145222438f6c276a32cb9',
  measurementId: 'G-QYPNVYMXSF',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging and get a reference to the service
// export const messaging = getMessaging(app)

export const requestPermission = () => {
  const messaging = getMessaging(app)
  console.log('Requesting Permission')

  if (localStorage.getItem('fcm_token')) {
    postRequestAuth('accounts/fcm_token_api/', {
      token: localStorage.getItem('fcm_token'),
    })

    return
  }

  if (Notification.permission !== 'default') {
    return
  }

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Permission Granted')
      getTokenForMessaging()
    } else {
      console.log('User Permission Denied')
    }
  })
}

// BBHMosPvrtsHNDHqlytc6ZIfPzFTZNRnC0WB96fF7gjyl53kEFGAStxAhxoSKH2eNAG5AGc8Ipq0y0clTyqdMSs
export const getTokenForMessaging = () => {
  const messaging = getMessaging(app)
  getToken(messaging, {
    vapidKey:
      'BJBUeL3gVrQS9bKOX3MPu7xt2LUDqNGKTU7plMZdlA33_dMxzacbuRWFokixOPHY9cYTXwX-DeDVeprBvxxWNi8',
  })
    .then(currentToken => {
      if (currentToken) {
        console.log('Client Token', currentToken)
        postRequestAuth('accounts/fcm_token_api/', {
          token: currentToken,
        })

        localStorage.setItem('fcm_token', currentToken + '')
      } else {
        console.log('Failed To Generate the app registration token')
      }
    })
    .catch(err => {
      console.log('Error Occured', err)
    })
}

export const onMessageListener = () => {
  const messaging = getMessaging(app)
  new Promise(resolve => {
    onMessage(messaging, payload => {
      resolve(payload)
    })
  })
}

export const initPushNotisfication = () => {}
