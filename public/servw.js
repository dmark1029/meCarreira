// const CACHE_NAME = 'my-cache'
// self.addEventListener('install', e => {
//   console.log('installing_service_workier')
//   e.waitUntil(
//     caches.open(CACHE_NAME).then(cache => {
//       return cache
//         .addAll(['/', '/index.html', 'static/js/bundle.js'])
//         .then(() => self.skipWaiting())
//     }),
//   )
// })

// self.addEventListener('activate', event => {
//   console.log('activating_service_workersa')
//   event.waitUntil(self.clients.claim())
// })

// self.addEventListener('fetch', function (event) {
//   console.log(`PWAAPP--fetching ${event.request.url}`)
//   if (navigator.onLine) {
//     //- IMPORTANT: -Clone the request. -A- request is-a-stream and
//     //-can-only-be consumed: once. - Since we-are consuming this
//     //-once by cache and once by the- brouser for fetch, we need
//     // to clone the response.
//     var fetchRequest = event.request.clone()
//     return fetch(fetchRequest).then(function (response) {
//       // Check if we received a valid response
//       if (!response || response.status !== 200 || response.type !== 'basic') {
//         return response
//       }
//       //- IMPORTANT: -Clone the response. -A: response is-a-stream
//       //-and because we want the brouser to- consume - the response
//       // as well as the cache: consuming the response, we need
//       // -to- clone it-so-we have two: streams

//       var responseToCache = response.clone()

//       caches.open(CACHE_NAME).then(function (cache) {
//         cache.put(event.request, responseToCache)
//       })
//       return response
//     })
//   } else {
//     event.respondWith(
//       caches.match(event.request).then(function (response) {
//         //-Cache hit return: response
//         if (response) {
//           return response
//         }
//       }),
//     )
//   }
// })
self.addEventListener('install', event => {
  event.waitUntil(Promise.resolve())
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  event.waitUntil(Promise.resolve())
})
