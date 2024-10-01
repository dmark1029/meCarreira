import purchases from '@root/apis/purchase/purchaseSlice'
import authentication from '@root/apis/onboarding/authenticationSlice'
import wallet from '@root/apis/wallet/walletSlice'
import playercoins from '@root/apis/playerCoins/playerCoinsSlice'
import playerstats from '@root/apis/playerStats/playerStatsSlice'
import careers from '@root/apis/careers/careersSlice'
import notification from '@root/apis/notification/notificationSlice'
import nftnavigation from '@root/apis/commonSlice'
import gallery from '@root/apis/gallery/gallerySlice'
import blog from '@root/apis/blog/blogSlice'
import playerVoting from '@root/apis/playerVoting/playerVotingSlice'
import tournament from '@root/apis/tournament/tournamentSlice'

export const rootReducer = {
  authentication,
  playercoins,
  playerstats,
  purchases,
  wallet,
  careers,
  notification,
  nftnavigation,
  gallery,
  blog,
  playerVoting,
  tournament,
}

export type RootState = ReturnType<typeof rootReducer>
