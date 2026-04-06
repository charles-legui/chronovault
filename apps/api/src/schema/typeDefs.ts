export const typeDefs = /* GraphQL */ `
  scalar DateTime

  type User {
    id: ID!
    email: String!
    displayName: String!
    role: UserRole!
    createdAt: DateTime!
  }

  enum UserRole {
    user
    admin
  }

  input SignUpInput {
    email: String!
    password: String!
    displayName: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input ForgotPasswordInput {
    email: String!
  }

  input ResetPasswordInput {
    token: String!
    newPassword: String!
    confirmPassword: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    health: String!
    me: User!
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
    signOut: Boolean!
    forgotPassword(input: ForgotPasswordInput!): Boolean!
    resetPassword(input: ResetPasswordInput!): Boolean!
  }
`;
