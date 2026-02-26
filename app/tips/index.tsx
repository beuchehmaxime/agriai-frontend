import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, BookOpen, ChevronRight, WifiOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../context/NetworkContext';
import IsOffline from '../../components/IsOffline';

export const MOCK_TIPS = [
    {
        id: '1',
        title: 'Proper Irrigation for Maize',
        summary: 'Learn the optimal watering frequency for your maize crops during the dry season.',
        category: 'Irrigation',
        date: '2024-03-08',
        image: 'https://images.unsplash.com/photo-1594913785162-e678564d2757?q=80&w=200&auto=format&fit=crop',
        content: 'Maize requires consistent moisture throughout its growth period, especially during the silking and tasseling stages. During the dry season in Cameroon, it is recommended to water deeply every 3-4 days rather than daily shallow watering. This encourages deep root growth, making the plants more resilient to heat stress.'
    },
    {
        id: '2',
        title: 'Identifying Fall Armyworm',
        summary: 'Early detection is key to preventing widespread damage to your grain crops.',
        category: 'Pest Control',
        date: '2024-03-05',
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=200&auto=format&fit=crop',
        content: 'The Fall Armyworm (Spodoptera frugiperda) is a destructive pest that feeds on more than 80 crop species. Look for ragged holes in leaves and the presence of sawdust-like droppings (frass) in the whorl of the plant. If detected early, organic neem-based pesticides can be highly effective.'
    },
    {
        id: '3',
        title: 'Organic Fertilizer Basics',
        summary: 'How to make your own compost from farm waste to improve soil health.',
        category: 'Soil Health',
        date: '2024-03-01',
        image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=200&auto=format&fit=crop',
        content: 'Composting transforms organic waste into nutrient-rich soil amendment. Mix "green" materials (nitrogen-rich food scraps, fresh grass) with "brown" materials (carbon-rich dried leaves, straw). Keep the pile moist and turn it every 2 weeks to provide oxygen. In 2-3 months, you will have black gold for your garden.'
    }
];

export default function TipsScreen() {
    const router = useRouter();
    const { isConnected } = useNetwork();

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to view agricultural tips." />;
    }

    const renderTipCard = ({ item }: { item: typeof MOCK_TIPS[0] }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/tips/[id]', params: { id: item.id } })}
            className="bg-white p-4 rounded-2xl shadow-sm flex-row items-center mb-4"
        >
            <Image
                source={{ uri: item.image }}
                className="w-20 h-20 rounded-xl mr-4 bg-gray-100"
            />
            <View className="flex-1">
                <View className="bg-green-100 px-2 py-0.5 rounded-full self-start mb-1">
                    <Text className="text-green-700 text-[10px] font-bold uppercase">{item.category}</Text>
                </View>
                <Text className="font-bold text-gray-800 text-base" numberOfLines={1}>{item.title}</Text>
                <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>{item.summary}</Text>
                <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-gray-400 text-[10px]">{item.date}</Text>
                    <View className="flex-row items-center">
                        <Text className="text-primary text-[10px] font-bold mr-1">Read More</Text>
                        <ChevronRight color="#4ADE80" size={12} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white p-4 pb-6 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <ChevronLeft color="#374151" size={24} />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-gray-900">Agri Tips</Text>
                    </View>
                    <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
                        <Search color="#6B7280" size={20} />
                    </TouchableOpacity>
                </View>
                <View className="flex-row space-x-2 gap-2">
                    {['All', 'Irrigation', 'Pests', 'Soil'].map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            className={`px-4 py-2 rounded-full ${cat === 'All' ? 'bg-primary' : 'bg-gray-100'}`}
                        >
                            <Text className={`text-xs font-bold ${cat === 'All' ? 'text-white' : 'text-gray-600'}`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={MOCK_TIPS}
                renderItem={renderTipCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <BookOpen color="#D1D5DB" size={64} />
                        <Text className="text-gray-400 mt-4">No tips available yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
