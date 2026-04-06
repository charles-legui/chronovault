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

  type Album {
    id: ID!
    ownerId: ID!
    title: String!
    description: String
    tags: [String!]!
    coverImageUrl: String
    eventDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateAlbumInput {
    title: String!
    description: String
    tags: [String!]
    coverImageUrl: String
    eventDate: DateTime
  }

  input UpdateAlbumInput {
    title: String
    description: String
    tags: [String!]
    coverImageUrl: String
    eventDate: DateTime
  }

  type DeleteAlbumPayload {
    id: ID!
    deleted: Boolean!
  }

  type Query {
    health: String!
    me: User!
    myAlbums: [Album!]!
    album(id: ID!): Album
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
    signOut: Boolean!
    forgotPassword(input: ForgotPasswordInput!): Boolean!
    resetPassword(input: ResetPasswordInput!): Boolean!
    createAlbum(input: CreateAlbumInput!): Album!
    updateAlbum(id: ID!, input: UpdateAlbumInput!): Album!
    deleteAlbum(id: ID!): DeleteAlbumPayload!
  }
`;
