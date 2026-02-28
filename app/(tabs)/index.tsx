import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { Bell, CloudSun, BookOpen, Users, ChevronRight, Sprout, User2, MapPin, UserRoundPen, ShoppingBag } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { DiagnosisLocal, QuickAccessItemProps } from '../../types';
import { useDiagnosisHistory } from '../../hooks/useDiagnosis';

export default function HomeScreen() {
    const { phoneNumber, userType, name } = useUserStore();
    const router = useRouter();
    const { data: diagnoses } = useDiagnosisHistory();
    const recentDiagnoses = diagnoses ? diagnoses.slice(0, 3) : [];

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
                            onPress={() => router.push('/shop')}
                            className="p-2 bg-white rounded-full shadow-sm"
                        >
                            <ShoppingBag color="#374151" size={24} />
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
                                    {userType === 'guest' ? 'Guest Farmer' : name}
                                </Text>
                                <Text className="text-white/80 text-sm">
                                    {phoneNumber || 'No phone number'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/profile')}>
                            <UserRoundPen color="white" size={24} />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center gap-2 bg-white/20 p-3 rounded-xl">
                        <MapPin color="white" size={24} />
                        <Text className="text-white font-medium">Cameroon</Text>
                        {/* Location fetching would go here */}
                    </View>
                </View>

                {/* Quick Access Grid */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-4">Quick Access</Text>
                    <View className="flex-row flex-wrap justify-between">
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
                            icon={Users}
                            label="Community"
                            color="bg-purple-500"
                            onPress={() => router.push('/community')}
                        />
                    </View>
                </View>

                {/* Recent Activity */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-800">Recent Activity</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
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
                                        <Text className="text-gray-500 text-sm mt-1">{item.crop} --- {Math.round(item.confidence * 100)}% Match</Text>
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