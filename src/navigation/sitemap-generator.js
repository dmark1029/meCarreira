require('babel-register')({
  presets: ['es2015', 'react'],
})

const mainRouter = require('./sitemap-routes').default
const Sitemap = require('react-router-sitemap').default

async function generateSitemap() {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_HOST_URL}/blogs/?category=All`,
    )
    const blogsData = await response.json()

    const joinLabelResponse = await fetch(
      `${process.env.REACT_APP_HOST_URL}/accounts/all_custom_links`,
    )
    const joinLabelData = await response.json()

    const joinLabelList = (joinLabelData.data || []).map(joinLabelItem => {
      return joinLabelItem.label
    })

    const blogList = (blogsData.data.posts || []).map(blogItem => {
      return blogItem.slug
    })

    const usersResponse = await fetch(
      `${process.env.REACT_APP_HOST_URL}/accounts/user-ranking-list/?search=&type=overview&limit=100&offset=0`,
    )
    const usersData = await usersResponse.json()
    const userList = (usersData.results || []).map(userItem => {
      return userItem.username
    })

    const playersApiUrl =
      process.env.REACT_APP_MODE.toString() === 'DEVELOPMENT'
        ? 'https://restapi.mecarreira.com/players/players_all?limit=100'
        : 'https://liveapi.mecarreira.com/players/player_landing/'
    const playersResponse = await fetch(playersApiUrl)
    const playersData = await playersResponse.json()
    const playersList = (playersData.results || []).map(playerItem => {
      return playerItem.detailpageurl
    })

    let idMap = []
    let userIdMap = []
    let playerIdMap = []
    let joinLabelIdMap = []

    for (let i = 0; i < blogList.length; i++) {
      idMap.push({ blog_id: blogList[i] })
    }
    for (let j = 0; j < userList.length; j++) {
      userIdMap.push({ user_name: userList[j] })
    }

    for (let k = 0; k < playersList.length; k++) {
      playerIdMap.push({ player_id: playersList[k] })
    }

    for (let i = 0; i < joinLabelList.length; i++) {
      joinLabelIdMap.push({ label_id: joinLabelList[i] })
    }

    const paramsConfig = {
      '/blog/:blog_id': idMap,
      '/app/user/:user_name': userIdMap,
      '/app/player/:player_id': playerIdMap,
      '/join/:label_id': joinLabelIdMap,
    }

    return new Sitemap(mainRouter)
      .applyParams(paramsConfig)
      .build(`${process.env.REACT_APP_LANDING_URL}`)
      .save('./public/sitemap.xml')
  } catch (e) {
    console.log('blogSitemap', e)
  }
}

generateSitemap()
