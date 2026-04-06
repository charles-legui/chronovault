export const typeDefs = /* GraphQL */ `
  scalar DateTime

  # ── Core types ──────────────────────────────────────────────────────────────

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

  # ── Auth payload ─────────────────────────────────────────────────────────────

  type AuthPayload {
    token: String!
    user: User!
  }

  # ── Input types ──────────────────────────────────────────────────────────────

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

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
    confirmPassword: String!
  }

  input UpdateProfileInput {
    displayName: String
    email: String
  }

  # ── Queries ──────────────────────────────────────────────────────────────────

  type Query {
    _health: String!
    me: User!
  }

  # ── Mutations ────────────────────────────────────────────────────────────────

  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
    signOut: Boolean!
    forgotPassword(input: ForgotPasswordInput!): Boolean!
    resetPassword(input: ResetPasswordInput!): Boolean!
    changePassword(input: ChangePasswordInput!): Boolean!
    updateProfile(input: UpdateProfileInput!): User!
  }
`;
