import type { User } from '@clerk/nextjs/api'
export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    externalUsername:
      user.externalAccounts.find(
        (externalAccount) => externalAccount.provider === 'oauth_google',
      )?.username || null,
    firstName: user.firstName,
    lastName: user.lastName,
  }
}
