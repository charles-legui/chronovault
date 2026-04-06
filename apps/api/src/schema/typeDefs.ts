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

  type Query {
    health: String!
    me: User!
  }

  type Mutation {
    _placeholder: Boolean
  }
`;
