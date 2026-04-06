import { gql } from '@apollo/client/core'

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user {
        id
        email
        displayName
        role
        createdAt
      }
    }
  }
`

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      token
      user {
        id
        email
        displayName
        role
        createdAt
      }
    }
  }
`

export const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signOut
  }
`

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input)
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      displayName
      role
      createdAt
    }
  }
`
