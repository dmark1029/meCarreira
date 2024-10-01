import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Route } from 'react-router'

export default (
  <Route>
    <Route path="/genesis" />
    <Route path="/app" />
    <Route path="/app/player/:player_id" />
    <Route path="/app/tutorials" />
    <Route path="/app/all-players" />
    <Route path="/app/how-it-works" />
    <Route path="/app/kiosk" />
    <Route path="/app/scouts" />
    <Route path="/app/launch-your-coin" />
    <Route path="/app/user/:user_name" />
    <Route path="/app/all-users" />
    <Route path="/blog" />
    <Route path="/blog/:blog_id" />
    <Route path="/faqs" />
    <Route path="/terms-conditions" />
    <Route path="/privacy-policy" />
    <Route path="/cookie-policy" />
    <Route path="/disclaimer" />
    <Route path="/careers" />
    <Route path="/contact-us" />
  </Route>
)