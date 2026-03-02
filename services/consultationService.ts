import { apiClient } from './apiClient';

export class ConsultationService {
    static async getAgronomists() {
        const response = await apiClient.get('/consultations/agronomists');
        return response.data;
    }

    static async getMyConsultations() {
        const response = await apiClient.get('/consultations');
        return response.data;
    }

    static async createConsultation(agronomistId: string) {
        const response = await apiClient.post('/consultations', { agronomistId });
        return response.data;
    }
}
