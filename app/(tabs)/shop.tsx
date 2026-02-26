import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';
import { useNetwork } from '../../context/NetworkContext';
import IsOffline from '../../components/IsOffline';

export default function ShopScreen() {
    const { isConnected } = useNetwork();

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to access the shop." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center p-6">
            <View className="bg-primary/10 p-6 rounded-full mb-6">
                <ShoppingBag color="#4ADE80" size={64} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Agri Shop</Text>
            <Text className="text-gray-500 text-center text-lg">
                Coming Soon! Buy fertilizers, seeds, and tools directly from the app.
            </Text>
        </SafeAreaView>
    );
}
