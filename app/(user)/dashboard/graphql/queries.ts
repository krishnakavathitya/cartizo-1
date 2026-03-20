import { gql } from '@apollo/client';

export const GET_USER_STATS_DATA = gql`
  query GetUserStatsData {
    orders {
      id
    }
    myReviews {
      id
    }
    wishlist {
      id
    }
  }
`;

export const GET_RECENT_ORDERS = gql`
  query GetRecentOrders {
    orders {
      id
      createdAt
      status
      total
    }
  }
`;

export const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    orders {
      id
      orderNumber
      createdAt
      status
      total
      items {
        id
        quantity
        price
        product {
          title
          images {
            url
          }
        }
      }
    }
  }
`;

export const GET_ADDRESSES = gql`
  query GetAddresses {
    addresses {
      id
      name
      street
      city
      state
      postalCode
      phone
      type
      isDefault
      country
    }
  }
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: AddressInput!) {
    createAddress(input: $input) {
      id
      name
      street
      city
      state
      postalCode
      phone
      isDefault
      country
    }
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($addressId: ID!) {
     deleteAddress(addressId: $addressId)
  }
`;

export const GET_MY_REVIEWS = gql`
  query GetMyReviews {
    myReviews {
      id
      rating
      comment
      createdAt
      product {
        id
        title
        slug
        images {
          url
        }
      }
    }
  }
`;

export const GET_WISHLIST_DETAILS = gql`
  query GetWishlistDetails {
    wishlist {
      id
      productId
      title
      price
      image
      slug
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId)
  }
`;

export const TRACK_ORDER = gql`
  query TrackOrder($orderNumber: String!) {
    trackOrder(orderNumber: $orderNumber) {
      id
      orderNumber
      status
      total
      paymentMethod
      createdAt
      items {
        id
        quantity
        price
        product {
          title
        }
      }
      shippingAddress {
        id
        name
        street
        city
        state
        postalCode
      }
      statusHistory {
        id
        status
        note
        createdAt
      }
    }
  }
`;
