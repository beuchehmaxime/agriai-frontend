import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShopService } from '../services/shopService';
import { Alert } from 'react-native';
import { getErrorMessage } from '../services/apiClient';
import { useNetwork } from '../context/NetworkContext';
import { useUserStore } from '../store/userStore';

export const useCategories = () => {
    const { isConnected } = useNetwork();
    const { token } = useUserStore();

    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            if (!isConnected) throw new Error('OFFLINE');
            const res = await ShopService.getCategories();
            return res.data;
        },
        enabled: isConnected && !!token,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useProducts = (params?: { search?: string, categoryId?: string, disease?: string }) => {
    const { isConnected } = useNetwork();
    const { token } = useUserStore();

    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            if (!isConnected) throw new Error('OFFLINE');
            const res = await ShopService.getProducts(params);
            return res.data;
        },
        enabled: isConnected && !!token,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useOrders = () => {
    const { isConnected } = useNetwork();
    const { token } = useUserStore();

    return useQuery({
        queryKey: ['orders', token],
        queryFn: async () => {
            if (!isConnected) throw new Error('OFFLINE');
            const res = await ShopService.getOrders();
            return res.data;
        },
        enabled: isConnected && !!token,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    const { isConnected } = useNetwork();

    return useMutation({
        mutationFn: async (orderData: { items: { productId: string, quantity: number }[] }) => {
            if (!isConnected) {
                throw new Error('OFFLINE');
            }
            const res = await ShopService.createOrder(orderData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Refetch products as stock likely lowered
        },
        onError: (error) => {
            if (error.message === 'OFFLINE') {
                Alert.alert('Offline', 'You must be connected to the internet to checkout.');
            } else {
                Alert.alert('Checkout Failed', getErrorMessage(error));
            }
        }
    });
};
