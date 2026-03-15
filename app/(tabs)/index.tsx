import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useCartStore } from '../../store/useCartStore';
import { Bell, CloudSun, BookOpen, ChevronRight, Sprout, User2, MapPin, UserRoundPen, ShoppingBag, PackageOpen, MessageSquare, Calculator, Stethoscope, TrendingUp, Droplets, Bug, AlertTriangle, CloudRain, Sun, Leaf, ArrowRight, Award, Wallet, Users } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { DiagnosisLocal, QuickAccessItemProps } from '../../types';
import { useDiagnosisHistory } from '../../hooks/useDiagnosis';
import { useWeather } from '../../hooks/useWeather';

export default function HomeScreen() {
    const { phoneNumber, userType, name } = useUserStore();
    const router = useRouter();
    const { data: diagnoses, refetch } = useDiagnosisHistory();
    const { data: weatherData, isLoading: isLoadingWeather } = useWeather(); // Added from new code

    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [refetch])
    );

    const recentDiagnoses = diagnoses ? diagnoses.slice(0, 3) : [];
    const cartItemsCount = useCartStore((state) => state.getTotalItems());

    const QuickAccessItem = ({ icon: Icon, label, color, onPress }: QuickAccessItemProps) => (
        <TouchableOpacity onPress={onPress} className="items-center bg-white p-4 rounded-2xl shadow-sm w-[30%] mb-4">
            <View className={`p-3 rounded-full ${color} mb-2`}>
                <Icon color="white" size={24} />
            </View>
            <Text className="text-xs font-semibold text-gray-700 text-center">{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 p-4">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <View className="p-2 bg-green-100 rounded-xl mr-3">
                            <Sprout color="#4ADE80" size={24} fill="#4ADE80" fillOpacity={0.2} />
                        </View>
                        <Text className="text-2xl font-black text-gray-900 tracking-tight">AGRI<Text className="text-primary">AI</Text></Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            onPress={() => router.push('/notifications')}
                            className="p-2 bg-white rounded-full shadow-sm"
                        >
                            <Bell color="#374151" size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/shop/cart')}
                            className="p-2 bg-white rounded-full shadow-sm relative"
                        >
                            <ShoppingBag color="#374151" size={24} />
                            {cartItemsCount > 0 && (
                                <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center border-2 border-white z-10">
                                    <Text className="text-white text-[10px] font-bold">{cartItemsCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* User Card */}
                <View className="bg-primary rounded-3xl p-6 mb-8 shadow-lg shadow-green-200">
                    <View className='flex-row justify-between items-center mb-4'>
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-white/80 rounded-full items-center justify-center mr-4">
                                <User2 color="#4ADE80" size={24} fill="#4ADE80" fillOpacity={0.2} />
                            </View>
                            <View>
                                <Text className="text-white text-lg font-bold">
                                    {name}
                                </Text>
                                <Text className="text-white/80 text-sm font-medium">
                                    {userType === 'Agronomist' ? 'Expert Agronomist' : 'Verified Farmer'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/profile')}>
                            <UserRoundPen color="white" size={24} />
                        </TouchableOpacity>
                    </View>
                    {/* mini Weather widget on Home Page linked to actual weather module */}
                    <TouchableOpacity
                        onPress={() => router.push('/weather')}
                        className="bg-white/10 p-4 rounded-2xl flex-row items-center justify-between border border-white/20"
                    >
                        <View className="flex-row items-center">
                            {isLoadingWeather ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : weatherData ? (
                                weatherData.current.condition.toLowerCase().includes('rain') ? (
                                    <CloudRain color="white" size={32} />
                                ) : weatherData.current.condition.toLowerCase().includes('sunny') || weatherData.current.condition.toLowerCase().includes('clear') ? (
                                    <Sun color="white" size={32} />
                                ) : (
                                    <CloudSun color="white" size={32} />
                                )
                            ) : (
                                <CloudSun color="white" size={32} />
                            )}
                            <View className="ml-3">
                                <Text className="text-white font-medium text-sm">
                                    {isLoadingWeather ? 'Loading location...' : weatherData ? weatherData.location : 'Tap to set location'}
                                </Text>
                                <Text className="text-white/80 text-xs mt-0.5">
                                    {isLoadingWeather ? 'Fetching forecast...' : weatherData ? `${weatherData.current.temp}°C, ${weatherData.current.condition}` : 'Location required'}
                                </Text>
                            </View>
                        </View>
                        {!isLoadingWeather && weatherData && (
                            <View className="items-end">
                                <Text className="text-white font-bold text-xl">{weatherData.current.temp}°C</Text>
                                <Text className="text-white/80 text-[10px]">Tap for 5-day</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Access Grid */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-4">Quick Access</Text>
                    <View className="flex-row flex-wrap justify-evenly gap-2 items-center">
                        {userType === 'Agronomist' ? (
                            <>
                                <QuickAccessItem
                                    icon={MessageSquare}
                                    label="Consultation"
                                    color="bg-teal-500"
                                    onPress={() => router.push('/consult')}
                                />
                                <QuickAccessItem
                                    icon={Award}
                                    label="Subscriptions"
                                    color="bg-blue-500"
                                    onPress={() => router.push('/profile/agronomist/planner' as any)}
                                />
                                <QuickAccessItem
                                    icon={Users}
                                    label="Subscribers"
                                    color="bg-indigo-500"
                                    onPress={() => router.push('/profile/agronomist/subscribers' as any)}
                                />
                                <QuickAccessItem
                                    icon={Wallet}
                                    label="Wallet"
                                    color="bg-orange-600"
                                    onPress={() => router.push('/profile/agronomist/wallet' as any)}
                                />
                                  <QuickAccessItem
                                    icon={PackageOpen}
                                    label="Orders"
                                    color="bg-orange-300"
                                    onPress={() => router.push('/shop/orders')}
                                />
                                <QuickAccessItem
                                    icon={BookOpen}
                                    label="Tips"
                                    color="bg-green-500"
                                    onPress={() => router.push('/tips')}
                                />
                            </>
                        ) : (
                            <>
                                <QuickAccessItem
                                    icon={MessageSquare}
                                    label="Consult"
                                    color="bg-teal-500"
                                    onPress={() => router.push('/consult')}
                                />
                                <QuickAccessItem
                                    icon={CloudSun}
                                    label="Weather"
                                    color="bg-blue-400"
                                    onPress={() => router.push('/weather')}
                                />
                                <QuickAccessItem
                                    icon={BookOpen}
                                    label="Tips"
                                    color="bg-green-500"
                                    onPress={() => router.push('/tips')}
                                />
                                <QuickAccessItem
                                    icon={ShoppingBag}
                                    label="Shop"
                                    color="bg-pink-500"
                                    onPress={() => router.push('/shop')}
                                />
                                <QuickAccessItem
                                    icon={PackageOpen}
                                    label="Orders"
                                    color="bg-orange-500"
                                    onPress={() => router.push('/shop/orders')}
                                />
                            </>
                        )}
                    </View>
                </View>

                {/* Recent Activity */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-800">Recent Diagnoses</Text>
                        <TouchableOpacity onPress={() => router.push('/diagnosis/history')}>
                            <Text className="text-primary font-semibold">See All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentDiagnoses.length > 0 ? (
                        recentDiagnoses.map((item) => (
                            <TouchableOpacity
                                key={item.id || item.createdAt}
                                onPress={() => router.push({ pathname: '/diagnosis/result', params: { result: JSON.stringify(item) } })}
                                className="bg-white p-4 rounded-2xl shadow-sm flex-row items-center justify-between mb-3"
                            >
                                <View className="flex-row items-center flex-1">
                                    <Image
                                        source={{ uri: item.imageUri }}
                                        className="w-12 h-12 rounded-xl mr-4 bg-gray-100"
                                    />
                                    <View>
                                        <Text className="font-bold text-gray-800">{item.disease}</Text>
                                        <Text className="text-gray-500 capitalize text-sm mt-1">{item.crop} --- {Math.round(item.confidence * 100)}% Match</Text>
                                        <Text className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <ChevronRight color="#9CA3AF" size={20} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View className="bg-white p-8 rounded-2xl shadow-sm items-center">
                            <Text className="text-gray-400">No recent activity</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}