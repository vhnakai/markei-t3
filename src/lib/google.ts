import dayjs from 'dayjs'
import { google } from 'googleapis'
import { clerkClient } from '@clerk/nextjs/server'
import { env } from '@/env.mjs'
import { TRPCError } from '@trpc/server'

export async function getGoogleOAuthToken(userId: string) {
  const tokens = await clerkClient.users.getUserOauthAccessToken(
    userId,
    'oauth_google',
  )

  const { externalAccounts } = await clerkClient.users.getUser(userId)

  const filteredAccont = externalAccounts.filter(
    (acc) => acc.provider === 'oauth_google' ?? acc,
  )

  const verification = filteredAccont.find(
    (acc) =>
      (acc.provider === 'oauth_google' &&
        acc.approvedScopes === 'https://www.googleapis.com/auth/calendar') ??
      acc,
  )?.verification

  const filteredToken = tokens.filter(
    (token) => token.provider === 'oauth_google' ?? token.token,
  )

  const accessToken = filteredToken.find(
    (token) => token.provider === 'oauth_google' ?? token.token,
  )

  if (!accessToken) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Token no provided.',
    })
  }

  const auth = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID ?? '',
    env.GOOGLE_CLIENT_SECRET ?? '',
  )

  auth.setCredentials({
    access_token: accessToken.token,
    expiry_date: verification?.expireAt,
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
