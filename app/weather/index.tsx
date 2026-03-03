import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CloudSun, Wind, Droplets, Sun, CloudRain, Cloud, CloudFog, CloudSnow, CloudLightning } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../context/NetworkContext';
import IsOffline from '../../components/IsOffline';
import { useWeather } from '../../hooks/useWeather';

export default function WeatherScreen() {
    const router = useRouter();
    const { isConnected } = useNetwork();

    const { data: weatherData, isLoading, error, refetch } = useWeather();

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to view weather forecast." />;
    }

    // Map the string condition back to an Icon component
    const getConditionIcon = (condition: string, size = 24, align = 'center') => {
        const lower = condition.toLowerCase();
        if (lower.includes('clear') || lower.includes('sunny')) return <Sun color="#EAB308" size={size} />;
        if (lower.includes('partly cloudy')) return <CloudSun color="#94A3B8" size={size} />;
        if (lower.includes('fog')) return <CloudFog color="#94A3B8" size={size} />;
        if (lower.includes('snow')) return <CloudSnow color="#60A5FA" size={size} />;
        if (lower.includes('thunder')) return <CloudLightning color="#8B5CF6" size={size} />;
        if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain color="#3B82F6" size={size} />;
        return <Cloud color="#94A3B8" size={size} />;
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="#374151" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 ml-2">Weather Forecast</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center p-6">
                    <ActivityIndicator size="large" color="#4ADE80" />
                    <Text className="text-gray-500 mt-4 text-center">Finding your location & fetching weather data...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-red-500 text-center mb-4">{(error as Error).message}</Text>
                    <TouchableOpacity onPress={() => refetch()} className="px-6 py-2 bg-primary rounded-full">
                        <Text className="text-white font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : weatherData ? (
                <ScrollView className="flex-1 p-6">
                    {/* Current Weather Card */}
                    <View className="bg-primary p-8 rounded-3xl shadow-lg shadow-green-200 mb-8 items-center">
                        <Text className="text-white text-lg font-medium opacity-80 text-center">{weatherData.location}</Text>
                        <View className="flex-row items-center my-4">
                            {weatherData.current.condition.toLowerCase().includes('sunny') || weatherData.current.condition.toLowerCase().includes('clear') ? (
                                <Sun color="white" size={64} fill="white" />
                            ) : weatherData.current.condition.toLowerCase().includes('rain') ? (
                                <CloudRain color="white" size={64} fill="white" />
                            ) : weatherData.current.condition.toLowerCase().includes('snow') ? (
                                <CloudSnow color="white" size={64} fill="white" />
                            ) : (
                                <Cloud color="white" size={64} fill="white" />
                            )}
                            <Text className="text-white text-7xl font-bold ml-4">{weatherData.current.temp}°</Text>
                        </View>
                        <Text className="text-white text-xl font-bold">{weatherData.current.condition}</Text>

                        <View className="flex-row justify-between w-full mt-8 border-t border-white/20 pt-6">
                            <View className="items-center">
                                <Wind color="white" size={24} />
                                <Text className="text-white font-bold mt-2">{weatherData.current.windSpeed} km/h</Text>
                                <Text className="text-white/60 text-xs">Wind</Text>
                            </View>
                            <View className="items-center">
                                <Droplets color="white" size={24} />
                                <Text className="text-white font-bold mt-2">{weatherData.current.humidity}%</Text>
                                <Text className="text-white/60 text-xs">Humidity</Text>
                            </View>
                            <View className="items-center">
                                <CloudRain color="white" size={24} />
                                <Text className="text-white font-bold mt-2">{weatherData.current.precipitationProb}%</Text>
                                <Text className="text-white/60 text-xs">Precipitation</Text>
                            </View>
                        </View>
                    </View>

                    {/* 5-Day Forecast */}
                    <Text className="text-xl font-bold text-gray-800 mb-4">5-Day Forecast</Text>
                    <View className="bg-gray-50 rounded-3xl p-4">
                        {weatherData.forecast.map((item, index) => {
                            return (
                                <View key={`${item.day}-${index}`} className={`flex-row items-center justify-between p-4 ${index !== weatherData.forecast.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <Text className="text-gray-600 font-bold w-12">{item.day}</Text>
                                    <View className="flex-row items-center flex-1 ml-4">
                                        {getConditionIcon(item.condition)}
                                        <Text className="text-gray-700 font-medium ml-3 flex-1" numberOfLines={1}>{item.condition}</Text>
                                    </View>
                                    <Text className="text-gray-900 font-bold text-lg">{item.tempMax}° <Text className="text-gray-400 text-sm font-normal">{item.tempMin}°</Text></Text>
                                </View>
                            );
                        })}
                    </View>

                    <View className="mt-8 bg-blue-50 p-6 rounded-3xl border border-blue-100">
                        <Text className="text-blue-800 font-bold text-lg mb-2">Agricultural Tip</Text>
                        <Text className="text-blue-700 leading-6">
                            {weatherData.current.precipitationProb > 60
                                ? "High chance of rain today. Consider delaying any chemical spraying as it might get washed away."
                                : weatherData.current.temp > 30
                                    ? "High temperatures expected. Ensure your crops are sufficiently irrigated during early morning hours to prevent heat stress."
                                    : "Good weather for regular field maintenance. Keep an eye out for early signs of pests."}
                        </Text>
                    </View>

                    <View className="h-10" />
                </ScrollView>
            ) : null}
        </SafeAreaView>
    );
}
