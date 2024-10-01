/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect } from 'react'
import { AppLayout } from '@components/index'
import Page from './Page'
import { initTagManager } from '@utils/helpers'

const TournamentPage: React.FC = () => {
  useEffect(() => {
    // TagManager.initialize(tagManagerArgs)
    initTagManager()
    document.querySelector('title')!.innerText =
      'Influence which football player is traded next'
    document
      .querySelector("meta[name='description']")!
      .setAttribute(
        'content',
        'Vote for the football players that you want to be listed and traded like stocks. You can vote each day',
      )
  }, [])

  return (
    <AppLayout headerClass="home" hasShadow={true}>
      {/* <PlayerListForm /> */}
      <Page />
    </AppLayout>
  )
}

export default TournamentPage
