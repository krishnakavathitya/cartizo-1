'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from './auth-context';

export interface LocalOrderItem {
  id: string;
  product: {
    id: string;
    title: string;
    slug: string;
    images: { url: string; altText: string; isPrimary: boolean }[];
  };
  image?: string;
  slug?: string;
  price: number;
  quantity: number;
}

export interface LocalOrder {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: LocalOrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    id: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  statusHistory: {
    id: string;
    status: string;
    createdAt: string;
    note?: string;
  }[];
  createdAt: string;
}

interface OrdersContextType {
  orders: LocalOrder[];
  placeOrder: (input: { addressId: string; paymentMethod: string }) => Promise<any>;
  initiateRazorpayPayment: (addressId: string) => Promise<any>;
  verifyAndCreateOrder: (input: {
    addressId: string;
    paymentMethod: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => Promise<any>;
  totalOrders: number;
  loading: boolean;
  isLoaded: boolean;
}

const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      orderNumber
      status
      subtotal
      total
      paymentMethod
      createdAt
      shippingAddress {
        id
        name
        phone
        street
        city
        state
        postalCode
        country
      }
      statusHistory {
        id
        status
        createdAt
        note
      }
      payment {
        id
        userName
        email
        razorpayOrderId
        razorpayPaymentId
        amount
        currency
        method
        status
        createdAt
      }
      items {
        id
        product {
          id
          title
          slug
          images {
            url
            altText
            isPrimary
          }
        }
        price
        quantity
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
    }
  }
`;

const INITIATE_RAZORPAY_PAYMENT = gql`
  mutation InitiateRazorpayPayment($addressId: ID!) {
    initiateRazorpayPayment(addressId: $addressId) {
      id
      amount
      currency
    }
  }
`;

const VERIFY_AND_CREATE_ORDER = gql`
  mutation VerifyAndCreateOrder(
    $addressId: ID!
    $paymentMethod: PaymentMethod!
    $razorpayOrderId: String!
    $razorpayPaymentId: String!
    $razorpaySignature: String!
  ) {
    verifyAndCreateOrder(
      addressId: $addressId
      paymentMethod: $paymentMethod
      razorpayOrderId: $razorpayOrderId
      razorpayPaymentId: $razorpayPaymentId
      razorpaySignature: $razorpaySignature
    ) {
      id
      orderNumber
      status
    }
  }
`;

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data, loading, refetch } = useQuery(GET_ORDERS, {
    skip: !user,
  });

  const [createOrderMutation] = useMutation(CREATE_ORDER, {
    onCompleted: () => refetch(),
  });

  const [initiateRazorpayPaymentMutation] = useMutation(INITIATE_RAZORPAY_PAYMENT);

  const [verifyAndCreateOrderMutation] = useMutation(VERIFY_AND_CREATE_ORDER, {
    onCompleted: () => refetch(),
  });

  const orders = data?.orders || [];
  const totalOrders = orders.length;

  return (
    <OrdersContext.Provider
      value={{
        orders,
        placeOrder: (input) => createOrderMutation({ variables: { input } }),
        initiateRazorpayPayment: (addressId) => initiateRazorpayPaymentMutation({ variables: { addressId } }),
        verifyAndCreateOrder: (input) => verifyAndCreateOrderMutation({ variables: input }),
        totalOrders,
        loading,
        isLoaded: !loading,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
