import { apiClient } from './apiClient';
import { Diagnosis, DiagnosisResponse } from '../types';

export const DiagnosisService = {
    predict: async (formData: FormData): Promise<DiagnosisResponse> => {
        const response = await apiClient.post<DiagnosisResponse>('/diagnosis/predict', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getHistory: async (): Promise<{ success: boolean; data: Diagnosis[] }> => {
        const response = await apiClient.get<{ success: boolean; data: Diagnosis[] }>('/diagnosis/history');
        return response.data;
    },

    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/diagnosis/${id}`);
        return response.data;
    }
};
