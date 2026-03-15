import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/Button';
import { SubscriptionPlanService, SubscriptionPlan } from '../../../services/subscriptionPlanService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../../../store/userStore';
import { useRouter } from 'expo-router';
import { Trash } from 'lucide-react-native';

export default function PlannerScreen() {
    const queryClient = useQueryClient();
    const { userType } = useUserStore();
    const router = useRouter();

    useEffect(() => {
        if (userType !== 'Agronomist') {
            Alert.alert('Unauthorized', 'Only agronomists can access this page.');
            router.replace('/(tabs)/profile');
        }
    }, [userType]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'HOURLY' | 'ONE_TIME'>('HOURLY');
    const [price, setPrice] = useState('');
    const [durationHours, setDurationHours] = useState('');

    const { data: plans, isLoading } = useQuery({
        queryKey: ['my-plans'],
        queryFn: () => SubscriptionPlanService.getMyPlans(),
    });

    const createPlanMutation = useMutation({
        mutationFn: (data: Partial<SubscriptionPlan>) => SubscriptionPlanService.createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-plans'] });
            Alert.alert('Success', 'Plan created successfully');
            setTitle('');
            setDescription('');
            setPrice('');
            setDurationHours('');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.message || 'Failed to create plan');
        }
    });

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Plan',
            'Are you sure you want to delete this plan?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        // Optimistically update the cache to remove the item immediately
                        queryClient.setQueryData(['my-plans'], (oldData: any) => {
                            if (!oldData) return oldData;
                            const plansArray = Array.isArray(oldData.data) ? oldData.data : (Array.isArray(oldData) ? oldData : []);
                            const newData = plansArray.filter((plan: SubscriptionPlan) => plan.id !== id);
                            return Array.isArray(oldData.data) ? { ...oldData, data: newData } : newData;
                        });

                        try {
                            await SubscriptionPlanService.deletePlan(id);
                            queryClient.invalidateQueries({ queryKey: ['my-plans'] });
                        } catch (error: any) {
                            // If it fails, revert the cache by refetching from the server
                            queryClient.invalidateQueries({ queryKey: ['my-plans'] });
                            Alert.alert('Error', error.message || 'Failed to delete plan');
                        }
                    }
                }
            ]
        );
    };

    const handleCreate = () => {
        if (!title || !price || (type === 'HOURLY' && !durationHours)) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        createPlanMutation.mutate({
            title,
            description,
            type,
            price: parseFloat(price),
            durationHours: type === 'HOURLY' ? parseInt(durationHours, 10) : null
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="p-4">
                <Text className="text-2xl font-bold text-gray-900 mb-4">Create Plan</Text>
                
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Title</Text>
                    <TextInput 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" 
                        value={title} onChangeText={setTitle} placeholder="e.g. Bronze Hourly" 
                        placeholderTextColor="#00000066"
                        />
                </View>
                
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Description</Text>
                    <TextInput 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" 
                        value={description} onChangeText={setDescription} placeholder="Description..." 
                        placeholderTextColor="#00000066"
                        multiline />
                </View>

                <View className="flex-row gap-4 mb-4">
                    <Button 
                        title="HOURLY" 
                        variant={type === 'HOURLY' ? 'primary' : 'yellow'} 
                        onPress={() => setType('HOURLY')} 
                        className="flex-1" 
                    />
                    <Button 
                        title="ONE_TIME" 
                        variant={type === 'ONE_TIME' ? 'primary' : 'yellow'} 
                        onPress={() => setType('ONE_TIME')} 
                        className="flex-1" 
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Price (XAF)</Text>
                    <TextInput 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" 
                        value={price} onChangeText={setPrice} placeholder="e.g. 5000" 
                        placeholderTextColor="#00000066"
                        keyboardType="numeric" />
                </View>

                {type === 'HOURLY' && (
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Duration (Hours)</Text>
                        <TextInput 
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" 
                            value={durationHours} onChangeText={setDurationHours} placeholder="e.g. 1" 
                            placeholderTextColor="#000000"
                            keyboardType="numeric" />
                    </View>
                )}

                <Button 
                    title={createPlanMutation.isPending ? "Creating..." : "Create Plan"} 
                    onPress={handleCreate} 
                    disabled={createPlanMutation.isPending} 
                    className="mb-8"
                />

                <View className="mb-5">
                    <Text className="text-xl font-bold text-gray-900 mb-4">My Plans</Text>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#4ADE80" />
                ) : (
                    (Array.isArray(plans?.data) ? plans.data : (Array.isArray(plans) ? plans : []))?.map((plan: SubscriptionPlan) => (
                        <View key={plan.id} className="p-4 bg-gray-50 rounded-xl mb-3 border border-gray-200 flex-row justify-between items-center">
                            <View>
                            <Text className="font-bold text-lg">{plan.title}</Text>
                            <Text className="text-gray-600">{plan.description}</Text>
                            <Text className="text-primary font-bold mt-2">
                                {plan.type === 'HOURLY' ? `${plan.durationHours} Hours` : 'Unlimited'} - {plan.price} XAF
                            </Text>
                            </View>
                           <TouchableOpacity onPress={() => handleDelete(plan.id)}>
                            <Trash size={25} color="red" />
                           </TouchableOpacity>
                        </View>
                    ))
                )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
