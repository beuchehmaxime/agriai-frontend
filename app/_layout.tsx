import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NetworkProvider } from "../context/NetworkContext";

const queryClient = new QueryClient();

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <NetworkProvider>
                <SafeAreaProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="auth" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="diagnosis" />
                    </Stack>
                    <StatusBar style="auto" />
                </SafeAreaProvider>
            </NetworkProvider>
        </QueryClientProvider>
    );
}
