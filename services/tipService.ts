import { apiClient, getErrorMessage } from './apiClient';
import { Tip, TipResponse } from '../types';

export const tipsService = {
    getAllTips: async (status?: string): Promise<Tip[]> => {
        try {
            const params = status ? { status } : {};
            const response = await apiClient.get<TipResponse>('/tips', { params });
            return response.data.data as Tip[];
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    getTipById: async (id: string): Promise<Tip> => {
        try {
            const response = await apiClient.get<TipResponse>(`/tips/${id}`);
            return response.data.data as Tip;
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    createTip: async (formData: FormData): Promise<Tip> => {
        try {
            const response = await apiClient.post<TipResponse>('/tips', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data as Tip;
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    updateTip: async (id: string, formData: FormData): Promise<Tip> => {
        try {
            const response = await apiClient.put<TipResponse>(`/tips/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data as Tip;
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    deleteTip: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/tips/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    voteTip: async (id: string, isHelpful: boolean): Promise<any> => {
        try {
            const response = await apiClient.post(`/tips/${id}/vote`, { isHelpful });
            return response.data.data;
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }
};
