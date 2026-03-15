import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, CheckCircle2 } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionPlanService, SubscriptionPlan } from '../../../services/subscriptionPlanService';
import Button from '../../../components/Button';
import { useUserStore } from '../../../store/userStore';

export default function AgronomistProfileScreen() {
    const { userType } = useUserStore();
    const { id, name } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    React.useEffect(() => {
        if (userType !== 'Farmer') {
            router.replace('/(tabs)/consult');
        }
    }, [userType]);

    const { data: plans, isLoading } = useQuery({
        queryKey: ['agronomist-plans', id],
        queryFn: () => SubscriptionPlanService.getAgronomistPlans(id as string),
    });

    const handleSubscribe = (plan: SubscriptionPlan) => {
        router.push({
            pathname: '/consult/payment',
            params: {
                agronomistId: id as string,
                planId: plan.id,
                amount: plan.price.toString(),
                planType: plan.type,
                title: plan.title,
                durationHours: plan.durationHours ? plan.durationHours.toString() : '0'
            }
        });
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft color="#1F2937" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Agronomist Profile</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="items-center mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <User color="#9CA3AF" size={48} />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">{name || 'Expert Agronomist'}</Text>
                    <View className="mt-2 bg-green-100 px-4 py-1 rounded-full flex-row items-center">
                        <CheckCircle2 color="#4ADE80" size={16} className="mr-1" />
                        <Text className="text-primary font-bold text-xs uppercase tracking-wider">
                            Verified Expert
                        </Text>
                    </View>
                </View>

                <Text className="text-xl font-bold text-gray-900 mb-4 px-1">Available Plans</Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#4ADE80" className="mt-8" />
                ) : (() => {
                    const plansList = Array.isArray(plans?.data) ? plans.data : (Array.isArray(plans) ? plans : []);
                    if (plansList.length > 0) {
                        return plansList.map((plan: SubscriptionPlan) => (
                            <View key={plan.id} className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-lg font-bold text-gray-900 flex-1 pr-2">{plan.title}</Text>
                                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                                        <Text className="text-primary font-bold">{plan.price} XAF</Text>
                                    </View>
                                </View>
                                {plan.description && (
                                    <Text className="text-gray-600 mb-4 leading-relaxed">{plan.description}</Text>
                                )}
                                <View className="flex-row items-center mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <Text className="text-gray-700 font-medium">
                                        {plan.type === 'ONE_TIME' 
                                            ? '✨ Unlimited Access' 
                                            : `⏱️ ${plan.durationHours} Hours Access`}
                                    </Text>
                                </View>
                                <Button 
                                    title="Subscribe" 
                                    onPress={() => handleSubscribe(plan)} 
                                    className="w-full"
                                />
                            </View>
                        ));
                    }
                    return (
                        <View className="bg-white p-8 rounded-2xl items-center border border-gray-100">
                            <Text className="text-gray-500 text-center text-lg">
                                This agronomist has not set up any subscription plans yet.
                            </Text>
                        </View>
                    );
                })()}
            </ScrollView>
        </View>
    );
}
