import { apolloClient } from './apolloClient'
import { FORGOT_PASSWORD_MUTATION, RESET_PASSWORD_MUTATION } from '@/graphql/auth'

export async function forgotPassword(email: string): Promise<void> {
  await apolloClient.mutate({
    mutation:  FORGOT_PASSWORD_MUTATION,
    variables: { input: { email } },
  })
}

export async function resetPassword(input: {
  token: string
  newPassword: string
  confirmPassword: string
}): Promise<void> {
  await apolloClient.mutate({
    mutation:  RESET_PASSWORD_MUTATION,
    variables: { input },
  })
}
