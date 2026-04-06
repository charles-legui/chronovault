import { gql } from '@apollo/client/core'

export const MY_ALBUMS_QUERY = gql`
  query MyAlbums {
    myAlbums {
      id
      ownerId
      title
      description
      tags
      coverImageUrl
      eventDate
      createdAt
      updatedAt
    }
  }
`

export const ALBUM_QUERY = gql`
  query Album($id: ID!) {
    album(id: $id) {
      id
      ownerId
      title
      description
      tags
      coverImageUrl
      eventDate
      createdAt
      updatedAt
    }
  }
`

export const CREATE_ALBUM_MUTATION = gql`
  mutation CreateAlbum($input: CreateAlbumInput!) {
    createAlbum(input: $input) {
      id
      ownerId
      title
      description
      tags
      coverImageUrl
      eventDate
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_ALBUM_MUTATION = gql`
  mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
    updateAlbum(id: $id, input: $input) {
      id
      ownerId
      title
      description
      tags
      coverImageUrl
      eventDate
      createdAt
      updatedAt
    }
  }
`

export const DELETE_ALBUM_MUTATION = gql`
  mutation DeleteAlbum($id: ID!) {
    deleteAlbum(id: $id) {
      id
      deleted
    }
  }
`
