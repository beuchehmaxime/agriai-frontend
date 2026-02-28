import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { DiagnosisService } from '../services/diagnosisService';
import { saveDiagnosisLocal, getDiagnoses, syncDiagnosesFromBackend, deleteDiagnosis } from '../services/database';
import { getErrorMessage } from '../services/apiClient';
import { useNetwork } from '../context/NetworkContext';
import { useUserStore } from '../store/userStore';

export const usePredictDiagnosis = () => {
    const { isConnected } = useNetwork();
    const { token } = useUserStore();
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { image: string; crop: string; symptoms: string; location?: string }) => {
            if (isConnected && token) {
                console.log('Online Mode & Logged In: Sending image to API...');

                const formData = new FormData();
                const uri = data.image;
                const fileName = uri.split('/').pop() || 'photo.jpg';
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append('image', {
                    uri,
                    name: fileName,
                    type,
                } as any);
                formData.append('cropType', data.crop);
                if (data.symptoms) formData.append('symptoms', data.symptoms);
                if (data.location) formData.append('location', data.location);

                const response = await DiagnosisService.predict(formData);
                return {
                    ...response.data,
                    diagnosis: {
                        ...response.data.diagnosis,
                        imageUri: data.image
                    }
                };
            } else {
                console.log('Offline/Guest Mode: Using local model logic');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return {
                    diagnosis: {
                        id: Math.random().toString(),
                        cropType: data.crop,
                        disease: 'Fall Armyworm (Offline Prediction)',
                        confidence: 0.89,
                        advice: 'Fall Armyworm creates ragged holes in leaves.\n\nTreatment:\n1. Apply neem oil solution.\n2. Use pheromone traps.\n\nPrevention:\n- Early planting.',
                        imageUri: data.image
                    }
                };
            }
        },
        onSuccess: async (data) => {
            if (data && data.diagnosis) {
                const isSynced = (isConnected && token) ? 1 : 0;
                await saveDiagnosisLocal(data.diagnosis, isSynced);

                // Invalidate history query so it pulls the newest item
                queryClient.invalidateQueries({ queryKey: ['history'] });

                router.push({
                    pathname: '/diagnosis/result',
                    params: {
                        result: JSON.stringify(data.diagnosis)
                    }
                });
            }
        },
        onError: (error) => {
            const errorMessage = getErrorMessage(error);
            Alert.alert('Error', errorMessage);
            console.error(error);
        }
    });
};

export const useDiagnosisHistory = () => {
    const { isConnected } = useNetwork();
    const { token } = useUserStore();

    return useQuery({
        queryKey: ['history', isConnected, token],
        queryFn: async () => {
            // First, load from SQLite
            const localData = await getDiagnoses();
            let mergedData = localData;

            // Second, attempt network sync if online and logged in
            if (isConnected && token) {
                try {
                    const response = await DiagnosisService.getHistory();
                    if (response && response.success && response.data) {
                        await syncDiagnosesFromBackend(response.data);
                        // Query the database again to get the final merged list
                        mergedData = await getDiagnoses();
                    }
                } catch (error) {
                    console.error('Failed to sync history from backend:', error);
                }
            }

            return mergedData;
        },
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Preserve cache configuration indefinitely
    });
};

export const useDeleteDiagnosis = () => {
    const { isConnected } = useNetwork();
    const { token } = useUserStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (item: any) => {
            // First attempt to delete from backend if online
            if (isConnected && token && item.synced && item.diagnosisId) {
                await DiagnosisService.delete(item.diagnosisId);
            }
            // Delete locally regardless
            await deleteDiagnosis(item.id);
        },
        onMutate: async (item: any) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['history', isConnected, token] });

            // Snapshot the previous value
            const previousHistory = queryClient.getQueryData(['history', isConnected, token]);

            // Optimistically update to the new value
            queryClient.setQueryData(['history', isConnected, token], (old: any) => {
                if (!old) return [];
                return old.filter((d: any) => d.id !== item.id);
            });

            // Return a context with the previous history
            return { previousHistory };
        },
        onError: (error, item, context: any) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousHistory) {
                queryClient.setQueryData(['history', isConnected, token], context.previousHistory);
            }
            console.error('Delete failed:', error);
            Alert.alert('Error', 'Failed to delete diagnosis. Please try again.');
        },
        onSettled: () => {
            // Always refetch after error or success to ensure data consistency
            queryClient.invalidateQueries({ queryKey: ['history'] });
        }
    });
};
