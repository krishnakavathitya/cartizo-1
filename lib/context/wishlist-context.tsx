'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from './auth-context';

export interface WishlistItem {
  id: string;
  createdAt: string;
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

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (productId: string) => Promise<any>;
  removeFromWishlist: (productId: string) => Promise<any>;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
  loading: boolean;
  isLoaded: boolean;
}

const GET_WISHLIST = gql`
  query GetWishlist {
    wishlist {
      id
      createdAt
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
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
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

const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: ID!) {
    addToWishlist(productId: $productId) {
      id
    }
  }
`;

const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: ID!) {
    removeFromWishlist(productId: $productId)
  }
`;

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'cartizo_guest_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [localWishlist, setLocalWishlist] = useState<WishlistItem[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        try {
          setLocalWishlist(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse wishlist from localStorage', e);
        }
      }
      setIsLocalLoaded(true);
    }
  }, [user]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !user && isLocalLoaded) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localWishlist));
    }
  }, [localWishlist, user, isLocalLoaded]);

  const { data, loading, refetch, client } = useQuery(GET_WISHLIST, {
    skip: !user,
    fetchPolicy: 'network-only',
  });

  const [addMutation] = useMutation(ADD_TO_WISHLIST, {
    refetchQueries: [{ query: GET_WISHLIST }],
    awaitRefetchQueries: true,
  });

  const [removeMutation] = useMutation(REMOVE_FROM_WISHLIST, {
    refetchQueries: [{ query: GET_WISHLIST }],
    awaitRefetchQueries: true,
  });

  // Local wishlist functions
  const addToLocalWishlist = async (productId: string) => {
    if (typeof window === 'undefined') return { success: false };

    try {
      // Check if already in local wishlist
      if (localWishlist.some(item => item.product.id === productId)) {
        return { success: true };
      }

      // Fetch product details to store them locally
      const { data } = await client.query({
        query: GET_PRODUCT,
        variables: { id: productId }
      });

      if (data?.product) {
        const newItem: WishlistItem = {
          id: `guest-${Date.now()}`,
          createdAt: new Date().toISOString(),
          product: data.product
        };
        setLocalWishlist(prev => [...prev, newItem]);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to add to guest wishlist', error);
      return { success: false };
    }
  };

  const removeFromLocalWishlist = async (productId: string) => {
    if (typeof window === 'undefined') return { success: false };
    setLocalWishlist(prev => prev.filter(item => item.product.id !== productId));
    return { success: true };
  };

  // Use local wishlist if not logged in, otherwise use GraphQL
  const items = user ? (data?.wishlist || []) : localWishlist;
  const totalItems = items.length;

  const isInWishlist = (productId: string) => {
    return items.some((item: WishlistItem) => item.product?.id === productId);
  };

  const isLoaded = user ? !loading : isLocalLoaded;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist: user
          ? (productId) => addMutation({ variables: { productId } })
          : addToLocalWishlist,
        removeFromWishlist: user
          ? (productId) => removeMutation({ variables: { productId } })
          : removeFromLocalWishlist,
        isInWishlist,
        totalItems,
        loading: user ? loading : false,
        isLoaded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
