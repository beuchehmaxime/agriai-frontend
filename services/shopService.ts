import { apiClient } from './apiClient';
import { Category, Product, Order } from '../types';

export const ShopService = {
    getCategories: async (): Promise<{ success: boolean; data: Category[] }> => {
        const response = await apiClient.get('/categories');
        return response.data;
    },

    getProducts: async (params?: { search?: string, categoryId?: string, disease?: string }): Promise<{ success: boolean; data: Product[] }> => {
        let queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
        if (params?.disease) queryParams.append('disease', params.disease);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await apiClient.get(`/products${queryString}`);
        return response.data;
    },

    getProductById: async (id: string): Promise<{ success: boolean; data: Product }> => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    createOrder: async (data: { items: { productId: string, quantity: number }[] }): Promise<{ success: boolean; data: Order }> => {
        const response = await apiClient.post('/orders', data);
        return response.data;
    },

    getOrders: async (): Promise<{ success: boolean; data: Order[] }> => {
        const response = await apiClient.get('/orders');
        return response.data;
    }
};
