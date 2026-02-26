import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CloudSun, Wind, Droplets, Sun, CloudRain } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../context/NetworkContext';
import IsOffline from '../../components/IsOffline';

export default function WeatherScreen() {
    const router = useRouter();
    const { isConnected } = useNetwork();

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to view weather forecast." />;
    }

    const forecast = [
        { day: 'Mon', temp: 28, condition: 'Sunny', icon: Sun },
        { day: 'Tue', temp: 26, condition: 'Cloudy', icon: CloudSun },
        { day: 'Wed', temp: 24, condition: 'Rainy', icon: CloudRain },
        { day: 'Thu', temp: 27, condition: 'Sunny', icon: Sun },
        { day: 'Fri', temp: 29, condition: 'Hot', icon: Sun },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="#374151" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 ml-2">Weather Forecast</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* Current Weather Card */}
                <View className="bg-primary p-8 rounded-3xl shadow-lg shadow-green-200 mb-8 items-center">
                    <Text className="text-white text-lg font-medium opacity-80">Yaoundé, Cameroon</Text>
                    <View className="flex-row items-center my-4">
                        <Sun color="white" size={64} fill="white" />
                        <Text className="text-white text-7xl font-bold ml-4">28°</Text>
                    </View>
                    <Text className="text-white text-xl font-bold">Mostly Sunny</Text>

                    <View className="flex-row justify-between w-full mt-8 border-t border-white/20 pt-6">
                        <View className="items-center">
                            <Wind color="white" size={24} />
                            <Text className="text-white font-bold mt-2">12 km/h</Text>
                            <Text className="text-white/60 text-xs">Wind</Text>
                        </View>
                        <View className="items-center">
                            <Droplets color="white" size={24} />
                            <Text className="text-white font-bold mt-2">65%</Text>
                            <Text className="text-white/60 text-xs">Humidity</Text>
                        </View>
                        <View className="items-center">
                            <CloudRain color="white" size={24} />
                            <Text className="text-white font-bold mt-2">10%</Text>
                            <Text className="text-white/60 text-xs">Precipitation</Text>
                        </View>
                    </View>
                </View>

                {/* 5-Day Forecast */}
                <Text className="text-xl font-bold text-gray-800 mb-4">5-Day Forecast</Text>
                <View className="bg-gray-50 rounded-3xl p-4">
                    {forecast.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <View key={item.day} className={`flex-row items-center justify-between p-4 ${index !== forecast.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                <Text className="text-gray-600 font-bold w-12">{item.day}</Text>
                                <View className="flex-row items-center flex-1 ml-4">
                                    <Icon color="#4ADE80" size={24} />
                                    <Text className="text-gray-700 font-medium ml-3">{item.condition}</Text>
                                </View>
                                <Text className="text-gray-900 font-bold text-lg">{item.temp}°</Text>
                            </View>
                        );
                    })}
                </View>

                <View className="mt-8 bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <Text className="text-blue-800 font-bold text-lg mb-2">Agricultural Tip</Text>
                    <Text className="text-blue-700 leading-6">
                        High temperatures expected this week. Ensure your maize crops are sufficiently irrigated during early morning hours to prevent heat stress.
                    </Text>
                </View>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
