import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tipsService } from '../services/tipService';
import { Tip } from '../types';

export const useTips = (status?: string) => {
    return useQuery({
        queryKey: ['tips', status],
        queryFn: () => tipsService.getAllTips(status),
    });
};

export const useTip = (id: string) => {
    return useQuery({
        queryKey: ['tip', id],
        queryFn: () => tipsService.getTipById(id),
        enabled: !!id,
    });
};

export const useCreateTip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => tipsService.createTip(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tips'] });
        },
    });
};

export const useUpdateTip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) => tipsService.updateTip(id, formData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tips'] });
            queryClient.invalidateQueries({ queryKey: ['tip', variables.id] });
        },
    });
};

export const useDeleteTip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => tipsService.deleteTip(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tips'] });
        },
    });
};

export const useVoteTip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isHelpful }: { id: string; isHelpful: boolean }) => tipsService.voteTip(id, isHelpful),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tips'] });
            queryClient.invalidateQueries({ queryKey: ['tip', variables.id] });
        },
    });
};
