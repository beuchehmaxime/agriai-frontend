import { apiClient } from './apiClient';

export class TransactionService {
    static async getWallet() {
        const response = await apiClient.get('/transactions/wallet');
        return response.data;
    }

    static async withdraw(amount: number, provider: 'MTN_MOMO' | 'ORANGE_MOMO', phoneNumber: string) {
        const response = await apiClient.post('/transactions/withdraw', { amount, provider, phoneNumber });
        return response.data;
    }
    
    // Use for mock payment when a farmer purchases a subscription
    static async mockPayment(amount: number, provider: 'MTN_MOMO' | 'ORANGE_MOMO', phoneNumber: string) {
        // Here we just mock a delay to simulate loading
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, transactionId: 'MOCK_' + Math.random().toString(36).substr(2, 9) }), 1500);
        });
    }
}
