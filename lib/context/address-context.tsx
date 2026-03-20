'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from './auth-context';

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type: 'Home' | 'Work';
  isDefault: boolean;
}

interface AddressContextType {
  addresses: Address[];
  loading: boolean;
  createAddress: (input: any) => Promise<any>;
  updateAddress: (id: string, input: any) => Promise<any>;
  deleteAddress: (id: string) => Promise<any>;
  setDefaultAddress: (id: string) => Promise<any>;
  defaultAddress: Address | null;
}

const GET_ADDRESSES = gql`
  query GetAddresses {
    addresses {
      id
      name
      phone
      street
      city
      state
      postalCode
      country
      type
      isDefault
    }
  }
`;

const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: AddressInput!) {
    createAddress(input: $input) {
      id
      name
      phone
      street
      city
      state
      postalCode
      country
      type
      isDefault
    }
  }
`;

const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($addressId: ID!, $input: AddressInput!) {
    updateAddress(addressId: $addressId, input: $input) {
      id
      name
      phone
      street
      city
      state
      postalCode
      country
      type
      isDefault
    }
  }
`;

const DELETE_ADDRESS = gql`
  mutation DeleteAddress($addressId: ID!) {
    deleteAddress(addressId: $addressId)
  }
`;

const SET_DEFAULT_ADDRESS = gql`
  mutation SetDefaultAddress($addressId: ID!) {
    setDefaultAddress(addressId: $addressId) {
      id
      name
      phone
      street
      city
      state
      postalCode
      country
      type
      isDefault
    }
  }
`;

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data, loading, refetch } = useQuery(GET_ADDRESSES, {
    skip: !user,
  });

  const [createAddressMutation] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => refetch(),
  });

  const [updateAddressMutation] = useMutation(UPDATE_ADDRESS, {
    onCompleted: () => refetch(),
  });

  const [deleteAddressMutation] = useMutation(DELETE_ADDRESS, {
    onCompleted: () => refetch(),
  });

  const [setDefaultAddressMutation] = useMutation(SET_DEFAULT_ADDRESS, {
    onCompleted: () => refetch(),
  });

  const addresses = data?.addresses || [];
  const defaultAddress = addresses.find((a: Address) => a.isDefault) || addresses[0] || null;

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
        createAddress: (input) => createAddressMutation({ variables: { input } }),
        updateAddress: (id, input) => updateAddressMutation({ variables: { addressId: id, input } }),
        deleteAddress: (id) => deleteAddressMutation({ variables: { addressId: id } }),
        setDefaultAddress: (id) => setDefaultAddressMutation({ variables: { addressId: id } }),
        defaultAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddresses must be used within an AddressProvider');
  }
  return context;
}
