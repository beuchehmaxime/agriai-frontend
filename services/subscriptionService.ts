import { apiClient } from './apiClient';

export class SubscriptionService {
    static async purchaseSubscription(planId: string, quantity: number | undefined, phoneNumber: string, provider: string) {
        const response = await apiClient.post('/subscriptions', { planId, quantity: quantity || 1, phoneNumber, provider });
        return response.data;
    }

    static async getMySubscriptions() {
        const response = await apiClient.get('/subscriptions/my-subscriptions');
        return response.data;
    }

    static async getSubscribersList() {
        const response = await apiClient.get('/subscriptions/subscribers');
        return response.data;
    }

    static async deductHours(subscriptionId: string, hours: number) {
        const response = await apiClient.post(`/subscriptions/${subscriptionId}/deduct-hours`, { hours });
        return response.data;
    }
}
