'use client';

import { useQuery, useMutation } from '@apollo/client';
import {
    GET_USER_STATS_DATA,
    GET_RECENT_ORDERS,
    GET_ALL_ORDERS,
    GET_ADDRESSES,
    CREATE_ADDRESS,
    DELETE_ADDRESS
} from './queries';

export function useUserStats() {
    const { data, loading, error } = useQuery(GET_USER_STATS_DATA);

    if (error) console.error('Dashboard Stats Error:', error);

    return {
        stats: {
            totalOrders: data?.orders?.length || 0,
            totalReviews: data?.myReviews?.length || 0,
            wishlistCount: data?.wishlist?.length || 0,
        },
        loading,
        error,
    };
}

export function useRecentOrders() {
    const { data, loading, error } = useQuery(GET_RECENT_ORDERS);

    // Sort by date descending and take top 5
    const recentOrders = data?.orders
        ? [...data.orders]
            .sort((a: any, b: any) => new Date(Number(b.createdAt)).getTime() - new Date(Number(a.createdAt)).getTime())
            .slice(0, 5)
        : [];

    return {
        orders: recentOrders,
        loading,
        error,
    };
}

export function useOrders() {
    const { data, loading, error } = useQuery(GET_ALL_ORDERS);

    const orders = data?.orders
        ? [...data.orders].sort((a: any, b: any) => new Date(Number(b.createdAt)).getTime() - new Date(Number(a.createdAt)).getTime())
        : [];

    return {
        orders,
        loading,
        error
    };
}

export function useAddresses() {
    const { data, loading, error, refetch } = useQuery(GET_ADDRESSES);
    const [createAddressMutation] = useMutation(CREATE_ADDRESS);
    const [deleteAddressMutation] = useMutation(DELETE_ADDRESS);

    const createAddress = async (input: any) => {
        await createAddressMutation({ variables: { input } });
        await refetch();
    };

    const deleteAddress = async (id: string) => {
        await deleteAddressMutation({ variables: { addressId: id } });
        await refetch();
    };

    return {
        addresses: data?.addresses || [],
        loading,
        error,
        createAddress,
        deleteAddress
    };
}
