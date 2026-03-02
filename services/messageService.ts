import { apiClient } from './apiClient';

export class MessageService {
    static async getMessages(consultationId: string, page = 1, limit = 50) {
        const response = await apiClient.get(`/messages/${consultationId}`, {
            params: { page, limit }
        });
        return response.data;
    }

    static async markAsRead(consultationId: string) {
        const response = await apiClient.put(`/messages/${consultationId}/read`);
        return response.data;
    }

    static async sendMessageImage(consultationId: string, imageUri: string) {
        // Need to use FormData to upload image
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
            uri: imageUri,
            name: filename,
            type
        } as any);

        const response = await apiClient.post(`/messages/${consultationId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    }
}
