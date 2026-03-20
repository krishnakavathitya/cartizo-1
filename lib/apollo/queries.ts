import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($pagination: PaginationInput, $filters: ProductFilters) {
    products(pagination: $pagination, filters: $filters) {
      items {
        id
        title
        slug
        description
        basePrice
        images {
          url
          altText
          isPrimary
        }
        category {
          name
        }
        brand {
          name
        }
        averageRating
        reviewCount
        discountPercentage
        inStock
        isActive
      }
      total
      page
      pageSize
      hasMore
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    product(slug: $slug) {
      id
      title
      slug
      description
      basePrice
      images {
        url
        altText
        isPrimary
      }
      category {
        name
      }
      brand {
        name
      }
      averageRating
      reviewCount
      discountPercentage
      inStock
      isActive
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      productCount
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!) {
    searchProducts(query: $query) {
      id
      title
      slug
      basePrice
      images {
        url
        altText
      }
      averageRating
      reviewCount
      discountPercentage
      inStock
    }
  }
`;

// Wishlist Queries
export const GET_WISHLIST = gql`
  query GetWishlist {
    wishlist {
      id
      product {
        id
        title
        slug
        basePrice
        images {
          url
          altText
          isPrimary
        }
        brand {
          name
        }
        averageRating
        reviewCount
        discountPercentage
        inStock
        isActive
      }
      createdAt
    }
  }
`;

// Wishlist Mutations
export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: ID!) {
    addToWishlist(productId: $productId) {
      id
      product {
        id
        title
        slug
        basePrice
        images {
          url
          altText
          isPrimary
        }
      }
    }
  }
`;

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: ID!) {
    removeFromWishlist(productId: $productId)
  }
`;

// Cart Queries
export const GET_CART = gql`
  query GetCart {
    cart {
      id
      items {
        id
        quantity
        product {
          id
          title
          slug
          basePrice
          images {
            url
            altText
            isPrimary
          }
          brand {
            name
          }
          averageRating
          reviewCount
          discountPercentage
          inStock
          isActive
        }
      }
      itemCount
      subtotal
      total
    }
  }
`;

// Cart Mutations
export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      items {
        id
        quantity
        product {
          id
          title
          slug
          basePrice
          images {
            url
            altText
            isPrimary
          }
        }
      }
      itemCount
      subtotal
      total
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($itemId: ID!, $quantity: Int!) {
    updateCartItem(itemId: $itemId, quantity: $quantity) {
      id
      items {
        id
        quantity
        product {
          id
          title
          basePrice
        }
      }
      itemCount
      subtotal
      total
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveCartItem($itemId: ID!) {
    removeCartItem(itemId: $itemId) {
      id
      itemCount
      subtotal
      total
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart
  }
`;
