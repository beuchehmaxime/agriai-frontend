import { Tabs } from 'expo-router';
import { Home, History, User, Camera, ShoppingBag } from 'lucide-react-native';
import { View, Text } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    elevation: 8,
                    height: 70,
                    paddingBottom: 30,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#4ADE80',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="diagnose"
                options={{
                    title: '',
                    tabBarIcon: ({ focused }) => (
                        <View className="bg-primary w-20 h-20 rounded-full items-center justify-center -mt-8 shadow-lg border-4 border-white">
                            <Camera color="white" size={28} />
                        </View>
                    ),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // Prevent default action
                        e.preventDefault();
                        // Navigate to diagnose modal or screen
                        // For now, just let it go to the screen, but maybe we want a modal? 
                        // Plan said "Diagnose Page", so screen is fine.
                        navigation.navigate('diagnose');
                    },
                })}
            />
            <Tabs.Screen
                name="shop"
                options={{
                    title: 'Shop',
                    tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
