import { apiClient } from './apiClient';

export interface SubscriptionPlan {
    id: string;
    agronomistId: string;
    type: 'HOURLY' | 'ONE_TIME';
    price: number;
    durationHours: number | null;
    title: string;
    description: string | null;
}

export class SubscriptionPlanService {
    static async createPlan(data: Partial<SubscriptionPlan>) {
        const response = await apiClient.post('/subscription-plans', data);
        return response.data;
    }

    static async getMyPlans() {
        const response = await apiClient.get('/subscription-plans/my-plans');
        return response.data;
    }
    
    static async updatePlan(id: string, data: Partial<SubscriptionPlan>) {
        const response = await apiClient.put(`/subscription-plans/${id}`, data);
        return response.data;
    }

    static async deletePlan(id: string) {
        const response = await apiClient.delete(`/subscription-plans/${id}`);
        return response.data;
    }

    static async getAgronomistPlans(agronomistId: string) {
        const response = await apiClient.get(`/subscription-plans/agronomist/${agronomistId}`);
        return response.data;
    }
}
