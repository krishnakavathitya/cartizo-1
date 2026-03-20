'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from './auth-context';

export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    basePrice: number;
    discountPercentage: number;
    images: { url: string; altText: string; isPrimary: boolean }[];
    brand: { id: string; name: string };
    averageRating: number;
    reviewCount: number;
    inStock: boolean;
    slug: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<any>;
  removeFromCart: (itemId: string) => Promise<any>;
  updateQuantity: (itemId: string, quantity: number) => Promise<any>;
  clearCart: () => Promise<any>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  isLoaded: boolean;
}

const GET_CART = gql`
  query GetCart {
    cart {
      id
      items {
        id
        quantity
        product {
          id
          title
          basePrice
          discountPercentage
          images {
            url
            altText
            isPrimary
          }
          brand {
            id
            name
          }
          averageRating
          reviewCount
          inStock
          slug
        }
      }
      subtotal
      total
      itemCount
    }
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    product(slug: $slug) {
      id
      title
      basePrice
      discountPercentage
      images {
        url
        altText
        isPrimary
      }
      brand {
        id
        name
      }
      averageRating
      reviewCount
      inStock
      slug
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      itemCount
    }
  }
`;

const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($itemId: ID!, $quantity: Int!) {
    updateCartItem(itemId: $itemId, quantity: $quantity) {
      id
      itemCount
    }
  }
`;

const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($itemId: ID!) {
    removeCartItem(itemId: $itemId) {
      id
      itemCount
    }
  }
`;

const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart
  }
`;

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cartizo_guest_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        try {
          setLocalCart(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e);
        }
      }
      setIsLocalLoaded(true);
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !user && isLocalLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
    }
  }, [localCart, user, isLocalLoaded]);

  const { data, loading, refetch, client } = useQuery(GET_CART, {
    skip: !user,
    fetchPolicy: 'network-only',
  });

  const [addMutation] = useMutation(ADD_TO_CART, {
    onCompleted: () => refetch(),
  });

  const [updateMutation] = useMutation(UPDATE_CART_ITEM, {
    onCompleted: () => refetch(),
  });

  const [removeMutation] = useMutation(REMOVE_CART_ITEM, {
    onCompleted: () => refetch(),
  });

  const [clearMutation] = useMutation(CLEAR_CART, {
    onCompleted: async () => {
      await refetch();
      // Force a cache update
      if (client) {
        client.cache.evict({ fieldName: 'cart' });
        client.cache.gc();
      }
    },
  });

  // Local cart functions
  const addToLocalCart = async (productId: string, quantity: number = 1) => {
    // Redirect to login instead of adding to local cart
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
    return { success: false };
  };

  const updateLocalQuantity = async (itemId: string, quantity: number) => {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
    return { success: false };
  };

  const removeFromLocalCart = async (itemId: string) => {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
    return { success: false };
  };

  const clearLocalCart = async () => {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
    return { success: false };
  };

  // Use local cart if not logged in, otherwise use GraphQL
  const items = user ? (data?.cart?.items || []) : localCart;
  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum: number, item: CartItem) => {
    const price = item.product.basePrice * (1 - (item.product.discountPercentage || 0) / 100);
    return sum + price * item.quantity;
  }, 0);

  const isLoaded = user ? !loading : isLocalLoaded;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart: user
          ? (productId, quantity = 1) => addMutation({ variables: { input: { productId, quantity } } })
          : addToLocalCart,
        updateQuantity: user
          ? (itemId, quantity) => updateMutation({ variables: { itemId, quantity } })
          : updateLocalQuantity,
        removeFromCart: user ? (itemId) => removeMutation({ variables: { itemId } }) : removeFromLocalCart,
        clearCart: user ? () => clearMutation() : clearLocalCart,
        totalItems,
        totalPrice,
        loading: user ? loading : false,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
