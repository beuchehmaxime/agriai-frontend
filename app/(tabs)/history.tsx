import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { getDiagnoses, deleteDiagnosis } from '../../services/database';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const router = useRouter();

    const loadHistory = async () => {
        const data = await getDiagnoses();
        setDiagnoses(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const handleDelete = (item: any) => {
        Alert.alert(
            'Delete Diagnosis',
            'Are you sure you want to delete this diagnosis? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDiagnosis(item.id);
                            loadHistory();
                        } catch (error) {
                            console.error('Delete failed:', error);
                            Alert.alert('Error', 'Failed to delete diagnosis.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/diagnosis/result', params: { result: JSON.stringify(item) } })}
            onLongPress={() => handleDelete(item)}
            className="bg-white p-4 rounded-xl shadow-sm mb-4 flex-row"
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.imageUri }} className="w-20 h-20 rounded-lg mr-4 bg-gray-200" />
            <View className="flex-1 justify-center">
                <View className="flex-row justify-between items-start">
                    <Text className="font-bold text-md text-gray-800">{item.disease}</Text>
                    <View className={`px-2 py-1 rounded-full ${item.synced ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        <Text className={`text-xs font-bold ${item.synced ? 'text-green-700' : 'text-yellow-700'}`}>
                            {item.synced ? 'Synced' : 'Local'}
                        </Text>
                    </View>
                </View>
                <Text className="text-gray-500 text-sm mt-1">{item.crop} • {Math.round(item.confidence * 100)}% Match</Text>
                <Text className="text-gray-400 text-xs mt-2">{new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text className="text-gray-300 text-[10px] mt-1 italic">Long-press to delete</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <Text className="text-2xl font-bold text-gray-900 mb-6">Diagnosis History</Text>
            <FlatList
                data={diagnoses}
                renderItem={renderItem}
                keyExtractor={(item) => item.id?.toString() || item.createdAt}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Text className="text-gray-400">No diagnoses yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
