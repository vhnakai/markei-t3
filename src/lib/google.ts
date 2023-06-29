import dayjs from 'dayjs'
import { google } from 'googleapis'
import { clerkClient } from '@clerk/nextjs'
import { env } from '@/env.mjs'

export async function getGoogleOAuthToken(userId: string) {
  const tokens = await clerkClient.users.getUserOauthAccessToken(
    userId,
    'oauth_google',
  )

  const accessToken = tokens.find(
    (token) => token.provider === 'oauth_google' ?? token.token,
  )?.token

  const auth = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
  )

  auth.setCredentials({
    access_token: accessToken || null,
  })

  const session = await clerkClient.sessions.getSession(userId)

  const isTokenExpired = dayjs(session.expireAt * 1000).isBefore(new Date())

  if (isTokenExpired) {
    const { credentials } = await auth.refreshAccessToken()
    const {
      access_token: accessToken,
      expiry_date: expiryDate,
      refresh_token: refreshToken,
    } = credentials

    auth.setCredentials({
      access_token: accessToken,
      expiry_date: expiryDate,
      refresh_token: refreshToken,
    })
  }

  return auth
}
