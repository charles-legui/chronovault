import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, concat } from '@apollo/client/core'

const TOKEN_KEY = 'chronovault_token'

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    operation.setContext({ headers: { Authorization: `Bearer ${token}` } })
  }
  return forward(operation)
})

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql',
})

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
})
