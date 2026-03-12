import { UserManager } from 'oidc-client-ts'

export type CreateUserManagerParams = {
  authority: string
  clientId: string
  redirectUri: string
  scope: string
}
export function createUserManager({
  authority,
  clientId,
  redirectUri,
  scope,
}: CreateUserManagerParams) {
  return new UserManager({
    authority,

    client_id: clientId,
    redirect_uri: redirectUri,

    // response_type: 'code',
    scope,
    accessTokenExpiringNotificationTimeInSeconds: 30,

    // accessTokenExpiringNotificationTime: 30,

    automaticSilentRenew: true,

    monitorSession: false,
  })
}
